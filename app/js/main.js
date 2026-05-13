/**
 * main.js — Orquestador Principal del Laboratorio
 */

import { SoundManager }   from './utils/SoundManager.js';
import { MenuLateral }    from './components/MenuLateral/MenuLateral.js';
import { AyudasViewer }   from './components/AyudasViewer/AyudasViewer.js';
import { Preloader }      from './components/Preloader/Preloader.js';
import { BotonRetroceso } from './components/BotonRetroceso/BotonRetroceso.js';
import { PantallaMobile } from './components/PantallaMobile/PantallaMobile.js';
import { ModalAyuda }     from './components/ModalAyuda/ModalAyuda.js';
import { ModalObjetivos } from './components/ModalObjetivos/ModalObjetivos.js';
import { ModalEquipo }    from './components/ModalEquipo/ModalEquipo.js';
import { V3DEngine }      from './engine/V3DEngine.js';

// ── Estado global del laboratorio ─────────────────────────────────────────────
const Lab = {
    config:     null,
    menu:       null,
    retroceso:  null,
    historial:  [],
    v3dReady:   false,
    engine:     null
};

// ── Inicialización ────────────────────────────────────────────────────────────
async function init() {
    let config;
    try {
        const resp = await fetch('./info.json');
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        config = await resp.json();
    } catch (e) {
        console.error('[Lab] No se pudo leer info.json:', e);
        return;
    }
    Lab.config = config;

    // Configuración dinámica del iframe (permite cambiar el modelo 3D sin tocar HTML)
    const iframe = document.getElementById('v3d-container');
    if (config.verge3dUrl) {
        iframe.src = config.verge3dUrl;
    } else {
        console.warn("[Lab] No se definió 'verge3dUrl' en info.json. El iframe no cargará.");
    }

    // Aplicar color de tema si está definido
    if (config.themeColor) {
        const hex = config.themeColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const rgb = `${r}, ${g}, ${b}`;

        // Variables legacy (compatibilidad con componentes anteriores)
        document.documentElement.style.setProperty('--theme-color',             config.themeColor);
        document.documentElement.style.setProperty('--theme-color-80',          `rgba(${r}, ${g}, ${b}, 0.8)`);
        document.documentElement.style.setProperty('--theme-color-transparent', `rgba(${r}, ${g}, ${b}, 0.6)`);
        document.documentElement.style.setProperty('--theme-color-shadow',      `rgba(${r}, ${g}, ${b}, 0.4)`);

        // Variables nuevas del sistema Blue Core (para Preloader y UI moderna)
        document.documentElement.style.setProperty('--color-primary',           config.themeColor);
        document.documentElement.style.setProperty('--color-primary-rgb',       rgb);
        document.documentElement.style.setProperty('--color-primary-light',     `rgb(${Math.min(255,r+60)}, ${Math.min(255,g+60)}, ${Math.min(255,b+60)})`);
        document.documentElement.style.setProperty('--color-primary-container', `rgb(${Math.max(0,r-60)}, ${Math.max(0,g-60)}, ${Math.max(0,b-60)})`);
        document.documentElement.style.setProperty('--glow-primary',            `rgba(${r}, ${g}, ${b}, 0.45)`);
        document.documentElement.style.setProperty('--glow-primary-strong',     `rgba(${r}, ${g}, ${b}, 0.75)`);
        document.documentElement.style.setProperty('--gradient-primary',        `linear-gradient(135deg, ${config.themeColor} 0%, rgb(${Math.max(0,r-60)},${Math.max(0,g-60)},${Math.max(0,b-60)}) 100%)`);
    }

    // Inicializamos el nuevo Preloader
    const preloader = new Preloader('preloader-container', {
        labNameES: config.laboratorio,
        labNameEN: config.laboratorioEN || config.laboratorio,
        logoUrl:   config.logoUrl
    });

    // Conectar el botón "INICIAR EXPERIENCIA" con el arranque de la UI
    const preloaderEl = document.getElementById('preloader-container');
    preloaderEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-preloader-btn]');
        if (btn && !btn.disabled) {
            preloader.hide();
            setTimeout(() => {
                document.getElementById('ayudas-container').style.display = 'flex';
                document.getElementById('menu-container').style.display   = 'flex';
            }, 400);
        }
    });

    new PantallaMobile('mobile-container');
    new ModalAyuda('modal-ayuda-container');
    new ModalObjetivos('modal-objetivos-container', config.objetivos || []);
    new ModalEquipo('modal-equipo-container', config.epp || []);
    new AyudasViewer('ayudas-container', config.ayudas);
    
    Lab.retroceso = new BotonRetroceso('retroceso-container');
    
    Lab.menu = new MenuLateral(
        'menu-container',
        config.menu,
        config.menuIconImage,
        config.laboratorio,
        config.laboratorioEN || config.laboratorio,
    );

    window.addEventListener('menu:paso', onPasoSeleccionado);
    window.addEventListener('menu:reset', onMenuReset);
    window.addEventListener('retroceso:click', onRetroceso);
    window.addEventListener('v3d:mostrar_retroceso', () => Lab.retroceso?.mostrar());
    window.addEventListener('v3d:ocultar_retroceso',  () => Lab.retroceso?.ocultar());
    window.addEventListener('v3d:navegar', (e) => onNavegacionInterna(e.detail?.id));
    window.addEventListener('v3d:playAudio', (e) => Lab.engine.playStepAudio(e.detail.id));

    // Sincronizar idioma con el iframe
    window.addEventListener('lang:change', (e) => {
        const iframe = document.getElementById('v3d-container');
        if (!iframe || !iframe.contentDocument) return;
        const iframeBody = iframe.contentDocument.body;
        if (!iframeBody) return;
        const lang = e.detail?.lang || 'es';
        iframeBody.classList.toggle('lang-es', lang === 'es');
        iframeBody.classList.toggle('lang-en', lang === 'en');
    });

    // Inicializamos el motor 3D
    Lab.engine = new V3DEngine('v3d-container');
    
    // Esperamos a que el motor esté listo
    Lab.engine.waitForReady().then(() => {
        // Actualizar el elemento oculto que el MutationObserver del Preloader observa
        const pctEl = document.getElementById('loading_percentage');
        if (pctEl) pctEl.innerHTML = '100%';

        // Forzar habilitación del botón (por si el observer no lo detectó)
        preloader.setProgress(100);

        onVerge3DReady();
    });
}

