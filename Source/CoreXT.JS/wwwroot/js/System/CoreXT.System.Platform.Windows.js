// ###########################################################################################################################
// Application Windows
// ###########################################################################################################################
var CoreXT;
(function (CoreXT) {
    var System;
    (function (System) {
        var Platform;
        (function (Platform) {
            CoreXT.namespace(function () { return CoreXT.System.Platform; });
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
            var Window = /** @class */ (function (_super) {
                __extends(Window, _super);
                function Window() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                /** Creates a new window object.  If null is passed as the root element, then a new pop-up window is created when the window is shown. */
                Window['new'] = function (rootElement, url) { return null; };
                Window.init = function (o, isnew, rootElement, url) { };
                return Window;
            }(CoreXT.FactoryBase(System.Object)));
            Platform.Window = Window;
            (function (Window) {
                var $__type = /** @class */ (function (_super) {
                    __extends($__type, _super);
                    function $__type() {
                        var _this = _super !== null && _super.apply(this, arguments) || this;
                        _this._guid = CoreXT.Utilities.createGUID(false);
                        return _this;
                    }
                    // ----------------------------------------------------------------------------------------------------------------
                    $__type.prototype.show = function () {
                        if (!this._target)
                            this._target = window.open(this._url, this._guid);
                    };
                    // ----------------------------------------------------------------------------------------------------------------
                    $__type.prototype.moveTo = function (x, y) { };
                    $__type.prototype.moveby = function (deltaX, deltaY) { };
                    // ----------------------------------------------------------------------------------------------------------------
                    $__type[CoreXT.constructor] = function (factory) {
                        factory.init = function (o, isnew, rootElement, url) {
                            factory.super.init(o, isnew);
                            if (typeof rootElement !== 'object' || !rootElement.style)
                                rootElement = null;
                            if (rootElement != null)
                                rootElement.style.display = "none";
                            o._target = rootElement;
                            o._url = url;
                        };
                    };
                    return $__type;
                }(CoreXT.FactoryType(System.Object)));
                Window.$__type = $__type;
                Window.$__register(Platform);
            })(Window = Platform.Window || (Platform.Window = {}));
            // ====================================================================================================================
        })(Platform = System.Platform || (System.Platform = {}));
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.Platform.Windows.js.map