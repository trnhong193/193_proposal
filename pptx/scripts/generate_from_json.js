#!/usr/bin/env node
/**
 * Generate PowerPoint presentation from JSON slide definitions
 * 
 * Usage:
 *   node scripts/generate_from_json.js <input_json_file>
 * 
 * Output:
 *   - <input_name>_output.pptx
 *   - <input_name>_html/ (directory with HTML files for each slide)
 *   - <input_name>_assets/ (directory with downloaded images and rendered diagrams)
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const pptxgen = require('pptxgenjs');
const html2pptx = require('./html2pptx.js');
const sharp = require('sharp');
const https = require('https');
const http = require('http');

// Configuration
const SLIDE_WIDTH = 720; // pt
const SLIDE_HEIGHT = 405; // pt (16:9)
const ACCENT_COLOR = '#00AEEF'; // viAct Blue
const TEXT_COLOR = '#FFFFFF'; // White
const BACKGROUND_IMAGE = path.join(__dirname, '..', 'background.png');

// Helper: Extract file ID from Google Drive URL
function extractGoogleDriveId(url) {
  if (!url) return null;
  
  // Pattern 1: https://drive.google.com/file/d/ID/view
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return match[1];
  }
  
  // Pattern 2: https://drive.google.com/open?id=ID
  try {
    const urlObj = new URL(url);
    if (urlObj.pathname.includes('open')) {
      const id = urlObj.searchParams.get('id');
      if (id) return id;
    }
  } catch (e) {
    // Invalid URL
  }
  
  return null;
}

// Download file using HTTP/HTTPS directly (no redirects)
function downloadFileDirect(url, outputPath, followRedirects = true) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    if (!followRedirects) {
      options.maxRedirects = 0;
    }
    
    const request = protocol.get(url, options, (response) => {
      // Handle redirects (301, 302, 303, 307, 308)
      if (!followRedirects && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        const redirectUrl = response.headers.location.startsWith('http') 
          ? response.headers.location 
          : new URL(response.headers.location, url).href;
        // Follow redirect with redirects enabled
        return downloadFileDirect(redirectUrl, outputPath, true)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      const fileStream = fs.createWriteStream(outputPath);
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(outputPath);
      });
      
      fileStream.on('error', (err) => {
        fs.unlink(outputPath, () => {});
        reject(err);
      });
    });
    
    request.on('error', reject);
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Download image from URL (handles Google Drive)
async function downloadImage(url, outputPath, browser, context) {
  if (!url || url.trim() === '') {
    return null;
  }

  try {
    const fileId = extractGoogleDriveId(url);
    if (fileId) {
      // Google Drive download logic (based on Python implementation)
      try {
        // Step 1: Try direct download URL
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        
        // First request without following redirects to check response
        try {
          await downloadFileDirect(downloadUrl, outputPath, false);
          const stats = await fs.promises.stat(outputPath);
          if (stats.size > 1000) { // Valid file (at least 1KB)
            return outputPath;
          }
        } catch (e) {
          // If we got a redirect (302/303), the file might be large
          // Try the view URL for images
        }
        
        // Step 2: Try view URL for images (alternative method)
        const viewUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
        try {
          await downloadFileDirect(viewUrl, outputPath, true);
          const stats = await fs.promises.stat(outputPath);
          if (stats.size > 1000) { // Valid image (at least 1KB)
            return outputPath;
          }
        } catch (e) {
          // View URL also failed
        }
        
        // Step 3: Try download URL with redirects enabled
        try {
          await downloadFileDirect(downloadUrl, outputPath, true);
          const stats = await fs.promises.stat(outputPath);
          if (stats.size > 1000) {
            return outputPath;
          }
        } catch (e) {
          console.log(`Direct download failed, trying Playwright: ${e.message}`);
        }
      } catch (e) {
        console.log(`All direct download methods failed, trying Playwright: ${e.message}`);
      }
      
      // Fallback to Playwright if direct download fails
      const page = await context.newPage();
      try {
        const downloadUrl = getGoogleDriveDownloadUrl(fileId);
        
        // Set up download listener BEFORE navigation
        const downloadPromise = page.waitForEvent('download', { timeout: 60000 }).catch(() => null);
        
        // Navigate and wait for download or page load
        await Promise.race([
          page.goto(downloadUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }),
          downloadPromise.then(() => null) // If download starts immediately, don't wait for page
        ]);
        
        // Wait a bit for any redirects or download to start
        await page.waitForTimeout(3000);
        
        // Check if download already started
        let download = await downloadPromise;
        
        // If no download yet, check if we got redirected to a confirmation page
        if (!download && (page.url().includes('confirm=') || page.url().includes('virusScanWarning'))) {
          // Handle Google Drive virus scan warning
          try {
            // Try multiple selectors for the download button
            const selectors = [
              'button#uc-download-link',
              'a#uc-download-link',
              'button[aria-label*="Download"]',
              'a[aria-label*="Download"]',
              'form[action*="download"] button',
              'form[action*="download"] input[type="submit"]',
              'input[type="submit"][value*="Download"]'
            ];
            
            let clicked = false;
            for (const selector of selectors) {
              try {
                const button = await page.$(selector);
                if (button) {
                  // Set up download listener again before clicking
                  const newDownloadPromise = page.waitForEvent('download', { timeout: 30000 }).catch(() => null);
                  await button.click();
                  await page.waitForTimeout(2000);
                  download = await newDownloadPromise;
                  if (download) {
                    clicked = true;
                    break;
                  }
                }
              } catch (e) {
                // Try next selector
              }
            }
            
            if (!clicked && !download) {
              // Try clicking any button in the form
              const form = await page.$('form');
              if (form) {
                const submitButton = await form.$('button, input[type="submit"]');
                if (submitButton) {
                  const newDownloadPromise = page.waitForEvent('download', { timeout: 30000 }).catch(() => null);
                  await submitButton.click();
                  await page.waitForTimeout(2000);
                  download = await newDownloadPromise;
                }
              }
            }
          } catch (e) {
            console.warn(`Could not find download button: ${e.message}`);
          }
        }
        
        // If we got a download, save it
        if (download) {
          await download.saveAs(outputPath);
          // Verify file exists and is not empty
          const stats = await fs.promises.stat(outputPath).catch(() => null);
          if (stats && stats.size > 0) {
            return outputPath;
          }
        }
        
        // Fallback: try direct download with response (bypass download dialog)
        try {
          const response = await page.goto(downloadUrl, { waitUntil: 'networkidle', timeout: 30000 });
          if (response) {
            const contentType = response.headers()['content-type'] || '';
            const status = response.status();
            
            if (status === 200 && (contentType.startsWith('image/') || contentType === 'application/octet-stream' || !contentType)) {
              const buffer = await response.body();
              if (buffer && buffer.length > 0) {
                await fs.promises.writeFile(outputPath, buffer);
                const stats = await fs.promises.stat(outputPath);
                if (stats.size > 0) {
                  return outputPath;
                }
              }
            }
          }
        } catch (e) {
          // Fallback failed, continue
        }
      } finally {
        await page.close();
      }
    } else {
      // Regular URL - try direct download first
      try {
        await downloadFileDirect(url, outputPath);
        const stats = await fs.promises.stat(outputPath);
        if (stats.size > 0) {
          return outputPath;
        }
      } catch (e) {
        // Fallback to Playwright
        const page = await browser.newPage();
        try {
          const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
          if (response) {
            const buffer = await response.body();
            if (buffer && buffer.length > 0) {
              await fs.promises.writeFile(outputPath, buffer);
              return outputPath;
            }
          }
        } finally {
          await page.close();
        }
      }
    }
  } catch (error) {
    console.warn(`Failed to download image from ${url}: ${error.message}`);
    return null;
  }
  
  return null;
}

// Render Mermaid diagram to PNG
async function renderMermaidDiagram(mermaidCode, outputPath) {
  try {
    // Use mermaid-cli if available, otherwise create a simple placeholder
    const { execSync } = require('child_process');
    
    // Try to use mmdc (mermaid-cli)
    try {
      const tempMmdFile = outputPath.replace('.png', '.mmd');
      await fs.promises.writeFile(tempMmdFile, mermaidCode);
      
      // Render with dark theme
      execSync(`mmdc -i "${tempMmdFile}" -o "${outputPath}" -b transparent -t dark`, {
        stdio: 'inherit'
      });
      
      await fs.promises.unlink(tempMmdFile);
      return outputPath;
    } catch (error) {
      console.warn(`mermaid-cli not available, creating placeholder: ${error.message}`);
      // Create a placeholder image
      const svg = `
        <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
          <rect width="800" height="600" fill="#1a1a1a"/>
          <text x="400" y="300" font-family="Arial" font-size="24" fill="#00AEEF" text-anchor="middle">
            Mermaid Diagram
          </text>
          <text x="400" y="330" font-family="Arial" font-size="14" fill="#FFFFFF" text-anchor="middle">
            (Install mermaid-cli: npm install -g @mermaid-js/mermaid-cli)
          </text>
        </svg>
      `;
      await sharp(Buffer.from(svg))
        .png()
        .toFile(outputPath);
      return outputPath;
    }
  } catch (error) {
    console.error(`Failed to render Mermaid diagram: ${error.message}`);
    return null;
  }
}

// Create placeholder image
async function createPlaceholderImage(text, outputPath) {
  const svg = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="600" fill="#1a1a1a" stroke="#00AEEF" stroke-width="2"/>
      <text x="400" y="280" font-family="Arial" font-size="32" fill="#00AEEF" text-anchor="middle" font-weight="bold">
        ${text}
      </text>
      <text x="400" y="320" font-family="Arial" font-size="18" fill="#FFFFFF" text-anchor="middle">
        Image Placeholder
      </text>
    </svg>
  `;
  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
  return outputPath;
}

// Smart content aggregation: Merge consecutive System Requirements slides
function aggregateSlides(slides) {
  const aggregated = [];
  let i = 0;
  
  while (i < slides.length) {
    const slide = slides[i];
    
    // Check if this is a System Requirements slide
    if (slide.type === 'content_bullets' && slide.title && slide.title.startsWith('System Requirements:')) {
      const systemReqSlides = [slide];
      const baseTitle = 'System Requirements';
      
      // Collect consecutive System Requirements slides
      while (i + 1 < slides.length) {
        const nextSlide = slides[i + 1];
        if (nextSlide.type === 'content_bullets' && 
            nextSlide.title && 
            nextSlide.title.startsWith('System Requirements:')) {
          systemReqSlides.push(nextSlide);
          i++;
        } else {
          break;
        }
      }
      
      // Filter out trivial slides
      const nonTrivialSlides = systemReqSlides.filter(s => {
        const content = s.content || [];
        const text = content.map(c => c.text || '').join(' ').toLowerCase();
        // Filter out slides with trivial content
        return !text.includes('none required') && 
               !text.includes('standard source') &&
               !text.match(/^power\s*:\s*standard/i);
      });
      
      // Merge if we have multiple non-trivial slides or if content is short
      if (nonTrivialSlides.length > 1 || 
          (nonTrivialSlides.length === 1 && systemReqSlides.length > 1)) {
        const mergedContent = [];
        const sections = [];
        
        nonTrivialSlides.forEach(s => {
          const sectionTitle = s.title.replace('System Requirements:', '').trim();
          sections.push(sectionTitle);
          (s.content || []).forEach(item => {
            mergedContent.push(item);
          });
        });
        
        // Create merged slide
        aggregated.push({
          ...slide,
          title: baseTitle,
          content: mergedContent,
          _mergedSections: sections
        });
      } else if (nonTrivialSlides.length === 1) {
        // Keep single slide but update title
        aggregated.push({
          ...nonTrivialSlides[0],
          title: baseTitle
        });
      }
      // If all were trivial, skip them
      
      i++;
    } else {
      aggregated.push(slide);
      i++;
    }
  }
  
  return aggregated;
}

// Clean timeline event text (remove leading/trailing pipes)
function cleanTimelineEvent(event) {
  if (!event) return '';
  return event.replace(/^\s*\|+\s*/, '').replace(/\s*\|+\s*$/, '').trim();
}

