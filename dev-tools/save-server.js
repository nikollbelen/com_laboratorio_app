const http = require('http');
const fs = require('fs');
const path = require('path');
const { runScanner } = require('./scan-assets');

const PORT = 3001;
const TARGET_FILE = path.join(__dirname, '../app/info.json');
const ASSETS_FILE = path.join(__dirname, '../app/assets_db.json');
const ASSETS_DIR = path.join(__dirname, '../app/verge3d_assets');


const server = http.createServer((req, res) => {
    // Habilitar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Normalizar URL
    const url = req.url.split('?')[0]; 
    console.log(`[Request] ${req.method} ${url}`);

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // --- ENDPOINT: GUARDAR CONFIG ---
    if (req.method === 'POST' && url === '/save') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                JSON.parse(body); 
                fs.writeFile(TARGET_FILE, body, 'utf8', (err) => {
                    if (err) { 
                        res.writeHead(500); 
                        res.end(JSON.stringify({ status: 'error', message: err.message })); 
                    } else { 
                        console.log(`[OK] info.json actualizado.`); 
                        res.writeHead(200); 
                        res.end(JSON.stringify({ status: 'success' })); 
                    }
                });
            } catch (e) { res.writeHead(400); res.end(JSON.stringify({ status: 'error', message: 'JSON inválido' })); }
        });
    } 
    // --- ENDPOINT: GENERAR TTS (ElevenLabs) ---
    else if (req.method === 'POST' && url === '/tts') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { text, fileName, extraFileNames } = JSON.parse(body);
                if (!text || !fileName) throw new Error('Faltan parámetros (text, fileName)');

                // Importación dinámica para soporte de ES Modules en CommonJS
                const { TTSService } = await import('./services/TTSService.mjs');
                const tts = new TTSService();
                
                const outputDir = path.join(__dirname, '../app/audios');
                const filePath = await tts.generateAudio(text, outputDir, fileName);

                // Si hay nombres de archivo extra (porque el texto se repite), los clonamos
                if (extraFileNames && Array.isArray(extraFileNames)) {
                    extraFileNames.forEach(extraName => {
                        const targetPath = path.join(outputDir, `${extraName}.mp3`);
                        fs.copyFileSync(filePath, targetPath);
                        console.log(`[TTS] Clonado automático a: ${extraName}.mp3`);
                    });
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    status: 'success', 
                    path: `audios/${fileName}.mp3` 
                }));
            } catch (e) {
                console.error('[TTS Error]', e.message);
                res.writeHead(500);
                res.end(JSON.stringify({ status: 'error', message: e.message }));
            }
        });
    }
    // --- ENDPOINT: RECIBIR/OBTENER ASSETS ---
    else if (url === '/assets' || url === '/assets/') {
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                fs.readFile(ASSETS_FILE, 'utf8', (err, existingData) => {
                    const isDifferent = err || (existingData !== body);
                    if (isDifferent) {
                        fs.writeFile(ASSETS_FILE, body, 'utf8', (err) => {
                            if (err) { res.writeHead(500); res.end(); }
                            else { console.log(`[SYNC] Assets DB actualizada.`); res.writeHead(200); res.end(); }
                        });
                    } else {
                        res.writeHead(200);
                        res.end();
                    }
                });
            });
        } else if (req.method === 'GET') {
            fs.readFile(ASSETS_FILE, 'utf8', (err, data) => {
                if (err) { 
                    console.log(`[Warn] No se encontró assets_db.json, enviando vacío.`);
                    res.writeHead(200); 
                    res.end(JSON.stringify({ meshes: [], anims: [] })); 
                } else { 
                    res.writeHead(200, { 'Content-Type': 'application/json' }); 
                    res.end(data); 
                }
            });
        }
    }
    else {
        res.writeHead(404);
        res.end();
    }
});

// --- INICIO DEL SERVIDOR ---
server.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 SERVIDOR DE GUARDADO ACTIVO`);
    console.log(`📍 Puerto: ${PORT}`);
    console.log(`📝 Destino: ${TARGET_FILE}`);
    console.log(`=========================================`);

    // 1. Ejecutar escaneo inicial al arrancar
    console.log(`[Init] Ejecutando escaneo de activos inicial...`);
    runScanner();

});
