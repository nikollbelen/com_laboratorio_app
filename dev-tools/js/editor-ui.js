import { DataEngine } from './DataEngine.js';
import { Autocomplete } from './Autocomplete.js';

let rawConfig = null;
let treeData = null;
let selectedNode = null;
let currentTags = { initOcultar: [], stepOcultar: [], stepResaltar: [] };
let sceneAssets = { meshes: [], anims: [] }; // <-- Lista de objetos reales del 3D

async function fetchAssets() {
    try {
        const resp = await fetch('http://localhost:3001/assets');
        if (resp.ok) sceneAssets = await resp.json();
        console.log("[Editor] Base de datos de activos cargada:", sceneAssets);
    } catch(e) { console.warn("No se pudo conectar con el servidor de activos."); }
}

const width = window.innerWidth;
const height = window.innerHeight - 60;
const zoomBehavior = d3.zoom().on("zoom", (event) => g.attr("transform", event.transform));
const svg = d3.select("#chart").append("svg").attr("width", width).attr("height", height).call(zoomBehavior);
const g = svg.append("g").attr("transform", "translate(100,0)");
const tree = d3.tree().size([height, width - 200]);

async function init(data) {
    if (data) rawConfig = data;
    else {
        try {
            const response = await fetch('../app/info.json');
            if (response.ok) rawConfig = await response.json();
        } catch (e) { console.warn("Sin info.json"); }
    }
    if (rawConfig) { treeData = DataEngine.normalize(rawConfig); update(); }
    await fetchAssets();
    
    // Configurar listeners para validación en tiempo real de campos de malla únicos
    ['inpInitCam', 'inpInitDir', 'inpPosicion', 'inpDireccion', 'inpEtiquetaObj', 'inpFlechaObj'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => window.validateMeshInput(el));
            new Autocomplete(el, sceneAssets.meshes);
        }
    });

    // Configurar autocompletado para etiquetas (Tags)
    new Autocomplete(document.getElementById('inpInitOcultar'), sceneAssets.meshes, () => window.addTagFromInput('inpInitOcultar', 'tags-init-ocultar'));
    new Autocomplete(document.getElementById('inpOcultarTxt'), sceneAssets.meshes, () => window.addTagFromInput('inpOcultarTxt', 'tags-ocultar'));
    new Autocomplete(document.getElementById('inpResaltarTxt'), sceneAssets.meshes, () => window.addTagFromInput('inpResaltarTxt', 'tags-resaltar'));
}

function update() {
    if (!treeData) return;
    const root = d3.hierarchy(treeData, d => d.children);
    tree(root);
    const links = g.selectAll(".link").data(root.links(), d => d.target.data.id || d.target.data.name);
    links.exit().remove();
    links.enter().append("path").attr("class", "link");
    g.selectAll(".link").transition().duration(500).attr("d", d3.linkHorizontal().x(d => d.y).y(d => d.x));
    const nodes = g.selectAll(".node").data(root.descendants(), d => d.data.id || d.data.name);
    nodes.exit().remove();
    const nodeEnter = nodes.enter().append("g").attr("class", "node");
    nodeEnter.append("circle").attr("r", 8).style("fill", d => d.data._children ? "lightsteelblue" : "#fff")
        .on("click", (event, d) => {
            event.stopPropagation();
            if (d.data.children) { d.data._children = d.data.children; d.data.children = null; }
            else if (d.data._children) { d.data.children = d.data._children; d.data._children = null; }
            update();
        });
    nodeEnter.append("text").attr("dy", ".35em").attr("x", d => (d.children || d.data._children) ? -15 : 15)
        .style("text-anchor", d => (d.children || d.data._children) ? "end" : "start")
        .text(d => d.data.name).on("click", (event, d) => { event.stopPropagation(); window.openModal(d.data); });
    const nodeUpdate = nodeEnter.merge(nodes);
    nodeUpdate.transition().duration(500).attr("transform", d => `translate(${d.y},${d.x})`);
    nodeUpdate.select("circle").style("fill", d => d.data._children ? "lightsteelblue" : "#fff");
    nodeUpdate.select("text").text(d => d.data.name);
}

