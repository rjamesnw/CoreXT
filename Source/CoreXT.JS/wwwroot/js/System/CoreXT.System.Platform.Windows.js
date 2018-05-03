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
            var $Window = (function (_super) {
                __extends($Window, _super);
                function $Window() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this._guid = CoreXT.Utilities.createGUID(false);
                    return _this;
                }
                $Window['$Window new'] = function (rootElement, url) { return null; };
                $Window.prototype['$Window init'] = function (isnew, rootElement, url) {
                    _super.prototype[''].call(this, this, isnew);
                    if (typeof rootElement !== 'object' || !rootElement.style)
                        rootElement = null;
                    if (rootElement != null)
                        rootElement.style.display = "none";
                    this._target = rootElement;
                    this._url = url;
                    return this;
                };
                $Window.prototype.show = function () {
                    if (!this._target)
                        this._target = window.open(this._url, this._guid);
                };
                $Window.prototype.moveTo = function (x, y) { };
                $Window.prototype.moveby = function (deltaX, deltaY) { };
                $Window['$Window Factory'] = (function (_super) {
                    __extends(Factory, _super);
                    function Factory() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    Factory.prototype['new'] = function (rootElement, url) { return null; };
                    Factory.prototype.init = function ($this, isnew, rootElement, url) {
                        this.$__baseFactory.init($this, isnew);
                        if (typeof rootElement !== 'object' || !rootElement.style)
                            rootElement = null;
                        if (rootElement != null)
                            rootElement.style.display = "none";
                        $this._target = rootElement;
                        $this._url = url;
                        return $this;
                    };
                    return Factory;
                }(CoreXT.FactoryBase($Window, $Window['$Object Factory']))).register(Platform);
                return $Window;
            }(System.Object.$__type));
            Platform.Window = $Window['$Window Factory'].$__type;
        })(Platform = System.Platform || (System.Platform = {}));
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.Platform.Windows.js.map