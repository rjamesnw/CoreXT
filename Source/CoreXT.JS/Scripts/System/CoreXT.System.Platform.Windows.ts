// ###########################################################################################################################
// Application Windows
// ###########################################################################################################################

namespace CoreXT.System.Platform {
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

    class $Window extends Object.$__type {
        private _guid: string = Utilities.createGUID(false);
        private _target: any; // (this is either a DIV element [for system windows], IFrame element, or native popup Window reference)
        private _header: HTMLElement; // (the HTML-style header contents for this window)
        private _body: HTMLElement; // (the body content to display)
        private _url: string;

        // ----------------------------------------------------------------------------------------------------------------

        static '$Window new'(rootElement?: HTMLElement, url?: string): $Window { return null; }

        '$Window init'(isnew: boolean, rootElement?: HTMLElement, url?: string): $Window {
            super[''](this, isnew);
            if (typeof rootElement !== OBJECT || !rootElement.style) rootElement = null;
            if (rootElement != null) rootElement.style.display = "none";
            this._target = rootElement;
            this._url = url;
            return this;
        }

        protected static '$Window Factory' = class Factory extends FactoryBase($Window, $Window['$Object Factory']) implements IFactory {
            /** Creates a new window object.  If null is passed as the root element, then a new pop-up window is created when the window is shown. */
            'new'(rootElement?: HTMLElement, url?: string): $Window { return null; }

            init($this: $Window, isnew: boolean, rootElement?: HTMLElement, url?: string): $Window {
                this.$__baseFactory.init($this, isnew);
                if (typeof rootElement !== OBJECT || !rootElement.style) rootElement = null;
                if (rootElement != null) rootElement.style.display = "none";
                $this._target = rootElement;
                $this._url = url;
                return $this;
            }
        }.register([CoreXT, System, Platform]);

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

    export interface IWindow extends $Window { }

    export var Window = $Window['$Window Factory'].$__type;

    // ====================================================================================================================
}
