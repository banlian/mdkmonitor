const fs = require('fs');
const path = require('path');

// Get current date and package version
const buildDate = new Date().toISOString();
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version;

// Create build info content
const buildInfoContent = `// This file is auto-generated during build process
export const BUILD_INFO = {
  buildDate: '${buildDate}',
  version: '${version}',
};

export const getBuildDate = () => {
  return new Date(BUILD_INFO.buildDate).toLocaleDateString();
};
`;

// Write to build info file
const buildInfoPath = path.join(__dirname, '..', 'src', 'lib', 'build-info.ts');
fs.writeFileSync(buildInfoPath, buildInfoContent);

console.log(`Build info updated: ${buildDate} (v${version})`);