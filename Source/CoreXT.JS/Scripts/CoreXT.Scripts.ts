// ###########################################################################################################################
// Types for time management.
// ###########################################################################################################################

/** Types and functions for loading scripts into the CoreXT system. */
namespace CoreXT {
    export namespace Scripts {
        // =======================================================================================================================

        /** Used to strip out the module header */
        export var MANIFEST_DEPENDENCIES_REGEX = /\bmodule\s*\(\s*\[(.*)\]/gim;

        // =======================================================================================================================

        /** A code-completion friendly list of registered modules.
          * Note: Though module references may show in code completion, the related manifests in each plugin location must be
          * loaded first before a module is ready for use.
          * Usage: To load a module, call it using the '[CoreXT.]using.ModuleName(...)' syntax.
          * Note: If you are developing your own module, use a proper name path under the Modules namespace -
          * typically something like 'module CoreXT.Scripts.Modules { /** Comments... * / export namespace CompanyOrWebsite.YourModule { ... } }'
          * (take note that the comments are in their own scope, which is required as well).
          */
        export namespace Modules {

            /** Supported CoreXT system modules.
              * Note: If you are developing your own module, use a proper name path under the parent 'Modules' namespace -
              * typically something like 'module CoreXT.Scripts.Modules { /** Comments... * / export namespace CompanyOrWebsite.YourModule { ... } }'
              * Do not put custom modules directly in the 'CoreXT.Scripts.Modules.System' namespace, nor any sub-namespace from there.
              */
            export namespace System {
            }
        }

        /** Takes a full type name and determines the expected path for the library.
          * This is used internally to find manifest file locations.
          */
        export function fullTypeNameToFolderPath(fullTypeName: string) {
            if (fullTypeName === void 0 || fullTypeName === null)
                throw System.Exception.from("A full type name was expected, but '" + fullTypeName + "' was given.");
            var parts = fullTypeName.split('.');
            parts.splice(parts.length - 1, 1); // (the last name is always the type name, so remove it)
            return parts.join('/');
        }

        // ====================================================================================================================

        class $ScriptResource extends Loader.ResourceRequest.$Type {

            /** For help, see 'CoreXT.Globals'. */
            registerGlobal<T>(name: string, initialValue: T, asHostGlobal?: boolean): string {
                return Globals.register(this, name, initialValue, asHostGlobal);
            }
            /** For help, see 'CoreXT.Globals'. */
            globalExists<T>(name: string): boolean {
                return Globals.exists(this, name);
            }
            /** For help, see 'CoreXT.Globals'. */
            eraseGlobal<T>(name: string): boolean {
                return Globals.erase(this, name);
            }
            /** For help, see 'CoreXT.Globals'. */
            clearGlobals<T>(): boolean {
                return Globals.clear(this);
            }
            /** For help, see 'CoreXT.Globals'. */
            setGlobalValue<T>(name: string, value: T): T {
                return Globals.setValue<T>(this, name, value);
            }
            /** For help, see 'CoreXT.Globals'. */
            getGlobalValue<T>(name: string): T {
                return Globals.getValue<T>(this, name);
            }

            // ----------------------------------------------------------------------------------------------------------------

            static '$ScriptResource Factory' = function () {
                return frozen(class Factory implements IFactoryType {
                    $Type = $ScriptResource;
                    $InstanceType = <{}>null && new this.$Type();
                    $BaseFactory = this.$Type['$ResourceRequest Factory'].prototype;

                    /** Returns a new module object only - does not load it. */
                    'new'(url: string): typeof Factory.prototype.$InstanceType { return null; }

                    /** Disposes this instance, sets all properties to 'undefined', and calls the constructor again (a complete reset). */
                    init($this: typeof Factory.prototype.$InstanceType, isnew: boolean, url: string): typeof Factory.prototype.$InstanceType {
                        this.$BaseFactory.init($this, isnew, url, Loader.ResourceTypes.Application_Script);
                        return $this;
                    }
                });
            }();

            // ----------------------------------------------------------------------------------------------------------------
        }

        export interface IScriptResource extends $ScriptResource { }
        export var ScriptResource = TypeFactory.__registerFactoryType($ScriptResource, $ScriptResource['$ScriptResource Factory'], [CoreXT, Scripts]);

        // ====================================================================================================================

        /**
         * Represents a loaded manifest that describes some underlying resource (typically JavaScript).
         * 'Manifest' inherits from 'ScriptResource', providing the loaded manifests the ability to register globals for the
         * CoreXT context, instead of the global 'window' context.
         */
        class $Manifest extends ScriptResource.$Type {
            // ----------------------------------------------------------------------------------------------------------------

            static '$Manifest Factory' = function () {
                return frozen(class Factory implements IFactoryType {
                    $Type = $Manifest;
                    $InstanceType = <{}>null && new this.$Type();
                    $BaseFactory = this.$Type['$ScriptResource Factory'].prototype;

                    /** Holds variables required for manifest execution (for example, callback functions for 3rd party libraries, such as the Google Maps API). */
                    'new'(url: string): $ScriptResource { return null; }

                    /** Holds variables required for manifest execution (for example, callback functions for 3rd party libraries, such as the Google Maps API). */
                    init($this: $Module, isnew: boolean, url: string): $ScriptResource {
                        this.$BaseFactory.init($this, isnew, url);
                        return $this;
                    }
                });
            }();

            // ----------------------------------------------------------------------------------------------------------------
        }

        export interface IManifest extends $Manifest { }
        export var Manifest = TypeFactory.__registerFactoryType($Manifest, $Manifest['$Manifest Factory'], [CoreXT, Scripts]);

        // ====================================================================================================================

        var _manifests: IManifest[] = []; // (holds a list of all 
        var _manifestsByURL: { [url: string]: IManifest; } = {};

        /** Returns a resource loader for loading a specified manifest file from a given path (the manifest file name itself is not required).
          * To load a custom manifest file, the filename should end in either ".manifest" or ".manifest.js".
          * Call 'start()' on the returned instance to begin the loading process.
          * If the manifest contains dependencies to other manifests, an attempt will be made to load them as well.
          */
        export function getManifest(path?: string): IManifest {
            if (path == void 0 || path === null) path = "";
            if (typeof path != 'string') path = "" + path; // (convert to string)
            if (path == "") path = "manifest";

            //var manifestName = (path.match(/(?:^|\/|\.\/|\.\.\/)((?:[^\/]*\.)*manifest(?:.js)?)(?:$|\?|#)/i) || []).pop();
            if (/((?:^|\/|\.)manifest)$/i.test(path)) path += ".js"; // (test if the name needs to have the '.js' added)

            var request: IManifest = _manifestsByURL[path];

            if (request) return request; // (request already made)

            request = <IManifest>(Manifest.new(path)).then((request: IManifest) => {
                // ... the manifest script is loaded, now extract any dependencies ...
                if (request.data == void 0 || request.data == null) return;
                var script: string = (typeof request.data == 'string' ? request.data : '' + request.data);
                if (script) {
                    var dependencyGroups: string[] = script.match(MANIFEST_DEPENDENCIES_REGEX);
                    if (dependencyGroups) {
                        var dependencies: string[] = [];
                        for (var i = 1, n = dependencyGroups.length; i < n; i++) {
                            var depItems = dependencyGroups[i].split(',');
                            for (var i2 = 0, n2 = depItems.length; i2 < n2; ++i2)
                                dependencies.push(depItems[i2].trim());
                        }
                        if (dependencies.length) {
                            // ... this manifest has dependencies, so convert to folder paths and load them ...
                            for (var i = 0, n = dependencies.length; i < n; ++i) {
                                var path = fullTypeNameToFolderPath(dependencies[i]);
                                getManifest(path).start().include(request); // (create a dependency chain; it's ok to do this in the 'then()' callback, as 'ready' events only trigger AFTER the promise sequence completes successfully)
                                // (Note: The current request is linked as a dependency on the required manifest. 'ready' is called when
                                //        parent manifests and their dependencies have completed loaded as well)
                            }
                        }
                    }
                }
            }).ready((request: IManifest) => {
                var func = Function("manifest", request.transformedData); // (create a manifest wrapper function to isolate the execution context)
                func.call(this, request); // (make sure 'this' is supplied, just in case, to help protect the global scope somewhat [instead of forcing 'strict' mode])
                request.status = Loader.RequestStatuses.Executed;
                request.message = "The manifest script has been executed.";
            });

            _manifests.push(request); // (note: the first and second manifest should be the default root manifests; modules script loading should commence once all manifests are loaded)
            _manifestsByURL[path] = request;

            return request;
        }

        // =======================================================================================================================

        /** Contains the statuses for module (script) loading and execution. */
        export enum ModuleLoadStatus {
            /** The script was requested, but couldn't be loaded. */
            Error = -1,
            /** The script is not loaded. Scripts only load and execute when needed/requested. */
            NotLoaded = 0,
            /** The script was requested, but loading has not yet started. */
            Requested,
            /** The script is waiting on dependents before loading. */
            Waiting,
            /** The script is loading. */
            InProgress,
            /** The script is now available, but has not executed yet. Scripts only execute when needed (see 'CoreXT.using'). */
            Loaded,
            /** The script has been executed. */
            Ready
        }

        var _modules: { [index: string]: IModule; } = {};
        var _appModule: IModule = null; // (becomes set to the app module when the app module is finally loaded and ready to be executed)

        interface _IModuleAccessors { get: (varName: string) => any; set: (varName: string, value: any) => any }

        /** Contains static module properties and functions. */
        class $Module extends ScriptResource.$Type {
            /** The full type name for this module. */
            fullname: string;

            /** The URL to the non-minified version of this module script. */
            nonMinifiedURL: string;
            /** The URL to the minified version of this module script. */
            minifiedURL: string;

            required: boolean = false; // (true if the script is required - the application will fail to execute if this occurs, and an exception will be thrown)

            isInclude() { return this.url && this.fullname == this.url; }

            /** If true, then the module is waiting to complete based on some outside custom script/event. */
            customWait: boolean = false;

            /** Holds a reference to the executed function that wraps the loaded script. */
            private $__modFunc: (module: IModule, exports: {}, ...args: any[]) => _IModuleAccessors;

            /** Returns a variable value from the executed module's local scope.
              * Module scripts that are wrapped in functions may have defined global variables that become locally scoped instead. In
              * these cases, use this function to read the required values.  This is an expensive operation that should only be used to 
              * retrieve object references.  If performance is required to access non-reference values, the script must be applied to
              * the global scope as normal.
              */
            getVar: <T extends any>(varName: string) => T = noop;
            setVar: <T extends any>(varName: string, value: T) => T = noop;

            /** This 'exports' container exists to support loading client-side modules in a NodeJS-type fashion.  The main exception is that
              * 'require()' is not supported as it is synchronous, and an asynchronous method is required on the client side.  Instead, the
              * reference to a 'manifest' variable (of type 'CoreXT.Scripts.IManifest') is also given to the script, and can be used to
              * further chain more modules to load.
              * Note: 'exports' (a module-global object) does not apply to scripts executed in the global scope (i.e. if 'execute(true)' is called).
              */
            exports: {} = {};

            /** A temp reference to the object returned from executing the generated '$__modFunc' wrapper function. */
            private _moduleGlobalAccessors: _IModuleAccessors;
            private static readonly _globalaccessors: _IModuleAccessors = (() => { return safeEval("({ get: function(varName) { return CoreXT.global[varName]; }, set: function(varName, val) { return CoreXT.global[varName] = val; } })"); })();

            private __onLoaded() {
                // ... script is loaded (not executed), but may be waiting on dependencies; for now, check for in-script dependencies/flags and apply those now ...
                return this;
            }

            private __onReady(request: Loader.IResourceRequest) {
                // ... script is loaded (not executed) and ready to be applied ...
                if (this.fullname == "app" || this.fullname == "application") {
                    _appModule = this;
                    if (_runMode) // (if run was requested)
                        _tryRunApp();
                }
                return this;
            }

            toString() { return this.fullname; }
            toValue() { return this.fullname; }

            /** Begin loading the module's script. After the loading is completed, any dependencies are automatically detected and loaded as well. */
            start(): this {
                if (this.status == Loader.RequestStatuses.Pending && !this._moduleGlobalAccessors) { // (make sure this module was not already started nor applied)
                    this.url = System.Diagnostics.debug ? this.nonMinifiedURL : (this.minifiedURL || this.nonMinifiedURL); // (just in case the debugging flag changed)
                    return super.start();
                }
                return this;
            }

            /** Executes the underlying script by either wrapping it in another function (the default), or running it in the global window scope. */
            execute(useGlobalScope = false): void {
                if (this.status == Loader.RequestStatuses.Ready && !this._moduleGlobalAccessors) {
                    // ... first, make sure all parent modules have been executed first ...
                    for (var i = 0, n = this._dependents.length, dep: Loader.IResourceRequest; i < n; ++i)
                        if ((dep = this._dependents[i]).status == Loader.RequestStatuses.Ready)
                            (<IModule>dep).execute();

                    var accessors: _IModuleAccessors;
                    if (useGlobalScope) {
                        this.$__modFunc = <any>new Function("module", "exports", this.data + ";\r\n return { get: function(varName) { return eval(varName); }, set: function(varName, val) { return eval(varName + ' = val;'); } };");
                        this._moduleGlobalAccessors = this.$__modFunc(this, this.exports); // (note that 'this.' effectively prevents polluting the global scope in case 'this' is used)
                    } else {
                        this._moduleGlobalAccessors = (safeEval(this.data), $Module._globalaccessors); // (use the global accessors, as the module was run in the global scope)
                    }

                    this.getVar = this._moduleGlobalAccessors.get;
                    this.setVar = this._moduleGlobalAccessors.set;

                    this.status = Loader.RequestStatuses.Executed;
                }
            }

            // ----------------------------------------------------------------------------------------------------------------

            static '$Module Factory' = function () {
                return frozen(class Factory implements IFactoryType {
                    $Type = $Module;
                    $InstanceType = <{}>null && new this.$Type();
                    $BaseFactory = this.$Type['$ScriptResource Factory'].prototype;

                    /** Returns a new module object only - does not load it. */
                    'new'(fullname: string, path: string, minifiedPath?: string): typeof Factory.prototype.$InstanceType { return null; }

                    /** Disposes this instance, sets all properties to 'undefined', and calls the constructor again (a complete reset). */
                    init($this: typeof Factory.prototype.$InstanceType, isnew: boolean, fullname: string, url: string, minifiedURL: string = null): typeof Factory.prototype.$InstanceType {
                        this.$BaseFactory.init($this, isnew, System.Diagnostics.debug ? url : (minifiedURL || url));

                        if (!$this.type) // (if the base resource loader fails to initialize, then another resource already exists for the same location)
                            throw System.Exception.from("Duplicate module load request: A previous request for '" + url + "' was already made.", $this);

                        $this.fullname = fullname;
                        $this.nonMinifiedURL = url;
                        $this.minifiedURL = minifiedURL;

                        $this.then($this.__onLoaded).ready($this.__onReady);

                        return $this;
                    }
                });
            }();

            // ----------------------------------------------------------------------------------------------------------------
        }

        export interface IModule extends $Module { }
        export var Module = TypeFactory.__registerFactoryType($Module, $Module['$Module Factory'], [CoreXT, Scripts]);

        var _runMode = 0; // (0=auto run, depending on debug flag; 1=user has requested run before the app module was ready; 2=running)

        /** Used internally to see if the application should run automatically. If needed, developers should call 'runApp()' instead. */
        export function _tryRunApp() {
            if (_runMode < 2)
                if (_appModule && (_runMode == 1 || !CoreXT.host.isDebugMode() && CoreXT.System.Diagnostics.debug != CoreXT.System.Diagnostics.DebugModes.Debug_Wait)) {
                    // (note: if the host is in debug mode, it trumps the internal debug setting)
                    if (_appModule.status == Loader.RequestStatuses.Ready)
                        _appModule.execute();
                    if (_appModule.status == Loader.RequestStatuses.Executed)
                        _runMode = 2;
                }
        }

        /** Attempts to run the application module (typically the script generated from 'app.ts'), if ready (i.e. loaded along with all dependencies).
          * If the app is not ready yet, the request is flagged to start the app automatically.
          * Note: Applications always start automatically by default, unless 'CoreXT.System.Diagnostics.debug' is set to 'Debug_Wait'.
          */
        export function runApp() {
            if (_runMode < 2) {
                _runMode = 1;
                _tryRunApp();
            }
        }

        // =======================================================================================================================

        /** This is the path to the root of the CoreXT JavaScript files ('CoreXT/' by default).
        * Note: This should either be empty, or always end with a URL path separator ('/') character (but the system will assume to add one anyhow if missing). */
        export var pluginFilesBasePath: string = System.IO && System.IO.Path ? System.IO.Path.combineURLPaths(BaseURI, "wwwroot/js/") : BaseURI + "wwwroot/js/";

        /** Translates a module relative or full type name to the actual type name (i.e. '.ABC' to 'CoreXT.ABC', or 'System'/'System.' to 'CoreXT'/'CoreXT.'). */
        export function translateModuleTypeName(moduleFullTypeName: string) {
            if (moduleFullTypeName.charAt(0) == '.')
                moduleFullTypeName = "CoreXT" + moduleFullTypeName; // (just a shortcut to reduce repetition of "CoreXT." at the start of full module type names during registration)
            else if (moduleFullTypeName == "System" || moduleFullTypeName.substr(0, "System.".length) == "System.")
                moduleFullTypeName = "CoreXT" + moduleFullTypeName.substr("System".length); // ("System." maps to "CoreXT." internally to prevent compatibility issues)
            return moduleFullTypeName;
        };

        /** Parses the text (usually a file name/path) and returns the non-minified and minified versions in an array (in that order).
          * If no tokens are found, the second item in the array will be null.
          * The format of the tokens is '{min:[non-minified-text|]minified-text}', where '[...]' is optional (square brackets not included).
          */
        export function processMinifyTokens(text: string): string[] {
            var tokenRegEx = /{min:[^\|}]*?\|?[^}]*?}/gi;
            var minTokens = text.match(tokenRegEx); // (note: more than one is supported)
            var minifiedText: string = null;
            var token: string, minParts: string[];

