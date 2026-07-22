import fs from 'fs';
import path from 'path';

const SRC_DIR = '/Users/paul/antigravity/Korean-Sentence-Builder/src';

const REPLACEMENTS = [
  { search: /bg-\[\#cc3311\]/g, replace: 'bg-brand-primary' },
  { search: /text-\[\#cc3311\]/g, replace: 'text-brand-primary' },
  { search: /border-\[\#cc3311\]/g, replace: 'border-brand-primary' },
  { search: /decoration-\[\#cc3311\]/g, replace: 'decoration-brand-primary' },
  { search: /text-\[\#cc3311\]/g, replace: 'text-brand-primary' },
  
  { search: /bg-\[\#fdf9f0\]/g, replace: 'bg-brand-bg-light' },
  { search: /hover:bg-\[\#fdf9f0\]/g, replace: 'hover:bg-brand-bg-light' },
  
  { search: /bg-\[\#efebe4\]/g, replace: 'bg-brand-surface-light' },
  { search: /hover:bg-\[\#efebe4\]/g, replace: 'hover:bg-brand-surface-light' },
  
  { search: /bg-\[\#100f0d\]/g, replace: 'bg-brand-bg-dark' },
  
  { search: /bg-\[\#1a1a1a\]/g, replace: 'bg-brand-surface-dark' },
  { search: /bg-\[\#121212\]/g, replace: 'bg-brand-surface-dark' },
  
  { search: /bg-\[\#ffcc00\]/g, replace: 'bg-brand-accent' },
  { search: /text-\[\#ffcc00\]/g, replace: 'text-brand-accent' },
  
  { search: /bg-\[\#f7f5f0\]/g, replace: 'bg-brand-surface-light' },
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      for (const rep of REPLACEMENTS) {
        content = content.replace(rep.search, rep.replace);
      }
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(SRC_DIR);
