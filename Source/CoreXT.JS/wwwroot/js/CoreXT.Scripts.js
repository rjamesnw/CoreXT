var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CoreXT;
(function (CoreXT) {
    var Scripts;
    (function (Scripts) {
        CoreXT.registerNamespace("CoreXT", "Scripts");
        Scripts.MANIFEST_DEPENDENCIES_REGEX = /\bmodule\s*\(\s*\[(.*)\]/gim;
        function fullTypeNameToFolderPath(fullTypeName) {
            if (fullTypeName === void 0 || fullTypeName === null)
                throw CoreXT.System.Exception.from("A full type name was expected, but '" + fullTypeName + "' was given.");
            var parts = fullTypeName.split('.');
            parts.splice(parts.length - 1, 1);
            return parts.join('/');
        }
        Scripts.fullTypeNameToFolderPath = fullTypeNameToFolderPath;
        Scripts.ScriptResource = CoreXT.ClassFactory(Scripts, CoreXT.Loader.ResourceRequest, function (base) {
            var ScriptResource = (function (_super) {
                __extends(ScriptResource, _super);
                function ScriptResource() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                ScriptResource.prototype.registerGlobal = function (name, initialValue, asHostGlobal) {
                    return CoreXT.Globals.register(this, name, initialValue, asHostGlobal);
                };
                ScriptResource.prototype.globalExists = function (name) {
                    return CoreXT.Globals.exists(this, name);
                };
                ScriptResource.prototype.eraseGlobal = function (name) {
                    return CoreXT.Globals.erase(this, name);
                };
                ScriptResource.prototype.clearGlobals = function () {
                    return CoreXT.Globals.clear(this);
                };
                ScriptResource.prototype.setGlobalValue = function (name, value) {
                    return CoreXT.Globals.setValue(this, name, value);
                };
                ScriptResource.prototype.getGlobalValue = function (name) {
                    return CoreXT.Globals.getValue(this, name);
                };
                ScriptResource.ScriptResourceFactory = (function (_super) {
                    __extends(Factory, _super);
                    function Factory() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    Factory['new'] = function (url) { return null; };
                    Factory.init = function (o, isnew, url) {
                        this.super.init(o, isnew, url, CoreXT.Loader.ResourceTypes.Application_Script);
                    };
                    return Factory;
                }(CoreXT.FactoryBase(ScriptResource, base["ResourceRequestFactory"])));
                return ScriptResource;
            }(base));
            return [ScriptResource, ScriptResource["ScriptResourceFactory"]];
        }, "ScriptResource");
        Scripts.Manifest = CoreXT.ClassFactory(Scripts, Scripts.ScriptResource, function (base) {
            var Manifest = (function (_super) {
                __extends(Manifest, _super);
                function Manifest() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Manifest.ManifestFactory = (function (_super) {
                    __extends(Factory, _super);
                    function Factory() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    Factory['new'] = function (url) { return null; };
                    Factory.init = function (o, isnew, url) {
                        this.super.init(o, isnew, url);
                    };
                    return Factory;
                }(CoreXT.FactoryBase(Scripts.ScriptResource, base["ScriptResourceFactory"])));
                Manifest = __decorate([
                    CoreXT.sealed
                ], Manifest);
                return Manifest;
            }(base));
            return [Manifest, Manifest["ManifestFactory"]];
        }, "Manifest");
        var _manifests = [];
        var _manifestsByURL = {};
        function getManifest(path) {
            var _this = this;
            if (path == void 0 || path === null)
                path = "";
            if (typeof path != 'string')
                path = "" + path;
            if (path == "")
                path = "manifest";
            if (/((?:^|\/|\.)manifest)$/i.test(path))
                path += ".js";
            var request = _manifestsByURL[path];
            if (request)
                return request;
            request = (Scripts.Manifest.new(path)).then(function (request) {
                if (request.data == void 0 || request.data == null)
                    return;
                var script = (typeof request.data == 'string' ? request.data : '' + request.data);
                if (script) {
                    var dependencyGroups = script.match(Scripts.MANIFEST_DEPENDENCIES_REGEX);
                    if (dependencyGroups) {
                        var dependencies = [];
                        for (var i = 1, n = dependencyGroups.length; i < n; i++) {
                            var depItems = dependencyGroups[i].split(',');
                            for (var i2 = 0, n2 = depItems.length; i2 < n2; ++i2)
                                dependencies.push(depItems[i2].trim());
                        }
                        if (dependencies.length) {
                            for (var i = 0, n = dependencies.length; i < n; ++i) {
                                var path = fullTypeNameToFolderPath(dependencies[i]);
                                getManifest(path).start().include(request);
                            }
                        }
                    }
                }
            }).ready(function (request) {
                var func = Function("manifest", request.transformedData);
                func.call(_this, request);
                request.status = CoreXT.Loader.RequestStatuses.Executed;
                request.message = "The manifest script has been executed.";
            });
            _manifests.push(request);
            _manifestsByURL[path] = request;
            return request;
        }
        Scripts.getManifest = getManifest;
        var ModuleLoadStatus;
        (function (ModuleLoadStatus) {
            ModuleLoadStatus[ModuleLoadStatus["Error"] = -1] = "Error";
            ModuleLoadStatus[ModuleLoadStatus["NotLoaded"] = 0] = "NotLoaded";
            ModuleLoadStatus[ModuleLoadStatus["Requested"] = 1] = "Requested";
            ModuleLoadStatus[ModuleLoadStatus["Waiting"] = 2] = "Waiting";
            ModuleLoadStatus[ModuleLoadStatus["InProgress"] = 3] = "InProgress";
            ModuleLoadStatus[ModuleLoadStatus["Loaded"] = 4] = "Loaded";
            ModuleLoadStatus[ModuleLoadStatus["Ready"] = 5] = "Ready";
        })(ModuleLoadStatus = Scripts.ModuleLoadStatus || (Scripts.ModuleLoadStatus = {}));
        var _modules = {};
        var _appModule = null;
        Scripts.Module = CoreXT.ClassFactory(Scripts, Scripts.ScriptResource, function (base) {
            var Module = (function (_super) {
                __extends(Module, _super);
                function Module() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.required = false;
                    _this.customWait = false;
                    _this.getVar = CoreXT.noop;
                    _this.setVar = CoreXT.noop;
                    _this.exports = {};
                    return _this;
                }
                Module.prototype.isInclude = function () { return this.url && this.fullname == this.url; };
                Module.prototype.__onLoaded = function () {
                    return this;
                };
                Module.prototype.__onReady = function (request) {
                    if (this.fullname == "app" || this.fullname == "application") {
                        _appModule = this;
                        if (_runMode)
                            _tryRunApp();
                    }
                    return this;
                };
                Module.prototype.toString = function () { return this.fullname; };
                Module.prototype.toValue = function () { return this.fullname; };
                Module.prototype.start = function () {
                    if (this.status == CoreXT.Loader.RequestStatuses.Pending && !this._moduleGlobalAccessors) {
                        this.url = CoreXT.debugMode ? this.nonMinifiedURL : (this.minifiedURL || this.nonMinifiedURL);
                        return _super.prototype.start.call(this);
                    }
                    return this;
                };
                Module.prototype.execute = function (useGlobalScope) {
                    if (useGlobalScope === void 0) { useGlobalScope = false; }
                    if (this.status == CoreXT.Loader.RequestStatuses.Ready && !this._moduleGlobalAccessors) {
                        for (var i = 0, n = this._parentRequests.length, dep; i < n; ++i)
                            if ((dep = this._parentRequests[i]).status == CoreXT.Loader.RequestStatuses.Ready)
                                dep.execute();
                        var accessors;
                        if (useGlobalScope) {
                            this.$__modFunc = new Function("module", "exports", this.data + ";\r\n return { get: function(varName) { return eval(varName); }, set: function(varName, val) { return eval(varName + ' = val;'); } };");
                            this._moduleGlobalAccessors = this.$__modFunc(this, this.exports);
                        }
                        else {
                            this._moduleGlobalAccessors = (CoreXT.safeEval(this.data), Module._globalaccessors);
                        }
                        this.getVar = this._moduleGlobalAccessors.get;
                        this.setVar = this._moduleGlobalAccessors.set;
                        this.status = CoreXT.Loader.RequestStatuses.Executed;
                    }
                };
                Module._globalaccessors = (function () { return CoreXT.safeEval("({ get: function(varName) { return CoreXT.global[varName]; }, set: function(varName, val) { return CoreXT.global[varName] = val; } })"); })();
                Module['ModuleFactory'] = (function (_super) {
                    __extends(Factory, _super);
                    function Factory() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    Factory['new'] = function (fullname, path, minifiedPath) { return null; };
                    Factory.init = function (o, isnew, fullname, url, minifiedURL) {
                        if (minifiedURL === void 0) { minifiedURL = null; }
                        this.super.init(o, isnew, CoreXT.debugMode ? url : (minifiedURL || url));
                        if (!o.type)
                            throw CoreXT.System.Exception.from("Duplicate module load request: A previous request for '" + url + "' was already made.", o);
                        o.fullname = fullname;
                        o.nonMinifiedURL = url;
                        o.minifiedURL = minifiedURL;
                        o.then(o.__onLoaded).ready(o.__onReady);
                    };
                    return Factory;
                }(CoreXT.FactoryBase(Module, base['ScriptResourceFactory'])));
                return Module;
            }(base));
            return [Module, Module["ModuleFactory"]];
        }, "Module");
        var _runMode = 0;
        function _tryRunApp() {
            if (_runMode < 2)
                if (_appModule && (_runMode == 1 || !CoreXT.host.isDebugMode() && CoreXT.debugMode != CoreXT.DebugModes.Debug_Wait)) {
                    if (_appModule.status == CoreXT.Loader.RequestStatuses.Ready)
                        _appModule.execute();
                    if (_appModule.status == CoreXT.Loader.RequestStatuses.Executed)
                        _runMode = 2;
                }
        }
        Scripts._tryRunApp = _tryRunApp;
        function runApp() {
            if (_runMode < 2) {
                _runMode = 1;
                _tryRunApp();
            }
        }
        Scripts.runApp = runApp;
        Scripts.pluginFilesBasePath = CoreXT.System.IO && CoreXT.System.IO.Path ? CoreXT.System.IO.Path.combineURLPaths(CoreXT.baseURL, "wwwroot/js/") : CoreXT.baseURL + "wwwroot/js/";
        function translateModuleTypeName(moduleFullTypeName) {
            if (moduleFullTypeName.charAt(0) == '.')
                moduleFullTypeName = "CoreXT" + moduleFullTypeName;
            else if (moduleFullTypeName == "System" || moduleFullTypeName.substr(0, "System.".length) == "System.")
                moduleFullTypeName = "CoreXT" + moduleFullTypeName.substr("System".length);
            return moduleFullTypeName;
        }
        Scripts.translateModuleTypeName = translateModuleTypeName;
        ;
        function processMinifyTokens(text) {
            var tokenRegEx = /{min:[^\|}]*?\|?[^}]*?}/gi;
            var minTokens = text.match(tokenRegEx);
            var minifiedText = null;
            var token, minParts;
            if (minTokens) {
                minifiedText = text;
                for (var i = 0, n = minTokens.length; i < n; ++i) {
                    token = minTokens[i];
                    minParts = token.substring(5, token.length - 1).split('|');
                    if (minParts.length == 1)
                        minParts.unshift("");
                    minifiedText = minifiedText.replace(token, minParts[1]);
                    text = text.replace(token, minParts[0]);
                }
            }
            return [text, minifiedText];
        }
        Scripts.processMinifyTokens = processMinifyTokens;
        function module(dependencies, moduleFullTypeName, moduleFileBasePath, requiresGlobalScope) {
            var _this = this;
            if (moduleFileBasePath === void 0) { moduleFileBasePath = null; }
            if (requiresGlobalScope === void 0) { requiresGlobalScope = false; }
            if (!moduleFullTypeName)
                throw CoreXT.System.Exception.from("A full type name path is expected.");
            var Path = CoreXT.System.IO.Path;
            var results = processMinifyTokens(moduleFullTypeName);
            var minifiedFullTypeName = null;
            if (results[1]) {
                moduleFullTypeName = translateModuleTypeName(results[0]);
                minifiedFullTypeName = translateModuleTypeName(results[1]);
            }
            else
                moduleFullTypeName = translateModuleTypeName(moduleFullTypeName);
            var path = moduleFileBasePath != null ? ("" + moduleFileBasePath).trim() : Scripts.pluginFilesBasePath;
            var minPath = null;
            if (path && path.charAt(0) == '~')
                path = Path.combineURLPaths(Scripts.pluginFilesBasePath, path.substring(1));
            results = processMinifyTokens(path);
            if (results[1]) {
                path = results[0];
                minPath = results[1];
            }
            else if (minifiedFullTypeName)
                minPath = path;
            if (!Path.hasFileExt(path, '.js')) {
                if (!path || path.charAt(path.length - 1) == '/')
                    path = Path.combineURLPaths(path, moduleFullTypeName + ".js");
                else
                    path += ".js";
            }
            if (minPath && !Path.hasFileExt(minPath, '.js')) {
                if (!minPath || minPath.charAt(minPath.length - 1) == '/')
                    minPath = Path.combineURLPaths(minPath, minifiedFullTypeName + ".js");
                else
                    minPath += ".js";
            }
            var mod = _modules[moduleFullTypeName];
            if (mod === void 0)
                _modules[moduleFullTypeName] = mod = Scripts.Module.new(moduleFullTypeName, path, minPath);
            else {
                mod.fullname = moduleFullTypeName;
                if (!mod.nonMinifiedURL)
                    mod.nonMinifiedURL = path;
                if (!mod.minifiedURL)
                    mod.minifiedURL = minPath;
            }
            if (dependencies && dependencies.length)
                for (var i = 0, n = dependencies.length; i < n; ++i)
                    dependencies[i].module.include(mod);
            var usingPluginFunc = (function (onready, onerror) {
                if (onready === void 0 && onerror === void 0 && mod.status != CoreXT.Loader.RequestStatuses.Executed) {
                    var msg = '';
                    if (mod.status >= CoreXT.Loader.RequestStatuses.Waiting) {
                        onReadyforUse.call(mod, mod);
                        return usingPluginFunc;
                    }
                    if (mod.status == CoreXT.Loader.RequestStatuses.Error)
                        msg = "It is in an error state.";
                    else if (mod.status == CoreXT.Loader.RequestStatuses.Pending)
                        msg = "It has not been requested to load.  Either supply a callback to execute when the module is ready to be used, or add it as a dependency to the requesting module.";
                    else if (mod.status < CoreXT.Loader.RequestStatuses.Waiting)
                        msg = "It is still loading and is not yet ready.  Either supply a callback to execute when the module is ready to be used, or add it as a dependency to the requesting module.";
                    throw CoreXT.System.Exception.from("Cannot use module '" + mod.fullname + "': " + msg, mod);
                }
                function onReadyforUse(mod) {
                    try {
                        mod.execute();
                        mod.status = CoreXT.Loader.RequestStatuses.Executed;
                        if (onready)
                            onready(mod);
                    }
                    catch (e) {
                        mod.setError("Error executing module script:", e);
                        if (onerror)
                            onerror.call(mod, mod);
                        throw e;
                    }
                }
                switch (mod.status) {
                    case CoreXT.Loader.RequestStatuses.Error: throw CoreXT.System.Exception.from("The module '" + mod.fullname + "' is in an error state and cannot be used.", mod);
                    case CoreXT.Loader.RequestStatuses.Pending:
                        mod.start();
                        break;
                    case CoreXT.Loader.RequestStatuses.Loading:
                        mod.catch(onerror);
                        break;
                    case CoreXT.Loader.RequestStatuses.Loaded:
                    case CoreXT.Loader.RequestStatuses.Waiting:
                    case CoreXT.Loader.RequestStatuses.Ready:
                    case CoreXT.Loader.RequestStatuses.Executed:
                        mod.ready(onReadyforUse);
                        break;
                }
                return usingPluginFunc;
            });
            usingPluginFunc.module = mod;
            usingPluginFunc.then = function (success, error) { mod.then(success, error); return _this; };
            usingPluginFunc.require = function (request) { request.include(mod); return _this; };
            usingPluginFunc.ready = function (handler) { mod.ready(handler); return _this; };
            usingPluginFunc.while = function (progressHandler) { mod.while(progressHandler); return _this; };
            usingPluginFunc.catch = function (errorHandler) { mod.catch(errorHandler); return _this; };
            usingPluginFunc.finally = function (cleanupHandler) { mod.finally(cleanupHandler); return _this; };
            return usingPluginFunc;
        }
        Scripts.module = module;
        ;
    })(Scripts = CoreXT.Scripts || (CoreXT.Scripts = {}));
    CoreXT.using = Scripts.Modules;
})(CoreXT || (CoreXT = {}));
if (!this['using'])
    var using = CoreXT.using;
//# sourceMappingURL=CoreXT.Scripts.js.map