// Run on the machine holding the source database; no network transfer.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const Database = require('better-sqlite3');
async function main() {
  const [source, destination] = process.argv.slice(2);
  if (!source || !destination) throw new Error('Usage: node backup.cjs <source.sqlite> <backup-directory-outside-web-root>');
  const root = path.resolve(__dirname, '../..');
  const outputDir = path.resolve(destination);
  const relative = path.relative(root, outputDir);
  if (!relative || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative))) {
    throw new Error('Backup directory must be outside the web project');
  }
  const db = new Database(path.resolve(source), { readonly: true, fileMustExist: true });
  try {
    fs.mkdirSync(outputDir, { recursive: true });
    const folder = fs.mkdtempSync(path.join(outputDir, 'factory-exam-'));
    const output = path.join(folder, 'factory-exam.sqlite');
    await db.backup(output);
    const copy = new Database(output, { readonly: true, fileMustExist: true });
    try {
      const integrity = copy.pragma('integrity_check', { simple: true });
      if (integrity !== 'ok') throw new Error('Backup integrity check failed');
    } finally { copy.close(); }
    const hash = crypto.createHash('sha256');
    for await (const chunk of fs.createReadStream(output)) hash.update(chunk);
    fs.writeFileSync(path.join(folder, 'manifest.json'), JSON.stringify({
      createdAt: new Date().toISOString(), file: 'factory-exam.sqlite',
      bytes: fs.statSync(output).size, sha256: hash.digest('hex'), integrity: 'ok',
      includesExternalFiles: false,
    }, null, 2));
    console.log('Backup verified: ' + folder);
  } finally { db.close(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
