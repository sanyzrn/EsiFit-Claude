#!/usr/bin/env node
/**
 * One-shot migration: hardcoded gray Tailwind classes → semantic theme tokens.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'src';

const REPLACEMENTS = [
  ['from-gray-800 to-gray-900', 'from-elevated to-surface'],
  ['bg-gray-950/90', 'bg-app/90'],
  ['bg-gray-950', 'bg-app'],
  ['bg-gray-900', 'bg-surface'],
  ['bg-gray-800/50', 'bg-elevated/50'],
  ['bg-gray-800', 'bg-elevated'],
  ['hover:bg-gray-700', 'hover:bg-elevated-hover'],
  ['hover:bg-gray-600', 'hover:bg-elevated-hover'],
  ['bg-gray-700', 'bg-elevated-hover'],
  ['bg-gray-600', 'bg-elevated-hover'],
  ['border-gray-800', 'border-border'],
  ['border-gray-700', 'border-strong'],
  ['border-gray-600', 'border-strong'],
  ['text-gray-100', 'text-fg'],
  ['text-gray-300', 'text-fg-muted'],
  ['text-gray-400', 'text-fg-subtle'],
  ['text-gray-500', 'text-fg-faint'],
  ['text-gray-200', 'text-fg-muted'],
  ['hover:text-gray-200', 'hover:text-fg-muted'],
  ['hover:text-white', 'hover:text-fg'],
  ['hover:bg-gray-800', 'hover:bg-elevated'],
];

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) files.push(...walk(p));
    else if (/\.(tsx|ts|jsx|js)$/.test(entry)) files.push(p);
  }
  return files;
}

let changed = 0;
for (const file of walk(ROOT)) {
  let content = readFileSync(file, 'utf8');
  const before = content;
  for (const [from, to] of REPLACEMENTS) {
    content = content.split(from).join(to);
  }
  if (content !== before) {
    writeFileSync(file, content);
    changed++;
    console.log('updated', file);
  }
}
console.log(`Done. ${changed} files updated.`);
