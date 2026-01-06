import PptxGenJS from 'pptxgenjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const html2pptx = require('./public/pptx/scripts/html2pptx.cjs');

async function createPresentation() {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9';
    pptx.author = 'Enterprise AI Team';
    pptx.title = 'AI GPU Requirements for Enterprise';

    const outputDir = 'outputs/ai-gpu-requirements-enterprise';

    // List of slides in order
    const slides = [
        'slide1-title.html',
        'slide2-market.html',
        'slide3-usecases.html',
        'slide4-comparison.html',
        'slide5-performance.html',
        'slide6-cost.html',
        'slide7-conclusion.html'
    ];

    // Process each slide
    for (const slide of slides) {
        const slidePath = join(__dirname, outputDir, slide);
        console.log(`Processing: ${slidePath}`);

        try {
            const { slide: pptxSlide, placeholders } = await html2pptx(slidePath, pptx);
            console.log(`✓ Added slide: ${slide}`);
        } catch (error) {
            console.error(`✗ Error processing ${slide}:`, error.message);
            throw error;
        }
    }

    // Save presentation
    const outputPath = join(outputDir, 'presentation.pptx');
    await pptx.writeFile({ fileName: outputPath });
    console.log(`\n✓ Presentation created successfully: ${outputPath}`);
}

createPresentation().catch(error => {
    console.error('Failed to create presentation:', error);
    process.exit(1);
});