// Generate HTML for title slide
function generateTitleSlideHTML(slide, htmlDir, assetsDir) {
  const bgPath = path.relative(htmlDir, path.join(assetsDir, 'background.png'));
  
  return `<!DOCTYPE html>
<html>
<head>
<style>
html { background: #000000; }
body {
  width: ${SLIDE_WIDTH}pt;
  height: ${SLIDE_HEIGHT}pt;
  margin: 0;
  padding: 0;
  background-image: url('${bgPath}');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Arial, Helvetica, sans-serif;
}
.title-container {
  text-align: center;
}
h1 {
  color: ${ACCENT_COLOR};
  font-size: 48pt;
  font-weight: bold;
  text-transform: uppercase;
  margin: 0;
  padding: 0;
  line-height: 1.2;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
</style>
</head>
<body>
<div class="title-container">
  <h1>${escapeHtml(slide.title || '')}</h1>
</div>
</body>
</html>`;
}

// Generate HTML for content_bullets slide
function generateContentBulletsHTML(slide, htmlDir, assetsDir) {
  const bgPath = path.relative(htmlDir, path.join(assetsDir, 'background.png'));
  const content = slide.content || [];
  
  let listHTML = '<ul style="list-style-type: none; padding: 0; margin: 0;">';
  content.forEach(item => {
    const level = item.level || 0;
    const text = item.text || '';
    if (text === '---') return; // Skip separator lines
    
    // Extract key-value pairs (text before colon should be bold/accent colored)
    const colonIndex = text.indexOf(':');
    let formattedText = '';
    if (colonIndex > 0) {
      const key = text.substring(0, colonIndex).trim();
      const value = text.substring(colonIndex + 1).trim();
      formattedText = `<span style="color: ${ACCENT_COLOR}; font-weight: bold;">${escapeHtml(key)}:</span> ${escapeHtml(value)}`;
    } else {
      formattedText = escapeHtml(text);
    }
    
    const indent = level * 18;
    // Reduce font size for very long content lists
    const contentLength = content.length;
    const baseFontSize = contentLength > 15 ? 12 : (contentLength > 10 ? 13 : 14);
    const fontSize = level === 0 ? `${baseFontSize}pt` : `${Math.max(10, baseFontSize - 2)}pt`;
    listHTML += `<li style="margin-left: ${indent}pt; margin-bottom: 3pt; font-size: ${fontSize}; color: ${TEXT_COLOR}; line-height: 1.25; word-wrap: break-word; overflow-wrap: break-word;">
      ${formattedText}
    </li>`;
  });
  listHTML += '</ul>';
  
  return `<!DOCTYPE html>
<html>
<head>
<style>
html { background: #000000; }
body {
  width: ${SLIDE_WIDTH}pt;
  height: ${SLIDE_HEIGHT}pt;
  margin: 0;
  padding: 0;
  background-image: url('${bgPath}');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  font-family: Arial, Helvetica, sans-serif;
  overflow: hidden;
  min-height: 0;
}
.title {
  color: ${ACCENT_COLOR};
  font-size: 32pt;
  font-weight: bold;
  text-transform: uppercase;
  margin: 30pt 40pt 20pt 40pt;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
.content {
  flex: 1;
  margin: 0 40pt 72pt 40pt;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  padding-bottom: 0;
  max-height: 100%;
}
</style>
</head>
<body>
<h1 class="title">${escapeHtml(slide.title || '')}</h1>
<div class="content">
  ${listHTML}
</div>
</body>
</html>`;
}

