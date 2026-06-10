const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

/* ===== ENSURE DIST EXISTS ===== */

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

/* ===== READ SOURCE FILES ===== */

let html = fs.readFileSync(path.join(srcDir, 'index.html'), 'utf8');
const css  = fs.readFileSync(path.join(srcDir, 'styles.css'), 'utf8');
const js   = fs.readFileSync(path.join(srcDir, 'main.js'), 'utf8');

/* ===== INLINE CSS ===== */

html = html.replace(
    '<link rel="stylesheet" href="styles.css">',
    `<style>\n${css}</style>`
);

/* ===== INLINE JS ===== */

html = html.replace(
    '<script src="main.js"></script>',
    `<script>\n${js}</script>`
);

/* ===== WRITE DIST ===== */

const outPath = path.join(distDir, 'index.html');
fs.writeFileSync(outPath, html, 'utf8');

console.log(`✅  Built → dist/index.html  (${(html.length / 1024).toFixed(1)} KB)`);
