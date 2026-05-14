const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../app/verge3d_assets');
const JS_FILE = path.join(ASSETS_DIR, 'v3d.js');

function cleanHTML() {
    console.log('Finding HTML file...');
    
    if (!fs.existsSync(ASSETS_DIR)) {
        console.error('Assets directory not found:', ASSETS_DIR);
        return;
    }

    const files = fs.readdirSync(ASSETS_DIR);
    const htmlFiles = files.filter(f => f.endsWith('.html'));

    if (htmlFiles.length === 0) {
        console.error('No HTML file found in:', ASSETS_DIR);
        return;
    }

    const HTML_FILE = path.join(ASSETS_DIR, htmlFiles[0]);
    console.log('Cleaning HTML file:', HTML_FILE);

    let content = fs.readFileSync(HTML_FILE, 'utf8');

    // Remove tags/comments containing VERGE3D
    // 1. Meta tags and title
    content = content.replace(/<title>Verge3D[^<]*<\/title>/gi, '<title>Web Interactive</title>');
    content = content.replace(/<meta[^>]*Verge3D[^>]*>/gi, '');
    
    // 2. Comments
    content = content.replace(/<!--[^>]*Verge3D[^>]*-->/gi, '');
    
    // 3. Remove Fullscreen Button
    content = content.replace(/<div id="fullscreen-button"[^>]*><\/div>/gi, '');

    // 4. Text references (like in noscript)
    content = content.replace(/Verge3D/gi, '3D');

    // Clean up empty lines left by removed tags
    content = content.replace(/^\s*[\r\n]/gm, '');

    fs.writeFileSync(HTML_FILE, content);
    console.log('HTML cleaned successfully.');
}

function cleanJS() {
    console.log('Cleaning v3d.js file...');
    if (!fs.existsSync(JS_FILE)) {
        console.error('JS file not found:', JS_FILE);
        return;
    }

    let content = fs.readFileSync(JS_FILE, 'utf8');

    // 1. Remove License Log
    // Pattern: console.log("Verge3D "+n+" "+Bn()+" ("+(3483952072==gn(Kt)?"Trial":"License")+", "+(t?"WebGL 2.0":"WebGL 1.0")+")")
    const logRegex = /console\.log\("[^\"]*"\s*\+\s*[a-zA-Z0-9_$]+\s*\+\s*" "\s*\+\s*[a-zA-Z0-9_$]+\(\)\s*\+\s*" \("\s*\+\s*\([^)]+\?\s*"Trial"\s*:\s*"License"\)[^)]+\)\)/;
    if (logRegex.test(content)) {
        content = content.replace(logRegex, '/* console.log cleaned */');
        console.log('License log removed.');
    } else {
        console.warn('License log pattern not found, trying fallback...');
        content = content.replace(/console\.log\("[^\"]*\"[^)]+\"Trial\"[^)]+\"License\"[^)]+\)/, '/* console.log cleaned */');
    }

    // 2. Replace Banner
    // Pattern: o.innerHTML=`<a ...>MADE WITH VERGE3D TRIAL</a>`,n.appendChild(o),setTimeout((function(){n.contains(o)&&890310108==gn(o.textContent)||e.dispose()}),1e3)
    const bannerRegex = /([a-zA-Z0-9_$]+)\.innerHTML\s*=\s*[`"'].*?MADE WITH VERGE3D TRIAL.*?[`"']\s*,\s*([a-zA-Z0-9_$]+)\.appendChild\(\1\)\s*,\s*setTimeout\(\s*\(function\(\)\{.*?\1\.textContent\)\s*\|\|\s*([a-zA-Z0-9_$]+)\.dispose\(\)\}\s*\)\s*,1e3\)/;
    
    if (bannerRegex.test(content)) {
        content = content.replace(bannerRegex, (match, div, parent, app) => {
            console.log(`Replacing banner block (div: ${div}, parent: ${parent}, app: ${app})`);
            return `${div}.innerHTML = ""; ${parent}.appendChild(${div}); setTimeout(() => !${parent}.contains(${div}) && ${app}.dispose(), 1000)`;
        });
    } else {
        console.warn('Banner block pattern not found.');
    }

    // 3. General Cleanup
    // Remove any other occurrences of "VERGE3D" (case insensitive)
    // We should be careful not to break URLs if they are used for something else, 
    // but the user asked to eliminate any other match.
    // However, usually we want to keep "v3d" internally if it's the namespace.
    // The request says "elimina cualquier otra coincidencia de la palabra VERGE3D".
    content = content.replace(/VERGE3D/gi, (match) => {
        // If it's part of a URL like soft8soft.com/verge3d, we might want to keep it or hide it.
        // But the instruction is strict.
        return '3D';
    });

    fs.writeFileSync(JS_FILE, content);
    console.log('v3d.js cleaned successfully.');
}

cleanHTML();
cleanJS();
