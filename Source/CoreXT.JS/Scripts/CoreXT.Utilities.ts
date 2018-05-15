// ###########################################################################################################################
// Application Windows
// ###########################################################################################################################

namespace CoreXT.Utilities {
    // -------------------------------------------------------------------------------------------------------------------

    /** This locates names of properties where only a reference and the object context is known.
    * If a reference match is found, the property name is returned, otherwise the result is 'undefined'.
    */
    export function getReferenceName(obj: {}, reference: object): string {
        for (var p in obj)
            if (obj[p] === reference) return p;
        return void 0;
    }

    // -------------------------------------------------------------------------------------------------------------------

    /** Erases all properties on the object, instead of deleting them (which takes longer).
    * @param {boolean} ignore An optional list of properties to ignore when erasing. The properties to ignore should equate to 'true'.
    * This parameter expects an object type because that is faster for lookups than arrays, and developers can statically store these in most cases.
    */
    export function erase(obj: {}, ignore: { [name: string]: any }): {} {
        for (var p in obj)
            if ((p != "__proto__" && p != 'constructor' && <NativeTypes.IObject>obj).hasOwnProperty(p))
                if (!ignore || !ignore[name])
                    obj[p] = void 0;
        return obj;
    }

    /** Makes a deep copy of the specified value and returns it. If the value is not an object, it is returned immediately.
    * For objects, the deep copy is made by */
    export function clone(value: any) {
        if (typeof value !== 'object') return value;
        var newObject: {}, p: string, rcCount: number, v: any;
        if (clone.arguments.length > 1) {
            rcCount = clone.arguments[clone.arguments.length - 1];
            if (value['@__recursiveCheck'] === rcCount) return value; // (this object has already been cloned for this request, which makes it a cyclical reference, so skip)
        }
        else rcCount = (value['@__recursiveCheck'] || 0) + 1; // (initially, rcCount will be set to the root __recursiveCheck value, +1, rather than re-creating all properties over and over for each clone request [much faster]) 
        value['@__recursiveCheck'] = rcCount;
        newObject = {};
        for (p in value) { // (note: not using "hasOwnProperty()" here because replicating any inheritance is not supported (nor usually needed), so all properties will be flattened for the new object instance)
            v = value[p];
            if (typeof v !== 'object')
                newObject[p] = v; // (faster to test and set than to call a function)
            else
                newObject[p] = (<Function>clone)(v, rcCount);
        }
        return newObject;
    };

    // -------------------------------------------------------------------------------------------------------------------

    /** Dereferences a property path in the form "A.B.C[*].D..." and returns the right most property value, if exists, otherwise
    * 'undefined' is returned.  If path is invalid, an exception will be thrown.
    * @param {string} path The delimited property path to parse.
    * @param {object} origin The object to begin dereferencing with.  If this is null or undefined then it defaults to the global scope.
    * @param {boolean} unsafe If false (default) a fast algorithm is used to parse the path.  If true, then the expression is evaluated at the host global scope (faster).
    *                         The reason for the option is that 'eval' is up to 4x faster, and is best used only if the path is guaranteed not to contain user entered
    *                         values, or ANY text transmitted insecurely.
    *                         Note: The 'eval' used is 'CoreXT.eval()', which is closed over the global scope (and not the CoreXT module's private scope).
    *                         'window.eval()' is not called directly in this function.
    */
    export function dereferencePropertyPath(path: string, origin?: {}, unsafe = false): {} {
        if (unsafe) return safeEval('p1.' + path, origin); // (note: this is 'CoreXT.eval()', not a direct call to the global 'eval()')
        if (origin === void 0 || origin === null) origin = this !== global ? this : global;
        if (typeof path !== 'string') path = '' + path;
        var o = origin, c = '', pc: string, i = 0, n = path.length, name = '';
        if (n)
            ((c = path[i++]) == '.' || c == '[' || c == ']' || c == void 0)
                ? (name ? <any>(o = o[name], name = '') : <any>(pc == '.' || pc == '[' || pc == ']' && c == ']' ? i = n + 2 : void 0), pc = c)
                : name += c;
        if (i == n + 2) throw System.Exception.from("Invalid path: " + path, origin);
    } // (performance: http://jsperf.com/ways-to-dereference-a-delimited-property-string)

    // -------------------------------------------------------------------------------------------------------------------

    /** Waits until a property of an object becomes available (i.e. is no longer 'undefined').
      * @param {Object} obj The object for the property.
      * @param {string} propertyName The object property.
      * @param {number} timeout The general amount of timeout to wait before failing, or a negative value to wait indefinitely.
      */
    export function waitReady(obj: {}, propertyName: string, callback: Function, timeout: number = 60000, timeoutCallback?: Function) {
        if (!callback) throw "'callback' is required.";
        if (!obj) throw "'obj' is required.";
        if (obj[propertyName] !== void 0)
            callback();
        else {
            if (timeout != 0) {
                if (timeout > 0) timeout--;
                setTimeout(() => {
                    waitReady(obj, propertyName, callback);
                }, 1);
            }
            else if (timeoutCallback)
                timeoutCallback();
        }
    }

