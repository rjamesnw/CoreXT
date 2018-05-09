// ###########################################################################################################################
// Application Windows
// ###########################################################################################################################

namespace CoreXT.System.Platform {
    registerNamespace("CoreXT", "System", "Platform");
    // =======================================================================================================================

    //?export enum WindowTypes {
    //    /** A DOM element, usually a DIV, is the window target.  This is usually for system windows. */
    //    Inline,
    //    /** An embedded window, which is an IFrame using a .  This is used to isolate applications in their own secure environment, 
    //      * with their own global space to prevent conflicts. This also secures the user from malicious applications.
    //      */
    //    Embedded,
    //    /** A native window, opened by calling 'window.open()'.  This follows the same rules surrounding 'Embedded' windows,
    //      * but allows them to "pop out" from the main window.  This may be especially useful for users with multiple monitors.
    //      */
    //    Native
    //}

    export var Window = ClassFactory(Platform, Object,
        (base) => {
            class Window extends base {
                private _guid: string = Utilities.createGUID(false);
                private _target: any; // (this is either a DIV element [for system windows], IFrame element, or native pop-up Window reference)
                private _header: HTMLElement; // (the HTML-style header contents for this window)
                private _body: HTMLElement; // (the body content to display)
                private _url: string;

                // ----------------------------------------------------------------------------------------------------------------

                protected static 'WindowFactory' = class Factory extends FactoryBase(Window, base['ObjectFactory']) {
                    /** Creates a new window object.  If null is passed as the root element, then a new pop-up window is created when the window is shown. */
                    'new'(rootElement?: HTMLElement, url?: string): Window { return null; }

                    init(o: Window, isnew: boolean, rootElement?: HTMLElement, url?: string) {
                        this.super.init(o, isnew);
                        if (typeof rootElement !== 'object' || !rootElement.style) rootElement = null;
                        if (rootElement != null) rootElement.style.display = "none";
                        o._target = rootElement;
                        o._url = url;
                        return o;
                    }
                };

                // ----------------------------------------------------------------------------------------------------------------

                show() {
                    if (!this._target)
                        this._target = window.open(this._url, this._guid);
                }

                // ----------------------------------------------------------------------------------------------------------------

                public moveTo(x: number, y: number) { }
                public moveby(deltaX: number, deltaY: number) { }

                // ----------------------------------------------------------------------------------------------------------------
            }
            return [Window, Window["WindowFactory"]];
        },
        "Window"
    );
    export interface IWindow extends InstanceType<typeof Window> { }

    // ====================================================================================================================
}
