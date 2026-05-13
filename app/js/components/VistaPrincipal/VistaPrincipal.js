/**
 * VistaPrincipal - Componente que representa la interfaz principal del laboratorio.
 * Incluye controles de HUD, navegación móvil y el asistente virtual.
 */
export class VistaPrincipal {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (this.container) {
            this.render();
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="VistaPrincipal-root dark bg-surface text-on-surface font-body-md overflow-hidden h-screen w-screen relative">
                <!-- Main 3D Canvas Mockup Background -->
                <div class="fixed inset-0 z-0">
                    <img alt="Industrial Engine" class="w-full h-full object-cover grayscale opacity-40 contrast-125"
                        src="/images/fondo_ejemplo.png" />
                </div>

                <!-- DESKTOP: TOP-RIGHT Controls -->
                <div class="fixed top-8 right-8 z-50 hidden md:flex items-center gap-3">
                    ${this.renderTopButton('language', 'Idioma')}
                    ${this.renderTopButton('volume_up', 'Sonido')}
                    ${this.renderTopButton('save', 'Guardar')}
                    ${this.renderTopButton('help', 'Ayuda')}
                </div>

                <!-- MOBILE: TOP-RIGHT Options Dropdown -->
                <header class="fixed top-6 right-6 z-50 md:hidden">
                    <div class="relative">
                        <input type="checkbox" id="menu-toggle" class="hidden peer">
                        <label for="menu-toggle" class="fixed inset-0 hidden peer-checked:block z-[-1] cursor-default"></label>
                        <label for="menu-toggle" class="flex size-12 items-center justify-center rounded-full VistaPrincipal-glass-panel text-on-surface shadow-lg cursor-pointer peer-checked:bg-primary/20 peer-checked:text-primary transition-all active:scale-90">
                            <span class="material-symbols-outlined pointer-events-none">more_vert</span>
                        </label>
                        <div class="absolute top-full right-0 mt-3 p-2 VistaPrincipal-glass-panel rounded-2xl shadow-2xl flex flex-col gap-2 min-w-[150px] opacity-0 translate-y-[-10px] scale-90 pointer-events-none peer-checked:opacity-100 peer-checked:translate-y-0 peer-checked:scale-100 peer-checked:pointer-events-auto VistaPrincipal-menu-transition origin-top-right">
                            ${this.renderMobileMenuButton('language', 'Idioma')}
                            ${this.renderMobileMenuButton('volume_up', 'Sonido')}
                            ${this.renderMobileMenuButton('save', 'Guardar')}
                            <div class="h-px bg-white/10 mx-2 my-1"></div>
                            ${this.renderMobileMenuButton('help', 'Ayuda')}
                        </div>
                    </div>
                </header>

                <!-- DESKTOP: Left HUD Controls -->
                <aside class="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-4 items-start">
                    ${this.renderHudButton('deployed_code', 'Vista Libre', true)}
                    ${this.renderHudButton('settings_input_component', 'Partes')}
                    ${this.renderHudButton('open_in_full', 'Explosión')}
                    ${this.renderHudButton('document_scanner', 'Modo Rayos X')}
                    ${this.renderHudButton('play_circle', 'Animación')}
                </aside>

                <!-- MOBILE: Bottom Navigation (Compact) -->
                <nav class="fixed bottom-0 left-0 right-0 border-t border-outline-variant/30 VistaPrincipal-glass-panel px-1 pb-4 pt-2 z-40 md:hidden">
                    <div class="flex justify-around items-center max-w-md mx-auto">
                        ${this.renderBottomNavButton('deployed_code', 'VISTA', true)}
                        ${this.renderBottomNavButton('settings_input_component', 'PARTES')}
                        ${this.renderBottomNavButton('open_in_full', 'EXPLOSIÓN')}
                        ${this.renderBottomNavButton('document_scanner', 'X-RAY')}
                        ${this.renderBottomNavButton('play_circle', 'ANIMACIÓN')}
                    </div>
                </nav>

                <!-- SHARED: Assistant Area -->
                <div class="fixed z-50 flex items-end gap-4 transition-all duration-500 
                    bottom-8 right-8 md:flex md:bottom-8 md:right-8 
                    bottom-[140px] right-6 md:right-8 flex-row-reverse md:flex-row">
                    
                    <!-- Dialogue Bubble (Desktop Only) -->
                    <div class="VistaPrincipal-glass-panel p-4 rounded-lg shadow-xl border border-white/10 max-w-xs VistaPrincipal-animate-assistant hidden md:block">
                        <p class="text-xs text-on-surface leading-relaxed">
                            "Hola! ¿Necesitas ayuda para navegar por la vista de explosión? Puedo guiarte por cada componente."
                        </p>
                    </div>

