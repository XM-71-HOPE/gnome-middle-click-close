import Clutter from 'gi://Clutter';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

function findWindow(actor) {
    let a = actor;
    while (a) {
        if (a.meta_window)
            return a.meta_window;
        if (a.metaWindow)
            return a.metaWindow;
        if (a._window)
            return a._window;
        if (a._delegate && a._delegate.metaWindow)
            return a._delegate.metaWindow;
        a = a.get_parent();
    }
    return null;
}

export default class MiddleClickCloseExtension extends Extension {
    enable() {
        this._handler = global.stage.connect('captured-event', (stage, event) => {
            if (event.type() !== Clutter.EventType.BUTTON_PRESS)
                return Clutter.EVENT_PROPAGATE;

            if (event.get_button() !== 2)
                return Clutter.EVENT_PROPAGATE;

            if (!Main.overview.visible)
                return Clutter.EVENT_PROPAGATE;

            const [x, y] = event.get_coords();
            const actor = global.stage.get_actor_at_pos(Clutter.PickMode.ALL, x, y);
            const win = findWindow(actor);

            if (!win || !actor)
                return Clutter.EVENT_PROPAGATE;

            // 淡出，让关闭有个过渡
            actor.ease({
                opacity: 0,
                duration: 150,
                mode: Clutter.AnimationMode.EASE_OUT_QUAD,
                onComplete: () => win.delete(global.get_current_time()),
            });

            return Clutter.EVENT_STOP;
        });
    }

    disable() {
        if (this._handler) {
            global.stage.disconnect(this._handler);
            this._handler = null;
        }
    }
}