function updatePreview(inputId, previewContainerId) {
    const url = document.getElementById(inputId).value;
    const container = document.getElementById(previewContainerId);
    if (!container) return;
    const img = container.querySelector('img');
    if (url && (url.includes('/') || url.includes('.'))) {
        img.src = url.startsWith('http') ? url : `../app/${url}`;
        container.style.display = 'block';
        img.onerror = () => container.style.display = 'none';
    } else {
        container.style.display = 'none';
    }
}

window.renderTags = function (containerId, tagsArray) {
    const container = document.getElementById(containerId);
    container.innerHTML = tagsArray.map((tag, i) => {
        // Validar si el tag existe en las mallas de la escena
        const isInvalid = sceneAssets.meshes.length > 0 && !sceneAssets.meshes.includes(tag);
        
        if (isInvalid) console.warn(`[Editor] ⚠️ El objeto "${tag}" no existe en la escena 3D.`);
        
        const chipClass = isInvalid ? 'tag-chip invalid-asset' : 'tag-chip';
        const help = isInvalid ? 'title="Este objeto no existe en el modelado 3D"' : '';
        
        return `<div class="${chipClass}" ${help}>${tag}<span class="tag-chip-del" onclick="removeTag('${containerId}', ${i})">x</span></div>`;
    }).join('');
};

window.addTagFromInput = function (inputId, containerId) {
    const input = document.getElementById(inputId);
    const value = input.value.trim();
    if (!value) return;

    // Log de validación en tiempo real para el usuario
    console.log(`[Editor] Validando Asset (Mesh): "${value}"`);
    if (sceneAssets.meshes.length > 0) {
        if (sceneAssets.meshes.includes(value)) {
            console.log(`[Editor] ✅ Mesh encontrado en el modelado: "${value}"`);
        } else {
            console.error(`[Editor] ❌ Mesh NO encontrado: "${value}". Se marcará en rojo.`);
        }
    } else {
        console.warn("[Editor] Base de datos de meshes vacía. Abre el laboratorio 3D para sincronizar.");
    }

    let targetArray = getTargetArray(containerId);
    if (!targetArray.includes(value)) { targetArray.push(value); window.renderTags(containerId, targetArray); }
    input.value = '';
};

window.removeTag = function (containerId, index) {
    let targetArray = getTargetArray(containerId);
    targetArray.splice(index, 1);
    window.renderTags(containerId, targetArray);
};

function getTargetArray(containerId) {
    if (containerId === 'tags-init-ocultar') return currentTags.initOcultar;
    if (containerId === 'tags-ocultar') return currentTags.stepOcultar;
    if (containerId === 'tags-resaltar') return currentTags.stepResaltar;
    return [];
}

