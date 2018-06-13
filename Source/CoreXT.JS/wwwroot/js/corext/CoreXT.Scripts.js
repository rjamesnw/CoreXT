// ###########################################################################################################################
// Types for time management.
// ###########################################################################################################################
/** Types and functions for loading scripts into the CoreXT system. */
var CoreXT;
(function (CoreXT) {
    var Scripts;
    (function (Scripts) {
        CoreXT.namespace("CoreXT", "Scripts");
        // =======================================================================================================================
        /** Used to strip out manifest dependencies. */
        Scripts.MANIFEST_DEPENDENCIES_REGEX = /^\s*using:\s*([A-Za-z0-9$_.,\s]*)/gim;
        /**
         * Takes a full type name and determines the expected path for the library.
         * This is used internally to find manifest file locations.
         */
        function moduleNamespaceToFolderPath(nsName) {
            var _nsName = ('' + nsName).trim();
            if (!nsName || !_nsName)
                CoreXT.log(CoreXT.nameof(function () { return moduleNamespaceToFolderPath; }) + "()", "A valid non-empty namespace string was expected.");
            var sysNs1 = CoreXT.nameof(function () { return CoreXT.Scripts.Modules; }) + "."; // (account for full names or relative names)
            var sysNs2 = CoreXT.nameof(function () { return Scripts.Modules; }) + ".";
            var sysNs3 = CoreXT.nameof(function () { return Scripts.Modules; }) + ".";
            if (_nsName.substr(0, sysNs1.length) === sysNs1)
                _nsName = _nsName.substr(sysNs1.length);
            else if (_nsName.substr(0, sysNs2.length) === sysNs2)
                _nsName = _nsName.substr(sysNs2.length);
            else if (_nsName.substr(0, sysNs3.length) === sysNs3)
                _nsName = _nsName.substr(sysNs3.length);
            var parts = _nsName.split('.');
            parts.splice(parts.length - 1, 1); // (the last name is always the type name, so remove it)
            return parts.join('/');
        }
        Scripts.moduleNamespaceToFolderPath = moduleNamespaceToFolderPath;
        // ====================================================================================================================
        var ScriptResource = /** @class */ (function (_super) {
            __extends(ScriptResource, _super);
            function ScriptResource() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return ScriptResource;
        }(CoreXT.FactoryBase(CoreXT.System.IO.ResourceRequest)));
        Scripts.ScriptResource = ScriptResource;
        (function (ScriptResource) {
            var $__type = /** @class */ (function (_super) {
                __extends($__type, _super);
                function $__type() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                /** A convenient script resource method that simply Calls 'Globals.register()'. For help, see 'CoreXT.Globals' and 'Globals.register()'. */
                $__type.prototype.registerGlobal = function (name, initialValue, asHostGlobal) {
                    return CoreXT.Globals.register(this, name, initialValue, asHostGlobal);
                };
                /** For help, see 'CoreXT.Globals'. */
                $__type.prototype.globalExists = function (name) {
                    return CoreXT.Globals.exists(this, name);
                };
                /** For help, see 'CoreXT.Globals'. */
                $__type.prototype.eraseGlobal = function (name) {
                    return CoreXT.Globals.erase(this, name);
                };
                /** For help, see 'CoreXT.Globals'. */
                $__type.prototype.clearGlobals = function () {
                    return CoreXT.Globals.clear(this);
                };
                /** For help, see 'CoreXT.Globals'. */
                $__type.prototype.setGlobalValue = function (name, value) {
                    return CoreXT.Globals.setValue(this, name, value);
                };
                /** For help, see 'CoreXT.Globals'. */
                $__type.prototype.getGlobalValue = function (name) {
                    return CoreXT.Globals.getValue(this, name);
                };
                $__type[CoreXT.constructor] = function (factory) {
                    factory.init = function (o, isnew, url) {
                        factory.super.init(o, isnew, url, CoreXT.ResourceTypes.Application_Script);
                    };
                };
                return $__type;
            }(CoreXT.FactoryType(CoreXT.System.IO.ResourceRequest)));
            ScriptResource.$__type = $__type;
            ScriptResource.$__register(Scripts);
        })(ScriptResource = Scripts.ScriptResource || (Scripts.ScriptResource = {}));
        // ====================================================================================================================
        /**
        * Represents a loaded manifest that describes some underlying resource (typically JavaScript).
        * 'Manifest' inherits from 'ScriptResource', providing the loaded manifests the ability to register globals for the
        * CoreXT context, instead of the global 'window' context.
        */
        var Manifest = /** @class */ (function (_super) {
            __extends(Manifest, _super);
            function Manifest() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return Manifest;
        }(CoreXT.FactoryBase(ScriptResource)));
        Scripts.Manifest = Manifest;
        (function (Manifest) {
            // (evaluated last, but called first)
            var $__type = /** @class */ (function (_super) {
                __extends($__type, _super);
                function $__type() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                /** A convenient script resource method that simply Calls 'Globals.register()'. For help, see 'CoreXT.Globals' and 'Globals.register()'. */
                $__type.prototype.registerGlobal = function (name, initialValue, asHostGlobal) {
                    return CoreXT.Globals.register(this, name, initialValue, asHostGlobal);
                };
                /** For help, see 'CoreXT.Globals'. */
                $__type.prototype.globalExists = function (name) {
                    return CoreXT.Globals.exists(this, name);
                };
                /** For help, see 'CoreXT.Globals'. */
                $__type.prototype.eraseGlobal = function (name) {
                    return CoreXT.Globals.erase(this, name);
                };
                /** For help, see 'CoreXT.Globals'. */
                $__type.prototype.clearGlobals = function () {
                    return CoreXT.Globals.clear(this);
                };
                /** For help, see 'CoreXT.Globals'. */
                $__type.prototype.setGlobalValue = function (name, value) {
                    return CoreXT.Globals.setValue(this, name, value);
                };
                /** For help, see 'CoreXT.Globals'. */
                $__type.prototype.getGlobalValue = function (name) {
                    return CoreXT.Globals.getValue(this, name);
                };
                $__type[CoreXT.constructor] = function (factory) {
                    factory.init = function (o, isnew, url) {
                        factory.super.init(o, isnew, url, CoreXT.ResourceTypes.Application_Script);
                    };
                };
                return $__type;
            }(CoreXT.FactoryType(ScriptResource)));
            Manifest.$__type = $__type;
            Manifest.$__register(Scripts);
            CoreXT.sealed($__type);
        })(Manifest = Scripts.Manifest || (Scripts.Manifest = {}));
        // ====================================================================================================================
        var _manifests = []; // (holds a list of all 
        var _manifestsByURL = {};
        /** Returns a resource loader for loading a specified manifest file from a given path (the manifest file name itself is not required).
          * To load a custom manifest file, the filename should end in either ".manifest" or ".manifest.js".
          * Call 'start()' on the returned instance to begin the loading process.
          * If the manifest contains dependencies to other manifests, an attempt will be made to load them as well.
          */
        function getManifest(path) {
            var _this = this;
            if (path == void 0 || path === null)
                path = "";
            if (typeof path != 'string')
                path = "" + path; // (convert to string)
            if (path == "")
                path = "manifest";
            //var manifestName = (path.match(/(?:^|\/|\.\/|\.\.\/)((?:[^\/]*\.)*manifest(?:.js)?)(?:$|\?|#)/i) || []).pop();
            if (/((?:^|\/|\.)manifest)$/i.test(path))
                path += ".js"; // (test if the name needs to have the '.js' added)
            var request = _manifestsByURL[path];
            if (request)
                return request; // (request already made)
            request = (Manifest.new(path)).then(function (request, data) {
                // ... the manifest script is loaded, now extract any dependencies ...
                if (!data)
                    return;
                var script = (typeof data == 'string' ? data : '' + data);
                if (script) {
                    var matches = CoreXT.matches(Scripts.MANIFEST_DEPENDENCIES_REGEX, script); // ("a.b.x, a.b.y, a.b.z")
                    if (matches.length) {
                        var dependencies = [];
                        for (var i = 0, n = matches.length; i < n; i++) {
                            var depItems = matches[i][1].split(',');
                            for (var i2 = 0, n2 = depItems.length; i2 < n2; ++i2)
                                dependencies.push(depItems[i2].trim());
                        }
                        if (dependencies.length) {
                            // ... this manifest has dependencies, so convert to folder paths and load them ...
                            for (var i = 0, n = dependencies.length; i < n; ++i) {
                                var path = moduleNamespaceToFolderPath(dependencies[i]);
                                getManifest(path).start().include(request); // (create a dependency chain; it's ok to do this in the 'then()' callback, as 'ready' events only trigger AFTER the promise sequence completes successfully)
                                // (Note: The current request is linked as a dependency on the required manifest. 'ready' is called when
                                //        parent manifests and their dependencies have completed loaded as well)
                            }
                        }
                    }
                }
            }).ready(function (manifestRequest) {
                var script = manifestRequest.transformedData;
                // ... before we execute the script we need to move down any source mapping pragmas ...
                var sourcePragmaInfo = CoreXT.extractPragmas(script);
                script = sourcePragmaInfo.filteredSource + "\r\n" + sourcePragmaInfo.pragmas.join("\r\n");
                var func = Function("manifest", "CoreXT", script); // (create a manifest wrapper function to isolate the execution context)
                func.call(_this, manifestRequest, CoreXT); // (make sure 'this' is supplied, just in case, to help protect the global scope somewhat [instead of forcing 'strict' mode])
                manifestRequest.status = CoreXT.RequestStatuses.Executed;
                manifestRequest.message = "The manifest script has been executed.";
            });
            _manifests.push(request); // (note: the first and second manifest should be the default root manifests; modules script loading should commence once all manifests are loaded)
            _manifestsByURL[path] = request;
            return request;
        }
        Scripts.getManifest = getManifest;
        // =======================================================================================================================
        /** Contains the statuses for module (script) loading and execution. */
        var ModuleLoadStatus;
        (function (ModuleLoadStatus) {
            /** The script was requested, but couldn't be loaded. */
            ModuleLoadStatus[ModuleLoadStatus["Error"] = -1] = "Error";
            /** The script is not loaded. Scripts only load and execute when needed/requested. */
            ModuleLoadStatus[ModuleLoadStatus["NotLoaded"] = 0] = "NotLoaded";
            /** The script was requested, but loading has not yet started. */
            ModuleLoadStatus[ModuleLoadStatus["Requested"] = 1] = "Requested";
            /** The script is waiting on dependents before loading. */
            ModuleLoadStatus[ModuleLoadStatus["Waiting"] = 2] = "Waiting";
            /** The script is loading. */
            ModuleLoadStatus[ModuleLoadStatus["InProgress"] = 3] = "InProgress";
            /** The script is now available, but has not executed yet. Scripts only execute when needed (see 'CoreXT.using'). */
            ModuleLoadStatus[ModuleLoadStatus["Loaded"] = 4] = "Loaded";
            /** The script has been executed. */
            ModuleLoadStatus[ModuleLoadStatus["Ready"] = 5] = "Ready";
        })(ModuleLoadStatus = Scripts.ModuleLoadStatus || (Scripts.ModuleLoadStatus = {}));
        var _modules = {};
        var _appModule = null; // (becomes set to the app module when the app module is finally loaded and ready to be executed)
        /** Contains static module properties and functions. */
        var Module = /** @class */ (function (_super) {
            __extends(Module, _super);
            function Module() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return Module;
        }(CoreXT.FactoryBase(ScriptResource)));
        Scripts.Module = Module;
        (function (Module) {
            var $__type = /** @class */ (function (_super) {
                __extends($__type, _super);
                function $__type() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.required = false; // (true if the script is required - the application will fail to execute if this occurs, and an exception will be thrown)
                    /** If true, then the module is waiting to complete based on some outside custom script/event. */
                    _this.customWait = false;
                    /** Returns a variable value from the executed module's local scope.
                      * Module scripts that are wrapped in functions may have defined global variables that become locally scoped instead. In
                      * these cases, use this function to read the required values.  This is an expensive operation that should only be used to
                      * retrieve object references.  If performance is required to access non-reference values, the script must be applied to
                      * the global scope as normal.
                      */
                    _this.getVar = CoreXT.noop;
                    _this.setVar = CoreXT.noop;
                    /** This 'exports' container exists to support loading client-side modules in a NodeJS-type fashion.  The main exception is that
                      * 'require()' is not supported as it is synchronous, and an asynchronous method is required on the client side.  Instead, the
                      * reference to a 'manifest' variable (of type 'CoreXT.Scripts.IManifest') is also given to the script, and can be used to
                      * further chain more modules to load.
                      * Note: 'exports' (a module-global object) does not apply to scripts executed in the global scope (i.e. if 'execute(true)' is called).
                      */
                    _this.exports = {};
                    return _this;
                }
                $__type.prototype.isInclude = function () { return this.url && this.fullname == this.url; };
                $__type.prototype.__onLoaded = function () {
                    // ... script is loaded (not executed), but may be waiting on dependencies; for now, check for in-script dependencies/flags and apply those now ...
                    return this;
                };
                $__type.prototype.__onReady = function (request) {
                    // ... script is loaded (not executed) and ready to be applied ...
                    if (this.fullname == "app" || this.fullname == "application") {
                        _appModule = this;
                        if (_runMode) // (if run was requested)
                            _tryRunApp();
                    }
                    return this;
                };
                $__type.prototype.toString = function () { return this.fullname; };
                $__type.prototype.toValue = function () { return this.fullname; };
                /** Begin loading the module's script. After the loading is completed, any dependencies are automatically detected and loaded as well. */
                $__type.prototype.start = function () {
                    if (this.status == CoreXT.RequestStatuses.Pending && !this._moduleGlobalAccessors) { // (make sure this module was not already started nor applied)
                        this.url = CoreXT.debugMode ? this.nonMinifiedURL : (this.minifiedURL || this.nonMinifiedURL); // (just in case the debugging flag changed)
                        return _super.prototype.start.call(this);
                    }
                    return this;
                };
                /** Executes the underlying script by either wrapping it in another function (the default), or running it in the global window scope. */
                $__type.prototype.execute = function (useGlobalScope) {
                    if (useGlobalScope === void 0) { useGlobalScope = false; }
                    if (this.status == CoreXT.RequestStatuses.Ready && !this._moduleGlobalAccessors) {
                        // ... first, make sure all parent modules have been executed first ...
                        for (var i = 0, n = this._parentRequests.length, dep; i < n; ++i)
                            if ((dep = this._parentRequests[i]).status == CoreXT.RequestStatuses.Ready)
                                dep.execute();
                        var accessors;
                        if (useGlobalScope) {
                            this._moduleGlobalAccessors = (CoreXT.globalEval(this.data), $__type._globalaccessors); // (use the global accessors, as the module was run in the global scope)
                        }
                        else {
                            var tsHelpers = CoreXT.renderHelperVarDeclarations("arguments[3]");
                            this.$__modFunc = new Function("CoreXT", "module", "exports", tsHelpers[0] + this.data + ";\r\n return { get: function(varName) { return eval(varName); }, set: function(varName, val) { return eval(varName + ' = val;'); } };");
                            this._moduleGlobalAccessors = this.$__modFunc(CoreXT, this, this.exports, tsHelpers); // (note that 'this.' effectively prevents polluting the global scope in case 'this' is used)
                        }
                        this.getVar = this._moduleGlobalAccessors.get;
                        this.setVar = this._moduleGlobalAccessors.set;
                        this.status = CoreXT.RequestStatuses.Executed;
                    }
                };
                $__type[CoreXT.constructor] = function (factory) {
                    factory.init = function (o, isnew, fullname, url, minifiedUrl) {
                        factory.super.init(o, isnew, CoreXT.debugMode ? url : (minifiedUrl || url));
                        if (!o.type) // (if the base resource loader fails to initialize, then another resource already exists for the same location)
                            throw CoreXT.System.Exception.from("Duplicate module load request: A previous request for '" + url + "' was already made.", o);
                        o.fullname = fullname;
                        o.nonMinifiedURL = url;
                        o.minifiedURL = minifiedUrl;
                        o.then(o.__onLoaded).ready(o.__onReady);
                    };
                };
                $__type._globalaccessors = (function () { return CoreXT.safeEval("({ get: function(varName) { return p0.global[varName]; }, set: function(varName, val) { return p0.global[varName] = val; } })", CoreXT); })();
                return $__type;
            }(CoreXT.FactoryType(ScriptResource)));
            Module.$__type = $__type;
            Module.$__register(Scripts);
        })(Module = Scripts.Module || (Scripts.Module = {}));
        var _runMode = 0; // (0=auto run, depending on debug flag; 1=user has requested run before the app module was ready; 2=running)
        /** Used internally to see if the application should run automatically. Developers should NOT call this directly and call 'runApp()' instead. */
        function _tryRunApp() {
            if (_runMode < 2)
                if (_appModule && (_runMode == 1 || !CoreXT.host.isDebugMode() && CoreXT.debugMode != CoreXT.DebugModes.Debug_Wait)) {
                    // (note: if the host is in debug mode, it trumps the internal debug setting)
                    if (_appModule.status == CoreXT.RequestStatuses.Ready)
                        _appModule.execute();
                    if (_appModule.status == CoreXT.RequestStatuses.Executed)
                        _runMode = 2;
                }
        }
        Scripts._tryRunApp = _tryRunApp;
        /** Attempts to run the application module (typically the script generated from 'app.ts'), if ready (i.e. loaded along with all dependencies).
          * If the app is not ready yet, the request is flagged to start the app automatically.
          * Note: Applications always start automatically by default, unless 'CoreXT.System.Diagnostics.debug' is set to 'Debug_Wait'.
          */
        function runApp() {
            if (_runMode < 2) {
                _runMode = 1;
                _tryRunApp();
            }
        }
        Scripts.runApp = runApp;
        // =======================================================================================================================
        /** This is the path to the root of the CoreXT JavaScript files ('CoreXT/' by default).
        * Note: This should either be empty, or always end with a URL path separator ('/') character (but the system will assume to add one anyhow if missing). */
        Scripts.pluginFilesBasePath = CoreXT.System.IO && CoreXT.System.IO.Path ? CoreXT.System.IO.Path.combine(CoreXT.baseURL, "wwwroot/js/") : CoreXT.baseURL + "wwwroot/js/";
        /** Translates a module relative or full type name to the actual type name (i.e. '.ABC' to 'CoreXT.ABC', or 'System'/'System.' to 'CoreXT'/'CoreXT.'). */
        function translateModuleTypeName(moduleFullTypeName) {
            if (moduleFullTypeName.charAt(0) == '.')
                moduleFullTypeName = "CoreXT" + moduleFullTypeName; // (just a shortcut to reduce repetition of "CoreXT." at the start of full module type names during registration)
            else if (moduleFullTypeName == "System" || moduleFullTypeName.substr(0, "System.".length) == "System.")
                moduleFullTypeName = "CoreXT" + moduleFullTypeName.substr("System".length); // ("System." maps to "CoreXT." internally to prevent compatibility issues)
            return moduleFullTypeName;
        }
        Scripts.translateModuleTypeName = translateModuleTypeName;
        ;
        /** Parses the text (usually a file name/path) and returns the non-minified and minified versions in an array (in that order).
          * If no tokens are found, the second item in the array will be null.
          * The format of the tokens is '{min:[non-minified-text|]minified-text}', where '[...]' is optional (square brackets not included).
          */
        function processMinifyTokens(text) {
            var tokenRegEx = /{min:[^\|}]*?\|?[^}]*?}/gi;
            var minTokens = text.match(tokenRegEx); // (note: more than one is supported)
            var minifiedText = null;
            var token, minParts;
            if (minTokens) { // (if tokens were found ...)
                minifiedText = text;
                for (var i = 0, n = minTokens.length; i < n; ++i) {
                    token = minTokens[i];
                    minParts = token.substring(5, token.length - 1).split('|');
                    if (minParts.length == 1)
                        minParts.unshift("");
                    minifiedText = minifiedText.replace(token, minParts[1]);
                    text = text.replace(token, minParts[0]); // (delete the token(s))
                }
            }
            return [text, minifiedText];
        }
        Scripts.processMinifyTokens = processMinifyTokens;
        /** This is usually called from the 'CoreXT.[ts|js]' file to register script files (plugins), making them available to the application based on module names (instead of file names).
          * When 'CoreXT.using.{...someplugin}()' is called, the required script files are then executed as needed.
          * This function returns a function that, when called, will execute the loaded script.  The returned object also as chainable methods for success and error callbacks.
          * @param {ModuleInfo[]} dependencies A list of modules that this module depends on.
          * @param {string} moduleFullTypeName The full type name of the module, such as 'CoreXT.UI', or 'jquery'.
          *                                    You can also use the token sequence '{min:[non-minified-text|]minified-text}' (where '[...]' is optional, square brackets
          *                                    not included) to define the minified and non-minified text parts.
          * @param {string} moduleFileBasePath (optional) The path to the '.js' file, including the filename + extension.  If '.js' is not found at the end, then
          *                                    the full module type name is appended, along with '.js'. This parameter will default to 'CoreXT.moduleFilesBasePath'
          *                                    (which is 'CoreXTJS/' by default) if null is passed, so pass an empty string if this is not desired.
          *                                    You can also use the '{min:[non-minified-text|]minified-text}' token sequence (where '[...]' is optional, square brackets
          *                                    not included) to define the minified and non-minified text parts.
          * @param {boolean} requiresGlobalScope If a module script MUST execute in the host global scope environment, set this to true.  If
          *                                      false, the module is wrapped in a function to create a local-global scope before execution.
          */
        function module(dependencies, moduleFullTypeName, moduleFileBasePath, requiresGlobalScope) {
            var _this = this;
            if (moduleFileBasePath === void 0) { moduleFileBasePath = null; }
            if (requiresGlobalScope === void 0) { requiresGlobalScope = false; }
            if (!moduleFullTypeName)
                throw CoreXT.System.Exception.from("A full type name path is expected.");
            var Path = CoreXT.System.IO.Path;
            // ... extract the minify-name tokens and create the proper names and paths for both min and non-min versions ...
            var results = processMinifyTokens(moduleFullTypeName);
            var minifiedFullTypeName = null;
            if (results[1]) {
                moduleFullTypeName = translateModuleTypeName(results[0]);
                minifiedFullTypeName = translateModuleTypeName(results[1]);
            }
            else
                moduleFullTypeName = translateModuleTypeName(moduleFullTypeName); // (translate "System." to "CoreXT." and "." to "CoreXT." internally)
            // ... if the JavaScript file is not given, then create the relative path to it given the full type name ...
            var path = moduleFileBasePath != null ? ("" + moduleFileBasePath).trim() : Scripts.pluginFilesBasePath;
            var minPath = null;
            if (path && path.charAt(0) == '~')
                path = CoreXT.System.IO.Path.combine(Scripts.pluginFilesBasePath, path.substring(1)); // ('~' is a request to insert the current default path; eg. "~CoreXT.System.js" for "CoreXTJS/CoreXT.System.js")
            results = processMinifyTokens(path);
            if (results[1]) {
                path = results[0];
                minPath = results[1];
            }
            else if (minifiedFullTypeName)
                minPath = path;
            if (!Path.hasFileExt(path, '.js')) { //&& !/^https?:\/\//.test(path)
                // ... JavaScript filename extension not found, so add it under the assumed name ...
                if (!path || path.charAt(path.length - 1) == '/')
                    path = CoreXT.System.IO.Path.combine(path, moduleFullTypeName + ".js");
                else
                    path += ".js";
            }
            if (minPath && !Path.hasFileExt(minPath, '.js')) { //&& !/^https?:\/\//.test(path)
                // ... JavaScript filename extension not found, so add it under the assumed name ...
                if (!minPath || minPath.charAt(minPath.length - 1) == '/')
                    minPath = CoreXT.System.IO.Path.combine(minPath, minifiedFullTypeName + ".js");
                else
                    minPath += ".js";
            }
            // ... add the module if it doesn't already exist, otherwise update it ...
            var mod = _modules[moduleFullTypeName];
            if (mod === void 0)
                _modules[moduleFullTypeName] = mod = Module.new(moduleFullTypeName, path, minPath); // (note: this can only be changed if the type hasn't been loaded yet)
            else {
                mod.fullname = moduleFullTypeName; // (just in case it changed somehow - this must always match the named index)
                if (!mod.nonMinifiedURL)
                    mod.nonMinifiedURL = path; // (update path only if missing)
                if (!mod.minifiedURL)
                    mod.minifiedURL = minPath; // (update minified-path only if missing)
            }
            if (dependencies && dependencies.length)
                for (var i = 0, n = dependencies.length; i < n; ++i)
                    dependencies[i].module.include(mod);
            var usingPluginFunc = (function (onready, onerror) {
                // (this is called to trigger the loading of the resource [scripts are only loaded on demand])
                if (onready === void 0 && onerror === void 0 && mod.status != CoreXT.RequestStatuses.Executed) {
                    // ... if no callbacks are given, this is a request to CONFIRM that a script is executed, and to execute it if not ...
                    var msg = '';
                    if (mod.status >= CoreXT.RequestStatuses.Waiting) {
                        onReadyforUse.call(mod, mod);
                        return usingPluginFunc;
                    }
                    if (mod.status == CoreXT.RequestStatuses.Error)
                        msg = "It is in an error state.";
                    else if (mod.status == CoreXT.RequestStatuses.Pending)
                        msg = "It has not been requested to load.  Either supply a callback to execute when the module is ready to be used, or add it as a dependency to the requesting module.";
                    else if (mod.status < CoreXT.RequestStatuses.Waiting)
                        msg = "It is still loading and is not yet ready.  Either supply a callback to execute when the module is ready to be used, or add it as a dependency to the requesting module.";
                    throw CoreXT.System.Exception.from("Cannot use module '" + mod.fullname + "': " + msg, mod);
                }
                function onReadyforUse(mod) {
                    try {
                        // ... execute the script ...
                        mod.execute();
                        mod.status = CoreXT.RequestStatuses.Executed;
                        if (onready)
                            onready(mod);
                    }
                    catch (e) {
                        mod.setError("Error executing module script:", e);
                        if (onerror)
                            onerror.call(mod, mod);
                        throw e; // (pass along to the resource loader)
                    }
                }
                // ... request to load the module and execute the script ...
                switch (mod.status) {
                    case CoreXT.RequestStatuses.Error: throw CoreXT.System.Exception.from("The module '" + mod.fullname + "' is in an error state and cannot be used.", mod);
                    case CoreXT.RequestStatuses.Pending:
                        mod.start();
                        break; // (the module is not yet ready and cannot be executed right now; attach callbacks...)
                    case CoreXT.RequestStatuses.Loading:
                        mod.catch(onerror);
                        break;
                    case CoreXT.RequestStatuses.Loaded:
                    case CoreXT.RequestStatuses.Waiting:
                    case CoreXT.RequestStatuses.Ready:
                    case CoreXT.RequestStatuses.Executed:
                        mod.ready(onReadyforUse);
                        break;
                }
                return usingPluginFunc;
            });
            usingPluginFunc.module = mod;
            usingPluginFunc.then = function (success, error) { mod.then(success, error); return _this; };
            usingPluginFunc.require = function (request) { request.include(mod); return _this; };
            //?usingPluginFunc.include = (dependantMod: IUsingModule) => { mod.include(dependantMod.module); return dependantMod; };
            usingPluginFunc.ready = function (handler) { mod.ready(handler); return _this; };
            usingPluginFunc.while = function (progressHandler) { mod.while(progressHandler); return _this; };
            usingPluginFunc.catch = function (errorHandler) { mod.catch(errorHandler); return _this; };
            usingPluginFunc.finally = function (cleanupHandler) { mod.finally(cleanupHandler); return _this; };
            return usingPluginFunc;
        }
        Scripts.module = module;
        ;
    })(Scripts = CoreXT.Scripts || (CoreXT.Scripts = {}));
    // =======================================================================================================================
    ///** Use to compile & execute required modules as they are needed.
    //  * By default, modules (scripts) are not executed immediately upon loading.  This makes page loading more efficient.
    //  */
    //export import using = Scripts.module;
    // =======================================================================================================================
})(CoreXT || (CoreXT = {}));
// ###########################################################################################################################
///** Used to load, compile & execute required plugin scripts. */
//if (!this['using'])
//    var using = CoreXT.using; // (users should reference "using.", but "CoreXT.using" can be used if the global 'using' is needed for something else)
// ###########################################################################################################################
//# sourceMappingURL=CoreXT.Scripts.js.map