const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
module.exports = function installOfflineImages(app, directory) {
  let mapping = {};
  if (directory) {
    const root = path.resolve(directory);
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
    mapping = Object.fromEntries(Object.entries(manifest).map(([url, file]) => {
      if (!/^https?:\/\//i.test(url) || !/^[a-f0-9]{64}\.(png|jpg|gif|webp)$/.test(file)) {
        throw new Error('Invalid offline image manifest');
      }
      if (!fs.existsSync(path.join(root, file))) throw new Error('Missing offline image: ' + file);
      return [url, '/offline-assets/' + file];
    }));
    app.use('/offline-assets', (req, res, next) => {
      if (!/^\/[a-f0-9]{64}\.(png|jpg|gif|webp)$/.test(req.path)) return res.sendStatus(404);
      next();
    }, express.static(root, { index: false, fallthrough: false }));
  }
  app.get('/offline-images-config.js', (_req, res) => {
    res.set('Cache-Control', 'no-store').type('application/javascript').send(
      'window.factoryOfflineImages=' + JSON.stringify(mapping).replace(/</g, '\\u003c') + ';'
    );
  });
};
