import sharp from 'sharp';
import fs from 'fs';

const outputDir = 'outputs/ai-gpu-requirements-enterprise/images';

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function createGPUVisualization() {
  // Create a GPU card comparison visualization
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400">
    <!-- Background -->
    <rect width="800" height="400" fill="#ffffff"/>

    <!-- Title -->
    <text x="400" y="30" font-size="24" font-weight="bold" text-anchor="middle" fill="#1e3c72">
      GPU Models Comparison
    </text>

    <!-- NVIDIA H100 -->
    <g>
      <rect x="30" y="70" width="160" height="300" fill="#76B900" stroke="#1e3c72" stroke-width="2" rx="8"/>
      <text x="110" y="105" font-size="14" font-weight="bold" text-anchor="middle" fill="white">NVIDIA H100</text>
      <text x="110" y="135" font-size="11" text-anchor="middle" fill="white">VRAM: 80GB</text>
      <text x="110" y="160" font-size="11" text-anchor="middle" fill="white">989 TFLOPS</text>
      <text x="110" y="185" font-size="11" text-anchor="middle" fill="white">Memory BW:</text>
      <text x="110" y="200" font-size="11" text-anchor="middle" fill="white">2.4 TB/s</text>
      <text x="110" y="230" font-size="11" text-anchor="middle" fill="white">TDP: 700W</text>
      <text x="110" y="260" font-size="12" font-weight="bold" text-anchor="middle" fill="white">$35K</text>
    </g>

    <!-- NVIDIA A100 -->
    <g>
      <rect x="210" y="70" width="160" height="300" fill="#76B900" stroke="#1e3c72" stroke-width="2" rx="8"/>
      <text x="290" y="105" font-size="14" font-weight="bold" text-anchor="middle" fill="white">NVIDIA A100</text>
      <text x="290" y="135" font-size="11" text-anchor="middle" fill="white">VRAM: 40-80GB</text>
      <text x="290" y="160" font-size="11" text-anchor="middle" fill="white">312 TFLOPS</text>
      <text x="290" y="185" font-size="11" text-anchor="middle" fill="white">Memory BW:</text>
      <text x="290" y="200" font-size="11" text-anchor="middle" fill="white">2.0 TB/s</text>
      <text x="290" y="230" font-size="11" text-anchor="middle" fill="white">TDP: 400W</text>
      <text x="290" y="260" font-size="12" font-weight="bold" text-anchor="middle" fill="white">$12K</text>
    </g>

    <!-- AMD MI300X -->
    <g>
      <rect x="390" y="70" width="160" height="300" fill="#ED1C24" stroke="#1e3c72" stroke-width="2" rx="8"/>
      <text x="470" y="105" font-size="14" font-weight="bold" text-anchor="middle" fill="white">AMD MI300X</text>
      <text x="470" y="135" font-size="11" text-anchor="middle" fill="white">VRAM: 192GB</text>
      <text x="470" y="160" font-size="11" text-anchor="middle" fill="white">1456 TFLOPS</text>
      <text x="470" y="185" font-size="11" text-anchor="middle" fill="white">Memory BW:</text>
      <text x="470" y="200" font-size="11" text-anchor="middle" fill="white">2.4 TB/s</text>
      <text x="470" y="230" font-size="11" text-anchor="middle" fill="white">TDP: 550W</text>
      <text x="470" y="260" font-size="12" font-weight="bold" text-anchor="middle" fill="white">$25K</text>
    </g>

    <!-- Intel Gaudi 3 -->
    <g>
      <rect x="570" y="70" width="160" height="300" fill="#0071C5" stroke="#1e3c72" stroke-width="2" rx="8"/>
      <text x="650" y="105" font-size="14" font-weight="bold" text-anchor="middle" fill="white">Intel Gaudi 3</text>
      <text x="650" y="135" font-size="11" text-anchor="middle" fill="white">VRAM: 96GB</text>
      <text x="650" y="160" font-size="11" text-anchor="middle" fill="white">6144 TFLOPS</text>
      <text x="650" y="185" font-size="11" text-anchor="middle" fill="white">Memory BW:</text>
      <text x="650" y="200" font-size="11" text-anchor="middle" fill="white">1.8 TB/s</text>
      <text x="650" y="230" font-size="11" text-anchor="middle" fill="white">TDP: 600W</text>
      <text x="650" y="260" font-size="12" font-weight="bold" text-anchor="middle" fill="white">$18K</text>
    </g>
  </svg>`;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(`${outputDir}/gpu-comparison.png`);

  console.log('✓ Created: gpu-comparison.png');
}

async function createSystemArchitecture() {
  // Create a system architecture diagram
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="500">
    <rect width="900" height="500" fill="#ffffff"/>
    <text x="450" y="30" font-size="24" font-weight="bold" text-anchor="middle" fill="#1e3c72">Enterprise GPU System Architecture</text>
    <rect x="50" y="60" width="800" height="60" fill="#E8F4F8" stroke="#2a5298" stroke-width="2" rx="4"/>
    <text x="450" y="85" font-size="14" font-weight="bold" text-anchor="middle" fill="#1e3c72">AI/ML Applications Layer</text>
    <text x="450" y="105" font-size="12" text-anchor="middle" fill="#4a5568">LLMs, Computer Vision, Recommendation Systems, Data Analytics</text>
    <rect x="50" y="140" width="800" height="60" fill="#F0E8F8" stroke="#2a5298" stroke-width="2" rx="4"/>
    <text x="450" y="165" font-size="14" font-weight="bold" text-anchor="middle" fill="#1e3c72">Software &amp; Frameworks Layer</text>
    <text x="450" y="185" font-size="12" text-anchor="middle" fill="#4a5568">CUDA, PyTorch, TensorFlow, Triton, ONNX Runtime</text>
    <rect x="50" y="220" width="150" height="80" fill="#FFF4E6" stroke="#FF9800" stroke-width="2" rx="4"/>
    <text x="125" y="245" font-size="12" font-weight="bold" text-anchor="middle" fill="#E65100">CPU</text>
    <text x="125" y="265" font-size="10" text-anchor="middle" fill="#4a5568">Intel/AMD</text>
    <text x="125" y="280" font-size="10" text-anchor="middle" fill="#4a5568">32-128 Cores</text>
    <text x="125" y="295" font-size="10" text-anchor="middle" fill="#4a5568">1.5 TB/s BW</text>
    <rect x="220" y="220" width="150" height="80" fill="#E8F8E8" stroke="#4CAF50" stroke-width="2" rx="4"/>
    <text x="295" y="245" font-size="12" font-weight="bold" text-anchor="middle" fill="#1B5E20">Memory</text>
    <text x="295" y="265" font-size="10" text-anchor="middle" fill="#4a5568">DDR5 DRAM</text>
    <text x="295" y="280" font-size="10" text-anchor="middle" fill="#4a5568">256-1024 GB</text>
    <text x="295" y="295" font-size="10" text-anchor="middle" fill="#4a5568">192-960 GB/s</text>
    <rect x="390" y="220" width="150" height="80" fill="#E8F0F8" stroke="#2196F3" stroke-width="2" rx="4"/>
    <text x="465" y="245" font-size="12" font-weight="bold" text-anchor="middle" fill="#0D47A1">GPU Cluster</text>
    <text x="465" y="265" font-size="10" text-anchor="middle" fill="#4a5568">8x H100 / A100</text>
    <text x="465" y="280" font-size="10" text-anchor="middle" fill="#4a5568">640GB VRAM</text>
    <text x="465" y="295" font-size="10" text-anchor="middle" fill="#4a5568">NVLink 900GB/s</text>
    <rect x="560" y="220" width="150" height="80" fill="#F8E8F8" stroke="#9C27B0" stroke-width="2" rx="4"/>
    <text x="635" y="245" font-size="12" font-weight="bold" text-anchor="middle" fill="#4A148C">Storage</text>
    <text x="635" y="265" font-size="10" text-anchor="middle" fill="#4a5568">NVMe SSD</text>
    <text x="635" y="280" font-size="10" text-anchor="middle" fill="#4a5568">10-50 TB</text>
    <text x="635" y="295" font-size="10" text-anchor="middle" fill="#4a5568">3.5 GB/s</text>
    <rect x="730" y="220" width="120" height="80" fill="#FFF5F8" stroke="#E91E63" stroke-width="2" rx="4"/>
    <text x="790" y="245" font-size="12" font-weight="bold" text-anchor="middle" fill="#880E4F">Network</text>
    <text x="790" y="265" font-size="10" text-anchor="middle" fill="#4a5568">InfiniBand</text>
    <text x="790" y="280" font-size="10" text-anchor="middle" fill="#4a5568">100-400 Gbps</text>
    <rect x="50" y="320" width="800" height="50" fill="#F3E5F5" stroke="#2a5298" stroke-width="2" rx="4"/>
    <text x="450" y="345" font-size="12" font-weight="bold" text-anchor="middle" fill="#1e3c72">Power Management &amp; Cooling (5-10 MW for 100-GPU cluster)</text>
    <line x1="450" y1="120" x2="450" y2="135" stroke="#999" stroke-width="2"/>
    <line x1="450" y1="200" x2="450" y2="215" stroke="#999" stroke-width="2"/>
    <line x1="450" y1="300" x2="450" y2="315" stroke="#999" stroke-width="2"/>
    <text x="50" y="410" font-size="11" fill="#666">Typical: 4-8 GPUs per server with 5-15 TB/s GPU-GPU bandwidth</text>
    <text x="50" y="430" font-size="11" fill="#666">100-GPU cluster: 400TB+ VRAM, 5-10 MW power, custom cooling required</text>
  </svg>`;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(`${outputDir}/system-architecture.png`);

  console.log('✓ Created: system-architecture.png');
}

async function generateAllImages() {
  try {
    await createGPUVisualization();
    await createSystemArchitecture();
    console.log('\n✓ All images generated successfully!');
  } catch (error) {
    console.error('Error generating images:', error);
    process.exit(1);
  }
}

generateAllImages();