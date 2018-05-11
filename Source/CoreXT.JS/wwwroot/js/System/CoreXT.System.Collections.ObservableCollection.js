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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var CoreXT;
(function (CoreXT) {
    var System;
    (function (System) {
        var Collections;
        (function (Collections) {
            Collections.ObservableCollection = CoreXT.ClassFactory(Collections, System.Array, function (base) {
                var ObservableCollection = (function (_super) {
                    __extends(ObservableCollection, _super);
                    function ObservableCollection() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    ObservableCollection['ObservableCollectionFactory'] = (function (_super) {
                        __extends(Factory, _super);
                        function Factory() {
                            return _super !== null && _super.apply(this, arguments) || this;
                        }
                        Factory['new'] = function () {
                            var items = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                items[_i] = arguments[_i];
                            }
                            return null;
                        };
                        Factory.init = function (o, isnew) {
                            var items = [];
                            for (var _i = 2; _i < arguments.length; _i++) {
                                items[_i - 2] = arguments[_i];
                            }
                            (_a = this.super).init.apply(_a, __spread([o, isnew], items));
                            var _a;
                        };
                        return Factory;
                    }(CoreXT.FactoryBase(ObservableCollection, base['ArrayFactory'])));
                    return ObservableCollection;
                }(base));
                return [ObservableCollection, ObservableCollection["ObservableCollectionFactory"]];
            }, "ObservableCollection");
        })(Collections = System.Collections || (System.Collections = {}));
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.Collections.ObservableCollection.js.map