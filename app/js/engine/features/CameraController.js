export class CameraController {
    constructor(appInstance) {
        this.appInstance = appInstance;
        // Caché interno si es necesario, aunque Verge3D tiene scene.getObjectByName
    }

    getObjectByName(name) {
        if (!name || !this.appInstance) return null;
        let objTarget = null;
        this.appInstance.scene.traverse((obj) => {
            if (obj.name === name) objTarget = obj;
        });
        return objTarget;
    }

    tween(posName, dirName, duration = 1.2) {
        const p = this.getObjectByName(posName);
        const d = this.getObjectByName(dirName);
        
        if (!p || !d || !this.appInstance.controls) {
            console.warn(`[Camera] No se encontraron posiciones para tween: pos=${posName}, dir=${dirName}`);
            return;
        }

        // v3d expone Vector3
        const v3d = this.appInstance.v3d || window.frames['v3d-container']?.contentWindow?.v3d;
        if (!v3d) return;

        const vec3Tmp = new v3d.Vector3();
        const vec3Tmp2 = new v3d.Vector3();

        const pW = p.getWorldPosition(vec3Tmp);
        const dW = d.getWorldPosition(vec3Tmp2);
        
        this.appInstance.controls.tween(pW, dW, duration);
    }
}
