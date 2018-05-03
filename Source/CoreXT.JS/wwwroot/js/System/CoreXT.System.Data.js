var CoreXT;
(function (CoreXT) {
    var System;
    (function (System) {
        var Data;
        (function (Data) {
            var JSON;
            (function (JSON) {
                function ToObject(jsonText) {
                    if (typeof jsonText !== "string" || !jsonText)
                        return null;
                    jsonText = jsonText.trim();
                    if (/^[\],:{}\s]*$/.test(jsonText.replace(/\\["\\\/bfnrtu]/g, '@').
                        replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
                        replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                        return window && window.JSON && window.JSON.parse ?
                            window.JSON.parse(jsonText) : (new Function("return " + jsonText))();
                    }
                    else {
                        throw System.Exception.from('Invalid JSON: "' + jsonText + '"');
                    }
                }
                JSON.ToObject = ToObject;
            })(JSON = Data.JSON || (Data.JSON = {}));
            var PropertyPathEndpoint = (function () {
                function PropertyPathEndpoint(object, propertyName, propertyIndex, parameters) {
                    this.object = object;
                    this.propertyName = propertyName;
                    this.propertyIndex = propertyIndex;
                    this.arguments = this.arguments;
                }
                PropertyPathEndpoint.prototype.getValue = function () {
                    if (this.object === void 0)
                        return void 0;
                    var value = this.object[this.propertyName];
                    if (this.arguments) {
                        if (!this.arguments.length)
                            value = value.apply(this.object);
                        else
                            value = value.apply(this.object, this.arguments);
                    }
                    else if (this.propertyIndex !== void 0)
                        value = value[this.propertyIndex];
                    return value;
                };
                return PropertyPathEndpoint;
            }());
            Data.PropertyPathEndpoint = PropertyPathEndpoint;
            var PropertyPath = (function () {
                function PropertyPath(origin, path) {
                    this.origin = origin;
                    this.parsePath(path);
                }
                PropertyPath.prototype.parsePath = function (path) {
                    if (path) {
                        if (typeof path != 'string')
                            path = '' + path;
                        var parts = path.match(PropertyPath.__PathPartRegEx);
                        var lastQuote = "";
                        var pname, index, arg;
                        for (var i = 0, n = parts.length; i < n; ++i) {
                        }
                    }
                    return this;
                };
                PropertyPath.prototype.__getPathString = function (level) {
                    var path = "", pname, args, index;
                    for (var i = 0, n = this.namePath.length; i < n && i <= level; ++i) {
                        pname = this.namePath[i];
                        if (pname)
                            path = path ? path + "." + pname : pname;
                        args = this.arguments[i];
                        if (args) {
                            if (!args.length)
                                path += "()";
                            else
                                path += "(" + this.arguments.join(",") + ")";
                        }
                        else {
                            index = this.indexes[i];
                            if (index !== void 0)
                                path += "[" + index + "]";
                        }
                    }
                    return path;
                };
                PropertyPath.prototype.getEndpoint = function (origin, existingEndpoint) {
                    if (!this.namePath || !this.namePath.length)
                        return null;
                    var i = 0, endpoint = existingEndpoint || new PropertyPathEndpoint();
                    if (typeof endpoint.getValue != 'function')
                        throw System.Exception.from("The existing endpoint object is not a valid 'PropertyPathEndpoint' instance.", this);
                    endpoint.object = origin;
                    endpoint.propertyName = this.namePath[0];
                    endpoint.propertyIndex = this.indexes[0];
                    endpoint.arguments = this.arguments[0];
                    while (i < this.namePath.length) {
                        endpoint.object = endpoint.getValue();
                        if (endpoint.object === void 0)
                            throw System.Exception.from("Invalid property path: " + this.__getPathString(i), this);
                        i++;
                        endpoint.propertyName = this.namePath[i];
                        endpoint.propertyIndex = this.indexes[i];
                        endpoint.arguments = this.arguments[i];
                    }
                    return endpoint;
                };
                PropertyPath.__PathPartRegEx = /\[|\]|\(|\)|"|'|\\|\.|[^\[\]\(\)"'\.\\]*/gi;
                return PropertyPath;
            }());
            Data.PropertyPath = PropertyPath;
            var BindingMode;
            (function (BindingMode) {
                BindingMode[BindingMode["TwoWay"] = 0] = "TwoWay";
                BindingMode[BindingMode["OneWay"] = 1] = "OneWay";
                BindingMode[BindingMode["OneWayToSource"] = 2] = "OneWayToSource";
                BindingMode[BindingMode["OneTime"] = 3] = "OneTime";
            })(BindingMode = Data.BindingMode || (Data.BindingMode = {}));
            var Binding = (function () {
                function Binding(source, path, targetType, mode, defaultValue, converter, converterParameter) {
                    if (mode === void 0) { mode = BindingMode.TwoWay; }
                    if (defaultValue === void 0) { defaultValue = void 0; }
                    if (converter === void 0) { converter = null; }
                    if (converterParameter === void 0) { converterParameter = null; }
                    this.propertyPath = new PropertyPath(source, path);
                    this.source = source;
                    this.targetType = targetType;
                    this.mode = mode;
                    this.defaultValue = defaultValue;
                    this.converter = converter;
                    this.converterParameter = converterParameter;
                    this.updateEndpoint();
                }
                Binding.prototype.updateEndpoint = function () {
                    this.sourceEndpoint = this.propertyPath.getEndpoint();
                };
                Binding.prototype.getValue = function (type, parameter) {
                    if (type === void 0) { type = "any"; }
                    if (parameter === void 0) { parameter = null; }
                    if (!this.sourceEndpoint)
                        this.updateEndpoint();
                    if (this.converter && typeof this.converter.convert == 'function')
                        var value = this.converter.convert(this.sourceEndpoint.getValue(), this.targetType, this.converterParameter);
                    else
                        var value = this.sourceEndpoint.getValue();
                    return value === void 0 ? this.defaultValue : value;
                };
                return Binding;
            }());
            Data.Binding = Binding;
        })(Data = System.Data || (System.Data = {}));
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.Data.js.map