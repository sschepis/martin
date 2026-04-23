import { readFileSync, writeFileSync } from 'node:fs';

const fst = readFileSync('fst.md', 'utf-8');
const sds = readFileSync('sds.md', 'utf-8');
const shotstack = readFileSync('shotstack-compositing.md', 'utf-8');

// Full versions
const fstFull = fst;
const sdsFull = sds;
const shotstackFull = shotstack;

// Compact version of FST: Just the headers (vocabulary)
const fstCompact = fst.split('\n')
  .filter(line => line.startsWith('#'))
  .join('\n');

// Compact version of SDS: Headers and bullet points (rules and choices)
const sdsCompact = sds.split('\n')
  .filter(line => line.startsWith('#') || line.trim().startsWith('* '))
  .join('\n');

const shotstackCompact = shotstack.split('\n')
  .filter(line => line.startsWith('#'))
  .join('\n');

const content = `// Auto-generated knowledge file
export const FST_KNOWLEDGE_FULL = ${JSON.stringify(fstFull)};
export const FST_KNOWLEDGE_COMPACT = ${JSON.stringify(fstCompact)};

export const SDS_KNOWLEDGE_FULL = ${JSON.stringify(sdsFull)};
export const SDS_KNOWLEDGE_COMPACT = ${JSON.stringify(sdsCompact)};

export const SHOTSTACK_KNOWLEDGE_FULL = ${JSON.stringify(shotstackFull)};
export const SHOTSTACK_KNOWLEDGE_COMPACT = ${JSON.stringify(shotstackCompact)};
`;

writeFileSync('src/knowledge/index.ts', content);