// Generate HTML for two_column slide
function generateTwoColumnHTML(slide, htmlDir, assetsDir) {
  const bgPath = path.relative(htmlDir, path.join(assetsDir, 'background.png'));
  const leftContent = slide.left_column?.content || [];
  const rightContent = slide.right_column?.content || [];
  
  // Calculate total items to determine font size
  const totalItems = leftContent.length + rightContent.length;
  const fontSize = totalItems > 8 ? 10 : (totalItems > 6 ? 11 : 12);
  const marginBottom = totalItems > 8 ? 4 : (totalItems > 6 ? 6 : 8);
  
  const leftList = leftContent.map(item => 
    `<li style="margin-bottom: ${marginBottom}pt; font-size: ${fontSize}pt; color: ${TEXT_COLOR}; line-height: 1.3; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(item)}</li>`
  ).join('');
  
  const rightList = rightContent.map(item => 
    `<li style="margin-bottom: ${marginBottom}pt; font-size: ${fontSize}pt; color: ${TEXT_COLOR}; line-height: 1.3; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(item)}</li>`
  ).join('');
  
  return `<!DOCTYPE html>
<html>
<head>
<style>
html { background: #000000; }
body {
  width: ${SLIDE_WIDTH}pt;
  height: ${SLIDE_HEIGHT}pt;
  margin: 0;
  padding: 0;
  background-image: url('${bgPath}');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  font-family: Arial, Helvetica, sans-serif;
  overflow: hidden;
  min-height: 0;
}
.title {
  color: ${ACCENT_COLOR};
  font-size: 24pt;
  font-weight: bold;
  text-transform: uppercase;
  margin: 20pt 40pt 10pt 40pt;
  word-wrap: break-word;
  overflow-wrap: break-word;
  flex-shrink: 0;
}
.columns {
  flex: 1;
  display: flex;
  margin: 0 40pt 54pt 40pt;
  gap: 25pt;
  min-height: 0;
  overflow: hidden;
  padding-bottom: 0;
}
.column {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}
.column-title {
  color: ${ACCENT_COLOR};
  font-size: 16pt;
  font-weight: bold;
  margin-bottom: 10pt;
  word-wrap: break-word;
  overflow-wrap: break-word;
  flex-shrink: 0;
}
.column-content {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}
ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
</style>
</head>
<body>
<h1 class="title">${escapeHtml(slide.title || '')}</h1>
<div class="columns">
  <div class="column">
    <h2 class="column-title">${escapeHtml(slide.left_column?.title || '')}</h2>
    <div class="column-content">
      <ul>${leftList}</ul>
    </div>
  </div>
  <div class="column">
    <h2 class="column-title">${escapeHtml(slide.right_column?.title || '')}</h2>
    <div class="column-content">
      <ul>${rightList}</ul>
    </div>
  </div>
</div>
</body>
</html>`;
}

