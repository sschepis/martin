const fs = require('fs');

const fst = fs.readFileSync('fst.md', 'utf-8');
const sds = fs.readFileSync('sds.md', 'utf-8');

// Full versions
const fstFull = fst;
const sdsFull = sds;

// Compact version of FST: Just the headers (vocabulary)
const fstCompact = fst.split('\n')
  .filter(line => line.startsWith('#'))
  .join('\n');

// Compact version of SDS: Headers and bullet points (rules and choices)
const sdsCompact = sds.split('\n')
  .filter(line => line.startsWith('#') || line.trim().startsWith('* '))
  .join('\n');

const content = `// Auto-generated knowledge file
export const FST_KNOWLEDGE_FULL = ${JSON.stringify(fstFull)};
export const FST_KNOWLEDGE_COMPACT = ${JSON.stringify(fstCompact)};

export const SDS_KNOWLEDGE_FULL = ${JSON.stringify(sdsFull)};
export const SDS_KNOWLEDGE_COMPACT = ${JSON.stringify(sdsCompact)};
`;

fs.writeFileSync('src/knowledge/index.ts', content);
