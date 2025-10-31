#!/usr/bin/env node

/**
 * Validates that no secrets are committed to the repository
 * Run with: node scripts/validate-secrets.js
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const PATTERNS = [
  {
    name: 'Supabase Anon Key (JWT)',
    pattern: /VITE_SUPABASE.*KEY.*=.*['"]?eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/i,
  },
  {
    name: 'Supabase Service Role Key (JWT)',
    pattern: /service.?role.*eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/i,
  },
  {
    name: 'Resend API Key',
    pattern: /RESEND.*KEY.*=.*['"]?re_[a-zA-Z0-9_-]{20,}/i,
  },
  {
    name: 'Sentry DSN with hash',
    pattern: /SENTRY.*DSN.*=.*['"]?https:\/\/[a-f0-9]{32}@[a-z0-9.-]+\/[0-9]+/i,
  },
  {
    name: 'Generic API Key',
    pattern: /api.?key.*=.*['"][a-zA-Z0-9_-]{32,}['"]/i,
  },
  {
    name: 'Supabase Project URL with identifier',
    pattern: /https:\/\/[a-z]{20}\.supabase\.co/,
  },
];

const IGNORE_DIRS = ['node_modules', 'dist', '.git', 'build', '.next', 'coverage'];
const IGNORE_FILES = ['.env', '.env.local', '.env.production', '.env.development', 'package-lock.json', 'bun.lockb'];
const SAFE_FILES = ['validate-secrets.js', 'SECURITY_IMPROVEMENTS.md', '.env.example'];

function scanDirectory(dir, errors = [], basePath = process.cwd()) {
  const files = readdirSync(dir);
  
  for (const file of files) {
    const filePath = join(dir, file);
    const relativePath = relative(basePath, filePath);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file) && !file.startsWith('.')) {
        scanDirectory(filePath, errors, basePath);
      }
    } else if (stat.isFile()) {
      // Skip ignored files and safe files
      if (IGNORE_FILES.includes(file) || SAFE_FILES.some(safe => relativePath.includes(safe))) {
        continue;
      }
      
      // Skip binary files and large files
      if (stat.size > 1024 * 1024) continue; // Skip files > 1MB
      
      try {
        const content = readFileSync(filePath, 'utf8');
        
        for (const { name, pattern } of PATTERNS) {
          const matches = content.match(pattern);
          if (matches) {
            errors.push({
              file: relativePath,
              secretType: name,
              match: matches[0].substring(0, 100) + (matches[0].length > 100 ? '...' : ''),
            });
          }
        }
      } catch (err) {
        // Skip files that can't be read as UTF-8 (binary files, etc.)
      }
    }
  }
  
  return errors;
}

console.log('🔍 Scanning for exposed secrets...\n');

const errors = scanDirectory('.');

if (errors.length > 0) {
  console.error('❌ Found exposed secrets:\n');
  errors.forEach(({ file, secretType, match }) => {
    console.error(`  📄 ${file}`);
    console.error(`     Type: ${secretType}`);
    console.error(`     Match: ${match}`);
    console.error('');
  });
  console.error('⚠️  SECURITY RISK: Please remove these secrets immediately!\n');
  console.error('💡 Use environment variables instead:');
  console.error('   1. Add secrets to .env file (gitignored)');
  console.error('   2. Use placeholders in documentation');
  console.error('   3. Set secrets in deployment platform (Heroku, Vercel, etc.)\n');
  console.error('📚 See SECURITY_IMPROVEMENTS.md for detailed instructions.\n');
  process.exit(1);
} else {
  console.log('✅ No exposed secrets found!');
  console.log('🔒 Your repository is secure.\n');
  process.exit(0);
}