                    <!-- Avatar Button -->
                    <div class="relative group">
                        <button class="w-14 h-14 md:w-16 md:h-16 rounded-full VistaPrincipal-glass-panel VistaPrincipal-inner-glow flex items-center justify-center overflow-hidden border-2 border-primary/30 shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.2)] hover:scale-110 transition-transform">
                            <img alt="AI Assistant" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAu4sV7nQIyj6IjKF2TlD3Hus9Ha10yPHiz_rKggb4Liif13Ej2MZMobbnOXQp4nzaN5yPjJg5I1rpI5si8VayIqKY6OhLLtzeO-3bZxRR9km-S66xW8yw4UbHkWHs_LA1HF-L5o74H1EtpzwJUB1G6w-H3ZD6yYXR5lwGpMGHpOeBLD_TGv9Fqhs6AcI7DkJNIqWi34hEu2QRLoY9JE9LnOgIZZO06mJBzXwKIsVsWzIwJ2GxoQrb6dxgbg4XrdywR8fWUsTyR7eJ6" />
                        </button>
                        <div class="absolute -top-1 -right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-primary rounded-full animate-pulse shadow-[0_0_10px_var(--glow-primary)]"></div>
                    </div>
                </div>

                <style>
                    .VistaPrincipal-root {
                        --glow-primary: rgba(var(--color-primary-rgb), 0.5);
                    }
                    .VistaPrincipal-glass-panel {
                        backdrop-filter: blur(20px);
                        -webkit-backdrop-filter: blur(20px);
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    }

                    .VistaPrincipal-inner-glow {
                        box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.2);
                    }

                    .VistaPrincipal-hover-active:hover, .VistaPrincipal-btn-active {
                        background: rgba(var(--color-primary-rgb), 0.2) !important;
                        color: var(--color-primary) !important;
                        border-color: rgba(var(--color-primary-rgb), 0.3) !important;
                        box-shadow: 0 0 20px rgba(var(--color-primary-rgb), 0.4);
                    }

                    .VistaPrincipal-hover-active:hover .material-symbols-outlined, .VistaPrincipal-btn-active .material-symbols-outlined {
                        font-variation-settings: 'FILL' 1 !important;
                    }

                    .VistaPrincipal-menu-transition {
                        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                    }

                    .VistaPrincipal-menu-item-hover:hover {
                        background: rgba(var(--color-primary-rgb), 0.2) !important;
                        color: var(--color-primary) !important;
                        border-color: rgba(var(--color-primary-rgb), 0.3) !important;
                    }

                    @keyframes VistaPrincipal-fadeInSlideRight {
                        from { opacity: 0; transform: translateX(20px); }
                        to { opacity: 1; transform: translateX(0); }
                    }
                    .VistaPrincipal-animate-assistant {
                        animation: VistaPrincipal-fadeInSlideRight 0.5s ease-out forwards;
                    }
                </style>
            </div>
        `;
    }

    renderTopButton(icon, label) {
        return `
            <div class="relative group">
                <button class="w-12 h-12 flex items-center justify-center rounded-full VistaPrincipal-glass-panel hover:bg-white/10 transition-all shadow-xl">
                    <span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary">${icon}</span>
                </button>
                <span class="absolute top-full mt-2 right-0 px-3 py-1 VistaPrincipal-glass-panel text-xs font-medium text-primary opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none whitespace-nowrap rounded-md shadow-lg border-primary/20">${label}</span>
            </div>
        `;
    }

    renderMobileMenuButton(icon, label) {
        return `
            <button class="flex items-center gap-3 px-4 py-2 rounded-xl transition-all VistaPrincipal-menu-item-hover text-sm">
                <span class="material-symbols-outlined text-xl text-on-surface-variant group-hover:text-primary">${icon}</span>
                <span class="font-medium">${label}</span>
            </button>
        `;
    }

    renderHudButton(icon, label, active = false) {
        return `
            <button class="VistaPrincipal-glass-panel flex items-center p-3 text-on-surface-variant VistaPrincipal-hover-active rounded-full group shadow-xl ${active ? 'VistaPrincipal-btn-active' : ''}">
                <span class="material-symbols-outlined shrink-0 w-6 h-6 flex items-center justify-center">${icon}</span>
                <span class="max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-4 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-500 whitespace-nowrap font-label-sm">${label}</span>
            </button>
        `;
    }

    renderBottomNavButton(icon, label, active = false) {
        return `
            <a class="flex flex-col items-center gap-0.5 p-1 ${active ? 'text-primary' : 'text-on-surface-variant'}" href="#">
                <div class="h-7 flex items-center justify-center">
                    <span class="material-symbols-outlined text-xl" style="font-variation-settings: 'FILL' ${active ? 1 : 0};">${icon}</span>
                </div>
                <span class="text-[9px] font-bold tracking-tight">${label}</span>
                ${active ? '<div class="w-3 h-0.5 bg-primary rounded-full mt-0.5"></div>' : ''}
            </a>
        `;
    }
}
