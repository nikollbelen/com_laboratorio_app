/**
 * ModalAyuda - Instrucciones de uso del mouse
 * Migrado de VergeModalAyuda de React a Vanilla JS
 * Los datos de las cards se reciben como array para que el JSON los controle
 */
export class ModalAyuda {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (this.container) this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="ModalOverlay content content1" id="ayuda">
                <div class="ModalAyudaContainer content content1" id="ayudaContainer">
                    <div class="ModalCard ModalCard--dark ModalCard--wide">
                        <img src="./images/mouse1.png" alt="Mouse 1" style="width:auto; height:6rem;" />
                        <div>
                            <p class="en">To rotate and move through the laboratory views, use the left mouse button.</p>
                            <p class="es">Para rotar y desplazarse por las vistas del laboratorio utilice el botÃ³n izquierdo del mouse</p>
                        </div>
                    </div>
                    <div class="ModalCard ModalCard--dark ModalCard--wide">
                        <img src="./images/mouse2.png" alt="Mouse 2" style="width:auto; height:6rem;" />
                        <div>
                            <p class="en">To move right or up, press the right mouse button or the physical arrow keys â†‘ â†“ â†’ â†.</p>
                            <p class="es">Para desplazarse hacia la derecha o arriba presione el botÃ³n derecho del mouse o las teclas fÃ­sicas â†‘ â†“ â†’ â†</p>
                        </div>
                    </div>
                    <div class="ModalCard ModalCard--dark ModalCard--wide">
                        <img src="./images/mouse3.png" alt="Mouse 3" style="width:auto; height:6rem;" />
                        <div>
                            <p class="en">To zoom in or out on the laboratory views, use the mouse wheel.</p>
                            <p class="es">Para acercar o alejar las vistas del laboratorio utilice la rueda del mouse.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
