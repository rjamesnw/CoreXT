// ###########################################################################################################################
// Application Windows
// ###########################################################################################################################
var CoreXT;
(function (CoreXT) {
    var System;
    (function (System) {
        /** This namespace contains types and routines for data communication, URL handling, and page navigation. */
        var IO;
        (function (IO) {
            // =======================================================================================================================
            /** Path/URL based utilities. */
            var Path;
            (function (Path) {
                CoreXT.registerNamespace("CoreXT", "System", "IO", "Path");
                // ===================================================================================================================
                /** Appends 'path2' to 'path1', inserting a path separator character if required. */
                function combineURLPaths(path1, path2) {
                    // ... add missing URL path separator if not found (BUT, only if the first path is NOT empty!) ...
                    if (path1.length > 0 && path1.charAt(path1.length - 1) != '/') {
                        if (path2.length > 0 && path2.charAt(0) != '/')
                            path1 += '/';
                    }
                    else if (path2.length > 0 && path2.charAt(0) == '/')
                        path2 = path2.substring(1); // (strip the additional '/', as it already exists on the end of path1)
                    return path1 + path2;
                }
                Path.combineURLPaths = combineURLPaths;
                ;
                // ===================================================================================================================
                /** Returns true if the specified extension is missing from the end of 'pathToFile'.
                  * An exception is made if special characters are detected (such as "?" or "#"), in which case true is always returned, as the resource may be returned
                  * indirectly via a server side script, or handled in some other special way).
                  * @param {string} ext The extension to check for (with or without the preceding period [with preferred]).
                  */
                function hasFileExt(pathToFile, ext) {
                    if (ext.length > 0 && ext.charAt(0) != '.')
                        ext = '.' + ext;
                    return pathToFile.lastIndexOf(ext) == pathToFile.length - ext.length || pathToFile.indexOf("?") >= 0 || pathToFile.indexOf("#") >= 0;
                }
                Path.hasFileExt = hasFileExt;
                // ===================================================================================================================
                Path.QUERY_STRING_REGEX = /[?|&][a-zA-Z0-9-._]+(?:=[^&#$]*)?/gi;
                /** Helps wrap common functionality for query/search string manipulation.  An internal 'values' object stores the 'name:value'
                  * pairs from a URI or 'location.search' string, and converting the object to a string results in a proper query/search string
                  * with all values escaped and ready to be appended to a URI. */
                Path.Query = CoreXT.ClassFactory(Path, null, function (base) {
                    var Query = /** @class */ (function (_super) {
                        __extends(Query, _super);
                        function Query() {
                            // ----------------------------------------------------------------------------------------------------------------
                            var _this = _super !== null && _super.apply(this, arguments) || this;
                            _this.values = {};
                            return _this;
                            // ---------------------------------------------------------------------------------------------------------------
                        }
                        // ----------------------------------------------------------------------------------------------------------------
                        /** Use to add additional query string values. The function returns the current object to allow chaining calls.
                            * Example: add({'name1':'value1', 'name2':'value2', ...});
                            * Note: Use this to also change existing values.
                            */
                        Query.prototype.addOrUpdate = function (newValues) {
                            if (newValues)
                                for (var pname in newValues)
                                    this.values[pname] = newValues[pname];
                            return this;
                        };
                        // ---------------------------------------------------------------------------------------------------------------
                        /** Use to rename a series of query parameter names.  The function returns the current object to allow chaining calls.
                            * Example: rename({'oldName':'newName', 'oldname2':'newName2', ...});
                            * Warning: If the new name already exists, it will be replaced.
                            */
                        Query.prototype.rename = function (newNames) {
                            for (var pname in this.values)
                                for (var pexistingname in newNames)
                                    if (pexistingname == pname && newNames[pexistingname] && newNames[pexistingname] != pname) { // (&& make sure the new name is actually different)
                                        this.values[newNames[pexistingname]] = this.values[pexistingname];
                                        delete this.values[pexistingname];
                                    }
                            return this;
                        };
                        // ---------------------------------------------------------------------------------------------------------------
                        /** Use to remove a series of query parameter names.  The function returns the current object to allow chaining calls.
                            * Example: remove(['name1', 'name2', 'name3']);
                            */
                        Query.prototype.remove = function (namesToDelete) {
                            if (namesToDelete && namesToDelete.length)
                                for (var i = 0, n = namesToDelete.length; i < n; ++i)
                                    if (this.values[namesToDelete[i]])
                                        delete this.values[namesToDelete[i]];
                            return this;
                        };
                        // ---------------------------------------------------------------------------------------------------------------
                        /** Creates and returns a duplicate of this object. */
                        Query.prototype.clone = function () {
                            var q = Path.Query.new();
                            for (var pname in this.values)
                                q.values[pname] = this.values[pname];
                            return q;
                        };
                        // ---------------------------------------------------------------------------------------------------------------
                        Query.prototype.appendTo = function (uri) {
                            return uri.match(/^[^\?]*/g)[0] + this.toString();
                        };
                        // ---------------------------------------------------------------------------------------------------------------
                        /** Returns the specified value, or a default value if nothing was found. */
                        Query.prototype.getValue = function (name, defaultValueIfUndefined) {
                            var value = this.values[name];
                            if (value === void 0)
                                value = defaultValueIfUndefined;
                            return value;
                        };
                        /** Returns the specified value as a lowercase string, or a default value (also made lowercase) if nothing was found. */
                        Query.prototype.getLCValue = function (name, defaultValueIfUndefined) {
                            var value = this.values[name];
                            if (value === void 0)
                                value = defaultValueIfUndefined;
                            return ("" + value).toLowerCase();
                        };
                        /** Returns the specified value as an uppercase string, or a default value (also made uppercase) if nothing was found. */
                        Query.prototype.getUCValue = function (name, defaultValueIfUndefined) {
                            var value = this.values[name];
                            if (value === void 0)
                                value = defaultValueIfUndefined;
                            return ("" + value).toUpperCase();
                        };
                        /** Returns the specified value as an uppercase string, or a default value (also made uppercase) if nothing was found. */
                        Query.prototype.getNumber = function (name, defaultValueIfUndefined) {
                            var value = parseFloat(this.values[name]);
                            if (value === void 0)
                                value = defaultValueIfUndefined;
                            return value;
                        };
                        // ---------------------------------------------------------------------------------------------------------------
                        /** Obfuscates the specified query value (to make it harder for end users to read naturally).  This is done using Base64 encoding.
                            * The existing value is replaced by the encoded value, and the encoded value is returned.
                            * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
                            */
                        Query.prototype.encodeValue = function (name) {
                            var value = this.values[name], result;
                            if (value !== void 0 && value !== null) {
                                this.values[name] = result = System.Text.Encoding.base64Encode(value, System.Text.Encoding.Base64Modes.URI);
                            }
                            return result;
                        };
                        /** De-obfuscates the specified query value (to make it harder for end users to read naturally).  This expects Base64 encoding.
                            * The existing value is replaced by the decoded value, and the decoded value is returned.
                            */
                        Query.prototype.decodeValue = function (name) {
                            var value = this.values[name], result;
                            if (value !== void 0 && value !== null) {
                                this.values[name] = result = System.Text.Encoding.base64Decode(value, System.Text.Encoding.Base64Modes.URI);
                            }
                            return result;
                        };
                        /** Encode ALL query values (see 'encodeValue()').
                            * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
                            */
                        Query.prototype.encodeAll = function () {
                            for (var p in this.values)
                                this.encodeValue(p);
                        };
                        /** Decode ALL query values (see 'encodeValue()').
                            * Note: This is NOT encryption.  It is meant solely as a means to transmit values that may contain characters not supported for URI query values.
                            */
                        Query.prototype.decodeAll = function () {
                            for (var p in this.values)
                                this.decodeValue(p);
                        };
                        // ---------------------------------------------------------------------------------------------------------------
                        /** Converts the underlying query values to a proper search string that can be appended to a URI. */
                        Query.prototype.toString = function () {
                            var qstr = "";
                            for (var pname in this.values)
                                if (this.values[pname] !== void 0)
                                    qstr += (qstr ? "&" : "?") + encodeURIComponent(pname) + "=" + encodeURIComponent(this.values[pname]);
                            return qstr;
                        };
                        // ----------------------------------------------------------------------------------------------------------------
                        Query['QueryFactory'] = /** @class */ (function (_super) {
                            __extends(Factory, _super);
                            function Factory() {
                                return _super !== null && _super.apply(this, arguments) || this;
                            }
                            /** Helps to build an object of 'name:value' pairs from a URI or 'location.search' string.
                                * @param {string} searchString A URI or 'location.search' string.
                                * @param {boolean} makeNamesLowercase If true, then all query names are made lower case when parsing (the default is false).
                                */
                            Factory['new'] = function (searchString, makeNamesLowercase) {
                                if (searchString === void 0) { searchString = null; }
                                if (makeNamesLowercase === void 0) { makeNamesLowercase = false; }
                                return null;
                            };
                            /** Helps to build an object of 'name:value' pairs from a URI or 'location.search' string.
                                * @param {string} searchString A URI or 'location.search' string.
                                * @param {boolean} makeNamesLowercase If true, then all query names are made lower case when parsing (the default is false).
                                */
                            Factory.init = function (o, isnew, searchString, makeNamesLowercase) {
                                if (searchString === void 0) { searchString = null; }
                                if (makeNamesLowercase === void 0) { makeNamesLowercase = false; }
                                if (searchString) {
                                    var nameValuePairs = searchString.match(Path.QUERY_STRING_REGEX);
                                    var i, n, eqIndex, nameValue;
                                    if (nameValuePairs)
                                        for (var i = 0, n = nameValuePairs.length; i < n; ++i) {
                                            nameValue = nameValuePairs[i];
                                            eqIndex = nameValue.indexOf('='); // (need to get first instance of the '=' char)
                                            if (eqIndex == -1)
                                                eqIndex = nameValue.length; // (whole string is the name)
                                            if (makeNamesLowercase)
                                                o.values[decodeURIComponent(nameValue).substring(1, eqIndex).toLowerCase()] = decodeURIComponent(nameValue.substring(eqIndex + 1)); // (note: the RegEx match always includes a delimiter)
                                            else
                                                o.values[decodeURIComponent(nameValue).substring(1, eqIndex)] = decodeURIComponent(nameValue.substring(eqIndex + 1)); // (note: the RegEx match always includes a delimiter)
                                        }
                                }
                            };
                            return Factory;
                        }(CoreXT.FactoryBase(Query, null)));
                        return Query;
                    }(CoreXT.Disposable));
                    return [Query, Query["QueryFactory"]];
                }, "Query");
                // ===================================================================================================================
                //! if (pageQuery.getValue('debug', '') == 'true') Diagnostics.debug = Diagnostics.DebugModes.Debug_Run; // (only allow this on the sandbox and development servers)
                //! var demo = demo || pageQuery.getValue('demo', '') == 'true'; // (only allow this on the sandbox and development servers)
                function setLocation(url, includeExistingQuery, bustCache) {
                    if (includeExistingQuery === void 0) { includeExistingQuery = false; }
                    if (bustCache === void 0) { bustCache = false; }
                    var query = Path.Query.new(url);
                    if (bustCache)
                        query.values['_'] = new Date().getTime().toString();
                    if (includeExistingQuery)
                        query.addOrUpdate(Path.pageQuery.values);
                    if (url.charAt(0) == '/')
                        url = map(url);
                    url = query.appendTo(url);
                    query.dispose();
                    wait();
                    setTimeout(function () { location.href = url; }, 1); // (let events finish before setting)
                }
                Path.setLocation = setLocation;
                /**
                 * Adds a given path to the base URI (CoreXT.BaseURI) and returns it.  If the path is an absolute path (starts with a
                 * protocol, or '/') , then it is returned as is.
                 */
                function map(path) {
                    if (!/^\w+:/.test(path) && path.charAt(0) == '/') // (don't add absolute paths to the base URI)
                        return Path.combineURLPaths(CoreXT.baseURL, path);
                    else
                        return path;
                }
                Path.map = map;
                /**
                 * Returns true if the page URL contains the given controller and action names (not case sensitive).
                 * This only works with typical default routing of "{host}/Controller/Action/etc.".
                 * @param action A controller action name.
                 * @param controller A controller name (defaults to "home" if not specified)
                 */
                function isView(action, controller) {
                    if (controller === void 0) { controller = "home"; }
                    return new RegExp("^\/" + controller + "\/" + action + "(?:[\/?&#])?", "gi").test(location.pathname);
                }
                Path.isView = isView;
                // ===================================================================================================================
                /** This is set automatically to the query for the current page. */
                Path.pageQuery = Path.Query.new(location.href);
                // ===================================================================================================================
            })(Path = IO.Path || (IO.Path = {}));
            /** This even is triggered when the user should wait for an action to complete. */
            IO.onBeginWait = System.Events.EventDispatcher.new(IO, "onBeginWait", true);
            /** This even is triggered when the user no longer needs to wait for an action to complete. */
            IO.onEndWait = System.Events.EventDispatcher.new(IO, "onEndWait", true);
            var __waitRequestCounter = 0; // (allows stacking calls to 'wait()')
            /**
             * Blocks user input until 'closeWait()' is called. Plugins can hook into 'onBeginWait' to receive notifications.
             * Note: Each call stacks, but the 'onBeginWait' event is triggered only once.
             * @param msg An optional message to display (default is 'Please wait...').
             */
            function wait(msg) {
                if (msg === void 0) { msg = "Please wait ..."; }
                if (__waitRequestCounter == 0) // (fire only one time)
                    IO.onBeginWait.dispatch(msg);
                __waitRequestCounter++;
            }
            IO.wait = wait;
            /**
             * Unblocks user input if 'wait()' was previously called. The number of 'closeWait()' calls must match the number of wait calls in order to unblock the user.
             * Plugins can hook into the 'onEndWait' event to be notified.
             * @param force If true, then the number of calls to 'wait' is ignored and the block is forcibly removed (default if false).
             */
            function closeWait(force) {
                if (force === void 0) { force = false; }
                if (__waitRequestCounter > 0 && (force || --__waitRequestCounter == 0)) {
                    __waitRequestCounter = 0;
                    IO.onEndWait.dispatch();
                }
            }
            IO.closeWait = closeWait;
            // =======================================================================================================================
        })(IO = System.IO || (System.IO = {}));
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.IO.js.map