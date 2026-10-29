// Read-only inventory. Does not print employee names, scores or secrets.
const Database = require('better-sqlite3');
const fs = require('node:fs');
const path = require('node:path');
const [source, reportPath] = process.argv.slice(2);
if (!source || !reportPath) {
  console.error('Usage: node inspect-data.cjs <backup.sqlite> <report.json>');
  process.exit(1);
}
let db;
try {
  if (fs.existsSync(reportPath)) throw new Error('Report already exists; choose a new filename');
  if (path.resolve(source) === path.resolve(reportPath)) throw new Error('Report must not replace database');
  db = new Database(source, { readonly: true, fileMustExist: true });
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
  const counts = {}, external = new Set(), local = new Set();
  let embeddedImages = 0;
  const quote = value => '"' + value.replaceAll('"', '""') + '"';
  function inspect(value, key = '') {
    if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) inspect(v, k);
    } else if (typeof value === 'string') {
      if (/^data:image\//i.test(value)) { embeddedImages++; return; }
      if (/image|photo|attachment|fileurl/i.test(key) && value.trim()) {
        if (/^https?:\/\//i.test(value)) external.add(value);
        else local.add(value);
      }
    }
  }
  for (const { name } of tables) {
    counts[name] = db.prepare(`SELECT COUNT(*) AS n FROM ${quote(name)}`).get().n;
    const columns = db.prepare(`PRAGMA table_info(${quote(name)})`).all()
      .filter(c => /json|payload|image|photo|attachment|fileurl/i.test(c.name));
    if (!columns.length) continue;
    for (const row of db.prepare(`SELECT ${columns.map(c => quote(c.name)).join(',')} FROM ${quote(name)}`).iterate()) {
      for (const [key, value] of Object.entries(row)) {
        if (typeof value !== 'string') continue;
        try { inspect(JSON.parse(value), key); } catch { inspect(value, key); }
      }
    }
  }
  fs.writeFileSync(reportPath, JSON.stringify({
    createdAt: new Date().toISOString(), integrity: db.pragma('integrity_check', { simple: true }),
    counts, embeddedImageOccurrences: embeddedImages,
    externalAssetUrls: [...external].sort(), localAssetReferences: [...local].sort(),
    note: 'Asset references may contain private URLs. Keep this report private. Repeated snapshots count repeatedly. No files downloaded; no source data changed. Review code dependencies separately.',
  }, null, 2), { flag: 'wx' });
  console.log('Read-only inventory saved: ' + reportPath);
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { if (db) db.close(); }
