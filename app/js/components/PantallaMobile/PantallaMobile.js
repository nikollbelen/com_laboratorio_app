/**
 * PantallaMobile - Aviso de rotar el dispositivo en modo portrait
 * Migrado de VergePantallaMobile de React a Vanilla JS
 */
export class PantallaMobile {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (this.container) this.render();
        this._escucharOrientacion();
    }

    render() {
        this.container.innerHTML = `
            <div class="FullScreenContainer" id="aviso_celular" style="display:none;">
                <h1 class="RotateText">
                    Pon tu celular en posiciÃ³n horizontal para poder acceder a la experiencia
                </h1>
                <img class="RotateImage" src="./images/horizontal-icono.png" alt="Rotar dispositivo" />
            </div>
        `;
    }

    _escucharOrientacion() {
        const check = () => {
            const aviso = document.getElementById('aviso_celular');
            if (!aviso) return;
            // Mostrar aviso solo en mÃ³viles en modo vertical
            const esMobile   = window.innerWidth <= 768;
            const esVertical = window.innerHeight > window.innerWidth;
            aviso.style.display = (esMobile && esVertical) ? 'flex' : 'none';
        };

        window.addEventListener('resize', check);
        window.addEventListener('orientationchange', check);
        check(); // Evaluar al cargar
    }
}
