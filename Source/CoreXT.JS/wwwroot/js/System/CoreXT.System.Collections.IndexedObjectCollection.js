// ############################################################################################################################################
// Collections: IndexedObjectCollection
// ############################################################################################################################################
var CoreXT;
(function (CoreXT) {
    var System;
    (function (System) {
        var Collections;
        (function (Collections) {
            CoreXT.registerNamespace("CoreXT", "System", "Collections");
            // ========================================================================================================================================
            /** Returns an ID based on the index position of the added object, or from a list of previously released object IDs (indexes).
            * There are 2 main goals of this object: 1. to help prevent ID numbers from wrapping for server apps that may be running
            * for days/weeks/months by caching an reusing IDs that are no longer needed, and 2. to maintain a global list of objects
            * for fast lookup under a single app domain (especially for networking purposes).
            * Note: A property '$__id' is added/updated on the objects automatically.  You can change this property name by setting
            * a new value for 'IndexedObjectCollcetion.__IDPropertyName'.
            */
            Collections.IndexedObjectCollection = CoreXT.ClassFactory(Collections, System.Array, function (base) {
                var IndexedObjectCollection = /** @class */ (function (_super) {
                    __extends(IndexedObjectCollection, _super);
                    function IndexedObjectCollection() {
                        var _this = _super !== null && _super.apply(this, arguments) || this;
                        /**
                         * Holds the name of the internal property created on the objects in order to track indexes.
                         * This defaults to the global 'IndexedObjectCollection.__IDPropertyName' setting.
                         */
                        _this.__IDPropertyName = IndexedObjectCollection.__IDPropertyName;
                        _this.__objects = _this;
                        _this.__validIDs = []; // (holds all the valid object indexes for quick lookup)
                        _this.__validIDsReadIndex = -1;
                        _this.__releasedIDs = []; // (holds all the released object indexes for quick lookup)
                        _this.__releasedIDsReadIndex = -1;
                        return _this;
                        // --------------------------------------------------------------------------------------------------------------------------
                    }
                    /** Adds an object and returns it's index number as the ID for the object. */
                    IndexedObjectCollection.prototype.addObject = function (obj) {
                        if (obj === void 0 || obj === null)
                            return void 0;
                        var id = obj[this.__IDPropertyName];
                        if (id >= this.__objects.length)
                            throw "The object already has an ID, but that ID does no belong to this collection."; // (this error may help identify a possible serious developer design bug)
                        if (id === 0 || id >= 0) {
                            // ... this object already has an ID, so let's try to use that ...
                            var internalObj = this.__objects[id]; // (rely on the internal object only)
                            if (internalObj == obj)
                                return id; // (return if references are the same!)
                            if (internalObj != null)
                                throw "The object given is not the same object that currently exists at the same index."; // (this error may help identify a possible serious developer design bug)
                            else
                                throw "The object given has an ID, but it's reference does not exist in this collection."; // (this error may help identify a possible serious developer design bug)
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
                            return void 0; // (make sure the ID is valid)
                        obj = this.__objects[id]; // (make sure to rely on getting the object internally, and not the one passed in)
                        if (obj == null)
                            return void 0; // (this object was already removed, or the object given is not the same object in the ID position)
                        if (objGiven != null && obj != objGiven)
                            throw "The object given is not the same object that currently exists at the same index."; // (this error may help identify a possible serious developer design bug)
                        obj[this.__IDPropertyName] = -1;
                        this.__objects[id] = null; // (nullify so we know this position is empty)
                        this.__releasedIDs[++this.__releasedIDsReadIndex] = id; // (store this ID for quick reference later when new objects are added)
                        var validIDIndex = obj[IndexedObjectCollection.__validIDIndexPropertyName];
                        obj[IndexedObjectCollection.__validIDIndexPropertyName] = -1;
                        this.__validIDs[validIDIndex] = this.__validIDs[this.__validIDsReadIndex--]; // (put the last id in place of the one to be removed [simple switch and decrement])
                    };
                    /** Return the object associated with the specified ID (index) value cast to the specified type. */
                    IndexedObjectCollection.prototype.getObject = function (id) {
                        if (!(id === 0 || id > 0 && id < this.__objects.length))
                            return void 0; // (make sure the ID is valid)
                        return this.__objects[id] || void 0; // (null items are empty positions, like accessing outside array bounds, and will always be translated to "undefined")
                    };
                    /** Return the object associated with the specified ID (index) value and forcibly cast it to the specified type. */
                    IndexedObjectCollection.prototype.getObjectForceCast = function (id) { return this.getObject(id); };
                    /** Returns the number of objects in this collection.
                    * You can use this number with the 'getObjectAt()' function to iterate over all the objects.
                    */
                    IndexedObjectCollection.prototype.count = function () { return this.__validIDs.length; };
                    /** Returns an object at a specified index. This allows iterating over the objects in a linear fashion.
                    * Internally, objects are stored in an array that may have a lot of 'null' items where objects have been removed. A
                    * separate internal array holds a list of valid object IDs for quick reference, and it is this array that the 'index'
                    * parameter applies to.
                    * Warning: When objects are removed, their IDs in the internal "valid IDs" array are swapped with the end item, so never
                    * remove objects while iterating over them using this function, otherwise many objects may be skipped in the process.
                    * If objects must be deleted during iteration, get the complete array of objects first by calling the 'getItems()' function.
                    */
                    IndexedObjectCollection.prototype.getObjectAt = function (index) {
                        if (index < 0 || index >= this.__validIDs.length)
                            return void 0;
                        return this.__objects[this.__validIDs[index]];
                    };
                    /** Returns an array of all the objects in this collection. */
                    IndexedObjectCollection.prototype.getItems = function () {
                        var items = [];
                        for (var i = 0, n = this.__validIDs.length; i < n; ++i)
                            items[i] = this.__objects[this.__validIDs[i]];
                        return items;
                    };
                    /** Removes all objects from the collection. */
                    IndexedObjectCollection.prototype.clear = function () {
                        for (var i = 0, n = this.__validIDs.length; i < n; ++i)
                            this.removeObject(this.__validIDs[i]);
                    };
                    /**
                     * Holds the name of the internal property created on the objects in order to track indexes.
                     * This defaults to "$__index".
                     */
                    IndexedObjectCollection.__IDPropertyName = "$__index";
                    IndexedObjectCollection.__validIDIndexPropertyName = "__.validIDIndex.__"; // (should never need to be accessed, so named as such to discourage it)
                    // --------------------------------------------------------------------------------------------------------------------------
                    IndexedObjectCollection['IndexedObjectCollectionFactory'] = /** @class */ (function (_super) {
                        __extends(Factory, _super);
                        function Factory() {
                            return _super !== null && _super.apply(this, arguments) || this;
                        }
                        /** @param {TObject[]} objects Initial objects to add to the collection. */
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
            // ========================================================================================================================================
        })(Collections = System.Collections || (System.Collections = {}));
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {})); // (end Collections)
//# sourceMappingURL=CoreXT.System.Collections.IndexedObjectCollection.js.map