function onVerge3DReady() {
    Lab.v3dReady = true;
    Lab.engine.ejecutarInicioEstado(Lab.config.inicioEstado);
    SoundManager.playMenuOpen();
}

/**
 * Busca un nodo en el árbol del menú y aplica Auto-Forward si solo tiene un hijo
 */
function obtenerNodoFinal(id) {
    let nodo = buscarNodoRecursivo(Lab.config.menu, id);
    if (!nodo) return id;

    if (nodo.children && nodo.children.length === 1) {
        console.log(`[Lab] Auto-Forward: ${id} -> ${nodo.children[0].id}`);
        return obtenerNodoFinal(nodo.children[0].id);
    }
    
    return id;
}

function buscarNodoRecursivo(menu, id) {
    if (!menu || !id) return null;
    for (const item of menu) {
        if (item.id === id) return item;
        if (item.children) {
            const found = buscarNodoRecursivo(item.children, id);
            if (found) return found;
        }
    }
    return null;
}

/**
 * Ejecuta un paso utilizando la nueva arquitectura modular
 * @param {string} pasoId
 * @param {boolean} skipAudio - Si es true, no reproducirá la locución (útil en retroceso)
 */
function ejecutarPaso(pasoId, skipAudio = false) {
    const pasoConfig = buscarNodoRecursivo(Lab.config.menu, pasoId);
    if (!pasoConfig) return;

    Lab.engine.resetScene(Lab.config.inicioEstado);
    
    // Reproducir audio del paso si no se indica lo contrario
    if (!skipAudio) {
        Lab.engine.playStepAudio(pasoId);
    } else {
        if (Lab.engine.audio) Lab.engine.audio.stop();
    }

    // 1. Visibilidad y Resaltado
    Lab.engine.visibility.showEverything();
    Lab.engine.visibility.hideAll(pasoConfig.objetos_ocultar || []);
    
    Lab.engine.currentStepSelection = pasoConfig.objeto_resaltar || [];
    if (Lab.engine.currentStepSelection.length) {
        Lab.engine.highlights.enable(Lab.engine.currentStepSelection);
    }

    // 2. Cámara
    if (pasoConfig.camara) {
        Lab.engine.camera.tween(pasoConfig.camara, pasoConfig.camaraDireccion, 1.2);
    }

    // 3. Animaciones
    if (pasoConfig.detener_animaciones) {
        Lab.engine.animations.stop('ALL_OBJECTS');
    }

    if (pasoConfig.animaciones && Array.isArray(pasoConfig.animaciones)) {
        pasoConfig.animaciones.forEach(anim => {
            const start = Array.isArray(anim.frame) ? anim.frame[0] : (anim.frame || 0);
            const end   = Array.isArray(anim.frame) ? anim.frame[1] : (anim.frame || 0);
            const mode  = anim.modo || 'LoopOnce';
            
            Lab.engine.animations.play(anim.nombre, start, end, mode);
        });
    }

    // 4. Navegación Jerárquica y Etiquetas
    const hijos = pasoConfig.children && pasoConfig.children.length > 0;
    if (hijos) {
        pasoConfig.children.forEach(child => {
            if (child.etiqueta && child.flecha) {
                Lab.engine.annotations.createLabel(child, true, Lab.engine.currentStepSelection, Lab.engine.currentGlobalSelection);
            }
        });
    } else if (pasoConfig.etiqueta && pasoConfig.flecha) {
        Lab.engine.annotations.createLabel(pasoConfig, false, Lab.engine.currentStepSelection, Lab.engine.currentGlobalSelection);
    }
}

