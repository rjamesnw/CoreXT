// ###########################################################################################################################
// These are functions for creating global scope variables/references that eliminate/minimize collisions between conflicting scripts.
// Normally, each manifest and module gets its own local-global scope; however, in some cases, 3rd-party libraries do not 
// expect or support dot-delimited object paths, so unfortunately a root global callback reference may be required in such cases.
// CoreXT.Globals contains functions to help deal with this as it relates to loading modules.
// Note: There's no need to use any of these functions directly from within manifest and module scripts.  Each has a local reference
// using the identifiers 'this', 'manifest', or 'module' (accordingly), which provides functions for local-global scope storage.
// ###########################################################################################################################

/**
 * An empty object whose sole purpose is to store global properties by resource namespace (usual a URL). It exists as an
 * alternative to using the global JavaScript host environment, but also supports it as well.  The get/set methods always use
 * named index based lookups, so no string concatenation is used, which makes the process many times faster. 
 * Note: It's never a good idea to put anything in the global HOST scope, as various frameworks/scripts might set conflicting
 * property names.  To be safe, make sure to always use the 'CoreXT.Globals.register()' function.  It can create isolated 
 * global variables, and if necessary, also create a safer unique host global scope name.
 */
namespace CoreXT.Globals { //http://jsperf.com/string-concat-vs-nested-object-lookups
    namespace("CoreXT", "Globals");
    /** Internal: used when initializing CoreXT. */
    var _globals: IndexedObject = CoreXT.Globals;

    var _namespaces: { [index: string]: string } = {};
    var _nsCount: number = 1;

