// ############################################################################################################################################
// Collections: ObservableCollection
// ############################################################################################################################################
var CoreXT;
(function (CoreXT) {
    var System;
    (function (System) {
        var Collections;
        (function (Collections) {
            CoreXT.registerNamespace("CoreXT", "System", "Collections");
            /** Holds an array of items, and implements notification functionality for when the collection changes. */
            Collections.ObservableCollection = CoreXT.ClassFactory(Collections, System.Array, function (base) {
                var ObservableCollection = /** @class */ (function (_super) {
                    __extends(ObservableCollection, _super);
                    function ObservableCollection() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    // --------------------------------------------------------------------------------------------------------------------------
                    ObservableCollection['ObservableCollectionFactory'] = /** @class */ (function (_super) {
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
                            var _a;
                            var items = [];
                            for (var _i = 2; _i < arguments.length; _i++) {
                                items[_i - 2] = arguments[_i];
                            }
                            (_a = this.super).init.apply(_a, __spread([o, isnew], items));
                        };
                        return Factory;
                    }(CoreXT.FactoryBase(ObservableCollection, base['ArrayFactory'])));
                    return ObservableCollection;
                }(base));
                return [ObservableCollection, ObservableCollection["ObservableCollectionFactory"]];
            }, "ObservableCollection");
            // ========================================================================================================================================
        })(Collections = System.Collections || (System.Collections = {}));
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {})); // (end Collections)
//# sourceMappingURL=CoreXT.System.Collections.ObservableCollection.js.map