export class AnimationPlayer {
    constructor(appInstance, iframeWindow) {
        this.appInstance = appInstance;
        this.v3d = iframeWindow ? iframeWindow.v3d : null;
    }

    getAllAnimations() {
        if (!this.appInstance || !this.v3d) return [];
        const res = [];
        this.appInstance.scene.traverse((o) => {
            if (this.v3d.SceneUtils.getAnimationActionByName(this.appInstance, o.name)) {
                res.push(o.name);
            }
        });
        return res;
    }

    play(anims, from = undefined, to = undefined, loop = 'LoopOnce') {
        if (!anims) return;
        const names = (anims === 'ALL_OBJECTS') ? this.getAllAnimations() : (Array.isArray(anims) ? anims : [anims]);
        
        if (!this.v3d) return;

        names.forEach((n) => {
            const action = this.v3d.SceneUtils.getAnimationActionByName(this.appInstance, n);
            if (!action) return;
            
            action.reset();
            action.loop = (loop === 'LoopRepeat') ? this.v3d.LoopRepeat : this.v3d.LoopOnce;
            if (from !== undefined) action.time = from / 24;
            action.clampWhenFinished = true;
            action.play();
        });
    }

    stop(anims) {
        if (!anims) return;
        const names = (anims === 'ALL_OBJECTS') ? this.getAllAnimations() : (Array.isArray(anims) ? anims : [anims]);
        
        if (!this.v3d) return;

        names.forEach((n) => {
            const action = this.v3d.SceneUtils.getAnimationActionByName(this.appInstance, n);
            if (action) action.stop();
        });
    }

    setFrame(anims, frame = 0) {
        if (!anims) return;
        const names = (anims === 'ALL_OBJECTS') ? this.getAllAnimations() : (Array.isArray(anims) ? anims : [anims]);
        
        if (!this.v3d) return;

        names.forEach((n) => {
            const action = this.v3d.SceneUtils.getAnimationActionByName(this.appInstance, n);
            if (action) {
                action.reset(); 
                action.time = frame / 24; 
                action.play(); 
                action.paused = true;
            }
        });
    }
}
