#!/usr/bin/env node

/**
 * Favicon Generator Script
 * 
 * This script helps generate favicon files from the SVG source.
 * 
 * To use this script, you'll need to install sharp:
 * npm install sharp
 * 
 * Then run: node scripts/generate-favicons.js
 * 
 * Alternatively, you can use online tools like:
 * - https://realfavicongenerator.net/
 * - https://favicon.io/favicon-converter/
 * 
 * Just upload the favicon.svg file and download the generated files.
 */

const fs = require('fs');
const path = require('path');

// SVG content for the favicon
const svgContent = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#9333EA;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="6" fill="url(#gradient)" />
  <text x="16" y="22" text-anchor="middle" fill="white" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700">B</text>
</svg>`;

async function generateFavicons() {
  try {
    // Try to use sharp if available
    const sharp = require('sharp');
    
    const sizes = [
      { size: 16, name: 'favicon-16x16.png' },
      { size: 32, name: 'favicon-32x32.png' },
      { size: 180, name: 'apple-touch-icon.png' },
      { size: 192, name: 'android-chrome-192x192.png' },
      { size: 512, name: 'android-chrome-512x512.png' },
    ];

    for (const { size, name } of sizes) {
      // Scale the SVG for different sizes
      const scaledSvg = svgContent
        .replace('width="32"', `width="${size}"`)
        .replace('height="32"', `height="${size}"`)
        .replace('viewBox="0 0 32 32"', `viewBox="0 0 32 32"`)
        .replace('font-size="18"', `font-size="${Math.round(size * 0.5625)}"`);

      await sharp(Buffer.from(scaledSvg))
        .resize(size, size)
        .png()
        .toFile(path.join(__dirname, '..', 'public', name));
      
      console.log(`✅ Generated ${name}`);
    }

    // Create favicon.ico
    await sharp(Buffer.from(svgContent.replace('width="32"', 'width="16"').replace('height="32"', 'height="16"')))
      .resize(16, 16)
      .toFormat('png')
      .toFile(path.join(__dirname, '..', 'public', 'favicon.ico'));
    
    console.log('✅ Generated favicon.ico');
    console.log('\n🎉 All favicons generated successfully!');
    
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('❌ Sharp not found. Install it with: npm install sharp');
      console.log('\n📝 Alternative options:');
      console.log('1. Install sharp: npm install sharp');
      console.log('2. Use online tools:');
      console.log('   - https://realfavicongenerator.net/');
      console.log('   - https://favicon.io/favicon-converter/');
      console.log('3. Use your favicon.svg file as input for these tools');
    } else {
      console.error('❌ Error generating favicons:', error);
    }
  }
}

if (require.main === module) {
  generateFavicons();
}

module.exports = { generateFavicons }; 