// Generate HTML for module_description slide
function generateModuleDescriptionHTML(slide, imagePath, htmlDir, assetsDir) {
  const bgPath = path.relative(htmlDir, path.join(assetsDir, 'background.png'));
  const content = slide.content || {};
  
  const imageRelPath = imagePath ? path.relative(htmlDir, imagePath) : null;
  
  return `<!DOCTYPE html>
<html>
<head>
<style>
html { background: #000000; }
body {
  width: ${SLIDE_WIDTH}pt;
  height: ${SLIDE_HEIGHT}pt;
  margin: 0;
  padding: 0;
  background-image: url('${bgPath}');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  font-family: Arial, Helvetica, sans-serif;
  overflow: hidden;
  min-height: 0;
}
.title {
  color: ${ACCENT_COLOR};
  font-size: 26pt;
  font-weight: bold;
  text-transform: uppercase;
  margin: 20pt 40pt 12pt 40pt;
  word-wrap: break-word;
  overflow-wrap: break-word;
  flex-shrink: 0;
}
.content-wrapper {
  flex: 1;
  display: flex;
  margin: 0 40pt 72pt 40pt;
  gap: 25pt;
  min-height: 0;
  overflow: hidden;
  padding-bottom: 0;
}
.text-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
}
.image-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  overflow: hidden;
}
img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.section {
  margin-bottom: 8pt;
}
.section-label {
  color: ${ACCENT_COLOR};
  font-size: 13pt;
  font-weight: bold;
  margin-bottom: 2pt;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
.section-text {
  color: ${TEXT_COLOR};
  font-size: 11pt;
  line-height: 1.25;
  word-wrap: break-word;
  overflow-wrap: break-word;
  margin: 0;
}
</style>
</head>
<body>
<h1 class="title">${escapeHtml(slide.title || '')}</h1>
<div class="content-wrapper">
  <div class="text-content">
    ${content.purpose ? `<div class="section">
      <p class="section-label">Purpose:</p>
      <p class="section-text">${escapeHtml(content.purpose)}</p>
    </div>` : ''}
    ${content.alert_logic ? `<div class="section">
      <p class="section-label">Alert Logic:</p>
      <p class="section-text">${escapeHtml(content.alert_logic)}</p>
    </div>` : ''}
    ${content.preconditions ? `<div class="section">
      <p class="section-label">Preconditions:</p>
      <p class="section-text">${escapeHtml(content.preconditions)}</p>
    </div>` : ''}
    ${content.data_requirements ? `<div class="section">
      <p class="section-label">Data Requirements:</p>
      <p class="section-text">${escapeHtml(content.data_requirements)}</p>
    </div>` : ''}
  </div>
  <div class="image-content">
    ${imageRelPath ? `<img src="${imageRelPath}" alt="${escapeHtml(slide.title)}" />` : ''}
  </div>
</div>
</body>
</html>`;
}

