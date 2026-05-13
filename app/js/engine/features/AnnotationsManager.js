export class AnnotationsManager {
    constructor(appInstance, iframeWindow, highlightManager) {
        this.appInstance = appInstance;
        this.iframeWindow = iframeWindow; // ¡Faltaba guardar esta referencia!
        this.v3d = iframeWindow ? iframeWindow.v3d : null;
        this.highlightManager = highlightManager;
        this._injectLangStyles();
    }

    _injectLangStyles() {
        if (!this.iframeWindow || !this.iframeWindow.document) return;
        const doc = this.iframeWindow.document;
        if (doc.getElementById('v3d-lang-styles')) return; // Ya inyectado
        const style = doc.createElement('style');
        style.id = 'v3d-lang-styles';
        style.textContent = `
            .en { display: none; }
            .es { display: block; }
            body.lang-en .es { display: none; }
            body.lang-en .en { display: block; }
            body.lang-es .en { display: none; }
            body.lang-es .es { display: block; }
        `;
        doc.head.appendChild(style);
    }

    getObjectByName(name) {
        if (!name || !this.appInstance) return null;
        let objTarget = null;
        this.appInstance.scene.traverse((obj) => {
            if (obj.name === name) objTarget = obj;
        });
        return objTarget;
    }

    handleAnnot(add, sel, annotText, contents, id) {
        if (!this.appInstance || !this.v3d) return;
        
        if (sel === 'ALL_OBJECTS') {
            this.appInstance.scene.traverse((o) => {
                for (let j = o.children.length - 1; j >= 0; j--) {
                    const child = o.children[j];
                    if (child.type === 'Annotation' || child.isAnnotation) {
                        if (child.dispose) child.dispose();
                        o.remove(child);
                    }
                }
            });
            return;
        }

        const names = (typeof sel === 'string') ? [sel] : sel;
        names.forEach((n) => {
            const o = this.getObjectByName(n);
            if (!o) return;
            for (let j = o.children.length - 1; j >= 0; j--) {
                const child = o.children[j];
                if (child.type === 'Annotation' || child.isAnnotation) {
                    if (child.dispose) child.dispose();
                    o.remove(child);
                }
            }
            if (add) {
                const a = new this.v3d.Annotation(this.appInstance.container, annotText, contents);
                a.fadeObscured = false; // Desactivar efecto de transparencia/fade cuando se oculta
                if (id) a.annotation.id = id;
                o.add(a);
            }
        });
    }

    operateLineObjectHTML(sel, id, op) {
        if (!this.appInstance || !this.v3d) return;

        if (sel === 'ALL_OBJECTS') {
            this.appInstance.scene.traverse((o) => {
                for (let j = o.children.length - 1; j >= 0; j--) {
                    if (o.children[j].isLineHTML) {
                        const l = o.children[j];
                        o.remove(l);
                        if (l.geometry) l.geometry.dispose();
                        if (l.material) l.material.dispose();
                    }
                }
            });
            return;
        }

        const names = (typeof sel === 'string') ? [sel] : sel;
        names.forEach((n) => {
            const o = this.getObjectByName(n);
            if (!o) return;
            for (let j = o.children.length - 1; j >= 0; j--) {
                if (o.children[j].isLineHTML) o.remove(o.children[j]);
            }
            if (op === 'DRAW') {
                const el = this.iframeWindow.document.getElementById(id);
                if (el) {
                    const line = new this.v3d.LineHTML(new this.v3d.Color('#000000'), 3);
                    line.offset = 0;
                    line.elemHTML = el;
                    o.add(line);
                }
            }
        });
    }

    createPoint(circleName, lineName, targetId) {
        this.handleAnnot(true, circleName, '', '', targetId);
        setTimeout(() => {
            const el = this.iframeWindow.document.getElementById(targetId);
            if (el) {
                Object.assign(el.style, {
                    width: '10px', minWidth: '0px', height: '10px', padding: '0px',
                    border: '3px solid #000', borderRadius: '50%', cursor: 'pointer'
                });
            }
        }, 50);
        this.operateLineObjectHTML([lineName], targetId, 'DRAW');
    }

    createLabel(nodeConfig, isNavigable, currentStepSelection = [], currentGlobalSelection = { obj: null }) {
        const id = 'ant_' + nodeConfig.id;
        this.handleAnnot(true, nodeConfig.etiqueta, '', '', id);
        
        const doc = this.iframeWindow.document;
        const elEN = doc.createElement('div');
        elEN.id = id + 'en';
        elEN.className = 'en';
        elEN.textContent = nodeConfig.ENdescription || '';
        
        const elES = doc.createElement('div');
        elES.id = id + 'es';
        elES.className = 'es';
        elES.textContent = nodeConfig.ESdescription || '';
        
        // Esperar a que Verge cree el contenedor HTML de la anotación
        setTimeout(() => {
            const container = doc.getElementById(id);
            if (container) {
                container.appendChild(elEN);
                container.appendChild(elES);
            }
        }, 50);

        this.createPoint(nodeConfig.flecha, nodeConfig.etiqueta, id + '_punto');

        const res = nodeConfig.objeto_resaltar || [];
        
        setTimeout(() => {
            const container = doc.getElementById(id);
            if (!container) return;

            container.addEventListener('mouseenter', () => {
                container.style.fontSize = '18px';
                container.style.padding = '4px 10px';
                container.style.cursor = 'pointer';
                if (res.length) this.highlightManager.enable(res);
            });

            container.addEventListener('mouseleave', () => {
                container.style.fontSize = '16px';
                container.style.padding = '2px 8px';
                let isProtected = false;
                res.forEach((n) => { 
                    if (n === currentGlobalSelection.obj) isProtected = true; 
                    if (currentStepSelection.indexOf(n) !== -1) isProtected = true;
                });
                
                if (!isProtected && res.length) {
                    this.highlightManager.disable(res);
                }
            });

            container.addEventListener('click', () => {
                if (res.length) {
                    if (currentGlobalSelection.obj && currentGlobalSelection.obj !== res[0]) {
                        this.highlightManager.disable([currentGlobalSelection.obj]);
                    }
                    currentGlobalSelection.obj = res[0]; 
                    this.highlightManager.enable(res);
                }

                if (isNavigable) {
                    // Enviar evento de navegación al parent window
                    window.dispatchEvent(new CustomEvent('v3d:navegar', { detail: { id: nodeConfig.id } }));
                } else {
                    // Si no es navegable, igual reproducimos su audio al hacer click
                    window.dispatchEvent(new CustomEvent('v3d:playAudio', { detail: { id: nodeConfig.id } }));
                }
            });
        }, 100);
    }

    removeAll() {
        this.handleAnnot(false, 'ALL_OBJECTS');
        this.operateLineObjectHTML('ALL_OBJECTS', '', 'REMOVE');
        
        // Limpiar residuos manuales en el DOM del iframe
        const annots = this.iframeWindow.document.querySelectorAll('.v3d-annotation, .v3d-annotation-dialog');
        for (let i = 0; i < annots.length; i++) annots[i].remove();
    }
}
