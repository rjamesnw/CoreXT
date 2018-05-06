// ###########################################################################################################################
// Application Windows
// ###########################################################################################################################

namespace Test {
    interface ITypeInfo<T extends new () => any> {
        $__type: T;
        $__factory: any;
    }

    function Factory<
        TFactory extends CoreXT.IType,
        TClass extends CoreXT.IType
        >
        (type: TFactory & { $__type: TClass }): TClass {
        return <any>type;
    }

    function registerClass<TNamespace extends object, TExportProp extends keyof TNamespace, TType extends CoreXT.IType>(ns: TNamespace, type: TType, name?: TExportProp): any {
        return null;
    }

    class $Test1 {
        a: number;
        static T: object = Test1;
    };

    export var Test1 = registerClass(Test, $Test1); // (register the Test1 factory un the Test namespace) - make last name optional, assume from private class name.

    class $Test2 extends Factory(Test1) {
        b: number;
    }

    export declare var Test2: typeof $Test2 & { init(n: string): $Test2; } & ITypeInfo<typeof $Test2>;

    class $Test3 extends Factory(Test2) {
        a: number;
    }

    export declare var Test3: typeof $Test3 & { init(n: boolean): $Test3; } & ITypeInfo<typeof $Test3>;
}

namespace CoreXT.System.IO {
    // =======================================================================================================================

    /** Path/URL based utilities. */
    export namespace Path {
        registerNamespace("CoreXT", "System", "IO", "Path");

        // ===================================================================================================================

        /** Appends 'path2' to 'path1', inserting a path separator character if required. */
        export function combineURLPaths(path1: string, path2: string): string {
            // ... add missing URL path separator if not found (BUT, only if the first path is NOT empty!) ...
            if (path1.length > 0 && path1.charAt(path1.length - 1) != '/') {
                if (path2.length > 0 && path2.charAt(0) != '/')
                    path1 += '/';
            } else if (path2.length > 0 && path2.charAt(0) == '/')
                path2 = path2.substring(1); // (strip the additional '/', as it already exists on the end of path1)
            return path1 + path2;
        };

        // ===================================================================================================================

        /** Returns true if the specified extension is missing from the end of 'pathToFile'.
        * An exception is made if special characters are detected (such as "?" or "#"), in which case true is always returned, as the resource may be returned
        * indirectly via a server side script, or handled in some other special way).
        * @param {string} ext The extension to check for (with or without the preceding period [with preferred]).
        */
        export function hasFileExt(pathToFile: string, ext: string): boolean {
            if (ext.length > 0 && ext.charAt(0) != '.') ext = '.' + ext;
            return pathToFile.lastIndexOf(ext) == pathToFile.length - ext.length || pathToFile.indexOf("?") >= 0 || pathToFile.indexOf("#") >= 0;
        }

        // ===================================================================================================================

