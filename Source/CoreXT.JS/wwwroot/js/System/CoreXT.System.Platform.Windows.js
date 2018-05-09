var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var CoreXT;
(function (CoreXT) {
    var System;
    (function (System) {
        var Platform;
        (function (Platform) {
            CoreXT.registerNamespace("CoreXT", "System", "Platform");
            Platform.Window = CoreXT.ClassFactory(Platform, System.Object, function (base) {
                var Window = (function (_super) {
                    __extends(Window, _super);
                    function Window() {
                        var _this = _super !== null && _super.apply(this, arguments) || this;
                        _this._guid = CoreXT.Utilities.createGUID(false);
                        return _this;
                    }
                    Window.prototype.show = function () {
                        if (!this._target)
                            this._target = window.open(this._url, this._guid);
                    };
                    Window.prototype.moveTo = function (x, y) { };
                    Window.prototype.moveby = function (deltaX, deltaY) { };
                    Window['WindowFactory'] = (function (_super) {
                        __extends(Factory, _super);
                        function Factory() {
                            return _super !== null && _super.apply(this, arguments) || this;
                        }
                        Factory.prototype['new'] = function (rootElement, url) { return null; };
                        Factory.prototype.init = function (o, isnew, rootElement, url) {
                            this.super.init(o, isnew);
                            if (typeof rootElement !== 'object' || !rootElement.style)
                                rootElement = null;
                            if (rootElement != null)
                                rootElement.style.display = "none";
                            o._target = rootElement;
                            o._url = url;
                            return o;
                        };
                        return Factory;
                    }(CoreXT.FactoryBase(Window, base['ObjectFactory'])));
                    return Window;
                }(base));
                return [Window, Window["WindowFactory"]];
            }, "Window");
        })(Platform = System.Platform || (System.Platform = {}));
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.Platform.Windows.js.map