function classifyEl(el) {
  if (el.querySelector?.('picture') || el.tagName === 'PICTURE') return 'image';
  if (/^H[1-6]$/.test(el.tagName)) return 'title';
  if (el.querySelector?.('a') || el.tagName === 'A') return 'cta';
  if (el.textContent.trim()) return 'description';
  return '';
}

export default function decorate(block) {
  const parts = { image: [], title: [], description: [], cta: [] };

  [...block.querySelectorAll(':scope > div > div')].forEach((cell) => {
    const nodes = cell.children.length ? [...cell.children] : [cell];
    nodes.forEach((el) => {
      const pic = el.tagName === 'PICTURE' ? el : el.querySelector?.('picture');
      if (pic) {
        parts.image.push(pic);
        if (el !== pic && el.textContent.trim()) parts.title.push(el);
        return;
      }
      const kind = classifyEl(el);
      if (kind) parts[kind].push(el);
    });
  });

  const image = document.createElement('div');
  image.className = 'banner-image';
  image.append(...parts.image);

  const body = document.createElement('div');
  body.className = 'banner-body';
  ['title', 'description', 'cta'].forEach((kind) => {
    if (!parts[kind].length) return;
    const wrap = document.createElement('div');
    wrap.className = `banner-${kind}`;
    wrap.append(...parts[kind]);
    body.append(wrap);
  });

  block.replaceChildren(image, body);
}
