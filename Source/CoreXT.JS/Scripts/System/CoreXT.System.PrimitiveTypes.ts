// ###########################################################################################################################
// Primitive types designed for use with the CoreXT system.
// See 'CoreXT.global' and 'CoreXT.NativeTypes/NativeStaticTypes' for access to global scope native references and definitions.
// ###########################################################################################################################
// Thing that gets passed a function and makes a decorator:

namespace CoreXT {
    export namespace System {
        registerNamespace(CoreXT, "System");

        // =======================================================================================================================

        class $Object extends global.Object implements IDisposable, ISerializable {
            // -------------------------------------------------------------------------------------------------------------------

            private $__value?: any;

            // -------------------------------------------------------------------------------------------------------------------

            /**
             * Don't create objects using the 'new' operator. Use the '{class_type}.new()' static method instead.
             */
            protected constructor() {
                if (Browser.ES6)
                    safeEval("var _super = function() { return null; }"); // (ES6 fix for extending built-in types [calling constructor not supported]; more details on it here: https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work)
                super();
            }

            // -------------------------------------------------------------------------------------------------------------------

            /** Returns the type information for this object instance. */
            getTypeInfo(): IFunctionInfo {
                if (!(<ITypeInfo><any>this.constructor).$__name && (<$Object><any>this.constructor).getTypeName)
                    (<$Object><any>this.constructor).getTypeName();
                return <IFunctionInfo>this.constructor;
            };

            /** Returns true if the specified value is equal to this object.
              * The default implementation only compares if the types and references are equal.  Derived types should override this
              * with a new more meaningful implementation where necessary.
              */
            equal(value: any): boolean {
                return this === value;
            }

            valueOf(): any { return this.$__value; };

            toString(): string { return '' + this; };

            // -------------------------------------------------------------------------------------------------------------------

            /** Serializes the object's '$__id' value only. */
            getData(data: SerializedData): void {
            }

            /** Restores the object's '$__id' value (only works if '$__id' is undefined). */
            setData(data: SerializedData): void {
            }

            /** Release the object back into the object pool. */
            dispose(release?: boolean): void {
                // ... this should be the final code executed in the disposal chain (from the derived types, since it should always be top down [opposite of construction]) ...
                var appDomain = (<IDomainObjectInfo><any>this).$__appDomain; // (note: may be set to UNDEFINED if this is called from '{AppDomain}.dispose()')
                this.dispose = noop; // (make sure 'appDomain.dispose(object)' doesn't call back; note: this only hides the prototype function)
                if (appDomain)
                    appDomain.dispose(this, release);
            };

            // -------------------------------------------------------------------------------------------------------------------

            /**
             * Disposes and reinitializes the current instance.
             */
            private $__reset(): this {
                // ... do a dispose and complete wipe ...
                if (this.dispose !== noop)
                    dispose(this, false); // 'false' also keeps the app domain (see 'dispose()' below), and only removes it from the "active" list.
                //??if (!this.constructor.new)
                //    throw Exception.error("{object}.new", "You need to register the class/type first: see 'AppDomain.registerClass()'.", this);
                var instance = <$Object & ITypeInfo>this.init.call(this, this, false, ...arguments);
                instance.$__appDomain.objects.addObject(instance);
                delete instance.dispose;
                return this;
            }

            // -------------------------------------------------------------------------------------------------------------------

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
            static getTypeName(object: object, cacheTypeName = true): string {
                this.getTypeName = CoreXT.getTypeName;
                return CoreXT.getTypeName(object, cacheTypeName);
            }

            /** Returns true if the given object is empty. */
            static isEmpty(obj: any): boolean {
                this.isEmpty = CoreXT.isEmpty; // (make future calls use the root namespace function that already exists)
                return CoreXT.isEmpty(obj);
            }

            // -------------------------------------------------------------------------------------------------------------------
            // This part uses the CoreXT factory pattern

