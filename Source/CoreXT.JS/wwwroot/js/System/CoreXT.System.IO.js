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
var CoreXT;
(function (CoreXT) {
    var System;
    (function (System) {
        var IO;
        (function (IO) {
            var Path;
            (function (Path) {
                CoreXT.registerNamespace("CoreXT", "System", "IO", "Path");
                function combineURLPaths(path1, path2) {
                    if (path1.length > 0 && path1.charAt(path1.length - 1) != '/') {
                        if (path2.length > 0 && path2.charAt(0) != '/')
                            path1 += '/';
                    }
                    else if (path2.length > 0 && path2.charAt(0) == '/')
                        path2 = path2.substring(1);
                    return path1 + path2;
                }
                Path.combineURLPaths = combineURLPaths;
                ;
                function hasFileExt(pathToFile, ext) {
                    if (ext.length > 0 && ext.charAt(0) != '.')
                        ext = '.' + ext;
                    return pathToFile.lastIndexOf(ext) == pathToFile.length - ext.length || pathToFile.indexOf("?") >= 0 || pathToFile.indexOf("#") >= 0;
                }
                Path.hasFileExt = hasFileExt;
                Path.QUERY_STRING_REGEX = /[?|&][a-zA-Z0-9-._]+(?:=[^&#$]*)?/gi;
                Path.Query = CoreXT.ClassFactory(Path, null, function (base) {
                    var Query = (function () {
                        function Query() {
                            this.values = {};
                        }
                        Query.prototype.addOrUpdate = function (newValues) {
                            if (newValues)
                                for (var pname in newValues)
                                    this.values[pname] = newValues[pname];
                            return this;
                        };
                        Query.prototype.rename = function (newNames) {
                            for (var pname in this.values)
                                for (var pexistingname in newNames)
                                    if (pexistingname == pname && newNames[pexistingname] && newNames[pexistingname] != pname) {
                                        this.values[newNames[pexistingname]] = this.values[pexistingname];
                                        delete this.values[pexistingname];
                                    }
                            return this;
                        };
                        Query.prototype.remove = function (namesToDelete) {
                            if (namesToDelete && namesToDelete.length)
                                for (var i = 0, n = namesToDelete.length; i < n; ++i)
                                    if (this.values[namesToDelete[i]])
                                        delete this.values[namesToDelete[i]];
                            return this;
                        };
                        Query.prototype.clone = function () {
                            var q = Path.Query.new();
                            for (var pname in this.values)
                                q.values[pname] = this.values[pname];
                            return q;
                        };
                        Query.prototype.appendTo = function (uri) {
                            return uri.match(/^[^\?]*/g)[0] + this.toString();
                        };
                        Query.prototype.getValue = function (name, defaultValueIfUndefined) {
                            var value = this.values[name];
                            if (value === void 0)
                                value = defaultValueIfUndefined;
                            return value;
                        };
                        Query.prototype.getLCValue = function (name, defaultValueIfUndefined) {
                            var value = this.values[name];
                            if (value === void 0)
                                value = defaultValueIfUndefined;
                            return ("" + value).toLowerCase();
                        };
                        Query.prototype.getUCValue = function (name, defaultValueIfUndefined) {
                            var value = this.values[name];
                            if (value === void 0)
                                value = defaultValueIfUndefined;
                            return ("" + value).toUpperCase();
                        };
                        Query.prototype.getNumber = function (name, defaultValueIfUndefined) {
                            var value = parseFloat(this.values[name]);
                            if (value === void 0)
                                value = defaultValueIfUndefined;
                            return value;
                        };
                        Query.prototype.encodeValue = function (name) {
                            var value = this.values[name], result;
                            if (value !== void 0 && value !== null) {
                                this.values[name] = result = System.Text.Encoding.base64Encode(value, System.Text.Encoding.Base64Modes.URI);
                            }
                            return result;
                        };
                        Query.prototype.decodeValue = function (name) {
                            var value = this.values[name], result;
                            if (value !== void 0 && value !== null) {
                                this.values[name] = result = System.Text.Encoding.base64Decode(value, System.Text.Encoding.Base64Modes.URI);
                            }
                            return result;
                        };
                        Query.prototype.encodeAll = function () {
                            for (var p in this.values)
                                this.encodeValue(p);
                        };
                        Query.prototype.decodeAll = function () {
                            for (var p in this.values)
                                this.decodeValue(p);
                        };
                        Query.prototype.toString = function () {
                            var qstr = "";
                            for (var pname in this.values)
                                if (this.values[pname] !== void 0)
                                    qstr += (qstr ? "&" : "?") + encodeURIComponent(pname) + "=" + encodeURIComponent(this.values[pname]);
                            return qstr;
                        };
                        Query['QueryFactory'] = (function (_super) {
                            __extends(Factory, _super);
                            function Factory() {
                                return _super !== null && _super.apply(this, arguments) || this;
                            }
                            Factory['new'] = function (searchString, makeNamesLowercase) {
                                if (searchString === void 0) { searchString = null; }
                                if (makeNamesLowercase === void 0) { makeNamesLowercase = false; }
                                return null;
                            };
                            Factory.init = function (o, isnew, searchString, makeNamesLowercase) {
                                if (searchString === void 0) { searchString = null; }
                                if (makeNamesLowercase === void 0) { makeNamesLowercase = false; }
                                if (searchString) {
                                    var nameValuePairs = searchString.match(Path.QUERY_STRING_REGEX);
                                    var i, n, eqIndex, nameValue;
                                    if (nameValuePairs)
                                        for (var i = 0, n = nameValuePairs.length; i < n; ++i) {
                                            nameValue = nameValuePairs[i];
                                            eqIndex = nameValue.indexOf('=');
                                            if (eqIndex == -1)
                                                eqIndex = nameValue.length;
                                            if (makeNamesLowercase)
                                                o.values[decodeURIComponent(nameValue).substring(1, eqIndex).toLowerCase()] = decodeURIComponent(nameValue.substring(eqIndex + 1));
                                            else
                                                o.values[decodeURIComponent(nameValue).substring(1, eqIndex)] = decodeURIComponent(nameValue.substring(eqIndex + 1));
                                        }
                                }
                            };
                            return Factory;
                        }(CoreXT.FactoryBase(Query, null)));
                        return Query;
                    }());
                    return [Query, Query["QueryFactory"]];
                }, "Query");
                Path.pageQuery = Path.Query.new(location.href);
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
                    wait();
                    setTimeout(function () { location.href = url; }, 1);
                }
                Path.setLocation = setLocation;
                function map(path) {
                    if (!/^\w+:/.test(path) && path.charAt(0) == '/')
                        return Path.combineURLPaths(CoreXT.baseURL, path);
                    else
                        return path;
                }
                Path.map = map;
                function isView(action, controller) {
                    if (controller === void 0) { controller = "home"; }
                    return new RegExp("^\/" + controller + "\/" + action + "(?:[\/?&#])?", "gi").test(location.pathname);
                }
                Path.isView = isView;
            })(Path = IO.Path || (IO.Path = {}));
            IO.onBeginWait = System.Events.EventDispatcher.new(IO, "onBeginWait", true);
            IO.onEndWait = System.Events.EventDispatcher.new(IO, "onEndWait", true);
            var __waitRequestCounter = 0;
            function wait(msg) {
                if (msg === void 0) { msg = "Please wait ..."; }
                if (__waitRequestCounter == 0)
                    IO.onBeginWait.dispatch(msg);
                __waitRequestCounter++;
            }
            IO.wait = wait;
            function closeWait(force) {
                if (force === void 0) { force = false; }
                if (__waitRequestCounter > 0 && (force || --__waitRequestCounter == 0)) {
                    __waitRequestCounter = 0;
                    IO.onEndWait.dispatch();
                }
            }
            IO.closeWait = closeWait;
        })(IO = System.IO || (System.IO = {}));
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.IO.js.map