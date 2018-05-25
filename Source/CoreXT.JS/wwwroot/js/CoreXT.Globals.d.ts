/**
 * An empty object whose sole purpose is to store global properties by resource namespace (usual a URL). It exists as an
 * alternative to using the global JavaScript host environment, but also supports it as well.  The get/set methods always use
 * named index based lookups, so no string concatenation is used, which makes the process many times faster.
 * Note: It's never a good idea to put anything in the global HOST scope, as various frameworks/scripts might set conflicting
 * property names.  To be safe, make sure to always use the 'CoreXT.Globals.register()' function.  It can create isolated
 * global variables, and if necessary, also create a safer unique host global scope name.
 */
declare namespace CoreXT.Globals {
    /**
    * Registers and initializes a global property for the specified resource, and returns the dot-delimited string reference (see CoreXT.Globals).
    * Subsequent calls with the same resource and identifier name ignores the 'initialValue' and 'asHostGlobal' arguments, and simply returns the
    * existing property path instead.
    * @param {Loader.ResourceRequest} resource The resource type object associated with the globals to create.
    * @param {T} initialValue  The initial value to set.
    * @param {boolean} asHostGlobal  If true, a host global scope unique variable name is returned. If false (default), a dot-delimited one is returned
    *                                instead which references the global variable within the CoreXT namespace related global scope (so as not to
    *                                pollute the host's global scope).
    *                                Some frameworks, such as the Google Maps API, support callbacks with dot-delimited names for nested objects to help
    *                                prevent global scope pollution.
    */
    function register<T>(resource: Loader.IResourceRequest, name: string, initialValue: T, asHostGlobal?: boolean): string;
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
    function register<T>(namespace: string, name: string, initialValue: T, asHostGlobal?: boolean): string;
    /**
      * Returns true if the specified global variable name is registered.
      */
    function exists<T>(resource: Loader.IResourceRequest, name: string): boolean;
    /**
      * Returns true if the specified global variable name is registered.
     */
    function exists<T>(namespace: string, name: string): boolean;
    /**
      * Erases the registered global variable (by setting it to 'undefined' - which is faster than deleting it).
      * Returns true if successful.
      */
    function erase<T>(resource: Loader.IResourceRequest, name: string): boolean;
    function erase<T>(namespace: string, name: string): boolean;
    /**
      * Clears all registered globals by releasing the associated global object for the specified resource's namespace
      * and creating a new object.  Any host globals are deleted first.
      * Return true on success, and false if the namespace doesn't exist.
      */
    function clear<T>(resource: Loader.IResourceRequest): boolean;
    /**
      * Clears all registered globals by releasing the associated global object for the specified resource's namespace
      * and creating a new object.  Any host globals are deleted first.
      * Return true on success, and false if the namespace doesn't exist.
      */
    function clear<T>(namespace: string): boolean;
    /**
      * Sets and returns a global property value.
      */
    function setValue<T>(resource: Loader.IResourceRequest, name: string, value: T): T;
    /**
      * Sets and returns a global property value.
      */
    function setValue<T>(namespace: string, name: string, value: T): T;
    /**
    * Gets a global property value.
    */
    function getValue<T>(resource: Loader.IResourceRequest, name: string): T;
    /**
    * Gets a global property value.
    */
    function getValue<T>(namespace: string, name: string): T;
}
