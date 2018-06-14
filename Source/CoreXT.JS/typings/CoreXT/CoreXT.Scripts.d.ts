/** Types and functions for loading scripts into the CoreXT system. */
declare namespace CoreXT {
    namespace Scripts {
        /** Used to strip out manifest dependencies. */
        var MANIFEST_DEPENDENCIES_REGEX: RegExp;
        /**
         * A code-completion friendly list of registered modules.
         * Note: Though module references may show in code completion, the related manifests in each plugin location must be
         * loaded first before a module is ready for use.
         * Usage: To load a module, call it using the '[CoreXT.]using.ModuleName(...)' syntax.
         * Note: If you are developing your own module, use a proper name path under the Modules namespace -
         * typically something like 'namespace CoreXT.Scripts.Modules { /** Description... * / export namespace CompanyOrWebsite.YourModule { ... } }'
         * (take note that the comments are in their own scope, which is required as well).
         * Remember: You can create a sub-namespace name with specific versions of your scripts (i.e. 'export namespace Company.MyScript.v1_0_0').
         */
        namespace Modules {
            /**
             * Supported CoreXT system modules.
             * Note: If you are developing your own module, use a proper name path under the parent 'Modules' namespace -
             * typically something like 'namespace CoreXT.Scripts.Modules { export namespace CompanyOrWebsite.YourModule { ... } }',
             * much like how GitHub URLs look like (i.e. 'Microsoft/TypeScript' might be 'Microsoft.TypeScript')
             * * Do not put custom modules directly in the 'CoreXT.Scripts.Modules.System' namespace, nor any sub-namespace from there.
             * Remember: You can create a sub-namespace name with specific versions of your scripts (i.e. 'export namespace Company.MyScript.v1_0_0').
             */
            namespace System {
            }
        }
        /**
         * Takes a full type name and determines the expected path for the library.
         * This is used internally to find manifest file locations.
         */
        function moduleNamespaceToFolderPath(nsName: string): string;
        const ScriptResource_base: {
            new (...args: any[]): {
                $__disposing?: boolean;
                $__disposed?: boolean;
            };
            $__type: IType<object>;
            readonly super: typeof System.IO.ResourceRequest;
            'new'?(...args: any[]): any;
            init?(o: object, isnew: boolean, ...args: any[]): void;
            $__register<TClass extends IType<object>, TFactory extends IFactory<IType<object>, NewDelegate<object>, InitDelegate<object>> & IType<object>>(this: TFactory & ITypeInfo & {
                $__type: TClass;
            }, namespace: object, addMemberTypeInfo?: boolean): TFactory;
        } & (new () => object);
        class ScriptResource extends ScriptResource_base {
            /** Returns a new module object only - does not load it. */
            static 'new': (url: string) => IScriptResource;
            /** Returns a new module object only - does not load it. */
            static init: (o: IScriptResource, isnew: boolean, url: string) => void;
        }
        namespace ScriptResource {
            const $__type_base: typeof System.IO.ResourceRequest.$__type;
            class $__type extends $__type_base {
                /** A convenient script resource method that simply Calls 'Globals.register()'. For help, see 'CoreXT.Globals' and 'Globals.register()'. */
                registerGlobal<T>(name: string, initialValue: T, asHostGlobal?: boolean): string;
                /** For help, see 'CoreXT.Globals'. */
                globalExists<T>(name: string): boolean;
                /** For help, see 'CoreXT.Globals'. */
                eraseGlobal<T>(name: string): boolean;
                /** For help, see 'CoreXT.Globals'. */
                clearGlobals<T>(): boolean;
                /** For help, see 'CoreXT.Globals'. */
                setGlobalValue<T>(name: string, value: T): T;
                /** For help, see 'CoreXT.Globals'. */
                getGlobalValue<T>(name: string): T;
            }
        }
        interface IScriptResource extends ScriptResource.$__type {
        }
        const Manifest_base: {
            new (...args: any[]): {
                $__disposing?: boolean;
                $__disposed?: boolean;
            };
            $__type: IType<object>;
            readonly super: typeof ScriptResource;
            'new'?(...args: any[]): any;
            init?(o: object, isnew: boolean, ...args: any[]): void;
            $__register<TClass extends IType<object>, TFactory extends IFactory<IType<object>, NewDelegate<object>, InitDelegate<object>> & IType<object>>(this: TFactory & ITypeInfo & {
                $__type: TClass;
            }, namespace: object, addMemberTypeInfo?: boolean): TFactory;
        } & (new () => object);
        /**
        * Represents a loaded manifest that describes some underlying resource (typically JavaScript).
        * 'Manifest' inherits from 'ScriptResource', providing the loaded manifests the ability to register globals for the
        * CoreXT context, instead of the global 'window' context.
        */
        class Manifest extends Manifest_base {
            /** Holds variables required for manifest execution (for example, callback functions for 3rd party libraries, such as the Google Maps API). */
            static 'new': (url: string) => IManifest;
            /** Holds variables required for manifest execution (for example, callback functions for 3rd party libraries, such as the Google Maps API). */
            static init: (o: IManifest, isnew: boolean, url: string) => void;
        }
        namespace Manifest {
            const $__type_base_1: typeof ScriptResource.$__type;
            class $__type extends $__type_base_1 {
                /** A convenient script resource method that simply Calls 'Globals.register()'. For help, see 'CoreXT.Globals' and 'Globals.register()'. */
                registerGlobal<T>(name: string, initialValue: T, asHostGlobal?: boolean): string;
                /** For help, see 'CoreXT.Globals'. */
                globalExists<T>(name: string): boolean;
                /** For help, see 'CoreXT.Globals'. */
                eraseGlobal<T>(name: string): boolean;
                /** For help, see 'CoreXT.Globals'. */
                clearGlobals<T>(): boolean;
                /** For help, see 'CoreXT.Globals'. */
                setGlobalValue<T>(name: string, value: T): T;
                /** For help, see 'CoreXT.Globals'. */
                getGlobalValue<T>(name: string): T;
            }
        }
        interface IManifest extends Manifest.$__type {
        }
        /** Returns a resource loader for loading a specified manifest file from a given path (the manifest file name itself is not required).
          * To load a custom manifest file, the filename should end in either ".manifest" or ".manifest.js".
          * Call 'start()' on the returned instance to begin the loading process.
          * If the manifest contains dependencies to other manifests, an attempt will be made to load them as well.
          */
        function getManifest(path?: string): IManifest;
        /** Contains the statuses for module (script) loading and execution. */
        enum ModuleLoadStatus {
            /** The script was requested, but couldn't be loaded. */
            Error = -1,
            /** The script is not loaded. Scripts only load and execute when needed/requested. */
            NotLoaded = 0,
            /** The script was requested, but loading has not yet started. */
            Requested = 1,
            /** The script is waiting on dependents before loading. */
            Waiting = 2,
            /** The script is loading. */
            InProgress = 3,
            /** The script is now available, but has not executed yet. Scripts only execute when needed (see 'CoreXT.using'). */
            Loaded = 4,
            /** The script has been executed. */
            Ready = 5
        }
        const Module_base: {
            new (...args: any[]): {
                $__disposing?: boolean;
                $__disposed?: boolean;
            };
            $__type: IType<object>;
            readonly super: typeof ScriptResource;
            'new'?(...args: any[]): any;
            init?(o: object, isnew: boolean, ...args: any[]): void;
            $__register<TClass extends IType<object>, TFactory extends IFactory<IType<object>, NewDelegate<object>, InitDelegate<object>> & IType<object>>(this: TFactory & ITypeInfo & {
                $__type: TClass;
            }, namespace: object, addMemberTypeInfo?: boolean): TFactory;
        } & (new () => object);
        /** Contains static module properties and functions. */
        class Module extends Module_base {
            /** Returns a new module object only - does not load it. */
            static 'new': (fullname: string, url: string, minifiedUrl?: string) => IModule;
            /** Disposes this instance, sets all properties to 'undefined', and calls the constructor again (a complete reset). */
            static init: (o: IModule, isnew: boolean, fullname: string, url: string, minifiedUrl?: string) => void;
        }
        namespace Module {
            const $__type_base_2: typeof ScriptResource.$__type;
            class $__type extends $__type_base_2 {
                /** The full type name for this module. */
                fullname: string;
                /** The URL to the non-minified version of this module script. */
                nonMinifiedURL: string;
                /** The URL to the minified version of this module script. */
                minifiedURL: string;
                required: boolean;
                isInclude(): boolean;
                /** If true, then the module is waiting to complete based on some outside custom script/event. */
                customWait: boolean;
                /** Holds a reference to the executed function that wraps the loaded script. */
                private $__modFunc;
                /** Returns a variable value from the executed module's local scope.
                  * Module scripts that are wrapped in functions may have defined global variables that become locally scoped instead. In
                  * these cases, use this function to read the required values.  This is an expensive operation that should only be used to
                  * retrieve object references.  If performance is required to access non-reference values, the script must be applied to
                  * the global scope as normal.
                  */
                getVar: <T extends any>(varName: string) => T;
                setVar: <T extends any>(varName: string, value: T) => T;
                /** This 'exports' container exists to support loading client-side modules in a NodeJS-type fashion.  The main exception is that
                  * 'require()' is not supported as it is synchronous, and an asynchronous method is required on the client side.  Instead, the
                  * reference to a 'manifest' variable (of type 'CoreXT.Scripts.IManifest') is also given to the script, and can be used to
                  * further chain more modules to load.
                  * Note: 'exports' (a module-global object) does not apply to scripts executed in the global scope (i.e. if 'execute(true)' is called).
                  */
                exports: {};
                /** A temp reference to the object returned from executing the generated '$__modFunc' wrapper function. */
                private _moduleGlobalAccessors;
                private static readonly _globalaccessors;
                private __onLoaded;
                private __onReady;
                toString(): string;
                toValue(): string;
                /** Begin loading the module's script. After the loading is completed, any dependencies are automatically detected and loaded as well. */
                start(): this;
                /** Executes the underlying script by either wrapping it in another function (the default), or running it in the global window scope. */
                execute(useGlobalScope?: boolean): void;
            }
        }
        interface IModule extends InstanceType<typeof Module.$__type> {
        }
        /** Used internally to see if the application should run automatically. Developers should NOT call this directly and call 'runApp()' instead. */
        function _tryRunApp(): void;
        /** Attempts to run the application module (typically the script generated from 'app.ts'), if ready (i.e. loaded along with all dependencies).
          * If the app is not ready yet, the request is flagged to start the app automatically.
          * Note: Applications always start automatically by default, unless 'CoreXT.System.Diagnostics.debug' is set to 'Debug_Wait'.
          */
        function runApp(): void;
        /** This is the path to the root of the CoreXT JavaScript files ('CoreXT/' by default).
        * Note: This should either be empty, or always end with a URL path separator ('/') character (but the system will assume to add one anyhow if missing). */
        var pluginFilesBasePath: string;
        /** Translates a module relative or full type name to the actual type name (i.e. '.ABC' to 'CoreXT.ABC', or 'System'/'System.' to 'CoreXT'/'CoreXT.'). */
        function translateModuleTypeName(moduleFullTypeName: string): string;
        /** Parses the text (usually a file name/path) and returns the non-minified and minified versions in an array (in that order).
          * If no tokens are found, the second item in the array will be null.
          * The format of the tokens is '{min:[non-minified-text|]minified-text}', where '[...]' is optional (square brackets not included).
          */
        function processMinifyTokens(text: string): string[];
        interface IUsingModule {
            /** Checks to see if the plugin script is already applied, and executes it if not. */
            (onready?: (mod: IModule) => any, onerror?: (mod: IModule) => any): IUsingModule;
            /** The plugin object instance details. */
            module: IModule;
            then: (success: ICallback<System.IO.IResourceRequest>, error?: IErrorCallback<System.IO.IResourceRequest>) => IUsingModule;
            /** Attach some dependent resources to load with the module (note: the module will not load if the required resources fail to load). */
            require: (request: System.IO.IResourceRequest) => IUsingModule;
            ready: (handler: ICallback<System.IO.IResourceRequest>) => IUsingModule;
            while: (progressHandler: ICallback<System.IO.IResourceRequest>) => IUsingModule;
            catch: (errorHandler: IErrorCallback<System.IO.IResourceRequest>) => IUsingModule;
            finally: (cleanupHandler: ICallback<System.IO.IResourceRequest>) => IUsingModule;
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
        function module(dependencies: IUsingModule[], moduleFullTypeName: string, moduleFileBasePath?: string, requiresGlobalScope?: boolean): IUsingModule;
    }
}
