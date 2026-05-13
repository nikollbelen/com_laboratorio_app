import { CameraController } from './features/CameraController.js';
import { VisibilityManager } from './features/VisibilityManager.js';
import { HighlightManager } from './features/HighlightManager.js';
import { AnimationPlayer } from './features/AnimationPlayer.js';
import { AnnotationsManager } from './features/AnnotationsManager.js';
import { AudioManager } from './features/AudioManager.js';

export class V3DEngine {
    constructor(iframeId) {
        this.iframeId = iframeId;
        this.iframe = document.getElementById(iframeId);
        this.ready = false;
        
        // Estado global interno del motor (selección manual de etiquetas)
        this.currentGlobalSelection = { obj: null };
        this.currentStepSelection = [];
    }

    async waitForReady() {
        return new Promise((resolve) => {
            let preloaderPatched = false;

            const check = () => {
                const iframeWin = this.iframe.contentWindow;
                
                if (iframeWin && iframeWin.v3d && iframeWin.v3d.apps && iframeWin.v3d.apps.length > 0) {
                    const appInstance = iframeWin.v3d.apps[0];
                    
                    // Interceptamos el preloader lo antes posible para actualizar el contador 0-100%
                    if (!preloaderPatched && appInstance.preloader) {
                        const originalUpdate = appInstance.preloader.onUpdate;
                        appInstance.preloader.onUpdate = function(percentage) {
                            if (originalUpdate) originalUpdate.call(appInstance.preloader, percentage);
                            const pctEl = document.getElementById('loading_percentage');
                            if (pctEl) pctEl.innerHTML = Math.round(percentage) + '%';
                        };
                        preloaderPatched = true;
                    }

                    // Verificamos que la app haya cargado completamente (escena y controles)
                    if (appInstance.scene && appInstance.controls) {
                        this._initFeatures(iframeWin);
                        resolve();
                        return;
                    }
                }
                setTimeout(check, 50); // Sondeo rápido para no perder eventos del preloader
            };
            check();
        });
    }

    _initFeatures(iframeWindow) {
        this.instance = iframeWindow.v3d.apps[0];
        
        this.camera = new CameraController(this.instance);
        // Exponer funciones globales para la consola
        window.enableCameraDebug = () => this.camera.enableDebug();
        window.disableCameraDebug = () => this.camera.disableDebug();

        this.visibility = new VisibilityManager(this.instance);
        this.highlights = new HighlightManager(this.instance, iframeWindow);
        this.animations = new AnimationPlayer(this.instance, iframeWindow);
        this.annotations = new AnnotationsManager(this.instance, iframeWindow, this.highlights);
        this.audio = new AudioManager();
        
        this.ready = true;
        console.log('[V3DEngine] Motor 3D modular inicializado.');
        console.log('%c[Debug Tip] %cEscribe %cenableCameraDebug()%c para activar el control manual y logs de cámara.', 
            'color: #ff00ff; font-weight: bold;', 'color: white;', 'color: #00ff00; font-family: monospace;', 'color: white;');
    }

    resetScene(inicioConfig) {
        if (!this.ready) return;
        
        this.currentGlobalSelection.obj = null;
        this.currentStepSelection = [];
        
        this.annotations.removeAll();
        this.highlights.disable();
        
        if (inicioConfig) {
            this.visibility.showEverything();
            this.visibility.hideAll(inicioConfig.ocultarObjetos || []);
        }
        this.visibility.showAll(['chute_de_descarga_mesh']); // Default en visual_logic.js
    }

    ejecutarInicioEstado(inicioConfig, duration = 0.005) {
        if (!inicioConfig || !this.ready) return;

        this.animations.stop('ALL_OBJECTS');
        if (inicioConfig.animacionInicio) {
            this.animations.setFrame(inicioConfig.animacionInicio.nombre, inicioConfig.animacionInicio.frame);
        }
        
        this.visibility.showEverything();
        this.visibility.hideAll(inicioConfig.ocultarObjetos || []);
        
        if (inicioConfig.camara && inicioConfig.camaraDireccion) {
            this.camera.tween(inicioConfig.camara, inicioConfig.camaraDireccion, duration);
        }
    }

    playStepAudio(paso) {
        if (this.audio) this.audio.playStepAudio(paso);
    }
}