            protected static '$Object Factory' = class Factory extends FactoryBase($Object, null) implements IFactory {
                /**
                 * Create a new basic object type.
                 * @param value If specified, the value will be wrapped in the created object.
                 * @param makeValuePrivate If true, the value will not be exposed, making the value immutable.
                 */
                'new'(value?: any, makeValuePrivate: boolean = false): InstanceType<typeof Factory.$__type> {
                    return Types.__new.call(this, value, makeValuePrivate);
                }

                //? /** Disposes this instance, sets all properties to 'undefined', and calls the constructor again (a complete reset). */
                /** This is called internally to initialize a blank instance of the underlying type. Users should call the 'new()'
                  * constructor function to get new instances, and 'dispose()' to release them when done.
                  */
                init($this: InstanceType<typeof Factory.$__type>, isnew: boolean, value?: any, makePrivate: boolean = false): InstanceType<typeof Factory.$__type> {
                    if (!isnew)
                        $this.$__reset();

                    if ($this.$__appDomain == void 0)
                        $this.$__appDomain = System.AppDomain.default;

                    if ($this.$__app == void 0)
                        $this.$__app = System.Application.default;

                    // ... if a value is given, the behavior changes to latch onto the value ...
                    if (value == void 0) {
                        if (makePrivate) {
                            $this.valueOf = function () { return value; };
                            $this.toString = function () { return '' + value; };
                        } else {
                            $this['$__value'] = value;
                        }
                    }

                    //? $this.init = noop;

                    return $this;
                }
            }.register([CoreXT, System]);

            // -------------------------------------------------------------------------------------------------------------------
        }

        export interface IObject extends $Object { }
        /** The base type for many CoreXT classes. */
        export var Object = $Object['$Object Factory'].$__type;
        
        //export var Object: typeof $Object & typeof $ObjectFactoryRoot.Object_factory & IRegisteredType<typeof $Object> = AppDomain.registerClass($Object, $Object[' '].Object_factory, [CoreXT, System]);
        // (have to be explicit on the object type since there may be references within the related types [thought nothing on a static level should access the 'Object' property during initialization])

        // =======================================================================================================================

        /** Copies over prototype properties from the $Object type to other base primitive types. */
        function _addObjectPrototypeProperties<T extends { new(...args: any[]): any }>(type: T): T & IObject {
            for (var p in $Object.prototype)
                if (Object.prototype.hasOwnProperty.call($Object.prototype, p) && p.charAt(0) != "$" && p.charAt(0) != "_")
                    if (!(p in type.prototype))
                        type.prototype[p] = $Object.prototype[p];
            return <any>type;
        }

        // =======================================================================================================================

        /* Note: This is a CoreXT system string object, and not the native JavaScript object. */
        /** Allows manipulation and formatting of text strings, including the determination and location of substrings within strings. */
        class $String extends global.String {
            [index: number]: string;

            private $__value?: any;
            length: number;

            /** Replaces one string with another in a given string.
            * This function is optimized to select the faster method in the current browser. For instance, 'split()+join()' is
            * faster in Chrome, and RegEx based 'replace()' in others.
            */
            static replace(source: string, replaceWhat: string, replaceWith: string, ignoreCase?: boolean): string {
                // (split+join is faster in some browsers, or very close in speed) http://jsperf.com/split-join-vs-regex-replace-the-raven
                if (typeof source !== 'string') source = "" + source;
                if (typeof replaceWhat !== 'string') replaceWhat = "" + replaceWhat;
                if (typeof replaceWith !== 'string') replaceWith = "" + replaceWith;
                if (ignoreCase)
                    return source.replace(new RegExp(Text.RegEx.escapeRegex(replaceWhat), 'gi'), replaceWith);
                else
                    if (Browser.type == Browser.BrowserTypes.Chrome)
                        return source.split(replaceWhat).join(replaceWith); // (MUCH faster in Chrome [including Chrome mobile])
                    else
                        return source.replace(new RegExp(Text.RegEx.escapeRegex(replaceWhat), 'g'), replaceWith);
            }

