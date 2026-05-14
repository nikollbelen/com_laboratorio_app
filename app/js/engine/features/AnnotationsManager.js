export class AnnotationsManager {
    constructor(appInstance, iframeWindow, highlightManager) {
        this.appInstance = appInstance;
        this.iframeWindow = iframeWindow;
        this.v3d = iframeWindow ? iframeWindow.v3d : null;
        this.highlightManager = highlightManager;
        this.activeAnnotations = []; // Para seguimiento inteligente
        this._injectPremiumStyles();
        this._startSmartLoop();
        this._setupAudioSync();
    }

    _setupAudioSync() {
        window.addEventListener('v3d:audioStarted', (e) => this._updateBtnIcon(e.detail.id, 'pause'));
        window.addEventListener('v3d:audioEnded', (e) => this._updateBtnIcon(e.detail.id, 'play_arrow'));
    }

    _updateBtnIcon(id, iconName) {
        const doc = this.iframeWindow.document;
        // Buscamos el span dentro del botón del panel específico
        const iconSpan = doc.querySelector(`#ant_${id}_panel .Etiqueta-v3d-btn span`);
        if (iconSpan) {
            iconSpan.textContent = iconName;
        }
    }

    _startSmartLoop() {
        const update = () => {
            if (this.activeAnnotations.length > 0) {
                const doc = this.iframeWindow.document;
                const activeData = [];
                const camPos = this.appInstance.camera.position;

                // 1. Recopilar datos estables (usando el contenedor raíz de Verge3D como base)
                this.activeAnnotations.forEach(id => {
                    const labelEl = doc.getElementById(id);
                    const pointEl = doc.getElementById(id + '_punto');
                    if (labelEl && pointEl) {
                        const panel = labelEl.querySelector('.Etiqueta-v3d-panel');
                        if (panel) {
                            const objName = id.replace('ant_', '');
                            const obj = this.getObjectByName(objName);
                            const distance = obj ? camPos.distanceTo(obj.position) : 9999;

                            // Usamos el contenedor raíz para la posición Y base (es más estable que el panel)
                            const rootRect = labelEl.getBoundingClientRect();
                            const panelRect = panel.getBoundingClientRect();
                            const currentOffset = parseFloat(panel.style.getPropertyValue('--v-offset')) || 0;

                            activeData.push({
                                id, labelEl, pointEl, panel, distance,
                                rootTop: rootRect.top,
                                height: panelRect.height,
                                currentOffset
                            });
                        }
                    }
                });

                // 2. Depth Sorting (Z-Index basado en distancia)
                [...activeData].sort((a, b) => b.distance - a.distance).forEach((data, i) => {
                    data.labelEl.style.zIndex = 100 + i;
                });

                // 3. Orientación Inteligente
                activeData.forEach(data => {
                    const labelX = data.labelEl.getBoundingClientRect().left;
                    const pointX = data.pointEl.getBoundingClientRect().left;
                    if (labelX < pointX) {
                        data.panel.classList.add('is-left');
                        data.panel.classList.remove('is-right');
                    } else {
                        data.panel.classList.add('is-right');
                        data.panel.classList.remove('is-left');
                    }
                });

                // 4. Lógica Anti-Colisión (Stable Stacking)
                activeData.sort((a, b) => a.rootTop - b.rootTop);

                const MARGIN = 20;
                activeData.forEach((current, i) => {
                    let push = 0;
                    for (let j = 0; j < i; j++) {
                        const prev = activeData[j];
                        // Detectar overlap horizontal simple
                        const currentRect = current.panel.getBoundingClientRect();
                        const prevRect = prev.panel.getBoundingClientRect();
                        
                        const overlapX = !(currentRect.right < prevRect.left || currentRect.left > prevRect.right);
                        if (overlapX) {
                            const prevBottom = prev.rootTop + (prev.push || 0) + (prev.height / 2);
                            const currentTop = current.rootTop + push - (current.height / 2);

                            if (currentTop < prevBottom + MARGIN) {
                                push += (prevBottom + MARGIN) - currentTop;
                            }
                        }
                    }
                    current.push = push;
                    
                    // Suavizado (Lerp): solo aplicamos un porcentaje del movimiento por frame para evitar temblores
                    const targetPush = push;
                    const easedPush = current.currentOffset + (targetPush - current.currentOffset) * 0.1;

                    if (Math.abs(current.currentOffset - easedPush) > 0.01) {
                        current.panel.style.setProperty('--v-offset', `${easedPush}px`);
                    }
                });
            }
            requestAnimationFrame(update);
        };
        update();
    }

    _injectPremiumStyles() {
        const doc = this.iframeWindow.document;
        if (doc.getElementById('v3d-premium-styles')) return;

        // 1. Sincronizar variables de diseño (Esencial para el diseño anterior)
        const parentRoot = window.document.documentElement;
        const iframeRoot = doc.documentElement;
        const themeVars = [
            '--color-primary', 
            '--color-primary-rgb', 
            '--glow-primary', 
            '--glow-primary-strong'
        ];
        
        themeVars.forEach(v => {
            const value = getComputedStyle(parentRoot).getPropertyValue(v).trim();
            if (value) iframeRoot.style.setProperty(v, value);
        });

        // 2. Fuentes (Necesarias dentro del iframe)
        const fonts = doc.createElement('link');
        fonts.rel = 'stylesheet';
        fonts.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap';
        doc.head.appendChild(fonts);

        // 3. CSS de Etiquetas (Ajustamos ruta relativa)
        const link = doc.createElement('link');
        link.id = 'v3d-premium-styles';
        link.rel = 'stylesheet';
        link.href = '../css/components/Etiqueta.css';
        doc.head.appendChild(link);
    }

    getObjectByName(name) {
        if (!name || !this.appInstance) return null;
        return this.appInstance.scene.getObjectByName(name);
    }

    handleAnnot(add, sel, id, customHTML = null) {
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
                const container = this.iframeWindow.document.body;
                const a = new this.v3d.Annotation(container, '', '');
                a.fadeObscured = false;
                
                if (id) {
                    a.annotation.id = id;
                    if (customHTML && customHTML.includes('Etiqueta-v3d-panel')) {
                        this.activeAnnotations.push(id);
                    }
                }
                if (customHTML) {
                    a.annotation.innerHTML = customHTML;
                    const isLabel = customHTML.includes('Etiqueta-v3d-panel');
                    a.annotation.className = (isLabel ? 'Etiqueta-v3d-label-root' : 'Etiqueta-v3d-point-root') + ' v3d-annotation';
                }
                
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
                    const themeColor = getComputedStyle(this.iframeWindow.document.documentElement).getPropertyValue('--color-primary').trim();
                    const line = new this.v3d.LineHTML(new this.v3d.Color(themeColor || '#0066ff'), 2);
                    line.offset = 0;
                    line.elemHTML = el;
                    o.add(line);
                }
            }
        });
    }

    createPoint(circleName, targetId) {
        const pointHTML = `<div class="Etiqueta-v3d-point" id="${targetId}"></div>`;
        this.handleAnnot(true, circleName, targetId, pointHTML);
    }

    _getHTMLContent(nodeConfig) {
        const isEn = window.document.body.classList.contains('lang-en');
        const title = (isEn ? nodeConfig.ENdescription : nodeConfig.ESdescription) || nodeConfig.name || 'Componente';
        const subtitle = (isEn ? nodeConfig.subtitleEN : nodeConfig.subtitle) || (isEn ? 'Component detail' : 'Detalle del componente');
        const status = (isEn ? nodeConfig.statusEN : nodeConfig.status) || (isEn ? 'ACTIVE' : 'ACTIVO');
        const panelId = 'ant_' + nodeConfig.id + '_panel';
        const anchorId = 'ant_' + nodeConfig.id + '_anchor';

        return `
            <div class="Etiqueta-v3d-panel" id="${panelId}">
                <!-- Punto de anclaje para la línea -->
                <div class="Etiqueta-v3d-anchor" id="${anchorId}"></div>
                
                <button class="Etiqueta-v3d-btn">
                    <span class="material-symbols-outlined">play_arrow</span>
                </button>
                <div>
                    <h4 class="Etiqueta-v3d-title">${title}</h4>
                    <p class="Etiqueta-v3d-subtitle">${subtitle}</p>
                    <span class="Etiqueta-v3d-status">${status}</span>
                </div>
            </div>
        `;
    }

    createLabel(nodeConfig, isNavigable, currentStepSelection = [], currentGlobalSelection = { obj: null }) {
        const id = 'ant_' + nodeConfig.id;
        const customHTML = this._getHTMLContent(nodeConfig);

        // 1. Crear punto visual
        this.createPoint(nodeConfig.flecha, id + '_punto');
        
        // 2. Crear etiqueta principal
        this.handleAnnot(true, nodeConfig.etiqueta, id, customHTML);

        // 3. Dibujar línea de conexión vinculada al ANCLA (para precisión milimétrica)
        this.operateLineObjectHTML([nodeConfig.flecha], id + '_anchor', 'DRAW');

        const res = nodeConfig.objeto_resaltar || [];

        // 4. Configurar eventos en el documento del IFRAME
        setTimeout(() => {
            const container = this.iframeWindow.document.getElementById(id);
            if (!container) return;

            // Bloquear eventos del root pero permitir los del panel
            container.style.pointerEvents = 'none';
            const panel = container.querySelector('.Etiqueta-v3d-panel');
            if (panel) panel.style.pointerEvents = 'auto';

            // Highlights al pasar el mouse
            container.addEventListener('mouseenter', () => {
                if (res.length) this.highlightManager.enable(res);
            });

            container.addEventListener('mouseleave', () => {
                let isProtected = false;
                res.forEach((n) => {
                    if (n === currentGlobalSelection.obj) isProtected = true;
                    if (currentStepSelection.indexOf(n) !== -1) isProtected = true;
                });
                if (!isProtected && res.length) this.highlightManager.disable(res);
            });

            // Click en el botón de PLAY: Solo AUDIO
            const playBtn = panel.querySelector('.Etiqueta-v3d-btn');
            if (playBtn) {
                playBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Evitamos disparar la navegación del panel
                    window.dispatchEvent(new CustomEvent('v3d:playAudio', { detail: { id: nodeConfig.id } }));
                });
            }

            // Click en el PANEL: NAVEGACIÓN + RESALTADO
            container.addEventListener('click', () => {
                // 1. Resaltado visual
                if (res.length) {
                    if (currentGlobalSelection.obj && currentGlobalSelection.obj !== res[0]) {
                        this.highlightManager.disable([currentGlobalSelection.obj]);
                    }
                    currentGlobalSelection.obj = res[0];
                    this.highlightManager.enable(res);
                }

                // 2. Navegación Silenciosa (Cámara, visibilidad, etc.)
                window.dispatchEvent(new CustomEvent('v3d:navegar', { detail: { id: nodeConfig.id, skipAudio: true } }));
            });
        }, 100);
    }

    removeAll() {
        this.handleAnnot(false, 'ALL_OBJECTS');
        this.operateLineObjectHTML('ALL_OBJECTS', '', 'REMOVE');
        this.activeAnnotations = [];
        const annots = this.iframeWindow.document.querySelectorAll('[class*="Etiqueta-v3d-"]');
        annots.forEach(el => el.remove());
    }
}
