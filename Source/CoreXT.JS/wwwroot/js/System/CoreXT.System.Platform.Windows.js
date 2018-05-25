// ###########################################################################################################################
// Application Windows
// ###########################################################################################################################
var CoreXT;
(function (CoreXT) {
    var System;
    (function (System) {
        var Platform;
        (function (Platform) {
            CoreXT.registerNamespace("CoreXT", "System", "Platform");
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
            Platform.Window = CoreXT.ClassFactory(Platform, System.Object, function (base) {
                var Window = /** @class */ (function (_super) {
                    __extends(Window, _super);
                    function Window() {
                        var _this = _super !== null && _super.apply(this, arguments) || this;
                        _this._guid = CoreXT.Utilities.createGUID(false);
                        return _this;
                        // ----------------------------------------------------------------------------------------------------------------
                    }
                    // ----------------------------------------------------------------------------------------------------------------
                    Window.prototype.show = function () {
                        if (!this._target)
                            this._target = window.open(this._url, this._guid);
                    };
                    // ----------------------------------------------------------------------------------------------------------------
                    Window.prototype.moveTo = function (x, y) { };
                    Window.prototype.moveby = function (deltaX, deltaY) { };
                    // ----------------------------------------------------------------------------------------------------------------
                    Window['WindowFactory'] = /** @class */ (function (_super) {
                        __extends(Factory, _super);
                        function Factory() {
                            return _super !== null && _super.apply(this, arguments) || this;
                        }
                        /** Creates a new window object.  If null is passed as the root element, then a new pop-up window is created when the window is shown. */
                        Factory['new'] = function (rootElement, url) { return null; };
                        Factory.init = function (o, isnew, rootElement, url) {
                            this.super.init(o, isnew);
                            if (typeof rootElement !== 'object' || !rootElement.style)
                                rootElement = null;
                            if (rootElement != null)
                                rootElement.style.display = "none";
                            o._target = rootElement;
                            o._url = url;
                        };
                        return Factory;
                    }(CoreXT.FactoryBase(Window, base['ObjectFactory'])));
                    return Window;
                }(base));
                return [Window, Window["WindowFactory"]];
            }, "Window");
            // ====================================================================================================================
        })(Platform = System.Platform || (System.Platform = {}));
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.Platform.Windows.js.map