// Generate HTML for diagram slide
function generateDiagramHTML(slide, diagramPath, htmlDir, assetsDir) {
  const bgPath = path.relative(htmlDir, path.join(assetsDir, 'background.png'));
  const diagramRelPath = diagramPath ? path.relative(htmlDir, diagramPath) : null;
  
  return `<!DOCTYPE html>
<html>
<head>
<style>
html { background: #000000; }
body {
  width: ${SLIDE_WIDTH}pt;
  height: ${SLIDE_HEIGHT}pt;
  margin: 0;
  padding: 0;
  background-image: url('${bgPath}');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  font-family: Arial, Helvetica, sans-serif;
  overflow: hidden;
  min-height: 0;
}
.title {
  color: ${ACCENT_COLOR};
  font-size: 28pt;
  font-weight: bold;
  text-transform: uppercase;
  margin: 25pt 40pt 15pt 40pt;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
.diagram-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 40pt 72pt 40pt;
  overflow: hidden;
  min-height: 0;
  padding-bottom: 0;
}
img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
</head>
<body>
<h1 class="title">${escapeHtml(slide.title || '')}</h1>
<div class="diagram-container">
  ${diagramRelPath ? `<img src="${diagramRelPath}" alt="Diagram" />` : ''}
</div>
</body>
</html>`;
}

