// Redirect display-only image URLs; never change saved questions or quiz identities.
(() => {
  const mapping = window.factoryOfflineImages || {};
  if (!Object.keys(mapping).length) return;
  function replaceImage(image) {
    const source = image.getAttribute('src');
    if (Object.hasOwn(mapping, source)) image.setAttribute('src', mapping[source]);
  }
  function scan(node) {
    if (node.nodeType !== 1) return;
    if (node.tagName === 'IMG') replaceImage(node);
    node.querySelectorAll('img').forEach(replaceImage);
  }
  new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes') replaceImage(record.target);
      else record.addedNodes.forEach(scan);
    }
  }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['src'] });
  document.querySelectorAll('img').forEach(replaceImage);
})();
