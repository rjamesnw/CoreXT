declare namespace CoreXT.System {
    /** Provides types and utilities for working with formatted data from various sources. */
    namespace Data {
        /** Provides basic functions for working with JSON data. */
        namespace JSON {
            /** Converts a JSON string into an object with nested objects as required.
            */
            function ToObject(jsonText: string): NativeTypes.IObject;
        }
        /** Represents a value conversion object. */
        interface IValueConverter {
            convert(value: any, type: string, parameter: any): any;
            convertBack(value: any, type: string, parameter: any): any;
        }
        class PropertyPathEndpoint {
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
            constructor(object?: IndexedObject, propertyName?: string, propertyIndex?: any, parameters?: any[]);
            /** Returns the value referenced by the associated endpoint information. */
            getValue(): any;
        }
        /** Holds details about the value source or target of a binding. */
        class PropertyPath {
            private static __PathPartRegEx;
            origin: {};
            namePath: Array<string>;
            arguments: Array<any[]>;
            indexes: Array<any>;
            constructor(origin: {}, path: string);
            /** Parses the specified path string and updates this PropertyPath instance with the details. */
            parsePath(path: string): PropertyPath;
            /** Reconstructs the property path string using the internal path array details. */
            private __getPathString(level);
            /** Traverses the property path information and returns the final endpoint details.
            * @param {object} origin The root object to begin the traversal on.  If an object was supplied to the constructor,
            * then this parameter is optional; though, it can be used to override that object (for the call only).
            * @param {PropertyPathEndpoint} existingEndpoint An optional existing endpoint instance if available, otherwise leave this undefined.
            */
            getEndpoint(origin?: {}, existingEndpoint?: PropertyPathEndpoint): PropertyPathEndpoint;
        }
        /** The type of binding between object properties (used by System.IO.Data.Binding). */
        enum BindingMode {
            /** Updates either the target or source property to the other when either of them change. */
            TwoWay = 0,
            /** Updates only the target property when the source changes. */
            OneWay = 1,
            /** Inverts OneWay mode so that the source updates when the target changes. */
            OneWayToSource = 2,
            /** Updates only the target property once when bound.  Subsequent source changes are ignored. */
            OneTime = 3,
        }
        /** Represents a binding between object properties. */
        class Binding {
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
            constructor(source: {}, path: string, targetType: string, mode?: BindingMode, defaultValue?: any, converter?: IValueConverter, converterParameter?: string);
            /** Updates the source endpoint using the current property path settings. */
            updateEndpoint(): void;
            /** Returns the value referenced by the source endpoint object, and applies any associated converter. */
            getValue(type?: string, parameter?: string): any;
        }
    }
}
