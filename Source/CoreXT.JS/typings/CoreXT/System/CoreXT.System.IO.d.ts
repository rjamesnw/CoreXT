declare namespace CoreXT.System {
    /** This namespace contains types and routines for data communication, URL handling, and page navigation. */
    namespace IO {
        /** Path/URL based utilities. */
        namespace Path {
            /** Appends 'path2' to 'path1', inserting a path separator character if required. */
            function combineURLPaths(path1: string, path2: string): string;
            /** Returns true if the specified extension is missing from the end of 'pathToFile'.
              * An exception is made if special characters are detected (such as "?" or "#"), in which case true is always returned, as the resource may be returned
              * indirectly via a server side script, or handled in some other special way).
              * @param {string} ext The extension to check for (with or without the preceding period [with preferred]).
              */
            function hasFileExt(pathToFile: string, ext: string): boolean;
            var QUERY_STRING_REGEX: RegExp;
            const Query_base: {
                new (...args: any[]): {
                    $__disposing?: boolean;
                    $__disposed?: boolean;
                };
                $__type: IType<object>;
                readonly super: {};
                'new'?(...args: any[]): any;
                init?(o: object, isnew: boolean, ...args: any[]): void;
                $__register<TClass extends IType<object>, TFactory extends IFactory<IType<object>, NewDelegate<object>, InitDelegate<object>> & IType<object>>(this: TFactory & ITypeInfo & {
                    $__type: TClass;
                }, namespace: object, addMemberTypeInfo?: boolean): TFactory;
            } & ObjectConstructor;
            /** Helps wrap common functionality for query/search string manipulation.  An internal 'values' object stores the 'name:value'
              * pairs from a URI or 'location.search' string, and converting the object to a string results in a proper query/search string
              * with all values escaped and ready to be appended to a URI. */
            class Query extends Query_base {
                /** Helps to build an object of 'name:value' pairs from a URI or 'location.search' string.
                   * @param {string} searchString A URI or 'location.search' string.
                   * @param {boolean} makeNamesLowercase If true, then all query names are made lower case when parsing (the default is false).
                   */
                static 'new': (...args: any[]) => IQuery;
                /** Helps to build an object of 'name:value' pairs from a URI or 'location.search' string.
                   * @param {string} searchString A URI or 'location.search' string.
                   * @param {boolean} makeNamesLowercase If true, then all query names are made lower case when parsing (the default is false).
                   */
                static init: (o: IQuery, isnew: boolean, searchString?: string, makeNamesLowercase?: boolean) => void;
            }
            namespace Query {
                class $__type extends Disposable {
                    values: {
                        [index: string]: string;
                    };
                    /** Use to add additional query string values. The function returns the current object to allow chaining calls.
                        * Example: add({'name1':'value1', 'name2':'value2', ...});
                        * Note: Use this to also change existing values.
                        */
                    addOrUpdate(newValues: {
                        [index: string]: string;
                    }): $__type;
                    /** Use to rename a series of query parameter names.  The function returns the current object to allow chaining calls.
                        * Example: rename({'oldName':'newName', 'oldname2':'newName2', ...});
                        * Warning: If the new name already exists, it will be replaced.
                        */
                    rename(newNames: {
                        [index: string]: string;
                    }): $__type;
                    /** Use to remove a series of query parameter names.  The function returns the current object to allow chaining calls.
                        * Example: remove(['name1', 'name2', 'name3']);
                        */
                    remove(namesToDelete: string[]): IQuery;
                    /** Creates and returns a duplicate of this object. */
                    clone(): IQuery;
                    appendTo(uri: string): string;
                    /** Returns the specified value, or a default value if nothing was found. */
                    getValue(name: string, defaultValueIfUndefined?: string): any;
                    /** Returns the specified value as a lowercase string, or a default value (also made lowercase) if nothing was found. */
                    getLCValue(name: string, defaultValueIfUndefined?: string): string;
                    /** Returns the specified value as an uppercase string, or a default value (also made uppercase) if nothing was found. */
                    getUCValue(name: string, defaultValueIfUndefined?: string): string;
                    /** Returns the specified value as an uppercase string, or a default value (also made uppercase) if nothing was found. */
                    getNumber(name: string, defaultValueIfUndefined?: number): number;
                    /** Obfuscates the specified query value (to make it harder for end users to read naturally).  This is done using Base64 encoding.
                        * The existing value is replaced by the encoded value, and the encoded value is returned.
                        * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
                        */
                    encodeValue(name: string): string;
                    /** De-obfuscates the specified query value (to make it harder for end users to read naturally).  This expects Base64 encoding.
                        * The existing value is replaced by the decoded value, and the decoded value is returned.
                        */
                    decodeValue(name: string): string;
                    /** Encode ALL query values (see 'encodeValue()').
                        * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
                        */
                    encodeAll(): void;
                    /** Decode ALL query values (see 'encodeValue()').
                        * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
                        */
                    decodeAll(): void;
                    /** Converts the underlying query values to a proper search string that can be appended to a URI. */
                    toString(): string;
                }
            }
            interface IQuery extends Query.$__type {
            }
            function setLocation(url: string, includeExistingQuery?: boolean, bustCache?: boolean): void;
            /**
             * Adds a given path to the base URI (CoreXT.BaseURI) and returns it.  If the path is an absolute path (starts with a
             * protocol, or '/') , then it is returned as is.
             */
            function map(path: string): string;
            /**
             * Returns true if the page URL contains the given controller and action names (not case sensitive).
             * This only works with typical default routing of "{host}/Controller/Action/etc.".
             * @param action A controller action name.
             * @param controller A controller name (defaults to "home" if not specified)
             */
            function isView(action: string, controller?: string): boolean;
            /** This is set automatically to the query for the current page. */
            var pageQuery: IQuery;
        }
        /** This even is triggered when the user should wait for an action to complete. */
        var onBeginWait: Events.IEventDispatcher<typeof IO, (msg: string) => void>;
        /** This even is triggered when the user no longer needs to wait for an action to complete. */
        var onEndWait: Events.IEventDispatcher<typeof IO, () => void>;
        /**
         * Blocks user input until 'closeWait()' is called. Plugins can hook into 'onBeginWait' to receive notifications.
         * Note: Each call stacks, but the 'onBeginWait' event is triggered only once.
         * @param msg An optional message to display (default is 'Please wait...').
         */
        function wait(msg?: string): void;
        /**
         * Unblocks user input if 'wait()' was previously called. The number of 'closeWait()' calls must match the number of wait calls in order to unblock the user.
         * Plugins can hook into the 'onEndWait' event to be notified.
         * @param force If true, then the number of calls to 'wait' is ignored and the block is forcibly removed (default if false).
         */
        function closeWait(force?: boolean): void;
    }
}
