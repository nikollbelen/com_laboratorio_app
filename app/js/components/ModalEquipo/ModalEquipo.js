/**
 * ModalEquipo - Componente que representa el modal de información técnica del equipo.
 */
export class ModalEquipo {
    constructor(containerId, data = {}) {
        this.container = document.getElementById(containerId);
        this.data = {
            name: data.name || 'AeroCore Turbofan A-12',
            type: data.type || 'Alta Presión',
            manufacturer: data.manufacturer || 'AeroCore Ind.',
            fuel: data.fuel || '15,000 lbs',
            status: data.status || 'ACTIVO',
            lastInspection: data.lastInspection || '12/2026',
            nextService: data.nextService || '12/2027',
            wear: data.wear || '14%'
        };
        if (this.container) this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="ModalEquipo-root dark bg-surface text-on-surface fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 bg-surface/20">
                <!-- Background Context Mockup -->
                <div class="fixed inset-0 z-0 pointer-events-none">
                    <img alt="Industrial Engine" class="w-full h-full object-cover grayscale opacity-40 contrast-125"
                        src="/images/fondo_ejemplo.png" />
                </div>

                <div class="ModalEquipo-glass-panel w-full max-w-4xl max-h-[90vh] rounded-lg shadow-2xl relative flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 z-10">
                    
                    <!-- Close Button -->
                    <button class="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-on-surface-variant hover:text-white transition-colors">
                        <span class="material-symbols-outlined text-xl md:text-2xl">close</span>
                    </button>

                    <!-- Header -->
                    <div class="p-6 pb-2 md:p-8 md:pb-4">
                        <h2 class="text-primary font-display text-xl md:text-2xl font-bold tracking-[0.1em] md:tracking-[0.2em] mb-1 uppercase">Información del Equipo</h2>
                        <p class="font-medium text-xs md:text-sm" style="color: var(--color-on-surface-variant); opacity: 0.8;">Especificaciones Técnicas y Estado Operativo</p>
                    </div>

                    <!-- Content -->
                    <div class="p-6 md:p-8 pt-2 md:pt-4 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 overflow-y-auto ModalEquipo-custom-scrollbar transition-all">
                        <!-- Left Section -->
                        <div class="space-y-6">
                            ${this.renderDataField('Motor', this.data.name)}
                            ${this.renderDataField('Tipo', this.data.type)}
                            ${this.renderDataField('Fabricante', this.data.manufacturer)}
                            ${this.renderDataField('Combustible', this.data.fuel)}
                            
                            <div class="flex items-center gap-3 pt-2">
                                <span class="text-[10px] uppercase tracking-[0.2em] font-bold" style="color: var(--color-primary); opacity: 0.65;">Estado</span>
                                <span class="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-bold border border-green-500/20">
                                    <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                    ${this.data.status}
                                </span>
                            </div>
                        </div>
                        <!-- Right Section (Maintenance/History) -->
                        <div class="bg-white/5 rounded-lg p-5 md:p-6 border border-white/5 space-y-6">
                            <h3 class="text-xs font-bold text-primary uppercase tracking-[0.15em] mb-4 border-b border-white/10 pb-2">
                                Mantenimiento e Historial</h3>
                            <div class="space-y-4">
                                ${this.renderHistoryItem('Última Inspección', this.data.lastInspection)}
                                ${this.renderHistoryItem('Próximo Servicio', this.data.nextService)}
                                ${this.renderHistoryItem('Estado de Componentes', 'Todo en rango', 'text-green-400')}
                            </div>
                            <!-- Symbolic Bar Chart -->
                            <div class="pt-4">
                                <div class="flex justify-between items-end mb-2">
                                    <span class="text-[10px] uppercase tracking-wider text-on-surface-variant">Desgaste</span>
                                    <span class="text-xs text-white">${this.data.wear}</span>
                                </div>
                                <div class="flex items-end gap-1.5 h-16">
                                    <div class="w-full h-[20%] rounded-t-sm" style="background-color: rgba(var(--color-primary-rgb), 0.4);"></div>
                                    <div class="w-full h-[35%] rounded-t-sm" style="background-color: rgba(var(--color-primary-rgb), 0.4);"></div>
                                    <div class="w-full h-[25%] rounded-t-sm" style="background-color: rgba(var(--color-primary-rgb), 0.4);"></div>
                                    <div class="w-full h-[45%] rounded-t-sm" style="background-color: rgba(var(--color-primary-rgb), 0.4);"></div>
                                    <div class="w-full h-[30%] rounded-t-sm" style="background-color: rgba(var(--color-primary-rgb), 0.4);"></div>
                                    <div class="w-full h-[15%] rounded-t-sm" style="background-color: var(--color-primary); box-shadow: 0 0 10px var(--glow-primary);"></div>
                                    <div class="w-full h-[20%] rounded-t-sm" style="background-color: rgba(var(--color-primary-rgb), 0.4);"></div>
                                    <div class="w-full h-[40%] rounded-t-sm" style="background-color: rgba(var(--color-primary-rgb), 0.4);"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Footer / Bottom Section -->
                    <div class="p-4 md:p-8 pt-0 md:pt-4 flex justify-center flex-shrink-0">
                        <button class="w-full px-6 py-2.5 md:py-4 bg-primary text-on-primary font-bold rounded-xl md:rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg text-[11px] md:text-base uppercase tracking-[0.15em] md:tracking-wider group">
                            <span class="text-center">Ver Ficha Técnica Completa</span>
                            <span class="hidden md:block material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <style>
                .ModalEquipo-glass-panel {
                    backdrop-filter: blur(25px);
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .ModalEquipo-root .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                }

                .ModalEquipo-custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }

                .ModalEquipo-custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }

                .ModalEquipo-custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--glow-primary);
                    border-radius: 10px;
                }
            </style>
        `;
    }

    renderDataField(label, value) {
        return `
            <div class="space-y-1">
                <span class="text-[10px] uppercase tracking-[0.2em] font-bold" style="color: var(--color-primary); opacity: 0.65;">${label}</span>
                <p class="text-white text-lg font-medium">${value}</p>
            </div>
        `;
    }

    renderHistoryItem(label, value, colorClass = 'text-white') {
        return `
            <div class="flex justify-between items-center text-sm">
                <span class="text-on-surface-variant">${label}</span>
                <span class="${colorClass} font-medium">${value}</span>
            </div>
        `;
    }
}