window.addRow = function (type, data = {}) {
    const containerId = (type === 'objetivo') ? 'list-objetivos' : (type === 'epp') ? 'list-epp' : '';
    if (!containerId) return;
    const container = document.getElementById(containerId);
    const rowId = `row-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const row = document.createElement('div');
    row.className = (type === 'objetivo') ? 'row-objetivo' : 'row-epp';
    row.id = rowId;
    if (type === 'objetivo') {
        row.innerHTML = `<div class="form-group"><label>ESP Descrip.</label><input type="text" class="obj-es" value="${data.ESdescription || ''}"></div><div class="form-group"><label>ENG Descrip.</label><input type="text" class="obj-en" value="${data.ENdescription || ''}"></div><button type="button" class="btn-del-mini" onclick="document.getElementById('${rowId}').remove()">x</button>`;
    } else {
        row.innerHTML = `<div class="form-group"><label>ESP Nombre</label><input type="text" class="epp-es" value="${data.ESdescription || ''}"></div><div class="form-group"><label>ENG Nombre</label><input type="text" class="epp-en" value="${data.ENdescription || ''}"></div><div class="form-group"><label>Imagen URL</label><input type="text" class="epp-img" value="${data.imagenUrl || ''}"></div><button type="button" class="btn-del-mini" onclick="document.getElementById('${rowId}').remove()">x</button>`;
    }
    container.appendChild(row);
};

window.addAnimRow = function (type, data = {}) {
    const containerId = type === 'root' ? 'root-anim-list' : 'step-anim-list';
    const container = document.getElementById(containerId);
    const rowId = `anim-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const row = document.createElement('div');
    row.className = 'anim-row'; row.id = rowId;
    const isRange = Array.isArray(data.frame || data.frames);
    const fStart = isRange ? (data.frame?.[0] ?? data.frames?.[0] ?? 0) : (data.frame ?? data.frames ?? 0);
    const fEnd = isRange ? (data.frame?.[1] ?? data.frames?.[1] ?? 0) : '';
    const modo = data.modo || 'LoopOnce';

    row.innerHTML = `
        <div class="form-group"><label>Nombre</label><input type="text" class="anim-name ${validateAnim(data.nombre)}" value="${data.nombre || ''}" oninput="validateAnimInput(this)"></div>
        <div class="form-group">
            <label>Tipo</label>
            <select class="anim-type" onchange="toggleAnimRowType('${rowId}')">
                <option value="single" ${!isRange ? 'selected' : ''}>Frame</option>
                <option value="range" ${isRange ? 'selected' : ''}>Rango</option>
            </select>
        </div>
        <div class="form-group"><label class="lbl-start">${isRange ? 'Inicio' : 'Frame'}</label><input type="number" class="anim-start" value="${fStart}"></div>
        <div class="form-group anim-end-group" style="${isRange ? '' : 'display:none'}"><label>Fin</label><input type="number" class="anim-end" value="${fEnd}"></div>
        <div class="form-group">
            <label>Modo</label>
            <select class="anim-modo">
                <option value="LoopOnce" ${modo === 'LoopOnce' ? 'selected' : ''}>Una vez</option>
                <option value="LoopRepeat" ${modo === 'LoopRepeat' ? 'selected' : ''}>Loop</option>
            </select>
        </div>
        <button type="button" class="btn-del-mini" onclick="document.getElementById('${rowId}').remove()">x</button>
    `;
    container.appendChild(row);

    const inputName = row.querySelector('.anim-name');
    if (inputName) {
        new Autocomplete(inputName, sceneAssets.anims, () => window.validateAnimInput(inputName));
    }
};

window.validateAnimInput = function(input) {
    const name = input.value.trim();
    console.log(`[Editor] Validando animación: "${name}"`);
    
    if (sceneAssets.anims.length > 0) {
        if (!sceneAssets.anims.includes(name)) {
            console.error(`[Editor] ❌ Animación NO encontrada: "${name}"`);
            input.classList.add('invalid-asset');
            input.title = "Esta animación no existe en el modelado 3D";
        } else {
            console.log(`[Editor] ✅ Animación encontrada: "${name}"`);
            input.classList.remove('invalid-asset');
            input.title = "";
        }
    } else {
        console.warn("[Editor] Base de datos de animaciones vacía. Sincroniza el 3D.");
    }
};

window.validateMeshInput = function(input) {
    const value = input.value.trim();
    if (!value) {
        input.classList.remove('invalid-asset');
        return;
    }
    
    if (sceneAssets.meshes.length > 0) {
        if (!sceneAssets.meshes.includes(value)) {
            console.warn(`[Editor] ⚠️ Mesh no encontrado en el modelado 3D: "${value}"`);
            input.classList.add('invalid-asset');
            input.title = "Este objeto no existe en el modelado 3D";
        } else {
            input.classList.remove('invalid-asset');
            input.title = "";
        }
    }
};

function validateAnim(name) {
    if (!name || sceneAssets.anims.length === 0) return '';
    return sceneAssets.anims.includes(name) ? '' : 'invalid-asset';
}

