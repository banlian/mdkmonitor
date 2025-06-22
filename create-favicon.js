const sharp = require('sharp');
const toIco = require('to-ico');
const fs = require('fs');

async function createFavicon() {
    try {
        // Read the SVG file
        const svgBuffer = fs.readFileSync('favicon.svg');

        // Create different sizes for the ICO file
        const sizes = [16, 32, 48];
        const pngBuffers = [];

        for (const size of sizes) {
            const pngBuffer = await sharp(svgBuffer)
                .resize(size, size)
                .png()
                .toBuffer();
            pngBuffers.push(pngBuffer);
        }

        // Create ICO file
        const icoBuffer = await toIco(pngBuffers);
        fs.writeFileSync('src/app/favicon.ico', icoBuffer);

        // Also create PNG version for modern browsers
        await sharp(svgBuffer)
            .resize(32, 32)
            .png()
            .toFile('src/app/favicon.png');

        console.log('Favicon created successfully!');
        console.log('Created: src/app/favicon.ico');
        console.log('Created: src/app/favicon.png');

    } catch (error) {
        console.error('Error creating favicon:', error);
    }
}

createFavicon();