const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../app/verge3d_assets');
const JS_FILE = path.join(ASSETS_DIR, 'v3d.js');

function cleanHTML() {
    const files = fs.readdirSync(ASSETS_DIR);
    const htmlFile = files.find(f => f.endsWith('.html'));
    if (!htmlFile) return;

    const filePath = path.join(ASSETS_DIR, htmlFile);
    let content = fs.readFileSync(filePath, 'utf8');

    content = content.replace(/<title>Verge3D[^<]*<\/title>/gi, '<title>Laboratorio 3D</title>');
    content = content.replace(/<meta[^>]*Verge3D[^>]*>/gi, '');
    content = content.replace(/<div id="fullscreen-button"[^>]*><\/div>/gi, '');
    content = content.replace(/Verge3D/gi, '3D');

    fs.writeFileSync(filePath, content);
    console.log('HTML cleaned.');
}

function cleanJS() {
    if (!fs.existsSync(JS_FILE)) return;
    let content = fs.readFileSync(JS_FILE, 'utf8');

    const bannerRegex = /([a-zA-Z0-9_$]+)\.innerHTML\s*=\s*[`"'].*?MADE WITH VERGE3D TRIAL.*?[`"']\s*,\s*([a-zA-Z0-9_$]+)\.appendChild\(\1\)\s*,\s*setTimeout\(\s*\(function\(\)\{.*?\1\.textContent\)\s*\|\|\s*([a-zA-Z0-9_$]+)\.dispose\(\)\}\s*\)\s*,1e3\)/;
    if (bannerRegex.test(content)) {
        content = content.replace(bannerRegex, (match, div, parent, app) => {
            return `${div}.innerHTML = ""; ${parent}.appendChild(${div}); setTimeout(() => !${parent}.contains(${div}) && ${app}.dispose(), 1000)`;
        });
    }

    fs.writeFileSync(JS_FILE, content);
    console.log('v3d.js cleaned.');
}

function activateXZ() {
    const files = fs.readdirSync(ASSETS_DIR);
    
    // Buscamos el archivo JS de la aplicación (el que tiene la extensión .gltf)
    const appJS = files.find(f => {
        if (!f.endsWith('.js') || f === 'v3d.js' || f.includes('visual_logic') || f.includes('.wasm')) return false;
        const content = fs.readFileSync(path.join(ASSETS_DIR, f), 'utf8');
        return content.includes('.gltf');
    });

    if (!appJS) return;

    const filePath = path.join(ASSETS_DIR, appJS);
    let content = fs.readFileSync(filePath, 'utf8');

    // Aplicamos lo que dice la imagen: cambiar .gltf por .gltf.xz
    if (content.includes('.gltf') && !content.includes('.gltf.xz')) {
        content = content.replace(/\.gltf/g, '.gltf.xz');
        fs.writeFileSync(filePath, content);
        console.log(`[OPTIMIZED] ${appJS}: Scene URL changed to .gltf.xz`);
    }
}

cleanHTML();
cleanJS();
activateXZ();
