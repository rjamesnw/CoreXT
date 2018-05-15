// #######################################################################################
// Application Windows
// #######################################################################################

namespace CoreXT.System {
    /** Provides types and utilities for working with formatted data from various sources. */
    export namespace Data {
        // =============================================================================================

        /** Provides basic functions for working with JSON data. */
        export namespace JSON {
            registerNamespace("CoreXT", "System", "Data", "JSON");
            // ===================================================================================================================

            /** Converts a JSON string into an object with nested objects as required.
            */
            export function ToObject(jsonText: string): NativeTypes.IObject {
                if (typeof jsonText !== "string" || !jsonText)
                    return null;

                // ... some browsers (IE) may not be able to handle the whitespace before or after the text ...
                jsonText = jsonText.trim();

                // ... validate the JSON format ...
                // (Note: regex is from "https://github.com/douglascrockford/JSON-js/blob/master/json2.js" [by Douglas Crockford])
                if (/^[\],:{}\s]*$/.test(jsonText.replace(/\\["\\\/bfnrtu]/g, '@').
                    replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
                    replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

                    // Try to use the native JSON parser first
                    return window && (<any>window).JSON && (<any>window).JSON.parse ?
                        (<any>window).JSON.parse(jsonText) : (new Function("return " + jsonText))();
                } else {
                    throw Exception.from('Invalid JSON: "' + jsonText + '"');
                }
            }

            // ===================================================================================================================
        }

        // =============================================================================================

        /** Represents a value conversion object. */
        export interface IValueConverter {
            convert(value: any, type: string, parameter: any): any;
            convertBack(value: any, type: string, parameter: any): any;
        }

        // =============================================================================================

        export class PropertyPathEndpoint {
            /** The object that is the target of this property path (which is the SOURCE of a binding). */
            object: IndexedObject;
            /** The property name on the end object for this property path. */
            propertyName: string;
            /** An index (number/string, if any) for the end property of this path.  Leave this undefined to ignore.
            * Note: This is ignored if the resulting value is a function, and arguments are defined (even if the array is empty).
            */
            propertyIndex: any;
            /** If the end property is a function reference, this holds the comma separated argument values.
            * Note: Leave this undefined to simply reference a function property.  If defined, the function
            * property will be called (even if the array is empty), and the return value will be used instead.
            */
            arguments: any[];

            constructor(object?: IndexedObject, propertyName?: string, propertyIndex?: any, parameters?: any[]) {
                this.object = object;
                this.propertyName = propertyName;
                this.propertyIndex = propertyIndex;
                this.arguments = this.arguments;
            }

            /** Returns the value referenced by the associated endpoint information. */
            getValue(): any {
                if (this.object === void 0) return void 0;
                var value = this.object[this.propertyName];
                if (this.arguments) { // (if no parameter list, then only the function value itself will be returned)
                    if (!this.arguments.length)
                        value = (<Function>value).apply(this.object);
                    else
                        value = (<Function>value).apply(this.object, this.arguments);
                } else if (this.propertyIndex !== void 0) // (note: ignored if the value is a function with parameters)
                    value = value[this.propertyIndex];
                return value;
            }
        }

        /** Holds details about the value source or target of a binding. */
        export class PropertyPath {
            // ---------------------------------------------------------------------------------------------------------------

            private static __PathPartRegEx = /\[|\]|\(|\)|"|'|\\|\.|[^\[\]\(\)"'\.\\]*/gi;

            origin: {};
            namePath: Array<string>;
            arguments: Array<any[]>;
            indexes: Array<any>;

            // ---------------------------------------------------------------------------------------------------------------

            constructor(origin: {}, path: string) {
                this.origin = origin;
                this.parsePath(path);
            }

            // ---------------------------------------------------------------------------------------------------------------

            /** Parses the specified path string and updates this PropertyPath instance with the details. */
            parsePath(path: string): PropertyPath {
                if (path) {
                    if (typeof path != 'string')
                        path = '' + path;
                    // ... use the native regex to parse out the path parts (including the symbols) ...
                    var parts = path.match(PropertyPath.__PathPartRegEx);

                    var lastQuote = ""; // (the end quote must match this if a quote is found)
                    var pname, index, arg;

                    for (var i = 0, n = parts.length; i < n; ++i) {
                    }
                }
                return this;
            }

            // ---------------------------------------------------------------------------------------------------------------

            /** Reconstructs the property path string using the internal path array details. */
            private __getPathString(level: number): string {
                var path = "", pname: string, args: any[], index: number;
                for (var i = 0, n = this.namePath.length; i < n && i <= level; ++i) {
                    pname = this.namePath[i];
                    if (pname)
                        path = path ? path + "." + pname : pname;
                    args = this.arguments[i];
                    if (args) { // (if no parameter list, then only the function value itself is being referenced)
                        if (!args.length)
                            path += "()";
                        else
                            path += "(" + this.arguments.join(",") + ")";
                    } else {
                        index = this.indexes[i];
                        if (index !== void 0) // (note: ignored if the value is a function with parameters)
                            path += "[" + index + "]";
                    }
                }
                return path;
            }

            /** Traverses the property path information and returns the final endpoint details.
            * @param {object} origin The root object to begin the traversal on.  If an object was supplied to the constructor,
            * then this parameter is optional; though, it can be used to override that object (for the call only).
            * @param {PropertyPathEndpoint} existingEndpoint An optional existing endpoint instance if available, otherwise leave this undefined.
            */
            getEndpoint(origin?: {}, existingEndpoint?: PropertyPathEndpoint): PropertyPathEndpoint {
                if (!this.namePath || !this.namePath.length) return null;
                var i = 0, endpoint = existingEndpoint || new PropertyPathEndpoint();

                if (typeof endpoint.getValue != 'function')
                    throw Exception.from("The existing endpoint object is not a valid 'PropertyPathEndpoint' instance.", this);

                endpoint.object = origin;
                endpoint.propertyName = this.namePath[0];
                endpoint.propertyIndex = this.indexes[0];
                endpoint.arguments = this.arguments[0];

                while (i < this.namePath.length) {
                    endpoint.object = endpoint.getValue();
                    if (endpoint.object === void 0)
                        throw Exception.from("Invalid property path: " + this.__getPathString(i), this);
                    i++;
                    endpoint.propertyName = this.namePath[i];
                    endpoint.propertyIndex = this.indexes[i];
                    endpoint.arguments = this.arguments[i];
                }

                return endpoint;
            }

            // ---------------------------------------------------------------------------------------------------------------
        }

        /** The type of binding between object properties (used by System.IO.Data.Binding). */
        export enum BindingMode {
            /** Updates either the target or source property to the other when either of them change. */
            TwoWay,
            /** Updates only the target property when the source changes. */
            OneWay,
            /** Inverts OneWay mode so that the source updates when the target changes. */
            OneWayToSource,
            /** Updates only the target property once when bound.  Subsequent source changes are ignored. */
            OneTime
        }

        /** Represents a binding between object properties. */
        export class Binding {
            /** The root object for the property path. */
            source: {};
            /** The 'PropertyPath' object which describes the property path to the bound property. */
            propertyPath: PropertyPath;
            /** The endpoint reference for the source value of this binding. */
            sourceEndpoint: PropertyPathEndpoint;

            mode: BindingMode;
            defaultValue: any;
            converter: IValueConverter;
            targetType: string;
            converterParameter: string;

            /** Creates a new Binding object to update an object property when another changes.
            * @param {object} source The source object that is the root to which the property path is applied for the binding.
            * @param {string} path The property path to the bound property.
            * @param {string} targetType The expected type of the target .
            * @param {BindingMode} mode The direction of data updates.
            * @param {any} defaultValue A default value to use when binding is unable to return a value, or the value is 'undefined'.
            * Note: If 'defaultValue' is undefined when a property path fails, an error will occur.
            * @param {IValueConverter} converter The converter used to convert values for this binding..
            */
            constructor(source: {}, path: string, targetType: string, mode: BindingMode = BindingMode.TwoWay,
                defaultValue: any = void 0, converter: IValueConverter = null, converterParameter: string = null) {
                this.propertyPath = new PropertyPath(source, path);
                this.source = source;
                this.targetType = targetType;
                this.mode = mode;
                this.defaultValue = defaultValue;
                this.converter = converter;
                this.converterParameter = converterParameter;
                this.updateEndpoint();
            }

            /** Updates the source endpoint using the current property path settings. */
            updateEndpoint(): void {
                this.sourceEndpoint = this.propertyPath.getEndpoint();
            }

            /** Returns the value referenced by the source endpoint object, and applies any associated converter. */
            getValue(type: string = "any", parameter: string = null): any {
                if (!this.sourceEndpoint)
                    this.updateEndpoint();
                if (this.converter && typeof this.converter.convert == 'function')
                    var value = this.converter.convert(this.sourceEndpoint.getValue(), this.targetType, this.converterParameter);
                else
                    var value = this.sourceEndpoint.getValue();
                return value === void 0 ? this.defaultValue : value;
            }
        }

        // =============================================================================================
    }
}
