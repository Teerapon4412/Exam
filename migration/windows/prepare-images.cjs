const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const [mappingFile, destination] = process.argv.slice(2);
try {
  if (!mappingFile || !destination) throw new Error('Usage: node prepare-images.cjs <mapping.json> <new-assets-directory>');
  const rows = JSON.parse(fs.readFileSync(mappingFile, 'utf8').replace(/^\uFEFF/, ''));
  const manifest = {};
  const files = new Map();
  for (const row of Array.isArray(rows) ? rows : [rows]) {
    if (row.Status !== 'OK' || !/^https?:\/\//i.test(row.Url)) throw new Error('Invalid or failed download entry');
    const data = fs.readFileSync(row.File);
    let ext;
    if (data.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) ext = 'png';
    else if (data[0] === 255 && data[1] === 216 && data[2] === 255) ext = 'jpg';
    else if (/^GIF8[79]a$/.test(data.toString('ascii', 0, 6))) ext = 'gif';
    else if (data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP') ext = 'webp';
    else throw new Error('Unsupported image signature: ' + path.basename(row.File));
    const filename = crypto.createHash('sha256').update(data).digest('hex') + '.' + ext;
    manifest[row.Url] = filename;
    files.set(filename, data);
  }
  if (!Object.keys(manifest).length) throw new Error('No images');
  const root = path.resolve(destination);
  if (fs.existsSync(root)) throw new Error('Destination already exists; choose a new directory');
  fs.mkdirSync(root, { recursive: true });
  for (const [filename, data] of files) fs.writeFileSync(path.join(root, filename), data, { flag: 'wx' });
  fs.writeFileSync(path.join(root, 'manifest.json'), JSON.stringify(manifest, null, 2), { flag: 'wx' });
  console.log(`Ready: ${Object.keys(manifest).length} URLs, ${files.size} unique images. Database unchanged.`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
