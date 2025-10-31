#!/usr/bin/env node

/**
 * Script to identify potentially unused dependencies
 * This is a simple check - manual verification is still recommended
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
);

// Get all dependencies
const allDeps = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies
};

// Directories to search
const searchDirs = ['src', 'public'];

// Read all files recursively
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and dist
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        getAllFiles(filePath, fileList);
      }
    } else if (file.match(/\.(tsx?|jsx?|json|html|css)$/)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Get all source files
let allFiles = [];
searchDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(dirPath)) {
    allFiles = allFiles.concat(getAllFiles(dirPath));
  }
});

// Read all file contents
const allContent = allFiles
  .map(file => fs.readFileSync(file, 'utf8'))
  .join('\n');

// Check each dependency
const unusedDeps = [];
const usedDeps = [];

console.log('🔍 Checking dependencies...\n');

Object.keys(allDeps).forEach(dep => {
  // Skip some packages that are used indirectly or in config
  const alwaysUsed = [
    'typescript',
    'vite',
    'eslint',
    'postcss',
    'autoprefixer',
    'tailwindcss',
    '@vitejs/plugin-react-swc',
    'serve'
  ];
  
  if (alwaysUsed.includes(dep)) {
    usedDeps.push(dep);
    return;
  }
  
  // Check if dependency is imported or required
  const patterns = [
    new RegExp(`from ['"]${dep}`, 'g'),
    new RegExp(`require\\(['"]${dep}`, 'g'),
    new RegExp(`import\\(['"]${dep}`, 'g'),
    // Check for scoped packages
    new RegExp(`from ['"]${dep.replace(/\//g, '\\/')}`, 'g'),
  ];
  
  const isUsed = patterns.some(pattern => pattern.test(allContent));
  
  if (isUsed) {
    usedDeps.push(dep);
  } else {
    unusedDeps.push(dep);
  }
});

// Report results
console.log(`✅ Used dependencies: ${usedDeps.length}`);
console.log(`⚠️  Potentially unused dependencies: ${unusedDeps.length}\n`);

if (unusedDeps.length > 0) {
  console.log('⚠️  Potentially Unused Dependencies:');
  console.log('   (Manual verification recommended)\n');
  
  unusedDeps.forEach(dep => {
    const version = allDeps[dep];
    const isDev = packageJson.devDependencies?.[dep] ? '[dev]' : '[prod]';
    console.log(`   - ${dep}@${version} ${isDev}`);
  });
  
  console.log('\n💡 Note: Some dependencies may be used indirectly or in config files.');
  console.log('   Always verify before removing!\n');
} else {
  console.log('✨ All dependencies appear to be in use!\n');
}

// Summary
console.log('📊 Summary:');
console.log(`   Total dependencies: ${Object.keys(allDeps).length}`);
console.log(`   Used: ${usedDeps.length}`);
console.log(`   Potentially unused: ${unusedDeps.length}`);
console.log(`   Files scanned: ${allFiles.length}\n`);




