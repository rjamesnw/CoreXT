declare namespace CoreXT {
    /** One or more utility functions to ease development within CoreXT environments. */
    namespace Utilities {
        /** Escapes a RegEx string so it behaves like a normal string. This is useful for RexEx string based operations, such as 'replace()'. */
        function escapeRegex(regExStr: string): string;
        /** This locates names of properties where only a reference and the object context is known.
        * If a reference match is found, the property name is returned, otherwise the result is 'undefined'.
        */
        function getReferenceName(obj: {}, reference: object): string;
        /** Erases all properties on the object, instead of deleting them (which takes longer).
        * @param {boolean} ignore An optional list of properties to ignore when erasing. The properties to ignore should equate to 'true'.
        * This parameter expects an object type because that is faster for lookups than arrays, and developers can statically store these in most cases.
        */
        function erase(obj: {}, ignore: {
            [name: string]: any;
        }): {};
        /** Makes a deep copy of the specified value and returns it. If the value is not an object, it is returned immediately.
        * For objects, the deep copy is made by */
        function clone(value: any): any;
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
        function dereferencePropertyPath(path: string, origin?: {}, unsafe?: boolean): {};
        /** Waits until a property of an object becomes available (i.e. is no longer 'undefined').
          * @param {Object} obj The object for the property.
          * @param {string} propertyName The object property.
          * @param {number} timeout The general amount of timeout to wait before failing, or a negative value to wait indefinitely.
          */
        function waitReady(obj: {}, propertyName: string, callback: Function, timeout?: number, timeoutCallback?: Function): void;
        /** Helps support cases where 'apply' is missing for a host function object (i.e. IE7 'setTimeout', etc.).  This function
        * will attempt to call '.apply()' on the specified function, and fall back to a work around if missing.
        * @param {Function} func The function to call '.apply()' on.
        * @param {Object} _this The calling object, which is the 'this' reference in the called function (the 'func' argument).
        * Note: This must be null for special host functions, such as 'setTimeout' in IE7.
        * @param {any} args The arguments to apply to given function reference (the 'func' argument).
        */
        function apply(func: Function, _this: NativeTypes.IObject, args: any[]): any;
        /**
         * Creates and returns a new version-4 (randomized) GUID/UUID (unique identifier). The uniqueness of the result
         * is enforced by locking the first part down to the current local date/time (not UTC) in milliseconds, along with
         * a counter value in case of fast repetitive calls. The rest of the ID is also randomized with the current local
         * time, along with a checksum of the browser's "agent" string and the current document URL.
         * This function is also supported server side; however, the "agent" string and document location are fixed values.
         * @param {boolean} hyphens If true (default) then hyphens (-) are inserted to separate the GUID parts.
         */
        function createGUID(hyphens?: boolean): string;
    }
    /**
     * This is a special override to the default TypeScript '__extends' code for extending types in the CoreXT system.
     * It's also a bit more efficient given that the 'extendStatics' part is run only once and cached and not every time '__extends' is called.
     * Note: This property simply references 'CoreXT.Utilities.extend'.
     */
}
