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
        var Collections;
        (function (Collections) {
            CoreXT.registerNamespace("CoreXT", "System", "Collections");
            Collections.IndexedObjectCollection = CoreXT.ClassFactory(Collections, System.Array, function (base) {
                var IndexedObjectCollection = (function (_super) {
                    __extends(IndexedObjectCollection, _super);
                    function IndexedObjectCollection() {
                        var _this = _super !== null && _super.apply(this, arguments) || this;
                        _this.__IDPropertyName = IndexedObjectCollection.__IDPropertyName;
                        _this.__objects = _this;
                        _this.__validIDs = [];
                        _this.__validIDsReadIndex = -1;
                        _this.__releasedIDs = [];
                        _this.__releasedIDsReadIndex = -1;
                        return _this;
                    }
                    IndexedObjectCollection.prototype.addObject = function (obj) {
                        if (obj === void 0 || obj === null)
                            return void 0;
                        var id = obj[this.__IDPropertyName];
                        if (id >= this.__objects.length)
                            throw "The object already has an ID, but that ID does no belong to this collection.";
                        if (id === 0 || id >= 0) {
                            var internalObj = this.__objects[id];
                            if (internalObj == obj)
                                return id;
                            if (internalObj != null)
                                throw "The object given is not the same object that currently exists at the same index.";
                            else
                                throw "The object given has an ID, but it's reference does not exist in this collection.";
                        }
                        if (this.__releasedIDsReadIndex >= 0)
                            id = this.__releasedIDs[this.__releasedIDsReadIndex--];
                        else
                            id = this.__objects.length;
                        obj[this.__IDPropertyName] = id;
                        this.__objects[id] = obj;
                        this.__validIDs[++this.__validIDsReadIndex] = id;
                        obj[IndexedObjectCollection.__validIDIndexPropertyName] = this.__validIDsReadIndex;
                    };
                    IndexedObjectCollection.prototype.removeObject = function (idOrObj) {
                        var id, obj, objGiven = null;
                        id = typeof idOrObj === 'number' ? idOrObj : (objGiven = idOrObj)[this.__IDPropertyName];
                        if (!(id === 0 || id > 0 && id < this.__objects.length))
                            return void 0;
                        obj = this.__objects[id];
                        if (obj == null)
                            return void 0;
                        if (objGiven != null && obj != objGiven)
                            throw "The object given is not the same object that currently exists at the same index.";
                        obj[this.__IDPropertyName] = -1;
                        this.__objects[id] = null;
                        this.__releasedIDs[++this.__releasedIDsReadIndex] = id;
                        var validIDIndex = obj[IndexedObjectCollection.__validIDIndexPropertyName];
                        obj[IndexedObjectCollection.__validIDIndexPropertyName] = -1;
                        this.__validIDs[validIDIndex] = this.__validIDs[this.__validIDsReadIndex--];
                    };
                    IndexedObjectCollection.prototype.getObject = function (id) {
                        if (!(id === 0 || id > 0 && id < this.__objects.length))
                            return void 0;
                        return this.__objects[id] || void 0;
                    };
                    IndexedObjectCollection.prototype.getObjectForceCast = function (id) { return this.getObject(id); };
                    IndexedObjectCollection.prototype.count = function () { return this.__validIDs.length; };
                    IndexedObjectCollection.prototype.getObjectAt = function (index) {
                        if (index < 0 || index >= this.__validIDs.length)
                            return void 0;
                        return this.__objects[this.__validIDs[index]];
                    };
                    IndexedObjectCollection.prototype.getItems = function () {
                        var items = [];
                        for (var i = 0, n = this.__validIDs.length; i < n; ++i)
                            items[i] = this.__objects[this.__validIDs[i]];
                        return items;
                    };
                    IndexedObjectCollection.prototype.clear = function () {
                        for (var i = 0, n = this.__validIDs.length; i < n; ++i)
                            this.removeObject(this.__validIDs[i]);
                    };
                    IndexedObjectCollection.__IDPropertyName = "$__index";
                    IndexedObjectCollection.__validIDIndexPropertyName = "__.validIDIndex.__";
                    IndexedObjectCollection['IndexedObjectCollectionFactory'] = (function (_super) {
                        __extends(Factory, _super);
                        function Factory() {
                            return _super !== null && _super.apply(this, arguments) || this;
                        }
                        Factory['new'] = function () {
                            var objects = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                objects[_i] = arguments[_i];
                            }
                            return null;
                        };
                        Factory.init = function (o, isnew) {
                            var objects = [];
                            for (var _i = 2; _i < arguments.length; _i++) {
                                objects[_i - 2] = arguments[_i];
                            }
                            this.super.init.apply(this.super, arguments);
                            o.clear();
                            for (var i = 0, n = objects.length; i < n; ++i)
                                o.addObject(objects[i]);
                        };
                        return Factory;
                    }(CoreXT.FactoryBase(IndexedObjectCollection, base['ArrayFactory'])));
                    return IndexedObjectCollection;
                }(base));
                return [IndexedObjectCollection, IndexedObjectCollection["IndexedObjectCollectionFactory"]];
            }, "IndexedObjectCollection");
        })(Collections = System.Collections || (System.Collections = {}));
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.Collections.IndexedObjectCollection.js.map