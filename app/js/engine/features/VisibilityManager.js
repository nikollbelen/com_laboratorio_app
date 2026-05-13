export class VisibilityManager {
    constructor(appInstance) {
        this.appInstance = appInstance;
    }

    getObjectByName(name) {
        if (!name || !this.appInstance) return null;
        let objTarget = null;
        this.appInstance.scene.traverse((obj) => {
            if (obj.name === name) objTarget = obj;
        });
        return objTarget;
    }

    change(names, bool) {
        const namesArray = (typeof names === 'string') ? [names] : names;
        if (!namesArray || namesArray.length === 0) return;

        namesArray.forEach((n) => {
            const o = this.getObjectByName(n);
            if (o) o.visible = bool;
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
