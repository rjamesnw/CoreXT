// ############################################################################################################################################
// Collections: ObservableCollection
// ############################################################################################################################################
var CoreXT;
(function (CoreXT) {
    var System;
    (function (System) {
        var Collections;
        (function (Collections) {
            CoreXT.namespace(function () { return CoreXT.System.Collections; });
            /** Holds an array of items, and implements notification functionality for when the collection changes. */
            var ObservableCollection = /** @class */ (function (_super) {
                __extends(ObservableCollection, _super);
                function ObservableCollection() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                ObservableCollection['new'] = function () {
                    var items = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        items[_i] = arguments[_i];
                    }
                    return null;
                };
                ObservableCollection.init = function (o, isnew) {
                    var _a;
                    var items = [];
                    for (var _i = 2; _i < arguments.length; _i++) {
                        items[_i - 2] = arguments[_i];
                    }
                    (_a = this.super).init.apply(_a, __spread([o, isnew], items));
                };
                return ObservableCollection;
            }(CoreXT.FactoryBase(System.Array)));
            Collections.ObservableCollection = ObservableCollection;
            (function (ObservableCollection) {
                var $__type = /** @class */ (function (_super) {
                    __extends($__type, _super);
                    function $__type() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    // --------------------------------------------------------------------------------------------------------------------------
                    $__type[CoreXT.constructor] = function (factory) {
                        //factory.init = (o, isnew) => {
                        //};
                    };
                    return $__type;
                }(CoreXT.FactoryType(System.Array)));
                ObservableCollection.$__type = $__type;
                ObservableCollection.$__register(Collections);
            })(ObservableCollection = Collections.ObservableCollection || (Collections.ObservableCollection = {}));
            // ========================================================================================================================================
        })(Collections = System.Collections || (System.Collections = {}));
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {})); // (end Collections)
//# sourceMappingURL=CoreXT.System.Collections.ObservableCollection.js.map