    /**
    * Registers and initializes a global property for the specified resource, and returns the dot-delimited string reference (see CoreXT.Globals).
    * Subsequent calls with the same resource and identifier name ignores the 'initialValue' and 'asHostGlobal' arguments, and simply returns the
    * existing property path instead.
    * @param {System.IO.ResourceRequest} resource The resource type object associated with the globals to create.
    * @param {T} initialValue  The initial value to set.
    * @param {boolean} asHostGlobal  If true, a host global scope unique variable name is returned. If false (default), a dot-delimited one is returned
    *                                instead which references the global variable within the CoreXT namespace related global scope (so as not to
    *                                pollute the host's global scope).
    *                                Some frameworks, such as the Google Maps API, support callbacks with dot-delimited names for nested objects to help
    *                                prevent global scope pollution.
    */
    export function register<T>(resource: System.IO.IResourceRequest, name: string, initialValue: T, asHostGlobal?: boolean): string;
    /**
    * Registers and initializes a global property for the specified namespace, and returns the dot-delimited string reference (see CoreXT.Globals).
    * Subsequent calls with the same namespace and identifier name ignores the 'initialValue' and 'asHostGlobal' arguments, and simply returns the
    * existing property path instead.
    * @param {string} namespace  Any string that is unique to your application/framework/resource/etc. (usually a URI of some sort), and is used to group globals
    *                            under a single object scope to prevent naming conflicts.  When resources are used, the URL is used as the namespace.
    *                            A windows-style GUID, MD5 hash, or SHA1+ hash is perfectly fine as well (to use as a safe unique namespace for this purpose).
    * @param {T} initialValue  The initial value to set.
    * @param {boolean} asHostGlobal  If true, a host global scope unique variable name is returned. If false (default), a dot-delimited one is returned
    *                                instead which references the global variable within the CoreXT namespace related global scope (so as not to
    *                                pollute the host's global scope).
    *                                Some frameworks, such as the Google Maps API, support callbacks with dot-delimited names for nested objects to help
    *                                prevent global scope pollution.
    */
    export function register<T>(namespace: string, name: string, initialValue: T, asHostGlobal?: boolean): string;
    export function register<T>(namespace: any, name: string, initialValue: T, asHostGlobal: boolean = false): string {
        var nsID: string, nsglobals: { [index: string]: any }, alreadyRegistered: boolean = false;
        if (typeof namespace == 'object' && namespace.url)
            namespace = namespace.url;
        if (!(namespace in _namespaces))
            _namespaces[namespace] = nsID = '_' + _nsCount++;
        else {
            nsID = _namespaces[namespace];
            alreadyRegistered = true;
        }
        nsglobals = _globals[nsID];
        if (!nsglobals)
            _globals[nsID] = nsglobals = {};
        //?if (name in nsglobals)
        //?    throw System.Exception.from("The global variable name '" + name + "' already exists in the global namespace '" + namespace + "'.", namespace);
        if (asHostGlobal) {
            // ... set and return a host global reference ...
            var hostGlobalName = "_" + CoreXT.ROOT_NAMESPACE + nsID + "_" + name;
            if (!alreadyRegistered) {
                nsglobals[name] = { "global": global, "hostGlobalName": hostGlobalName };// (any namespace global value referencing the global [window] scope is a redirect to lookup the value name there instead)
                global[hostGlobalName] = initialValue;
            }
            return hostGlobalName;
        } else {
            // ... set and return a namespace global reference (only works for routines that support dot-delimited callback references) ...
            if (!alreadyRegistered) nsglobals[name] = initialValue;
            if (/^[A-Z_\$]+[A-Z0-9_\$]*$/gim.test(name)) // (if 'name' contains invalid identifier characters, then it needs to be referenced by index)
                return CoreXT.ROOT_NAMESPACE + ".Globals." + nsID + "." + name;
            else
                return CoreXT.ROOT_NAMESPACE + ".Globals." + nsID + "['" + name.replace(/'/g, "\\'") + "']";
        }
    };

    /**
      * Returns true if the specified global variable name is registered.
      */
    export function exists<T>(resource: System.IO.IResourceRequest, name: string): boolean;
    /**
      * Returns true if the specified global variable name is registered.
     */
    export function exists<T>(namespace: string, name: string): boolean;
    export function exists<T>(namespace: any, name: string): boolean {
        var namespace = namespace.url || ('' + namespace), nsID: string, nsglobals: { [index: string]: any };
        nsID = _namespaces[namespace];
        if (!nsID) return false;
        nsglobals = _globals[nsID];
        return name in nsglobals;
    };

    /**
      * Erases the registered global variable (by setting it to 'undefined' - which is faster than deleting it).
      * Returns true if successful.
      */
    export function erase<T>(resource: System.IO.IResourceRequest, name: string): boolean;
    export function erase<T>(namespace: string, name: string): boolean;
    export function erase<T>(namespace: any, name: string): boolean {
        var namespace = namespace.url || ('' + namespace), nsID: string, nsglobals: { [index: string]: any };
        nsID = _namespaces[namespace];
        if (!nsID) return false;
        nsglobals = _globals[nsID];
        if (!(name in nsglobals))
            return false;
        var existingValue = nsglobals[name];
        if (existingValue && existingValue["global"] == global) {
            var hgname = existingValue["hostGlobalName"];
            delete global[hgname];
        }
        return nsglobals[name] === void 0;
    };

    /**
      * Clears all registered globals by releasing the associated global object for the specified resource's namespace
      * and creating a new object.  Any host globals are deleted first.
      * Return true on success, and false if the namespace doesn't exist.
      */
    export function clear<T>(resource: System.IO.IResourceRequest): boolean;
    /**
      * Clears all registered globals by releasing the associated global object for the specified resource's namespace
      * and creating a new object.  Any host globals are deleted first.
      * Return true on success, and false if the namespace doesn't exist.
      */
    export function clear<T>(namespace: string): boolean;
    export function clear<T>(namespace: any): boolean {
        var namespace = namespace.url || ('' + namespace), nsID: string, nsglobals: { [index: string]: any };
        nsID = _namespaces[namespace];
        if (!nsID) return false;
        nsglobals = _globals[nsID];
        for (var name in nsglobals) { // (clear any root globals first before resetting the namespace global instance)
            var existingValue = nsglobals[name];
            if (existingValue && existingValue["global"] == global)
                delete global[existingValue["hostGlobalName"]];
        }
        _globals[nsID] = {};
        return true;
    };

    /**
      * Sets and returns a global property value.
      */
    export function setValue<T>(resource: System.IO.IResourceRequest, name: string, value: T): T;
    /**
      * Sets and returns a global property value.
      */
    export function setValue<T>(namespace: string, name: string, value: T): T;
    export function setValue<T>(namespace: any, name: string, value: T): T {
        var namespace = namespace.url || ('' + namespace), nsID: string, nsglobals: { [index: string]: any };
        nsID = _namespaces[namespace];
        if (!nsID) {
            //?throw System.Exception.from("The namespace '" + namespace + "' does not exist - did you remember to call 'CoreXT.Globals.register()' first?", namespace);
            register(namespace, name, value); // (implicitly register the namespace as a local global)
            nsID = _namespaces[namespace];
        }
        nsglobals = _globals[nsID];
        //?if (!(name in nsglobals))
        //?    throw System.Exception.from("The global variable name '" + name + "' was not found in the global namespace '" + namespace + "' - did you remember to call 'CoreXT.Globals.register()' first?", namespace);
        var existingValue = nsglobals[name];
        if (existingValue && existingValue["global"] == global) {
            return global[existingValue["hostGlobalName"]] = value;
        }
        else return nsglobals[name] = value;
    };

    /**
    * Gets a global property value.
    */
    export function getValue<T>(resource: System.IO.IResourceRequest, name: string): T;
    /**
    * Gets a global property value.
    */
    export function getValue<T>(namespace: string, name: string): T;
    export function getValue<T>(namespace: any, name: string): T {
        var namespace = namespace.url || ('' + namespace), nsID: string, nsglobals: { [index: string]: any };
        nsID = _namespaces[namespace];
        if (!nsID)
            throw System.Exception.from("The namespace '" + namespace + "' does not exist - did you remember to call 'CoreXT.Globals.register()' first?", namespace);
        nsglobals = _globals[nsID];
        if (!(name in nsglobals))
            return void 0;
        var existingValue = nsglobals[name];
        if (existingValue && existingValue["global"] == global) {
            return global[existingValue["hostGlobalName"]];
        }
        else return nsglobals[name];
    };
}

// ###########################################################################################################################
