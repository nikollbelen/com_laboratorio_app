import { SoundManager } from '../../utils/SoundManager.js';

/**
 * AudioManager - Gestión de locuciones dinámicas
 * Se encarga de reproducir los audios generados por ElevenLabs.
 * Implementa un sistema de canal único (detiene el audio anterior al iniciar uno nuevo).
 */
export class AudioManager {
    constructor() {
        this.currentAudio = null;
        this.basePath = './audios/';
    }

    /**
     * Reproduce el audio asociado a un ID de paso.
     * @param {string} pasoId - ID del paso (ej: "paso2_5_1")
     */
    playStepAudio(pasoId) {
        if (!pasoId) return;

        // Si el sonido está silenciado globalmente, no reproducimos nada
        if (SoundManager.isMuted()) {
            this.stop();
            return;
        }

        // 1. Detener cualquier audio que se esté reproduciendo actualmente
        this.stop();

        // 2. Construir la ruta: paso2_5_1 -> 2_5_1.mp3
        const fileName = pasoId.replace('paso', '') + '.mp3';
        const url = `${this.basePath}${fileName}`;

        // 3. Crear y reproducir
        this.currentAudio = new Audio(url);
        
        this.currentAudio.play().catch(err => {
            // No alertamos al usuario para no interrumpir la experiencia si falta un audio
            console.warn(`[AudioManager] Audio no encontrado o bloqueado para ${pasoId}: ${url}`);
        });
    }

    /**
     * Detiene la reproducción actual de forma inmediata.
     */
    stop() {
        if (this.currentAudio) {
            try {
                this.currentAudio.pause();
                this.currentAudio.currentTime = 0;
            } catch (e) {
                // Silenciamos posibles errores al pausar un audio ya terminado
            }
            this.currentAudio = null;
        }
    }
}
