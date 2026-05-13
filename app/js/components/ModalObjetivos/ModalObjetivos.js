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
                { ESdescription: 'Identificar componentes y subsistemas clave.', ENdescription: 'Identify key components and subsystems.' },
                { ESdescription: 'Comprender flujos de fluido internos.', ENdescription: 'Understand internal fluid flows.' },
                { ESdescription: 'Simular escenarios de falla operativos.', ENdescription: 'Simulate operational failure scenarios.' },
                { ESdescription: 'Entrenar en la resolución de problemas técnicos.', ENdescription: 'Train in technical problem solving.' }
            ],
            progress: data.progress || 25
        };
        this.options = { lang: 'es' };
        if (this.container) this.render();
    }

    setLanguage(lang) {
        this.options.lang = lang;
        if (this.container) {
            const isVisible = this.container.querySelector('.ModalObjetivos-root')?.classList.contains('visible');
            this.render();
            if (isVisible) this.container.querySelector('.ModalObjetivos-root').classList.add('visible');
        }
    }

    open() {
        if (this.container) {
            this.container.style.display = 'block';
            requestAnimationFrame(() => {
                const modal = this.container.querySelector('.ModalObjetivos-root');
                if (modal) modal.classList.add('visible');
            });
        }
    }

    close() {
        const modal = this.container.querySelector('.ModalObjetivos-root');
        if (modal) {
            modal.classList.remove('visible');
            setTimeout(() => {
                if (this.container) this.container.style.display = 'none';
            }, 300);
        }
    }

    render() {
        const lang = this.options.lang;
        const objectivesHtml = this.data.objectives.map(obj => {
            const text = lang === 'es' ? (obj.ESdescription || obj) : (obj.ENdescription || obj);
            return `
            <div class="ModalObjetivos-card flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-2xl bg-white/20 border border-white/40 transition-all hover:bg-white/40 hover:border-primary/40 group shadow-sm">
                <div class="w-10 h-10 md:w-11 md:h-11 rounded-2xl flex items-center justify-center shrink-0" 
                     style="background-color: rgba(var(--color-primary-rgb), 0.15); color: var(--color-primary); box-shadow: 0 0 15px rgba(var(--color-primary-rgb), 0.1);">
                    <span class="material-symbols-outlined text-xl md:text-2xl font-bold" style="filter: drop-shadow(0 0 5px rgba(var(--color-primary-rgb), 0.3));">task_alt</span>
                </div>
                <div class="flex-grow">
                    <span class="text-xs md:text-sm text-[#1a1c1e]/80 leading-tight block">${text}</span>
                </div>
            </div>
        `; }).join('');

        const t = {
            es: { title: 'OBJETIVOS DEL LABORATORIO', subtitle: 'Objetivos Principales y Ruta de Aprendizaje', progress: 'Progreso de Misión', complete: 'COMPLETO', next: 'Siguiente Paso' },
            en: { title: 'LABORATORY OBJECTIVES', subtitle: 'Main Objectives and Learning Path', progress: 'Mission Progress', complete: 'COMPLETE', next: 'Next Step' }
        }[lang] || {};

        this.container.innerHTML = `
            <div class="ModalObjetivos-root dark fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 opacity-0 pointer-events-none transition-opacity duration-300">
                <!-- Backdrop Blur -->
                <div class="absolute inset-0 bg-surface/20 backdrop-blur-md"></div>

                <div class="ModalObjetivos-glass-panel w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl relative flex flex-col overflow-hidden animate-in fade-in zoom-in duration-500 z-10"
                     style="background: rgba(255, 255, 255, 0.7); border: 1px solid rgba(255, 255, 255, 0.5); backdrop-filter: blur(20px);">
                    
                    <!-- Close Button -->
                    <button class="ModalObjetivos-close absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 text-[#1a1c1e] hover:text-black transition-colors z-20">
                        <span class="material-symbols-outlined text-2xl">close</span>
                    </button>

                    <!-- Header -->
                    <div class="p-8 pb-4">
                        <h2 class="text-primary font-display text-2xl md:text-3xl font-bold tracking-[0.15em] mb-1 uppercase">${t.title}</h2>
                        <p class="font-bold text-xs md:text-sm text-[#1a1c1e]/70">${t.subtitle}</p>
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
                                <span class="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">${t.progress}</span>
                                <span class="text-primary font-bold text-[10px] md:text-xs">${this.data.progress}% ${t.complete}</span>
                            </div>
                            <div class="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <div class="h-full bg-primary shadow-[0_0_10px_var(--glow-primary)]" style="width: ${this.data.progress}%"></div>
                            </div>
                        </div>
                        <!-- Action Button -->
                        <button class="w-full py-3 md:py-4 bg-primary text-on-primary font-bold rounded-full hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg text-sm md:text-base">
                            <span>${t.next}</span>
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

                .ModalObjetivos-root.visible {
                    opacity: 1;
                    pointer-events: auto;
                }
            </style>
        `;

        // Event Listeners
        const closeBtn = this.container.querySelector('.ModalObjetivos-close');
        if (closeBtn) closeBtn.addEventListener('click', () => this.close());

        const root = this.container.querySelector('.ModalObjetivos-root');
        if (root) {
            root.addEventListener('click', (e) => {
                if (e.target === root) this.close();
            });
        }
    }
}
