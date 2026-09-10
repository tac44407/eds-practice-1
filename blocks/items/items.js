const PAGE_SIZE = 20;

function getJsonUrl(block) {
  const link = block.querySelector('a[href]');
  if (link) return new URL(link.href, window.location.origin);
  const text = block.textContent.trim();
  if (text) return new URL(text, window.location.origin);
  return new URL('/products.json', window.location.origin);
}

function isUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
}

function formatPrice(value) {
  const amount = Number(String(value).replace(/[^0-9.-]/g, ''));
  if (Number.isNaN(amount)) return value;
  return `₹${amount.toLocaleString('en-IN')}`;
}

function cellValue(column, value) {
  if (value === undefined || value === null) return '';
  if (column.toLowerCase() === 'price') return formatPrice(value);
  return value;
}

function renderTable(rows, columns) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  columns.forEach((column) => {
    const th = document.createElement('th');
    th.textContent = column;
    headerRow.append(th);
  });
  thead.append(headerRow);

  const tbody = document.createElement('tbody');
  rows.forEach((row) => {
    const tr = document.createElement('tr');
    columns.forEach((column) => {
      const td = document.createElement('td');
      const value = cellValue(column, row[column]);
      if (isUrl(value)) {
        const a = document.createElement('a');
        a.href = value;
        a.textContent = value;
        td.append(a);
      } else {
        td.textContent = value;
      }
      tr.append(td);
    });
    tbody.append(tr);
  });

  table.append(thead, tbody);
  return table;
}

async function loadPage(block, jsonUrl, offset) {
  const url = new URL(jsonUrl);
  url.searchParams.set('offset', String(offset));
  url.searchParams.set('limit', String(PAGE_SIZE));

  const resp = await fetch(url);
  if (!resp.ok) {
    block.textContent = 'Unable to load items.';
    return;
  }

  const json = await resp.json();
  const rows = json.data || [];
  const total = json.total || rows.length;
  const columns = json.columns || (rows[0] ? Object.keys(rows[0]) : []);

  const nav = document.createElement('div');
  nav.className = 'items-pagination';

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.textContent = 'Previous';
  prev.disabled = offset <= 0;
  prev.addEventListener('click', () => loadPage(block, jsonUrl, Math.max(0, offset - PAGE_SIZE)));

  const status = document.createElement('span');
  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + rows.length, total);
  status.textContent = `${from}–${to} of ${total}`;

  const next = document.createElement('button');
  next.type = 'button';
  next.textContent = 'Next';
  next.disabled = offset + PAGE_SIZE >= total;
  next.addEventListener('click', () => loadPage(block, jsonUrl, offset + PAGE_SIZE));

  nav.append(prev, status, next);
  block.replaceChildren(renderTable(rows, columns), nav);
}

export default async function decorate(block) {
  const jsonUrl = getJsonUrl(block);
  block.textContent = '';
  await loadPage(block, jsonUrl, 0);
}
