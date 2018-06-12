declare namespace CoreXT {
    namespace System {
        const Object_base: {
            new (...args: any[]): {
                $__disposing?: boolean;
                $__disposed?: boolean;
            };
            $__type: IType<object>;
            readonly super: any;
            'new'?(...args: any[]): any;
            init?(o: object, isnew: boolean, ...args: any[]): void;
            $__register<TClass extends IType<object>, TFactory extends IFactory<IType<object>, NewDelegate<object>, InitDelegate<object>> & IType<object>>(this: TFactory & ITypeInfo & {
                $__type: TClass;
            }, namespace: object, addMemberTypeInfo?: boolean): TFactory;
        } & ObjectConstructor;
        /** The base type for many CoreXT classes. */
        class Object extends Object_base {
            /**
            * Create a new basic object type.
            * @param value If specified, the value will be wrapped in the created object.
            * @param makeValuePrivate If true, the value will not be exposed, making the value immutable.
            */
            static 'new'(value?: any, makeValuePrivate?: boolean): IObject;
            /** This is called internally to initialize a blank instance of the underlying type. Users should call the 'new()'
            * constructor function to get new instances, and 'dispose()' to release them when done.
            */
            static init: (o: IObject, isnew: boolean, value?: any, makeValuePrivate?: boolean) => void;
            static s: number;
        }
        namespace Object {
            const $__type_base: {
                new (...args: any[]): {
                    dispose(release?: boolean): void;
                };
            } & ObjectConstructor;
            class $__type extends $__type_base implements ISerializable {
                private $__value?;
                /** Returns the type information for this object instance. */
                getTypeInfo(): IFunctionInfo;
                /** Returns true if the specified value is equal to this object.
                  * The default implementation only compares if the types and references are equal.  Derived types should override this
                  * with a new more meaningful implementation where necessary.
                  */
                equal(value: any): boolean;
                valueOf(): any;
                toString(): string;
                /** Serializes the object's '$__id' value only. */
                getData(data: SerializedData): void;
                /** Restores the object's '$__id' value (only works if '$__id' is undefined). */
                setData(data: SerializedData): void;
                /**
                 * Disposes and reinitializes the current instance.
                 */
                private $__reset;
                /** Returns the type name for an object instance registered with 'AppDomain.registerType()'.  If the object does not have
                * type information, and the object is a function, then an attempt is made to pull the function name (if one exists).
                * Note: This function returns the type name ONLY (not the FULL type name [no namespace path]).
                * Note: The name will be undefined if a type name cannot be determined.
                * @param {object} object The object to determine a type name for.  If the object type was not registered using 'AppDomain.registerType()',
                * and the object is not a function, no type information will be available. Unregistered function objects simply
                * return the function's name.
                * @param {boolean} cacheTypeName (optional) If true (default), the name is cached using the 'ITypeInfo' interface via the '$__name' property.
                * This helps to speed up future calls.
                */
                static getTypeName(object: object, cacheTypeName?: boolean): string;
                /** Returns true if the given object is empty. */
                static isEmpty(obj: any): boolean;
            }
        }
        interface IObject extends Object.$__type {
        }
        const String_base: {
            new (...args: any[]): {
                $__disposing?: boolean;
                $__disposed?: boolean;
            };
            $__type: IType<object>;
            readonly super: any;
            'new'?(...args: any[]): any;
            init?(o: object, isnew: boolean, ...args: any[]): void;
            $__register<TClass extends IType<object>, TFactory extends IFactory<IType<object>, NewDelegate<object>, InitDelegate<object>> & IType<object>>(this: TFactory & ITypeInfo & {
                $__type: TClass;
            }, namespace: object, addMemberTypeInfo?: boolean): TFactory;
        } & StringConstructor;
        /** Allows manipulation and formatting of text strings, including the determination and location of substrings within strings. */
        class String extends String_base {
            /** Returns a new string object instance. */
            static 'new': (value?: any) => IString;
            /**
                * Reinitializes a disposed Delegate instance.
                * @param this The Delegate instance to initialize, or re-initialize.
                * @param isnew If true, this is a new instance, otherwise it is from a cache (and may have some preexisting properties).
                * @param object The instance to bind to the resulting delegate object.
                * @param func The function that will be called for the resulting delegate object.
                */
            static init: (o: IString, isnew: boolean, value?: any) => void;
            /** Replaces one string with another in a given string.
                * This function is optimized to select the faster method in the current browser. For instance, 'split()+join()' is
                * faster in Chrome, and RegEx based 'replace()' in others.
                */
            static replace(source: string, replaceWhat: string, replaceWith: string, ignoreCase?: boolean): string;
            /** Replaces all tags in the given 'HTML' string with 'tagReplacement' (an empty string by default) and returns the result. */
            static replaceTags(html: string, tagReplacement?: string): string;
            /** Pads a string with given characters to make it a given fixed length. If the string is greater or equal to the
              * specified fixed length, then the request is ignored, and the given string is returned.
              * @param {any} str The string to pad.
              * @param {number} fixedLength The fixed length for the given string (note: a length less than the string length will not truncate it).
              * @param {string} leftPadChar Padding to add to the left side of the string, or null/undefined to ignore. If 'rightPadChar' is also specified, the string becomes centered.
              * @param {string} rightPadChar Padding to add to the right side of the string, or null/undefined to ignore. If 'leftPadChar' is also specified, the string becomes centered.
              */
            static pad(str: any, fixedLength: number, leftPadChar: string, rightPadChar?: string): string;
            /** Appends the suffix string to the end of the source string, optionally using a delimiter if the source is not empty.
              * Note: If any argument is not a string, the value is converted into a string.
              */
            static append(source: string, suffix?: string, delimiter?: string): string;
            /** Appends the prefix string to the beginning of the source string, optionally using a delimiter if the source is not empty.
              * Note: If any argument is not a string, the value is converted into a string.
              */
            static prepend(source: string, prefix?: string, delimiter?: string): string;
            /** Returns an array of all matches of 'regex' in 'text', grouped into sub-arrays (string[matches][groups]). */
            static matches(regex: RegExp, text: string): string[][];
        }
        namespace String {
            const $__type_base_1: {
                new (...args: any[]): {
                    dispose(release?: boolean): void;
                };
            } & StringConstructor;
            class $__type extends $__type_base_1 {
                [index: number]: string;
                private $__value?;
                length: number;
                /** Replaces one string with another in the current string.
                * This function is optimized to select the faster method in the current browser. For instance, 'split()+join()' is
                * faster in Chrome, and RegEx based 'replace()' in others.
                */
                replaceAll(replaceWhat: string, replaceWith: string, ignoreCase?: boolean): string;
                /** Returns an array of all matches of 'regex' in the underlying string, grouped into sub-arrays (string[matches][groups]). */
                matches(regex: RegExp): string[][];
                toString(): string;
                valueOf(): any;
            }
        }
        interface IString extends String.$__type {
        }
        const Array_base: {
            new (...args: any[]): {
                $__disposing?: boolean;
                $__disposed?: boolean;
            };
            $__type: IType<object>;
            readonly super: any;
            'new'?(...args: any[]): any;
            init?(o: object, isnew: boolean, ...args: any[]): void;
            $__register<TClass extends IType<object>, TFactory extends IFactory<IType<object>, NewDelegate<object>, InitDelegate<object>> & IType<object>>(this: TFactory & ITypeInfo & {
                $__type: TClass;
            }, namespace: object, addMemberTypeInfo?: boolean): TFactory;
        } & ArrayConstructor;
        /** Represents an array of items.
         * Note: This is a CoreXT system array object, and not the native JavaScript object. Because it is not native,
         * manually setting an array item by index past the end will not modify the length property (this may changed as
         * new features are introduce in future EcmaScript versions [such as 'Object.observe()' in ES7]).
         */
        class Array extends Array_base {
            /** Returns a new array object instance.
              * Note: This is a CoreXT system array object, and not the native JavaScript object. */
            static 'new': <T = any>(...items: any[]) => IArray<T>;
            /**
               * Reinitializes a disposed Delegate instance.
               * @param this The Delegate instance to initialize, or re-initialize.
               * @param isnew If true, this is a new instance, otherwise it is from a cache (and may have some preexisting properties).
               * @param object The instance to bind to the resulting delegate object.
               * @param func The function that will be called for the resulting delegate object.
               */
            static init: <T = any>(o: IArray<T>, isnew: boolean, ...items: any[]) => void;
        }
        namespace Array {
            const $__type_base_2: {
                new (...args: any[]): {
                    dispose(release?: boolean): void;
                };
            } & ArrayConstructor;
            class $__type<T = any> extends $__type_base_2<T> {
                [index: number]: T;
                length: number;
                private _length;
                /** Clears the array and returns it. */
                clear(): this;
            }
        }
        interface IArray<T = any> extends Array.$__type<T> {
        }
        /** Represents an object that can have a parent object. */
        abstract class DependentObject extends Object.$__type {
            readonly parent: DependentObject;
            protected __parent: DependentObject;
        }
        interface IDependencyObject extends DependentObject {
        }
    }
}
