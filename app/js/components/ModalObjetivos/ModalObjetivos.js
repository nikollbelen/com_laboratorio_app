/**
 * ModalObjetivos - Componente que representa el modal de objetivos y ruta de aprendizaje.
 */
export class ModalObjetivos {
    constructor(containerId, data = {}) {
        this.container = document.getElementById(containerId);
        this.data = {
            title: data.title || 'OBJETIVOS DEL LABORATORIO',
            subtitle: data.subtitle || 'Objetivos Principales y Ruta de Aprendizaje',
            objectives: data.objectives || [
                'Identificar componentes y subsistemas clave.',
                'Comprender flujos de fluido internos.',
                'Simular escenarios de falla operativos.',
                'Entrenar en la resolución de problemas técnicos.'
            ],
            progress: data.progress || 25
        };
        if (this.container) this.render();
    }

    render() {
        const objectivesHtml = this.data.objectives.map(obj => `
            <div class="ModalObjetivos-card flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-lg bg-white/5 border border-white/5 transition-colors group">
                <div class="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-primary shrink-0" style="background-color: rgba(var(--color-primary-rgb), 0.2);">
                    <span class="material-symbols-outlined text-lg md:text-xl">task_alt</span>
                </div>
                <div>
                    <span class="text-xs md:text-sm text-on-surface leading-tight block">${obj}</span>
                </div>
            </div>
        `).join('');

        this.container.innerHTML = `
            <div class="ModalObjetivos-root dark bg-surface text-on-surface fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 bg-surface/20">
                <!-- Background Context Mockup -->
                <div class="fixed inset-0 z-0 pointer-events-none">
                    <img alt="Industrial Engine" class="w-full h-full object-cover grayscale opacity-40 contrast-125"
                        src="/images/fondo_ejemplo.png" />
                </div>

                <div class="ModalObjetivos-glass-panel w-full max-w-2xl max-h-[90vh] rounded-lg shadow-2xl relative flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 z-10">
                    <!-- Close Button -->
                    <button class="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-on-surface-variant hover:text-white transition-colors">
                        <span class="material-symbols-outlined text-xl md:text-2xl">close</span>
                    </button>
                    <!-- Modal Header -->
                    <div class="p-6 pb-2 md:p-8 md:pb-4">
                        <h2 class="text-primary font-display text-xl md:text-2xl font-bold tracking-[0.1em] md:tracking-[0.2em] mb-1">${this.data.title}</h2>
                        <p class="font-medium text-xs md:text-sm" style="color: var(--color-on-surface-variant); opacity: 0.8;">${this.data.subtitle}</p>
                    </div>
                    <!-- Modal Content -->
                    <div class="px-6 py-4 md:px-8 md:py-6 flex-grow grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 overflow-y-auto ModalObjetivos-custom-scrollbar">
                        ${objectivesHtml}
                    </div>
                    <!-- Modal Footer -->
                    <div class="p-6 pt-2 md:p-8 md:pt-4 flex flex-col gap-4 md:gap-6">
                        <!-- Progress Bar Area -->
                        <div class="space-y-2">
                            <div class="flex justify-between items-end">
                                <span class="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Progreso de Misión</span>
                                <span class="text-primary font-bold text-[10px] md:text-xs">${this.data.progress}% COMPLETO</span>
                            </div>
                            <div class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <div class="h-full bg-primary shadow-[0_0_10px_var(--glow-primary)]" style="width: ${this.data.progress}%"></div>
                            </div>
                        </div>
                        <!-- Action Button -->
                        <button class="w-full py-3 md:py-4 bg-primary text-on-primary font-bold rounded-full hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg text-sm md:text-base">
                            <span>Siguiente Paso</span>
                            <span class="material-symbols-outlined text-lg">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <style>
                .ModalObjetivos-glass-panel {
                    backdrop-filter: blur(20px);
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .ModalObjetivos-root .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                }

                .ModalObjetivos-custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }

                .ModalObjetivos-custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }

                .ModalObjetivos-custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--glow-primary);
                    border-radius: 10px;
                }

                /* Hover del borde de cartillas — usa variable CSS directamente */
                .ModalObjetivos-card:hover {
                    border-color: var(--color-primary) !important;
                }
            </style>
        `;
    }
}
