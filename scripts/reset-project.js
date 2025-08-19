/* eslint-disable no-console */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function rimraf(targetPath) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
    console.log(`Removed ${targetPath}`);
  }
}

function main() {
  const projectRoot = process.cwd();
  rimraf(path.join(projectRoot, 'node_modules'));
  rimraf(path.join(projectRoot, '.expo'));
  rimraf(path.join(projectRoot, 'dist'));
  execSync('npm i', { stdio: 'inherit' });
}

main();