            if (minTokens) { // (if tokens were found ...)
                minifiedText = text;

                for (var i = 0, n = minTokens.length; i < n; ++i) {
                    token = minTokens[i];
                    minParts = token.substring(5, token.length - 1).split('|');
                    if (minParts.length == 1) minParts.unshift("");
                    minifiedText = minifiedText.replace(token, minParts[1]);
                    text = text.replace(token, minParts[0]); // (delete the token(s))
                }
            }

            return [text, minifiedText];
        }

        export interface IUsingModule {
            /** Checks to see if the plugin script is already applied, and executes it if not. */
            (onready?: (mod: IModule) => any, onerror?: (mod: IModule) => any): IUsingModule;
            /** The plugin object instance details. */
            module: IModule;
            then: (success: ICallback<Loader.IResourceRequest>, error?: IErrorCallback<Loader.IResourceRequest>) => IUsingModule;
            /** Attach some dependent resources to load with the module (note: the module will not load if the required resources fail to load). */
            require: (request: Loader.IResourceRequest) => IUsingModule;
            //?include: (mod: IUsingModule) => IUsingModule; //? (dangerous and confusing to users I think in regards to module definitions)
            ready: (handler: ICallback<Loader.IResourceRequest>) => IUsingModule;
            while: (progressHandler: ICallback<Loader.IResourceRequest>) => IUsingModule;
            catch: (errorHandler: IErrorCallback<Loader.IResourceRequest>) => IUsingModule;
            finally: (cleanupHandler: ICallback<Loader.IResourceRequest>) => IUsingModule;
        }

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
        export function module(dependencies: IUsingModule[], moduleFullTypeName: string, moduleFileBasePath: string = null, requiresGlobalScope = false): IUsingModule {

            if (!moduleFullTypeName)
                throw System.Exception.from("A full type name path is expected.");

            var Path = System.IO.Path;

            // ... extract the minify-name tokens and create the proper names and paths for both min and non-min versions ...

            var results = processMinifyTokens(moduleFullTypeName);
            var minifiedFullTypeName: string = null;
            if (results[1]) {
                moduleFullTypeName = translateModuleTypeName(results[0]);
                minifiedFullTypeName = translateModuleTypeName(results[1]);
            }
            else moduleFullTypeName = translateModuleTypeName(moduleFullTypeName); // (translate "System." to "CoreXT." and "." to "CoreXT." internally)

            // ... if the JavaScript file is not given, then create the relative path to it given the full type name ...

            var path: string = moduleFileBasePath != null ? ("" + moduleFileBasePath).trim() : pluginFilesBasePath;
            var minPath: string = null;

            if (path && path.charAt(0) == '~')
                path = Path.combineURLPaths(pluginFilesBasePath, path.substring(1)); // ('~' is a request to insert the current default path; eg. "~CoreXT.System.js" for "CoreXTJS/CoreXT.System.js")

            results = processMinifyTokens(path);
            if (results[1]) {
                path = results[0];
                minPath = results[1];
            }
            else if (minifiedFullTypeName) minPath = path;

            if (!Path.hasFileExt(path, '.js')) { //&& !/^https?:\/\//.test(path)
                // ... JavaScript filename extension not found, so add it under the assumed name ...
                if (!path || path.charAt(path.length - 1) == '/')
                    path = Path.combineURLPaths(path, moduleFullTypeName + ".js");
                else
                    path += ".js";
            }
            if (minPath && !Path.hasFileExt(minPath, '.js')) { //&& !/^https?:\/\//.test(path)
                // ... JavaScript filename extension not found, so add it under the assumed name ...
                if (!minPath || minPath.charAt(minPath.length - 1) == '/')
                    minPath = Path.combineURLPaths(minPath, minifiedFullTypeName + ".js");
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

            var usingPluginFunc: IUsingModule = <IUsingModule><any>((onready?: (mod: IModule) => any, onerror?: (mod: IModule) => any) => {
                // (this is called to trigger the loading of the resource [scripts are only loaded on demand])

                if (onready === void 0 && onerror === void 0 && mod.status != Loader.RequestStatuses.Executed) {
                    // ... if no callbacks are given, this is a request to CONFIRM that a script is executed, and to execute it if not ...
                    var msg = '';
                    if (mod.status >= Loader.RequestStatuses.Waiting) {
                        onReadyforUse.call(mod, mod);
                        return usingPluginFunc;
                    } if (mod.status == Loader.RequestStatuses.Error)
                        msg = "It is in an error state.";
                    else if (mod.status == Loader.RequestStatuses.Pending)
                        msg = "It has not been requested to load.  Either supply a callback to execute when the module is ready to be used, or add it as a dependency to the requesting module.";
                    else if (mod.status < Loader.RequestStatuses.Waiting)
                        msg = "It is still loading and is not yet ready.  Either supply a callback to execute when the module is ready to be used, or add it as a dependency to the requesting module.";
                    throw System.Exception.from("Cannot use module '" + mod.fullname + "': " + msg, mod);
                }

                function onReadyforUse(mod: IModule): any {
                    try {
                        // ... execute the script ...
                        mod.execute();
                        mod.status = Loader.RequestStatuses.Executed;
                        if (onready)
                            onready(mod);
                    } catch (e) {
                        mod.setError("Error executing module script:", e);
                        if (onerror)
                            onerror.call(mod, mod);
                        throw e; // (pass along to the resource loader)
                    }
                }

                // ... request to load the module and execute the script ...

                switch (mod.status) {
                    case Loader.RequestStatuses.Error: throw CoreXT.System.Exception.from("The module '" + mod.fullname + "' is in an error state and cannot be used.", mod);
                    case Loader.RequestStatuses.Pending: mod.start(); break; // (the module is not yet ready and cannot be executed right now; attach callbacks...)
                    case Loader.RequestStatuses.Loading: mod.catch(onerror); break;
                    case Loader.RequestStatuses.Loaded:
                    case Loader.RequestStatuses.Waiting:
                    case Loader.RequestStatuses.Ready:
                    case Loader.RequestStatuses.Executed: mod.ready(onReadyforUse); break;
                }

                return usingPluginFunc;
            });

            usingPluginFunc.module = mod;

            usingPluginFunc.then = (success, error) => { mod.then(success, error); return this; };
            usingPluginFunc.require = (request: Loader.IResourceRequest) => { request.include(mod); return this; };
            //?usingPluginFunc.include = (dependantMod: IUsingModule) => { mod.include(dependantMod.module); return dependantMod; };
            usingPluginFunc.ready = (handler: ICallback<Loader.IResourceRequest>) => { mod.ready(handler); return this; };
            usingPluginFunc.while = (progressHandler: ICallback<Loader.IResourceRequest>) => { mod.while(progressHandler); return this; };
            usingPluginFunc.catch = (errorHandler: IErrorCallback<Loader.IResourceRequest>) => { mod.catch(errorHandler); return this; };
            usingPluginFunc.finally = (cleanupHandler: ICallback<Loader.IResourceRequest>) => { mod.finally(cleanupHandler); return this; };

            return usingPluginFunc;
        };
    }

    // =======================================================================================================================

    /** Use to compile & execute required modules as they are needed.
      * By default, modules (scripts) are not executed immediately upon loading.  This makes page loading more efficient.
      */
    export import using = Scripts.Modules;

    // =======================================================================================================================
}

// ###########################################################################################################################


/** Used to load, compile & execute required plugin scripts. */
if (!this['using'])
    var using = CoreXT.using; // (users should reference "using.", but "CoreXT.using" can be used if the global 'using' is needed for something else)

// ###########################################################################################################################
