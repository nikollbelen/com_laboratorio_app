/**
 * Preloader - Pantalla de carga inicial
 * Migrado de VergePreloader de React a Vanilla JS
 */
export class Preloader {
    constructor(containerId, { labNameES, labNameEN, imageUrl, logoUrl, backgroundColor, backgroundType }) {
        this.container      = document.getElementById(containerId);
        this.labNameES      = labNameES;
        this.labNameEN      = labNameEN;
        this.imageUrl       = imageUrl;
        this.logoUrl        = logoUrl;
        this.backgroundColor = backgroundColor;
        this.backgroundType  = backgroundType;
        if (this.container) this.render();
    }

    render() {
        const bgStyle = this.backgroundType === 'color' 
            ? `background-color: ${this.backgroundColor}; background-image: none;`
            : `background-image: url('${this.imageUrl}'); background-color: transparent;`;

        this.container.innerHTML = `
            <div class="PreloaderScreen" id="preloader" style="${bgStyle}">
                <div class="ContainerScreen">
                    <div class="ContentScreen">
                        <div class="WelcomeBox">
                            <span class="es">Bienvenido a:</span>
                            <span class="en">Welcome to:</span>
                        </div>
                        <h1 class="PreloaderTitle">
                            <span class="es">${this.labNameES}</span>
                            <span class="en">${this.labNameEN}</span>
                        </h1>
                        <p class="PreloaderDescription es">Por favor espere</p>
                        <p class="PreloaderDescription en">Please wait</p>
                        <p class="LoadingPercentage" id="loading_percentage">0%</p>
                        <div class="Loader"></div>
                    </div>
                </div>
                <div class="LogoScreen">
                    ${this.logoUrl ? `<img src="${this.logoUrl}" alt="Logo" />` : ''}
                </div>
            </div>
        `;
    }

    /** Actualiza el porcentaje y oculta cuando llega a 100% */
    setProgress(percent) {
        const el = document.getElementById('loading_percentage');
        if (el) el.textContent = `${Math.round(percent)}%`;
        if (percent >= 100) {
            setTimeout(() => this.hide(), 500);
        }
    }

    hide() {
        const screen = document.getElementById('preloader');
        if (!screen) return;
        screen.style.transition = 'opacity 0.8s ease';
        screen.style.opacity = '0';
        setTimeout(() => { screen.style.display = 'none'; }, 800);
    }
}