window.toggleAnimRowType = function (rowId) {
    const row = document.getElementById(rowId);
    const isRange = row.querySelector('.anim-type').value === 'range';
    row.querySelector('.anim-end-group').style.display = isRange ? 'block' : 'none';
    row.querySelector('.lbl-start').textContent = isRange ? 'Inicio' : 'Frame';
};

function getAnimationsFromUI(containerId) {
    const container = document.getElementById(containerId);
    const rows = container.querySelectorAll('.anim-row');
    const anims = [];
    rows.forEach(row => {
        const nombre = row.querySelector('.anim-name').value;
        const type = row.querySelector('.anim-type').value;
        const start = parseInt(row.querySelector('.anim-start').value) || 0;
        const end = parseInt(row.querySelector('.anim-end').value);
        const modo = row.querySelector('.anim-modo').value;
        if (nombre) {
            anims.push({
                nombre,
                frame: type === 'range' ? [start, isNaN(end) ? start : end] : start,
                modo
            });
        }
    });
    return anims;
}

window.toggleHelpVisibility = function () {
    const hasObj = document.getElementById('inpObjetivos').checked;
    const hasEpp = document.getElementById('inpEquipo').checked;
    document.getElementById('section-objetivos').style.display = hasObj ? 'block' : 'none';
    document.getElementById('section-epp').style.display = hasEpp ? 'block' : 'none';
};

window.toggleEtiquetaSection = function () {
    const active = document.getElementById('chkEsEtiqueta').checked;
    document.getElementById('section-etiqueta').style.display = active ? 'grid' : 'none';
};