    // -------------------------------------------------------------------------------------------------------------------

    var extendStatics = Object.setPrototypeOf || ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b: {}) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

    /** Extends from a base type by chaining a derived type's 'prototype' to the base type's prototype.
    * This method takes into account any preset properties that may exist on the derived type's prototype.
    * Note: Extending an already extended prototype will recreate the prototype connection again, pointing it to the new prototype.
    * Note: It is not possible to modify any existing chain of constructor calls.  Only the prototype can be changed.
    * @param {Function} derivedType The derived type (function) that will extend from a base type.
    * @param {Function} baseType The base type (function) to extend to the derived type.
    * @param {boolean} copyBaseProperties If true (default) behaves like the TypeScript "__extends" method, which copies forward any static base properties to the derived type.
    */
    export function extend<DerivedType extends Function, BaseType extends Function>(derivedType: DerivedType, baseType: BaseType, copyStaticProperties = true): DerivedType {
        if (copyStaticProperties)
            extendStatics(derivedType, baseType);
        // ... create a prototype link for the given type ...
        function __() { this.constructor = derivedType; }
        __.prototype = baseType.prototype;
        var newProto: {} = baseType === null ? Object.create(baseType) : (__.prototype = baseType.prototype, new (<any>__)());
        // ... copy forward any already defined properties in the derived prototype to be replaced, if any, before setting the derived types prototype ...
        for (var p in derivedType.prototype)
            if (derivedType.prototype.hasOwnProperty(p))
                newProto[p] = derivedType.prototype[p];
        // ... set the new prototype ...
        derivedType.prototype = newProto;
        // ... return the extended derived type ...
        return derivedType;
    };

    // -------------------------------------------------------------------------------------------------------------------

    /** Helps support cases where 'apply' is missing for a host function object (i.e. IE7 'setTimeout', etc.).  This function
    * will attempt to call '.apply()' on the specified function, and fall back to a work around if missing.
    * @param {Function} func The function to call '.apply()' on.
    * @param {Object} _this The calling object, which is the 'this' reference in the called function (the 'func' argument).
    * Note: This must be null for special host functions, such as 'setTimeout' in IE7.
    * @param {any} args The arguments to apply to given function reference (the 'func' argument).
    */
    export function apply(func: Function, _this: NativeTypes.IObject, args: any[]): any {
        if (func.apply) {
            return func.apply(_this, args);
        } else {
            return Function.prototype.apply.apply(func, [_this, args]);
        }
    }

    // -------------------------------------------------------------------------------------------------------------------

    var _guidSeed = (function () { // (used in 'createGUID()')
        var text = navigator.userAgent + location.href; // TODO: This may need fixing on the server side.
        for (var i = 0, n = text.length, randseed = 0; i < n; ++i)
            randseed += navigator.userAgent.charCodeAt(i);
        return randseed;
    })();

    var _guidCounter = 0;

    /** 
     * Creates and returns a new version-4 (randomized) GUID/UUID (unique identifier). The uniqueness of the result 
     * is enforced by locking the first part down to the current local date/time (not UTC) in milliseconds, along with
     * a counter value in case of fast repetitive calls. The rest of the ID is also randomized with the current local
     * time, along with a checksum of the browser's "agent" string and the current document URL.
     * This function is also supported server side; however, the "agent" string and document location are fixed values.
     * @param {boolean} hyphens If true (default) then hyphens (-) are inserted to separate the GUID parts.
     */
    export function createGUID(hyphens: boolean = true): string {
        var time = (Date.now ? Date.now() : new Date().getTime()) + Time.__localTimeZoneOffset; // (use current local time [not UTC] to offset the random number [there was a bug in Chrome, not sure if it was fixed yet])
        var randseed = time + _guidSeed;
        var hexTime = time.toString(16) + (_guidCounter <= 0xffffffff ? _guidCounter++ : _guidCounter = 0).toString(16), i = hexTime.length, pi = 0;
        var pattern = hyphens ? 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx' : 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx', len = pattern.length, result = "", c: string, r: number;
        while (pi < len)
            c = pattern[pi++], result += c != 'x' && c != 'y' ? c : i > 0 ? hexTime[--i] : (r = Math.random() * randseed % 16 | 0, c == 'x' ? r : r & 0x3 | 0x8).toString(16);
        return result;
    }

    // -------------------------------------------------------------------------------------------------------------------
}

/**
 * This is a special override to the default TypeScript '__extends' code for extending types in the CoreXT system.
 * It's also a bit more efficient given that the 'extendStatics' part is run only once and cached.
 */
var __extends = CoreXT.Utilities.extend;