export class VisibilityManager {
    constructor(appInstance) {
        this.appInstance = appInstance;
    }

    getObjectByName(name) {
        if (!name || !this.appInstance) return null;
        // La mayoría de las veces el nombre es único, usamos el método nativo por velocidad
        return this.appInstance.scene.getObjectByName(name);
    }

    change(names, bool) {
        if (!names || !this.appInstance) return;
        const namesArray = (typeof names === 'string') ? [names] : names;
        if (namesArray.length === 0) return;

        // Para asegurar que encontramos TODOS los objetos con ese nombre (por si hay duplicados o clones)
        this.appInstance.scene.traverse((o) => {
            if (namesArray.includes(o.name)) {
                o.visible = bool;
            }
        });
    }

    hideAll(namesArray) {
        this.change(namesArray, false);
    }

    showAll(namesArray) {
        this.change(namesArray, true);
    }

    hideEverything() {
        if (!this.appInstance) return;
        this.appInstance.scene.traverse((o) => {
            if (o.type === 'Mesh' || o.isMesh) {
                o.visible = false;
            }
        });
    }

    showEverything() {
        if (!this.appInstance) return;
        this.appInstance.scene.traverse((o) => {
            if (o.type === 'Mesh' || o.isMesh) {
                o.visible = true;
            }
        });
    }
}