window.openModal = function (nodeData) {
    selectedNode = nodeData;
    const rootFields = document.getElementById('root-fields');
    const stepFields = document.getElementById('step-fields');
    document.getElementById('root-anim-list').innerHTML = '';
    document.getElementById('step-anim-list').innerHTML = '';
    document.getElementById('list-objetivos').innerHTML = '';
    document.getElementById('list-epp').innerHTML = '';

    if (nodeData.isRoot) {
        rootFields.style.display = 'block'; stepFields.style.display = 'none';
        document.getElementById('inpLabName').value = nodeData.name || '';
        document.getElementById('inpLabNameEN').value = nodeData.nameEN || '';
        // Mapear themeColor a la paleta correcta
        const PALETTE_MAP = {
            '#0066ff': 'blue-core',
            '#00d4ff': 'cyan-plasma',
            '#8b5cf6': 'violet-forge',
            '#f59e0b': 'amber-fusion',
            '#10b981': 'emerald-core'
        };
        const savedColor = (nodeData.themeColor || '#0066ff').toLowerCase();
        const paletteName = PALETTE_MAP[savedColor] || 'blue-core';
        const radio = document.querySelector(`input[name="palette"][value="${paletteName}"]`);
        if (radio) radio.checked = true;
        document.getElementById('inpThemeColor').value = savedColor;

        // Listener: cuando cambie la paleta, actualizar el hidden input
        document.querySelectorAll('input[name="palette"]').forEach(r => {
            r.onchange = () => {
                const REVERSE_MAP = {
                    'blue-core': '#0066ff', 'cyan-plasma': '#00d4ff', 'violet-forge': '#8b5cf6',
                    'amber-fusion': '#f59e0b', 'emerald-core': '#10b981'
                };
                document.getElementById('inpThemeColor').value = REVERSE_MAP[r.value] || '#0066ff';
            };
        });

        const ini = nodeData.inicioEstado || {};
        if (ini.animacionInicio) {
            const anims = Array.isArray(ini.animacionInicio) ? ini.animacionInicio : [ini.animacionInicio];
            anims.forEach(a => window.addAnimRow('root', a));
        }
        currentTags.initOcultar = [...(ini.ocultarObjetos || [])];
        window.renderTags('tags-init-ocultar', currentTags.initOcultar);
        document.getElementById('inpInitCam').value = ini.camara || '';
        document.getElementById('inpInitDir').value = ini.camaraDireccion || '';
        const ayud = nodeData.ayudas || {};
        document.getElementById('inpAyuda').checked = ayud.tieneBotonAyuda !== false;
        document.getElementById('inpObjetivos').checked = ayud.tieneBotonObjetivos !== false;
        document.getElementById('inpEquipo').checked = ayud.tieneBotonEquipo !== false;
        document.getElementById('inpSonido').checked = ayud.tieneBotonSonido !== false;
        document.getElementById('inpLang').checked = ayud.tieneBotonLang !== false;
        document.getElementById('inpGuardar').checked = ayud.tieneBotonGuardar !== false;
        if (nodeData.objetivos) nodeData.objetivos.forEach(o => window.addRow('objetivo', o));
        if (nodeData.epp) nodeData.epp.forEach(e => window.addRow('epp', e));
        document.getElementById('inpObjetivos').onchange = window.toggleHelpVisibility;
        document.getElementById('inpEquipo').onchange = window.toggleHelpVisibility;
        window.toggleHelpVisibility();
    } else {
        rootFields.style.display = 'none'; stepFields.style.display = 'block';
        document.getElementById('inpNombre').value = nodeData.ESdescription || '';
        const inpId = document.getElementById('inpEtiqueta');
        inpId.value = nodeData.id || '';
        inpId.disabled = true; // Bloquear ID en sub-pasos
        inpId.title = "El ID se genera automáticamente basado en la posición";
        
        document.getElementById('inpPosicion').value = nodeData.camara || '';
        document.getElementById('inpDireccion').value = nodeData.camaraDireccion || '';

        const hasEtiqueta = !!(nodeData.etiqueta || nodeData.flecha);
        document.getElementById('chkEsEtiqueta').checked = hasEtiqueta;
        document.getElementById('inpEtiquetaObj').value = nodeData.etiqueta || '';
        document.getElementById('inpFlechaObj').value = nodeData.flecha || '';
        window.toggleEtiquetaSection();

        if (nodeData.animaciones && Array.isArray(nodeData.animaciones)) nodeData.animaciones.forEach(a => window.addAnimRow('step', a));
        currentTags.stepOcultar = [...(nodeData.objetos_ocultar || [])];
        currentTags.stepResaltar = [...(nodeData.objeto_resaltar || [])];
        window.renderTags('tags-ocultar', currentTags.stepOcultar);
        window.renderTags('tags-resaltar', currentTags.stepResaltar);
        document.getElementById('inpStopAnim').checked = nodeData.detener_animaciones || false;

        // Cargar datos de TTS basados en ID
        const audioId = nodeData.id.replace('paso', '');
        const audioPath = `audios/${audioId}.mp3`;
        document.getElementById('inpAudioPath').value = audioPath;
        document.getElementById('tts-status').innerText = '';
        document.getElementById('btnPlayTTS').disabled = false;
    }

    // Ejecutar validación inicial de todos los campos de malla
    ['inpInitCam', 'inpInitDir', 'inpPosicion', 'inpDireccion', 'inpEtiquetaObj', 'inpFlechaObj'].forEach(id => {
        const el = document.getElementById(id);
        if (el) window.validateMeshInput(el);
    });

    renderChildrenList(); document.getElementById('editModalOverlay').style.display = 'flex';
};

