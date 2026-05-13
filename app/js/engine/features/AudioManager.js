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

    playStepAudio(paso) {
        if (!paso) return;

        if (SoundManager.isMuted()) {
            this.stop();
            return;
        }

        this.stop();

        // Volviendo al sistema numérico puro por petición del usuario
        const numericId = paso.id.replace('paso', '');
        const url = `${this.basePath}${numericId}.mp3`;

        console.log(`[AudioManager] Reproduciendo audio: ${url}`);
        this.currentAudio = new Audio(url);
        this.currentAudio.play().catch(err => {
            console.warn(`[AudioManager] Audio no encontrado: ${url}`);
        });
    }

    _slugify(text) {
        return text.toString().toLowerCase().trim()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quitar acentos
            .replace(/\s+/g, '_')           // Espacios por guiones bajos
            .replace(/[^\w-]+/g, '')       // Quitar caracteres especiales
            .replace(/--+/g, '_');          // Quitar guiones dobles
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