            /** Replaces all tags in the given 'HTML' string with 'tagReplacement' (an empty string by default) and returns the result. */
            static replaceTags(html: string, tagReplacement?: string): string {
                return html.replace(/<[^<>]*|>[^<>]*?>|>/g, tagReplacement);
            }

            /** Pads a string with given characters to make it a given fixed length. If the string is greater or equal to the
            * specified fixed length, then the request is ignored, and the given string is returned.
            * @param {any} str The string to pad.
            * @param {number} fixedLength The fixed length for the given string (note: a length less than the string length will not truncate it).
            * @param {string} leftPadChar Padding to add to the left side of the string, or null/undefined to ignore. If 'rightPadChar' is also specified, the string becomes centered.
            * @param {string} rightPadChar Padding to add to the right side of the string, or null/undefined to ignore. If 'leftPadChar' is also specified, the string becomes centered.
            */
            static pad(str: any, fixedLength: number, leftPadChar: string, rightPadChar?: string): string {
                if (str === void 0) str = "";
                if (leftPadChar === void 0 || leftPadChar === null) leftPadChar = "";
                if (rightPadChar === void 0 || rightPadChar === null) rightPadChar = "";

                var s = "" + str, targetLength = fixedLength || 0, remainder = targetLength - s.length,
                    lchar = "" + leftPadChar, rchar = "" + rightPadChar,
                    i: number, n: number, llen: number, rlen: number, lpad: string = "", rpad: string = "";

                if (remainder == 0 || (!lchar && !rchar)) return str;

                if (lchar && rchar) {
                    llen = Math.floor(remainder / 2);
                    rlen = targetLength - llen;
                }
                else if (lchar) llen = remainder;
                else if (rchar) rlen = remainder;

                for (i = 0; i < llen; ++i)
                    lpad += lchar;

                for (i = 0; i < rlen; ++i)
                    rpad += rchar;

                return lpad + s + rpad;
            }

            /** Appends the suffix string to the end of the source string, optionally using a delimiter if the source is not empty.
            * Note: If any argument is not a string, the value is converted into a string.
            */
            static append(source: string, suffix?: string, delimiter?: string): string {
                if (source === void 0) source = "";
                else if (typeof source != 'string') source = '' + source;
                if (typeof suffix != 'string') suffix = '' + suffix;
                if (typeof delimiter != 'string') delimiter = '' + delimiter;
                if (!source) return suffix;
                return source + delimiter + suffix;
            }

            /** Appends the prefix string to the beginning of the source string, optionally using a delimiter if the source is not empty.
            * Note: If any argument is not a string, the value is converted into a string.
            */
            static prepend(source: string, prefix?: string, delimiter?: string): string {
                if (source === void 0) source = "";
                else if (typeof source != 'string') source = '' + source;
                if (typeof prefix != 'string') prefix = '' + prefix;
                if (typeof delimiter != 'string') delimiter = '' + delimiter;
                if (!source) return prefix;
                return prefix + delimiter + source;
            }

            /** Replaces one string with another in the current string. 
            * This function is optimized to select the faster method in the current browser. For instance, 'split()+join()' is
            * faster in Chrome, and RegEx based 'replace()' in others.
            */
            replaceAll(replaceWhat: string, replaceWith: string, ignoreCase?: boolean): string {
                return $String.replace(this.toString(), replaceWhat, replaceWith, ignoreCase);
            }

            toString(): string { return this.$__value; }

            valueOf(): any { return this.$__value; }
            // (NOTE: This is the magic that makes it work, as 'toString()' is called by the other functions to get the string value, and the native implementation only works on a primitive string only.)

            // -------------------------------------------------------------------------------------------------------------------
            // This part uses the CoreXT factory pattern