window.saveNodeChanges = async function () {
    if (!selectedNode) return;
    if (selectedNode.isRoot) {
        selectedNode.name = document.getElementById('inpLabName').value;
        selectedNode.nameEN = document.getElementById('inpLabNameEN').value;
        selectedNode.themeColor = document.getElementById('inpThemeColor').value;
        selectedNode.inicioEstado = selectedNode.inicioEstado || {};
        selectedNode.inicioEstado.camara = document.getElementById('inpInitCam').value;
        selectedNode.inicioEstado.camaraDireccion = document.getElementById('inpInitDir').value;
        selectedNode.inicioEstado.ocultarObjetos = currentTags.initOcultar;
        const animRoot = getAnimationsFromUI('root-anim-list');
        selectedNode.inicioEstado.animacionInicio = animRoot.length > 1 ? animRoot : (animRoot[0] || null);
        selectedNode.ayudas = {
            tieneBotonAyuda: document.getElementById('inpAyuda').checked, tieneBotonObjetivos: document.getElementById('inpObjetivos').checked,
            tieneBotonEquipo: document.getElementById('inpEquipo').checked, tieneBotonSonido: document.getElementById('inpSonido').checked, tieneBotonLang: document.getElementById('inpLang').checked,
            tieneBotonGuardar: document.getElementById('inpGuardar').checked
        };
        if (selectedNode.ayudas.tieneBotonObjetivos) selectedNode.objetivos = Array.from(document.querySelectorAll('#list-objetivos .row-objetivo')).map(row => ({ ESdescription: row.querySelector('.obj-es').value, ENdescription: row.querySelector('.obj-en').value }));
        else delete selectedNode.objetivos;
        if (selectedNode.ayudas.tieneBotonEquipo) selectedNode.epp = Array.from(document.querySelectorAll('#list-epp .row-epp')).map(row => ({ ESdescription: row.querySelector('.epp-es').value, ENdescription: row.querySelector('.epp-en').value, imagenUrl: row.querySelector('.epp-img').value }));
        else delete selectedNode.epp;
    } else {
        selectedNode.ESdescription = document.getElementById('inpNombre').value; selectedNode.name = selectedNode.ESdescription;
        selectedNode.id = document.getElementById('inpEtiqueta').value;
        selectedNode.camara = document.getElementById('inpPosicion').value; selectedNode.camaraDireccion = document.getElementById('inpDireccion').value;

        if (document.getElementById('chkEsEtiqueta').checked) {
            selectedNode.etiqueta = document.getElementById('inpEtiquetaObj').value;
            selectedNode.flecha = document.getElementById('inpFlechaObj').value;
        } else {
            delete selectedNode.etiqueta; delete selectedNode.flecha;
        }

        const animStep = getAnimationsFromUI('step-anim-list');
        selectedNode.animaciones = animStep;
        selectedNode.objetos_ocultar = currentTags.stepOcultar;
        selectedNode.objeto_resaltar = currentTags.stepResaltar;
        selectedNode.detener_animaciones = document.getElementById('inpStopAnim').checked;
        
        // El audio_path se deduce del ID, no es necesario guardarlo como campo extra si es fijo
        selectedNode.audio_path = document.getElementById('inpAudioPath').value;
    }
    update(); window.closeModal();
    const finalConfig = DataEngine.reconstruct(treeData, rawConfig);
    try {
        await fetch('http://localhost:3001/save', { method: 'POST', body: JSON.stringify(finalConfig, null, 2), headers: { 'Content-Type': 'application/json' } });
        console.log("Disco actualizado.");
    } catch (e) { console.error("Error al guardar."); }
};


function renderChildrenList() {
    const container = document.getElementById('childrenListContainer');
    const nodesChildren = selectedNode.children || selectedNode._children || [];
    if (!nodesChildren.length) { container.innerHTML = '<div class="children-empty" style="padding:20px; color:#999; text-align:center;">Sin sub-pasos</div>'; return; }

    container.innerHTML = nodesChildren.map((c, i) => `
        <div class="child-item-edit" draggable="true" ondragstart="handleDragStart(event, ${i})" ondragover="handleDragOver(event)" ondrop="handleDrop(event, ${i})">
            <div class="drag-handle">≡</div>
            <div class="child-index-info">${c.id}</div>
            <div class="child-inputs">
                <input type="text" value="${c.ESdescription || c.name || ''}" placeholder="ESP" oninput="updateChildData(${i}, 'ESdescription', this.value)">
                <input type="text" value="${c.ENdescription || ''}" placeholder="ENG" oninput="updateChildData(${i}, 'ENdescription', this.value)">
                ${selectedNode.isRoot ? `<input type="text" value="${c.icon || ''}" placeholder="ICON" oninput="updateChildData(${i}, 'icon', this.value)">` : ''}
            </div>
            <button class="btn-delete-child" onclick="deleteChild(${i})" title="Eliminar sub-paso">×</button>
        </div>
    `).join('');
}

