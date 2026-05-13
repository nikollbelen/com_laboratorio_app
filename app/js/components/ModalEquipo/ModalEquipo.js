/**
 * ModalEquipo - EPP requerido para el laboratorio
 * Los items del EPP vienen del info.json para que sean configurables
 */
export class ModalEquipo {
    constructor(containerId, epps = []) {
        this.container = document.getElementById(containerId);
        this.epps      = epps;
        if (this.container) this.render();
    }

    render() {
        const cards = this.epps.map(epp => `
            <div class="ModalCard ModalCard--dark">
                <img src="${epp.icon}" alt="${epp.nombre}" />
                <p>${epp.nombre}</p>
            </div>
        `).join('');

        this.container.innerHTML = `
            <div class="ModalOverlay content content3" style="z-index:30;">
                <div class="ModalEquipoContainer content content3">
                    <div>
                        <h2 class="ModalTitle">Equipo de Protección Personal</h2>
                        <h3 class="ModalSubTitle">Estos son los EPP que se utilizan en este laboratorio</h3>
                    </div>
                    <div class="ModalCards">
                        ${cards}
                    </div>
                </div>
            </div>
        `;
    }
}
