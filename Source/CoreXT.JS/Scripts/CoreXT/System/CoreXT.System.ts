// ###########################################################################################################################
// Types for event management.
// ###########################################################################################################################

namespace CoreXT {
    // ===================================================================================================================

    /** Calls the 'dispose()' function on the specified object.
    * Note: Once 'dispose()' is called on an object, the function is replaced with 'noop()' so it cannot be called again.
    * @param {object} obj The object to dispose.
    * @param {boolean} release If true (default) allows the object to be released back into the object pool.  Set this to
    *                          false to request that child objects remain connected after disposal (not released). This
    *                          can allow quick initialization of a group of objects, instead of having to pull each one
    *                          from the object pool each time.
    */
    export function dispose(obj: IDisposable, release?: boolean): void;
    /** Calls the 'dispose()' function on each object in the specified array.  Any array items (nested arrays) are traversed for objects to disposed as well. 
    * Note: Once 'dispose()' is called on an object, the function is replaced with 'noop()' so it cannot be called again.
    * @param {object[]} obj The objects to dispose.
    * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
    *                          false to request that child objects remain connected after disposal (not released). This
    *                          can allow quick initialization of a group of objects, instead of having to pull each one
    *                          from the object pool each time.
    */
    export function dispose(obj: IDisposable[], release?: boolean): void;
    export function dispose(obj: any, release: boolean = true): void {
        if (typeof obj == 'object')
            if (typeof obj.dispose == 'function' && !(<IDisposable>obj).$__disposing && !(<IDisposable>obj).$__disposed) {
                obj.dispose(release);
            } else if (obj.length > 0)
                for (var i = obj.length; i >= 0; --i)
                    dispose(obj[i], release);
    }
    /** Iterates over the properties of the specified object instance and attempts to call 'dispose()' on each one.
    * If a property is an array, the array is scanned for objects to dispose as well.
    * Note: Once 'dispose()' is called on an object, the function is replaced with 'CoreXT.noop' (if 'keepProperties' is false/undefined) so it cannot be called again.
    * @param {object} obj The object whose object properties should be disposed.
    * @param {object[]} skipObjects A list of the object properties on the specified object to ignore.
    *                               The test is done by property object reference, and not by string name, so that:
    *                               1. The native 'indexOf()' can be used to speed up the process (and is slightly faster on instance matches).
    *                               2. Code completion can be used on the object properties passed in.
    * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
    *                          false to request that child objects remain connected after disposal (not released). This
    *                          can allow quick initialization of a group of objects, instead of having to pull each one
    *                          from the object pool each time.
    */
    export function disposeProperties(obj: {}, skipObjects?: IDisposable[], release: boolean = true): void {
        for (var p in obj) {
            var item = obj[p];
            if (skipObjects && skipObjects.indexOf(item) >= 0) continue;
            if (typeof item == 'object') // (faster not to make unnecessary calls)
                dispose(item, release);
        }
    }

    // ========================================================================================================================
}

// ###########################################################################################################################
// TODO: Consider adding a dependency injection system layer.