let draggedIdx = null;
window.handleDragStart = function(e, index) {
    draggedIdx = index;
    e.dataTransfer.effectAllowed = 'move';
};
window.handleDragOver = function(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
window.handleDrop = function(e, targetIndex) {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIndex) return;
    
    const list = selectedNode.children || selectedNode._children || [];
    const item = list.splice(draggedIdx, 1)[0];
    list.splice(targetIndex, 0, item);
    
    recalculateIds(selectedNode);
    renderChildrenList();
    update();
    draggedIdx = null;
};

function recalculateIds(parent) {
    const list = parent.children || parent._children || [];
    list.forEach((child, i) => {
        const num = i + 1;
        // Si el padre es root -> paso1, paso2...
        // Si el padre es un paso -> paso1_1, paso1_2...
        const prefix = parent.isRoot ? 'paso' : (parent.id + '_');
        child.id = prefix + (parent.isRoot ? num : num);
        
        // Recursivo: Actualizar los hijos de este hijo si existen
        if (child.children || child._children) {
            recalculateIds(child);
        }
    });
}
window.updateChildData = function (index, field, value) {
    const nodesChildren = selectedNode.children || selectedNode._children || [];
    if (nodesChildren[index]) { nodesChildren[index][field] = value; if (field === 'ESdescription') nodesChildren[index].name = value; update(); }
};
window.addNewChild = function () {
    if (!selectedNode) return;
    const list = selectedNode.children || selectedNode._children || [];
    const num = list.length + 1;
    const prefix = selectedNode.isRoot ? 'paso' : (selectedNode.id + '_');
    const newId = prefix + num;

    const newChild = { 
        id: newId, 
        ESdescription: "Nuevo Paso " + num, 
        ENdescription: "New Step " + num, 
        name: "Nuevo Paso " + num, 
        icon: "./images/icon2.png", 
        children: [],
        animaciones: [],
        objetos_mostrar: [],
        objetos_ocultar: []
    };
    
    if (!selectedNode.children && !selectedNode._children) selectedNode.children = [newChild];
    else (selectedNode.children || selectedNode._children).push(newChild);
    
    renderChildrenList(); 
    update();
};