function onNavegacionInterna(id) {
    if (!id || !Lab.v3dReady) return;
    
    const idFinal = obtenerNodoFinal(id);
    
    if (Lab.historial[Lab.historial.length - 1] !== idFinal) {
        Lab.historial.push(idFinal);
    }
    
    ejecutarPaso(idFinal);
    if (Lab.historial.length > 0) Lab.retroceso?.mostrar();
}

function onPasoSeleccionado(e) {
    const paso = e.detail?.paso;
    if (!paso || !Lab.v3dReady) return;

    const idFinal = obtenerNodoFinal(paso.id);
    Lab.historial = [idFinal];
    
    ejecutarPaso(idFinal);
    Lab.retroceso?.ocultar(); 
}

function onMenuReset() {
    if (!Lab.v3dReady) return;
    
    Lab.historial = [];
    Lab.retroceso?.ocultar();
    
    Lab.engine.resetScene(Lab.config.inicioEstado);
    Lab.engine.ejecutarInicioEstado(Lab.config.inicioEstado, 1.2);
    
    if (Lab.engine.audio) Lab.engine.audio.stop();
    
    console.log('[Lab] → Reset: Cámara a Inicio');
}

function onRetroceso() {
    if (Lab.historial.length <= 1) {
        onMenuReset();
        return;
    }
    
    Lab.historial.pop();
    const idAnterior = Lab.historial[Lab.historial.length - 1];
    
    if (Lab.engine.audio) Lab.engine.audio.stop();
    
    ejecutarPaso(idAnterior, true);
    
    if (Lab.historial.length <= 1) {
        Lab.retroceso?.ocultar();
    }
}

init();
