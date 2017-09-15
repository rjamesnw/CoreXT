// ###########################################################################################################################
// Collections: IndexedObjectCollection
// ###########################################################################################################################

namespace CoreXT.System.Collections {
    // =======================================================================================================================

    /** Returns an ID based on the index position of the added object, or from a list of previously released object IDs (indexes).
    * There are 2 main goals of this object: 1. to help prevent ID numbers from wrapping for server apps that may be running
    * for days/weeks/months by caching an reusing IDs that are no longer needed, and 2. to maintain a global list of objects
    * for fast lookup under a single app domain (especially for networking purposes).
    * Note: A property '$__id' is added/updated on the objects automatically.  You can change this property name by setting
    * a new value for 'IndexedObjectCollcetion.__IDPropertyName'.
    */
    export class IndexedObjectCollection<TObject> { // (inherits natively from 'PrimitiveObject')
        static __IDPropertyName = "$__id";
        static __validIDIndexPropertyName = "__.validIDIndex.__"; // (should never need to be accessed, so named as such to discourage it)

        private __objects: TObject[] = [];
        private __validIDs: number[] = []; // (holds all the valid object indexes for quick lookup)
        private __validIDsReadIndex: number = -1;
        private __releasedIDs: number[] = []; // (holds all the released object indexes for quick lookup)
        private __releasedIDsReadIndex: number = -1;

        /** @param {TObject[]} objects Initial objects to add to the collection. */
        constructor(...objects: TObject[]) {
            for (var i = 0, n = objects.length; i < n; ++i)
                this.addObject(objects[i]);
        }

        /** Adds an object and returns it's index number as the ID for the object. */
        addObject(obj: TObject): number {
            if (obj === void 0 || obj === null) return void 0;
            var id = obj[IndexedObjectCollection.__IDPropertyName];
            if (id >= this.__objects.length) throw "The object already has an ID, but that ID does no belong to this collection."; // (this error may help identify a possible serious developer design bug)
            if (id === 0 || id >= 0) {
                // ... this object already has an ID, so let's try to use that ...
                var internalObj = this.__objects[id]; // (rely on the internal object only)
                if (internalObj == obj) return id; // (return if references are the same!)
                if (internalObj != null)
                    throw "The object given is not the same object that currently exists at the same index."; // (this error may help identify a possible serious developer design bug)
                else
                    throw "The object given has an ID, but it's reference does not exist in this collection."; // (this error may help identify a possible serious developer design bug)
            }
            if (this.__releasedIDsReadIndex >= 0)
                id = this.__releasedIDs[this.__releasedIDsReadIndex--];
            else
                id = this.__objects.length;
            obj[IndexedObjectCollection.__IDPropertyName] = id;
            this.__objects[id] = obj;
            this.__validIDs[++this.__validIDsReadIndex] = id;
            obj[IndexedObjectCollection.__validIDIndexPropertyName] = this.__validIDsReadIndex;
        }

        /** Releases an object based on it's ID (index value). */
        removeObject(id: number): TObject;
        /** Releases an object based on it's ID property (index value, which is '__id' by default). */
        removeObject(obj: TObject): TObject;
        removeObject(idOrObj: any): TObject {
            var id: number, obj: TObject, objGiven: {} = null;
            id = typeof idOrObj === 'number' ? idOrObj : (objGiven = idOrObj)[IndexedObjectCollection.__IDPropertyName];
            if (!(id === 0 || id > 0 && id < this.__objects.length)) return void 0; // (make sure the ID is valid)
            obj = this.__objects[id]; // (make sure to rely on getting the object internally, and not the one passed in)
            if (obj == null) return void 0; // (this object was already removed, or the object given is not the same object in the ID position)
            if (objGiven != null && obj != objGiven) throw "The object given is not the same object that currently exists at the same index."; // (this error may help identify a possible serious developer design bug)
            obj[IndexedObjectCollection.__IDPropertyName] = -1;
            this.__objects[id] = null; // (nullify so we know this position is empty)
            this.__releasedIDs[++this.__releasedIDsReadIndex] = id; // (store this ID for quick reference later when new objects are added)
            var validIDIndex = obj[IndexedObjectCollection.__validIDIndexPropertyName];
            obj[IndexedObjectCollection.__validIDIndexPropertyName] = -1;
            this.__validIDs[validIDIndex] = this.__validIDs[this.__validIDsReadIndex--]; // (put the last id in place of the one to be removed [simple switch and decrement])
        }

        /** Return the object associated with the specified ID (index) value. */
        getObject<T extends TObject>(id: number): T {
            if (!(id === 0 || id > 0 && id < this.__objects.length)) return void 0; // (make sure the ID is valid)
            return <T>this.__objects[id] || void 0; // (null items are empty positions, like accessing outside array bounds, and will always be translated to "undefined")
        }

        /** Returns the number of objects in this collection.
        * You can use this number with the 'getObjectAt()' function to iterate over all the objects.
        */
        count(): number { return this.__validIDs.length; }

        /** Returns an object at a specified index. This allows iterating over the objects in a linear fashion.
        * Internally, objects are stored in an array that may have a lot of 'null' items where objects have been removed. A
        * separate internal array holds a list of valid object IDs for quick reference, and it is this array that the 'index'
        * parameter applies to.
        * Warning: When objects are removed, their IDs in the internal "valid IDs" array are swapped with the end item, so never
        * remove objects while iterating over them using this function, otherwise many objects may be skipped in the process.
        * If objects must be deleted during iteration, get the complete array of objects first by calling the 'getItems()' function.
        */
        getObjectAt(index: number): TObject {
            if (index < 0 || index >= this.__validIDs.length) return void 0;
            return this.__objects[this.__validIDs[index]];
        }

        /** Returns an array of all the objects in this collection. */
        getItems(): TObject[] {
            var items: TObject[] = [];
            for (var i = 0, n = this.__validIDs.length; i < n; ++i)
                items[i] = this.__objects[this.__validIDs[i]];
            return items;
        }
    }

    // =======================================================================================================================

} // (end Collections)