window.deleteChild = async (index) => { 
    const confirmed = await window.showConfirm("Eliminar Paso", "¿Estás seguro de que deseas eliminar este paso y todos sus sub-pasos?");
    if(!confirmed) return;
    const list = (selectedNode.children || selectedNode._children);
    list.splice(index, 1); 
    recalculateIds(selectedNode);
    renderChildrenList(); 
    update(); 
};
window.closeModal = () => document.getElementById('editModalOverlay').style.display = 'none';
document.getElementById('uploadBtn').onclick = () => document.getElementById('jsonFileInput').click();
document.getElementById('jsonFileInput').onchange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = (event) => init(JSON.parse(event.target.result)); reader.readAsText(file);
};
document.getElementById('btn-export').onclick = () => {
    const finalConfig = DataEngine.reconstruct(treeData, rawConfig);
    const blob = new Blob([JSON.stringify(finalConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'info.json'; a.click();
};
document.getElementById('btn-reset').onclick = () => d3.select("svg").transition().duration(750).call(zoomBehavior.transform, d3.zoomIdentity.translate(100, 0).scale(1));
document.getElementById('btn-fit').onclick = () => {
    const bounds = g.node().getBBox();
    const scale = 0.8 / Math.max(bounds.width / width, bounds.height / height);
    const translate = [width / 2 - scale * (bounds.x + bounds.width / 2), height / 2 - scale * (bounds.y + bounds.height / 2)];
    d3.select("svg").transition().duration(750).call(zoomBehavior.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
};

// --- FUNCIONES TTS (ElevenLabs) ---

window.confirmAndRegenerateTTS = async function() {
    const text = document.getElementById('inpNombre').value.trim();
    if (!text) {
        alert("El nombre no puede estar vacío.");
        return;
    }
    
    if (!selectedNode) return;

    // Buscar otros pasos que tengan el mismo texto para avisar al usuario
    const duplicateIds = [];
    function searchDuplicates(nodes) {
        for (const node of nodes) {
            if (node.ESdescription && node.ESdescription.trim() === text && node.id !== selectedNode.id) {
                duplicateIds.push(node.id);
            }
            if (node.children) searchDuplicates(node.children);
        }
    }
    searchDuplicates(treeData.children || []);

    let msg = `Se va a volver a locutar este paso: <b>"${text}"</b>.<br>Esto borrará y reemplazará el audio existente.`;
    
    if (duplicateIds.length > 0) {
        const idsList = duplicateIds.map(id => id.replace('paso', '')).join(', ');
        msg += `<br><br><span style="color:#ef4444; font-weight:bold;">⚠️ ¡ATENCIÓN!</span> Este texto también se usa en los pasos: <br><b>[${idsList}]</b>.<br><br>Todos ellos serán actualizados automáticamente.`;
    }

    msg += `<br><br>¿Deseas continuar?`;
    
    const confirmed = await window.showConfirm("Locución de ElevenLabs", msg);
    if (!confirmed) return;

    const fileName = selectedNode.id.replace('paso', '');
    const extraFileNames = duplicateIds.map(id => id.replace('paso', ''));
    
    const statusEl = document.getElementById('tts-status');
    const btn = document.getElementById('btnRegenerateTTS');
    
    statusEl.innerText = "🎙️ Locutando...";
    statusEl.style.color = "#64748b";
    btn.disabled = true;
    btn.style.opacity = "0.5";

    try {
        const resp = await fetch('http://localhost:3001/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                text, 
                fileName,
                extraFileNames // Enviamos los IDs extra para que el servidor los clone
            })
        });
        
        const result = await resp.json();
        if (result.status === 'success') {
            statusEl.innerText = "✅ Audio(s) actualizado(s).";
            statusEl.style.color = "#16a34a";
            document.getElementById('btnPlayTTS').disabled = false;
        } else {
            statusEl.innerText = "❌ Error: " + result.message;
            statusEl.style.color = "#dc2626";
        }
    } catch (e) {
        statusEl.innerText = "❌ Error de conexión.";
        statusEl.style.color = "#dc2626";
        console.error(e);
    } finally {
        btn.disabled = false;
        btn.style.opacity = "1";
    }
};

window.playCurrentTTS = function() {
    const path = document.getElementById('inpAudioPath').value;
    if (!path) return;
    
    // Bypass cache con timestamp para oir el nuevo audio inmediatamente
    const fullUrl = `../app/${path}?t=${Date.now()}`; 
    console.log("[Editor] Reproduciendo:", fullUrl);
    
    const audio = new Audio(fullUrl);
    audio.play().catch(e => {
        console.error("Error al reproducir audio:", e);
        alert("No se encontró el audio para este paso.\nUsa el botón de locutar (🎙️) para generarlo.");
    });
};

// --- HELPER: MODAL DE CONFIRMACIÓN CUSTOM ---
window.showConfirm = function(title, message) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('confirmModalOverlay');
        const titleEl = document.getElementById('confirmTitle');
        const messageEl = document.getElementById('confirmMessage');
        const btnOk = document.getElementById('btnConfirmOk');
        const btnCancel = document.getElementById('btnConfirmCancel');

        titleEl.innerText = title;
        messageEl.innerHTML = message; // Usamos HTML para poder poner negritas/rojo
        overlay.style.display = 'flex';

        btnOk.onclick = () => {
            overlay.style.display = 'none';
            resolve(true);
        };

        btnCancel.onclick = () => {
            overlay.style.display = 'none';
            resolve(false);
        };
    });
};

init();
