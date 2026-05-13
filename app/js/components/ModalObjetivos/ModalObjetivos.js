/**
 * ModalObjetivos - Tarjetas de objetivos del laboratorio
 * Los objetivos vienen del info.json para que sean configurables por máquina
 */
export class ModalObjetivos {
    constructor(containerId, objetivos = []) {
        this.container  = document.getElementById(containerId);
        this.objetivos  = objetivos;
        if (this.container) this.render();
    }

    render() {
        const cards = this.objetivos.map(obj => `
            <div class="ModalCard">
                <img src="${obj.icon}" alt="${obj.descripcion}" />
                <p>${obj.descripcion}</p>
            </div>
        `).join('');

        this.container.innerHTML = `
            <div class="ModalOverlay content content2" style="z-index:30;">
                <div class="ModalObjetivosContainer content content2">
                    <h2 class="ModalTitle">Objetivos del Laboratorio</h2>
                    <div class="ModalCards">
                        ${cards}
                    </div>
                </div>
            </div>
        `;
    }
}