        export var QUERY_STRING_REGEX: RegExp = /[?|&][a-zA-Z0-9-._]+(?:=[^&#$]*)?/gi;

        /** Helps wrap common functionality for query/search string manipulation.  An internal 'values' object stores the 'name:value'
        * pairs from a URI or 'location.search' string, and converting the object to a string results in a proper query/search string
        * with all values escaped and ready to be appended to a URI. */
        class $Query {

            // ----------------------------------------------------------------------------------------------------------------

            values: { [index: string]: string } = {};

            // ----------------------------------------------------------------------------------------------------------------

            protected static '$Query Factory' = class Factory extends FactoryBase($Query, null) {
                /** Helps to build an object of 'name:value' pairs from a URI or 'location.search' string.
                    * @param {string} searchString A URI or 'location.search' string.
                    * @param {boolean} makeNamesLowercase If true, then all query names are made lower case when parsing (the default is false).
                    */
                'new'(searchString: string = null, makeNamesLowercase: boolean = false): InstanceType<typeof Factory.$__type> { return null; }

                /** Helps to build an object of 'name:value' pairs from a URI or 'location.search' string.
                    * @param {string} searchString A URI or 'location.search' string.
                    * @param {boolean} makeNamesLowercase If true, then all query names are made lower case when parsing (the default is false).
                    */
                init($this: InstanceType<typeof Factory.$__type>, isnew: boolean, searchString: string = null, makeNamesLowercase: boolean = false): InstanceType<typeof Factory.$__type> {
                    if (searchString) {
                        var nameValuePairs = searchString.match(QUERY_STRING_REGEX);
                        var i: number, n: number, eqIndex: number, nameValue: string;
                        if (nameValuePairs)
                            for (var i = 0, n = nameValuePairs.length; i < n; ++i) {
                                nameValue = nameValuePairs[i];
                                eqIndex = nameValue.indexOf('='); // (need to get first instance of the '=' char)
                                if (eqIndex == -1) eqIndex = nameValue.length; // (whole string is the name)
                                if (makeNamesLowercase)
                                    $this.values[decodeURIComponent(nameValue).substring(1, eqIndex).toLowerCase()] = decodeURIComponent(nameValue.substring(eqIndex + 1)); // (note: the RegEx match always includes a delimiter)
                                else
                                    $this.values[decodeURIComponent(nameValue).substring(1, eqIndex)] = decodeURIComponent(nameValue.substring(eqIndex + 1)); // (note: the RegEx match always includes a delimiter)
                            }
                    }
                    return $this;
                }
            }.register(Path);

            // ----------------------------------------------------------------------------------------------------------------

            /** Use to add additional query string values. The function returns the current object to allow chaining calls.
            * Example: add({'name1':'value1', 'name2':'value2', ...});
            * Note: Use this to also change existing values.
            */
            addOrUpdate(newValues: { [index: string]: string }): $Query {
                if (newValues)
                    for (var pname in newValues)
                        this.values[pname] = newValues[pname];
                return this;
            }

            // ---------------------------------------------------------------------------------------------------------------

            /** Use to rename a series of query parameter names.  The function returns the current object to allow chaining calls.
            * Example: rename({'oldName':'newName', 'oldname2':'newName2', ...});
            * Warning: If the new name already exists, it will be replaced.
            */
            rename(newNames: { [index: string]: string }): $Query {
                for (var pname in this.values)
                    for (var pexistingname in newNames)
                        if (pexistingname == pname && newNames[pexistingname] && newNames[pexistingname] != pname) { // (&& make sure the new name is actually different)
                            this.values[newNames[pexistingname]] = this.values[pexistingname];
                            delete this.values[pexistingname];
                        }
                return this;
            }

            // ---------------------------------------------------------------------------------------------------------------

            /** Use to remove a series of query parameter names.  The function returns the current object to allow chaining calls.
            * Example: remove(['name1', 'name2', 'name3']);
            */
            remove(namesToDelete: string[]): IQuery {
                if (namesToDelete && namesToDelete.length)
                    for (var i = 0, n = namesToDelete.length; i < n; ++i)
                        if (this.values[namesToDelete[i]])
                            delete this.values[namesToDelete[i]];
                return this;
            }

            // ---------------------------------------------------------------------------------------------------------------

            /** Creates and returns a duplicate of this object. */
            clone(): IQuery {
                var q = Query.new();
                for (var pname in this.values)
                    q.values[pname] = this.values[pname];
                return q;
            }

            // ---------------------------------------------------------------------------------------------------------------

            appendTo(uri: string): string {
                return uri.match(/^[^\?]*/g)[0] + this.toString();
            }

            // ---------------------------------------------------------------------------------------------------------------

            /** Returns the specified value, or a default value if nothing was found. */
            getValue(name: string, defaultValueIfUndefined?: string): any {
                var value = this.values[name];
                if (value === void 0) value = defaultValueIfUndefined;
                return value;
            }

            /** Returns the specified value as a lowercase string, or a default value (also made lowercase) if nothing was found. */
            getLCValue(name: string, defaultValueIfUndefined?: string): string {
                var value = this.values[name];
                if (value === void 0) value = defaultValueIfUndefined;
                return ("" + value).toLowerCase();
            }

            /** Returns the specified value as an uppercase string, or a default value (also made uppercase) if nothing was found. */
            getUCValue(name: string, defaultValueIfUndefined?: string): string {
                var value = this.values[name];
                if (value === void 0) value = defaultValueIfUndefined;
                return ("" + value).toUpperCase();
            }

            /** Returns the specified value as an uppercase string, or a default value (also made uppercase) if nothing was found. */
            getNumber(name: string, defaultValueIfUndefined?: number): number {
                var value = parseFloat(this.values[name]);
                if (value === void 0) value = defaultValueIfUndefined;
                return value;
            }

            // ---------------------------------------------------------------------------------------------------------------

            /** Obfuscates the specified query value (to make it harder for end users to read naturally).  This is done using Base64 encoding.
            * The existing value is replaced by the encoded value, and the encoded value is returned.
            * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
            */
            encodeValue(name: string): string {
                var value = this.values[name], result: string;
                if (value !== void 0 && value !== null) {
                    this.values[name] = result = Text.Encoding.base64Encode(value, Text.Encoding.Base64Modes.URI);
                }
                return result;
            }

            /** De-obfuscates the specified query value (to make it harder for end users to read naturally).  This expects Base64 encoding.
            * The existing value is replaced by the decoded value, and the decoded value is returned.
            */
            decodeValue(name: string): string {
                var value = this.values[name], result: string;
                if (value !== void 0 && value !== null) {
                    this.values[name] = result = Text.Encoding.base64Decode(value, Text.Encoding.Base64Modes.URI);
                }
                return result;
            }

            /** Encode ALL query values (see 'encodeValue()'). 
            * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
            */
            encodeAll(): void {
                for (var p in this.values)
                    this.encodeValue(p);
            }

            /** Decode ALL query values (see 'encodeValue()'). 
            * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
            */
            decodeAll(): void {
                for (var p in this.values)
                    this.decodeValue(p);
            }

            // ---------------------------------------------------------------------------------------------------------------

            /** Converts the underlying query values to a proper search string that can be appended to a URI. */
            toString(): string {
                var qstr = "";
                for (var pname in this.values)
                    if (this.values[pname] !== void 0)
                        qstr += (qstr ? "&" : "?") + encodeURIComponent(pname) + "=" + encodeURIComponent(this.values[pname]);
                return qstr;
            }

            // ---------------------------------------------------------------------------------------------------------------
        }

        export interface IQuery extends $Query { }
        export var Query = $Query['$Query Factory'].$__type;

        // ===================================================================================================================

        export var pageQuery = Query.new(location.href);

        //! if (pageQuery.getValue('debug', '') == 'true') Diagnostics.debug = Diagnostics.DebugModes.Debug_Run; // (only allow this on the sandbox and development servers)
        //! var demo = demo || pageQuery.getValue('demo', '') == 'true'; // (only allow this on the sandbox and development servers)

        export function setLocation(url: string, includeExistingQuery = false, bustCache = false) {
            var query = Query.new(url);
            if (bustCache) query.values['_'] = new Date().getTime().toString();
            if (includeExistingQuery)
                query.addOrUpdate(pageQuery.values);
            if (url.charAt(0) == '/')
                url = map(url);
            url = query.appendTo(url);
            wait();
            setTimeout(() => { location.href = url; }, 1); // (let events finish before setting)
        }

        /**
         * Adds a given path to the base URI (CoreXT.BaseURI) and returns it.  If the path is an absolute path (starts with a
         * protocol, or '/') , then it is returned as is.
         */
        export function map(path: string): string {
            if (!/^\w+:/.test(path) && path.charAt(0) == '/') // (don't add absolute paths to the base URI)
                return Path.combineURLPaths(BaseURI, path);
            else
                return path;
        }

        /**
         * Returns true if the page URL contains the given controller and action names (not case sensitive).
         * This only works with typical default routing of "{host}/Controller/Action/etc.".
         * @param action A controller action name.
         * @param controller A controller name (defaults to "home" if not specified)
         */
        export function isView(action: string, controller = "home"): boolean {
            return new RegExp("^\/" + controller + "\/" + action + "(?:[\/?&#])?", "gi").test(location.pathname);
        }

        // ===================================================================================================================
    }

    /** This even is triggered when the user should wait for an action to complete. */
    export var onBeginWait = Events.EventDispatcher.new<typeof IO, { (msg: string): void }>(IO, "onBeginWait", true);

    /** This even is triggered when the user no longer needs to wait for an action to complete. */
    export var onEndWait = Events.EventDispatcher.new<typeof IO, { (): void }>(IO, "onEndWait", true);

    var __waitRequestCounter = 0; // (allows stacking calls to 'wait()')

    /**
     * Blocks user input until 'closeWait()' is called. Plugins can hook into 'onBeginWait' to receive notifications.
     * Note: Each call stacks, but the 'onBeginWait' event is triggered only once.
     * @param msg An optional message to display (default is 'Please wait...').
     */
    export function wait(msg = "Please wait ...") {
        if (__waitRequestCounter == 0) // (fire only one time)
            onBeginWait.dispatch(msg);
        __waitRequestCounter++;
    }

    /**
     * Unblocks user input if 'wait()' was previously called. The number of 'closeWait()' calls must match the number of wait calls in order to unblock the user.
     * Plugins can hook into the 'onEndWait' event to be notified.
     * @param force If true, then the number of calls to 'wait' is ignored and the block is forcibly removed (default if false).
     */
    export function closeWait(force = false) {
        if (__waitRequestCounter > 0 && (force || --__waitRequestCounter == 0)) {
            __waitRequestCounter = 0;
            onEndWait.dispatch();
        }
    }

    // =======================================================================================================================
}