// Generate HTML for timeline slide
function generateTimelineHTML(slide, htmlDir, assetsDir) {
  const bgPath = path.relative(htmlDir, path.join(assetsDir, 'background.png'));
  const milestones = slide.timeline?.milestones || [];
  
  // Calculate positions with staggered heights
  const positions = [
    { eventY: -80, phaseY: -40 }, // Position 1: far-top
    { eventY: -80, phaseY: -40 }, // Position 2: near-top
    { eventY: 30, phaseY: 60 },   // Position 3: near-bottom
    { eventY: 30, phaseY: 60 }    // Position 4: far-bottom
  ];
  
  let timelineHTML = '';
  const timelineStartX = 80;
  const timelineEndX = SLIDE_WIDTH - 80;
  const timelineY = SLIDE_HEIGHT / 2;
  const spacing = milestones.length > 1 ? (timelineEndX - timelineStartX) / (milestones.length - 1) : 0;
  
  milestones.forEach((milestone, index) => {
    const x = timelineStartX + (index * spacing);
    const pos = positions[index % 4];
    const eventText = cleanTimelineEvent(milestone.event);
    const phase = milestone.phase || '';
    const date = milestone.date ? cleanTimelineEvent(milestone.date) : '';
    
    timelineHTML += `
      <div style="position: absolute; left: ${x}pt; top: ${timelineY}pt; transform: translateX(-50%);">
        <div style="width: 12pt; height: 12pt; background: ${ACCENT_COLOR}; border-radius: 50%; border: 2px solid ${TEXT_COLOR}; position: absolute; top: -6pt; left: -6pt;"></div>
        <div style="position: absolute; left: 0; top: ${pos.eventY}pt; width: 140pt; margin-left: -70pt; text-align: center;">
          <p style="color: ${TEXT_COLOR}; font-size: 12pt; line-height: 1.4; margin: 0; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(eventText)}</p>
        </div>
        <div style="position: absolute; left: 0; top: ${pos.phaseY}pt; width: 140pt; margin-left: -70pt; text-align: center;">
          <p style="color: ${ACCENT_COLOR}; font-size: 14pt; font-weight: bold; margin: 0 0 2pt 0;">${escapeHtml(phase)}</p>
          ${date ? `<p style="color: ${TEXT_COLOR}; font-size: 11pt; margin: 0; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(date)}</p>` : ''}
        </div>
      </div>
    `;
  });
  
  return `<!DOCTYPE html>
<html>
<head>
<style>
html { background: #000000; }
body {
  width: ${SLIDE_WIDTH}pt;
  height: ${SLIDE_HEIGHT}pt;
  margin: 0;
  padding: 0;
  background-image: url('${bgPath}');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  font-family: Arial, Helvetica, sans-serif;
  overflow: hidden;
  min-height: 0;
  position: relative;
}
.title {
  color: ${ACCENT_COLOR};
  font-size: 28pt;
  font-weight: bold;
  text-transform: uppercase;
  margin: 25pt 40pt 15pt 40pt;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
.timeline-container {
  flex: 1;
  position: relative;
  margin: 0 40pt 72pt 40pt;
  overflow: hidden;
  min-height: 0;
  padding-bottom: 0;
}
.timeline-line {
  position: absolute;
  left: ${timelineStartX}pt;
  width: ${timelineEndX - timelineStartX}pt;
  top: ${timelineY}pt;
  height: 2pt;
  background: ${ACCENT_COLOR};
}
</style>
</head>
<body>
<h1 class="title">${escapeHtml(slide.title || '')}</h1>
<div class="timeline-container">
  <div class="timeline-line"></div>
  ${timelineHTML}
</div>
</body>
</html>`;
}

// Escape HTML
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Main generation function
async function generatePresentation(inputJsonPath) {
  console.log(`Reading JSON from: ${inputJsonPath}`);
  const jsonData = JSON.parse(await fs.promises.readFile(inputJsonPath, 'utf8'));
  
  // Create output directories
  const inputName = path.basename(inputJsonPath, '.json');
  const baseDir = path.dirname(inputJsonPath);
  const outputDir = path.join(baseDir, `${inputName}_output`);
  const htmlDir = path.join(outputDir, 'html');
  const assetsDir = path.join(outputDir, 'assets');
  
  await fs.promises.mkdir(htmlDir, { recursive: true });
  await fs.promises.mkdir(assetsDir, { recursive: true });
  
  // Copy background image to assets
  const bgDest = path.join(assetsDir, 'background.png');
  await fs.promises.copyFile(BACKGROUND_IMAGE, bgDest);
  
  // Apply smart content aggregation
  console.log('Applying smart content aggregation...');
  const aggregatedSlides = aggregateSlides(jsonData.slides || []);
  console.log(`Reduced ${jsonData.slides.length} slides to ${aggregatedSlides.length} slides`);
  
  // Process assets
  console.log('Processing assets...');
  const browser = await chromium.launch();
  // Create a browser context with downloads enabled
  const context = await browser.newContext({
    acceptDownloads: true
  });
  const assetMap = new Map(); // Map slide index to asset paths
  
  try {
    for (let i = 0; i < aggregatedSlides.length; i++) {
      const slide = aggregatedSlides[i];
      
      // Download images for module_description slides
      if (slide.type === 'module_description' && slide.content?.image_url) {
        const imageUrl = slide.content.image_url;
        const imageExt = path.extname(new URL(imageUrl).pathname) || '.png';
        const imagePath = path.join(assetsDir, `module_${i}${imageExt}`);
        
        let downloadedPath = await downloadImage(imageUrl, imagePath, browser, context);
        if (!downloadedPath) {
          // Create placeholder
          downloadedPath = await createPlaceholderImage(slide.title, imagePath);
        }
        assetMap.set(i, { type: 'image', path: downloadedPath });
      }
      
      // Render Mermaid diagrams
      if (slide.type === 'diagram' && slide.diagram?.type === 'mermaid') {
        const diagramPath = path.join(assetsDir, `diagram_${i}.png`);
        await renderMermaidDiagram(slide.diagram.code, diagramPath);
        assetMap.set(i, { type: 'diagram', path: diagramPath });
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }
  
  // Generate HTML files
  console.log('Generating HTML files...');
  const htmlFiles = [];
  
  for (let i = 0; i < aggregatedSlides.length; i++) {
    const slide = aggregatedSlides[i];
    const htmlFile = path.join(htmlDir, `slide_${i + 1}.html`);
    let html = '';
    
    switch (slide.type) {
      case 'title':
        html = generateTitleSlideHTML(slide, htmlDir, assetsDir);
        break;
      case 'content_bullets':
        html = generateContentBulletsHTML(slide, htmlDir, assetsDir);
        break;
      case 'two_column':
        html = generateTwoColumnHTML(slide, htmlDir, assetsDir);
        break;
      case 'module_description': {
        const asset = assetMap.get(i);
        html = generateModuleDescriptionHTML(slide, asset?.path, htmlDir, assetsDir);
        break;
      }
      case 'diagram': {
        const asset = assetMap.get(i);
        html = generateDiagramHTML(slide, asset?.path, htmlDir, assetsDir);
        break;
      }
      case 'timeline':
        html = generateTimelineHTML(slide, htmlDir, assetsDir);
        break;
      default:
        console.warn(`Unknown slide type: ${slide.type}`);
        continue;
    }
    
    await fs.promises.writeFile(htmlFile, html);
    htmlFiles.push(htmlFile);
  }
  
  // Convert HTML to PPTX
  console.log('Converting HTML to PPTX...');
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = jsonData.client_name || 'viAct';
  pptx.title = jsonData.project_name || 'Presentation';
  
  for (const htmlFile of htmlFiles) {
    try {
      await html2pptx(htmlFile, pptx);
    } catch (error) {
      console.error(`Error processing ${htmlFile}: ${error.message}`);
      throw error;
    }
  }
  
  const outputPptx = path.join(outputDir, `${inputName}.pptx`);
  await pptx.writeFile({ fileName: outputPptx });
  console.log(`\nPresentation generated successfully!`);
  console.log(`Output: ${outputPptx}`);
  console.log(`HTML files: ${htmlDir}`);
  console.log(`Assets: ${assetsDir}`);
}

// Main
if (require.main === module) {
  const inputJsonPath = process.argv[2];
  if (!inputJsonPath) {
    console.error('Usage: node generate_from_json.js <input_json_file>');
    process.exit(1);
  }
  
  generatePresentation(inputJsonPath).catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}

module.exports = { generatePresentation };