            protected static '$String Factory' = class Factory extends FactoryBase($String, null) implements IFactory {
                /** Returns a new string object instance. */
                'new'(value?: any): InstanceType<typeof Factory.$__type> { return null; }

                /**
                 * Reinitializes a disposed Delegate instance.
                 * @param this The Delegate instance to initialize, or re-initialize.
                 * @param isnew If true, this is a new instance, otherwise it is from a cache (and may have some preexisting properties).
                 * @param object The instance to bind to the resulting delegate object.
                 * @param func The function that will be called for the resulting delegate object.
                 */
                init($this: InstanceType<typeof Factory.$__type>, isnew: boolean, value?: any): InstanceType<typeof Factory.$__type> {
                    $this.$__value = global.String(value);
                    //??System.String.prototype.constructor.apply(this, arguments);
                    // (IE browsers older than v9 do not populate the string object with the string characters)
                    //if (Browser.type == Browser.BrowserTypes.IE && Browser.version <= 8)
                    $this.length = $this.$__value.length;
                    for (var i = 0; i < $this.length; ++i) $this[i] = $this.charAt(i);
                    return $this;
                }
            }.register([CoreXT, System]);

            // -------------------------------------------------------------------------------------------------------------------
        }

        export interface IString extends $String, IDisposable, ISerializable { }
        export var String = $String['$String Factory'].$__type;

        // =======================================================================================================================

        /** Represents an array of items.
        * Note: This is a CoreXT system array object, and not the native JavaScript object. Because it is not native,
        * manually setting an array item by index past the end will not modify the length property (this may changed as
        * new features are introduce in future EcmaScript versions [such as 'Object.observe()' in ES7]).
        */
        class $Array<T> extends global.Array<T> {
            [index: number]: T;

            // -------------------------------------------------------------------------------------------------------------------
            /* ------ This part uses the CoreXT factory pattern ------ */

            protected static '$Array Factory' = function () {
                type TInstance<TItem> = $Array<TItem>;
                return class Factory extends FactoryBase($Array, null) implements IFactory {
                    $Type = $Array;
                    $BaseFactory = <IFactory>null;

                    /** Returns a new array object instance. 
                      * Note: This is a CoreXT system array object, and not the native JavaScript object. */
                    'new'<T>(...items: T[]): TInstance<T> { return null; }

                    /**
                    * Reinitializes a disposed Delegate instance.
                    * @param this The Delegate instance to initialize, or re-initialize.
                    * @param isnew If true, this is a new instance, otherwise it is from a cache (and may have some preexisting properties).
                    * @param object The instance to bind to the resulting delegate object.
                    * @param func The function that will be called for the resulting delegate object.
                    */
                    init<T>($this: TInstance<T>, isnew: boolean, ...items: T[]): TInstance<T> {
                        try {
                            $this.push.apply($this, items); // (note: http://stackoverflow.com/a/9650855/1236397)
                        } catch (e) {
                            for (var i = 0, n = items.length; i < n; ++i)
                                $this.push(items[i]);
                        }
                        //??System.String.prototype.constructor.apply(this, arguments);
                        // (IE browsers older than v9 do not populate the string object with the string characters)
                        //if (Browser.type == Browser.BrowserTypes.IE && Browser.version <= 8)
                        $this.length = $this.$__value.length;
                        for (var i = 0; i < $this.length; ++i) $this[i] = $this.charAt(i);
                        return $this;
                    }
                }.register([CoreXT, System]);
            }();

            /* ------------------------------------------------------- */

            // -------------------------------------------------------------------------------------------------------------------
        }

        export interface IArray<T> extends $Array<T>, IDisposable, ISerializable { }
        export var Array = $Array['$Array Factory'].$__type;

        // =======================================================================================================================

        //if (Object.freeze) {
        //    Object.freeze($Object);
        //    Object.freeze($EventObject);
        //    Object.freeze($Array);
        //    Object.freeze($String);
        //}

        // =======================================================================================================================
    }
}