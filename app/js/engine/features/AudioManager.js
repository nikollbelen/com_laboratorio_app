import { SoundManager } from '../../utils/SoundManager.js';

/**
 * AudioManager - Gestión de locuciones dinámicas
 * Se encarga de reproducir los audios generados por ElevenLabs.
 * Implementa un sistema de canal único (detiene el audio anterior al iniciar uno nuevo).
 */
export class AudioManager {
    constructor() {
        this.currentAudio = null;
        this.currentId = null;
        this.basePath = './audios/';
    }

    playStepAudio(paso) {
        if (!paso) return;

        // Soporta tanto el objeto paso completo como solo el ID (string)
        const id = (typeof paso === 'string') ? paso : paso.id;
        if (!id) return;

        // Lógica de TOGGLE: Si es el mismo audio y está sonando, pausamos
        if (this.currentId === id && this.currentAudio && !this.currentAudio.paused) {
            this.stop();
            return;
        }

        if (SoundManager.isMuted()) {
            this.stop();
            return;
        }

        this.stop();
        this.currentId = id;

        const numericId = id.replace('paso', '');
        const url = `${this.basePath}${numericId}.mp3`;

        console.log(`[AudioManager] Solicitud de audio para ID: "${id}" -> URL: ${url}`);
        
        this.currentAudio = new Audio(url);

        // Eventos para sincronizar la UI
        this.currentAudio.addEventListener('play', () => {
            window.dispatchEvent(new CustomEvent('v3d:audioStarted', { detail: { id } }));
        });
        this.currentAudio.addEventListener('ended', () => {
            window.dispatchEvent(new CustomEvent('v3d:audioEnded', { detail: { id } }));
            this.currentId = null;
        });
        this.currentAudio.addEventListener('pause', () => {
            window.dispatchEvent(new CustomEvent('v3d:audioEnded', { detail: { id } }));
        });

        this.currentAudio.play().catch(err => {
            console.warn(`[AudioManager] Error o Audio no encontrado: ${url}`, err);
            window.dispatchEvent(new CustomEvent('v3d:audioEnded', { detail: { id } }));
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
