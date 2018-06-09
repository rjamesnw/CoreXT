// ###########################################################################################################################
// Primitive types designed for use with the CoreXT system.
// See 'CoreXT.global' and 'CoreXT.NativeTypes/NativeStaticTypes' for access to global scope native references and definitions.
// ###########################################################################################################################
// Thing that gets passed a function and makes a decorator:
var CoreXT;
(function (CoreXT) {
    var System;
    (function (System) {
        CoreXT.namespace(function () { return CoreXT.System; });
        // =======================================================================================================================
        /** The base type for many CoreXT classes. */
        var Object = /** @class */ (function (_super) {
            __extends(Object, _super);
            function Object() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            /**
            * Create a new basic object type.
            * @param value If specified, the value will be wrapped in the created object.
            * @param makeValuePrivate If true, the value will not be exposed, making the value immutable.
            */
            Object['new'] = function (value, makeValuePrivate) {
                if (makeValuePrivate === void 0) { makeValuePrivate = false; }
                return null;
            };
            Object.s = 3;
            return Object;
        }(CoreXT.FactoryBase()));
        System.Object = Object;
        (function (Object) {
            var $__type = /** @class */ (function (_super) {
                __extends($__type, _super);
                function $__type() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                // -------------------------------------------------------------------------------------------------------------------
                /** Returns the type information for this object instance. */
                $__type.prototype.getTypeInfo = function () {
                    if (!this.constructor.$__name && this.constructor.getTypeName)
                        this.constructor.getTypeName();
                    return this.constructor;
                };
                ;
                /** Returns true if the specified value is equal to this object.
                  * The default implementation only compares if the types and references are equal.  Derived types should override this
                  * with a new more meaningful implementation where necessary.
                  */
                $__type.prototype.equal = function (value) {
                    return this === value;
                };
                $__type.prototype.valueOf = function () { return this.$__value; };
                ;
                $__type.prototype.toString = function () { return '' + this; };
                ;
                // -------------------------------------------------------------------------------------------------------------------
                /** Serializes the object's '$__id' value only. */
                $__type.prototype.getData = function (data) {
                };
                /** Restores the object's '$__id' value (only works if '$__id' is undefined). */
                $__type.prototype.setData = function (data) {
                };
                ///** 
                // * Release the object back into the object pool. 
                // * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
                // *                          false to request that child objects remain connected after disposal (not released). This
                // *                          can allow quick initialization of a group of objects, instead of having to pull each one
                // *                          from the object pool each time.
                // */
                //x dispose(release?: boolean): void {
                //    // ... this should be the final code executed in the disposal chain (from the derived types, since it should always be top down [opposite of construction]) ...
                //    var appDomain = (<IDomainObjectInfo><any>this).$__appDomain; // (note: may be set to UNDEFINED if this is called from '{AppDomain}.dispose()')
                //    this.dispose = noop; // (make sure 'appDomain.dispose(object)' doesn't call back; note: this only hides the prototype function)
                //    if (appDomain)
                //        appDomain.dispose(this, release);
                //};
                // -------------------------------------------------------------------------------------------------------------------
                /**
                 * Disposes and reinitializes the current instance.
                 */
                $__type.prototype.$__reset = function () {
                    var _a;
                    // ... do a dispose and complete wipe ...
                    if (this.dispose !== CoreXT.noop)
                        CoreXT.dispose(this, false); // 'false' also keeps the app domain (see 'dispose()' below), and only removes it from the "active" list.
                    //??if (!this.constructor.new)
                    //    throw Exception.error("{object}.new", "You need to register the class/type first: see 'AppDomain.registerClass()'.", this);
                    var instance = (_a = this.init).call.apply(_a, __spread([this, this, false], arguments));
                    instance.$__appDomain.objects.addObject(instance);
                    delete instance.dispose;
                    return this;
                };
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
                $__type.getTypeName = function (object, cacheTypeName) {
                    if (cacheTypeName === void 0) { cacheTypeName = true; }
                    this.getTypeName = CoreXT.getTypeName;
                    return CoreXT.getTypeName(object, cacheTypeName);
                };
                /** Returns true if the given object is empty. */
                $__type.isEmpty = function (obj) {
                    this.isEmpty = CoreXT.isEmpty; // (make future calls use the root namespace function that already exists)
                    return CoreXT.isEmpty(obj);
                };
                // -------------------------------------------------------------------------------------------------------------------
                // This part uses the CoreXT factory pattern
                $__type[CoreXT.constructor] = function (factory) {
                    factory.init = function (o, isnew, value, makeValuePrivate) {
                        if (makeValuePrivate === void 0) { makeValuePrivate = false; }
                        if (!isnew)
                            o.$__reset();
                        if (o.$__appDomain == void 0 && System.AppDomain)
                            o.$__appDomain = System.AppDomain.default;
                        if (o.$__app == void 0 && System.Application)
                            o.$__app = System.Application.default;
                        // ... if a value is given, the behavior changes to latch onto the value ...
                        if (value != void 0) {
                            if (makeValuePrivate) {
                                o.valueOf = function () { return value; };
                                o.toString = function () { return '' + value; };
                            }
                            else {
                                o['$__value'] = value;
                            }
                        }
                    };
                };
                return $__type;
            }(CoreXT.DisposableFromBase(CoreXT.global.Object)));
            Object.$__type = $__type;
            Object.$__register(System);
        })(Object = System.Object || (System.Object = {}));
        // =======================================================================================================================
        /** Copies over prototype properties from the $Object type to other base primitive types. */
        function _addObjectPrototypeProperties(type) {
            for (var p in Object.prototype)
                if (Object.prototype.hasOwnProperty.call(Object.prototype, p) && p.charAt(0) != "$" && p.charAt(0) != "_")
                    if (!(p in type.prototype))
                        type.prototype[p] = Object.prototype[p];
            return type;
        }
        // =======================================================================================================================
        /* Note: This is a CoreXT system string object, and not the native JavaScript object. */
        /** Allows manipulation and formatting of text strings, including the determination and location of substrings within strings. */
        var String = /** @class */ (function (_super) {
            __extends(String, _super);
            function String() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            /** Replaces one string with another in a given string.
                * This function is optimized to select the faster method in the current browser. For instance, 'split()+join()' is
                * faster in Chrome, and RegEx based 'replace()' in others.
                */
            String.replace = function (source, replaceWhat, replaceWith, ignoreCase) {
                // (split+join is faster in some browsers, or very close in speed) http://jsperf.com/split-join-vs-regex-replace-the-raven
                if (typeof source !== 'string')
                    source = "" + source;
                if (typeof replaceWhat !== 'string')
                    replaceWhat = "" + replaceWhat;
                if (typeof replaceWith !== 'string')
                    replaceWith = "" + replaceWith;
                if (ignoreCase)
                    return source.replace(new RegExp(CoreXT.Utilities.escapeRegex(replaceWhat), 'gi'), replaceWith);
                else if (CoreXT.Browser.type == CoreXT.Browser.BrowserTypes.Chrome)
                    return source.split(replaceWhat).join(replaceWith); // (MUCH faster in Chrome [including Chrome mobile])
                else
                    return source.replace(new RegExp(CoreXT.Utilities.escapeRegex(replaceWhat), 'g'), replaceWith);
            };
            /** Replaces all tags in the given 'HTML' string with 'tagReplacement' (an empty string by default) and returns the result. */
            String.replaceTags = function (html, tagReplacement) {
                return html.replace(/<[^<>]*|>[^<>]*?>|>/g, tagReplacement);
            };
            /** Pads a string with given characters to make it a given fixed length. If the string is greater or equal to the
              * specified fixed length, then the request is ignored, and the given string is returned.
              * @param {any} str The string to pad.
              * @param {number} fixedLength The fixed length for the given string (note: a length less than the string length will not truncate it).
              * @param {string} leftPadChar Padding to add to the left side of the string, or null/undefined to ignore. If 'rightPadChar' is also specified, the string becomes centered.
              * @param {string} rightPadChar Padding to add to the right side of the string, or null/undefined to ignore. If 'leftPadChar' is also specified, the string becomes centered.
              */
            String.pad = function (str, fixedLength, leftPadChar, rightPadChar) {
                if (str === void 0)
                    str = "";
                if (leftPadChar === void 0 || leftPadChar === null)
                    leftPadChar = "";
                if (rightPadChar === void 0 || rightPadChar === null)
                    rightPadChar = "";
                var s = "" + str, targetLength = fixedLength || 0, remainder = targetLength - s.length, lchar = "" + leftPadChar, rchar = "" + rightPadChar, i, n, llen, rlen, lpad = "", rpad = "";
                if (remainder == 0 || (!lchar && !rchar))
                    return str;
                if (lchar && rchar) {
                    llen = Math.floor(remainder / 2);
                    rlen = targetLength - llen;
                }
                else if (lchar)
                    llen = remainder;
                else if (rchar)
                    rlen = remainder;
                for (i = 0; i < llen; ++i)
                    lpad += lchar;
                for (i = 0; i < rlen; ++i)
                    rpad += rchar;
                return lpad + s + rpad;
            };
            /** Appends the suffix string to the end of the source string, optionally using a delimiter if the source is not empty.
              * Note: If any argument is not a string, the value is converted into a string.
              */
            String.append = function (source, suffix, delimiter) {
                if (source === void 0)
                    source = "";
                else if (typeof source != 'string')
                    source = '' + source;
                if (typeof suffix != 'string')
                    suffix = '' + suffix;
                if (typeof delimiter != 'string')
                    delimiter = '' + delimiter;
                if (!source)
                    return suffix;
                return source + delimiter + suffix;
            };
            /** Appends the prefix string to the beginning of the source string, optionally using a delimiter if the source is not empty.
              * Note: If any argument is not a string, the value is converted into a string.
              */
            String.prepend = function (source, prefix, delimiter) {
                if (source === void 0)
                    source = "";
                else if (typeof source != 'string')
                    source = '' + source;
                if (typeof prefix != 'string')
                    prefix = '' + prefix;
                if (typeof delimiter != 'string')
                    delimiter = '' + delimiter;
                if (!source)
                    return prefix;
                return prefix + delimiter + source;
            };
            return String;
        }(CoreXT.FactoryBase()));
        System.String = String;
        (function (String) {
            var $__type = /** @class */ (function (_super) {
                __extends($__type, _super);
                function $__type() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                /** Replaces one string with another in the current string.
                * This function is optimized to select the faster method in the current browser. For instance, 'split()+join()' is
                * faster in Chrome, and RegEx based 'replace()' in others.
                */
                $__type.prototype.replaceAll = function (replaceWhat, replaceWith, ignoreCase) {
                    return String.replace(this.toString(), replaceWhat, replaceWith, ignoreCase);
                };
                $__type.prototype.toString = function () { return this.$__value; };
                $__type.prototype.valueOf = function () { return this.$__value; };
                // (NOTE: This is the magic that makes it work, as 'toString()' is called by the other functions to get the string value, and the native implementation only works on a primitive string only.)
                $__type[CoreXT.constructor] = function (factory) {
                    factory.init = function (o, isnew, value) {
                        o.$__value = CoreXT.global.String(value);
                        //??System.String.prototype.constructor.apply(this, arguments);
                        // (IE browsers older than v9 do not populate the string object with the string characters)
                        //if (Browser.type == Browser.BrowserTypes.IE && Browser.version <= 8)
                        o.length = o.$__value.length;
                        for (var i = 0; i < o.length; ++i)
                            o[i] = o.charAt(i);
                    };
                };
                return $__type;
            }(CoreXT.DisposableFromBase(CoreXT.global.String)));
            String.$__type = $__type;
            String.$__register(System);
        })(String = System.String || (System.String = {}));
        // =======================================================================================================================
        /** Represents an array of items.
         * Note: This is a CoreXT system array object, and not the native JavaScript object. Because it is not native,
         * manually setting an array item by index past the end will not modify the length property (this may changed as
         * new features are introduce in future EcmaScript versions [such as 'Object.observe()' in ES7]).
         */
        var Array = /** @class */ (function (_super) {
            __extends(Array, _super);
            function Array() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return Array;
        }(CoreXT.FactoryBase()));
        System.Array = Array;
        (function (Array) {
            var $__type = /** @class */ (function (_super) {
                __extends($__type, _super);
                function $__type() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                /** Clears the array and returns it. */
                $__type.prototype.clear = function () { this.length = 0; return this; };
                $__type[CoreXT.constructor] = function (factory) {
                    if (!CoreXT.ES6) // (if 'class' syntax is not supported then the 'length' property will not behave like an normal array so try to polyfill this somewhat)
                        CoreXT.global.Object.defineProperty(Array, "length", {
                            get: function () { return this._length; },
                            set: function (v) { this._length = +v || 0; CoreXT.global.Array.prototype.splice(this._length); }
                        });
                    factory.init = function (o, isnew) {
                        var items = [];
                        for (var _i = 2; _i < arguments.length; _i++) {
                            items[_i - 2] = arguments[_i];
                        }
                        if (!CoreXT.ES6)
                            o._length = 0;
                        try {
                            o.push.apply(o, items); // (note: argument limit using this method: http://stackoverflow.com/a/9650855/1236397)
                        }
                        catch (e) {
                            // (too many items for arguments, need to add each one by one)
                            for (var i = 0, n = items.length; i < n; ++i)
                                o.push(items[i]);
                        }
                    };
                };
                return $__type;
            }(CoreXT.DisposableFromBase(CoreXT.global.Array)));
            Array.$__type = $__type;
            Array.$__register(System);
        })(Array = System.Array || (System.Array = {}));
        // =======================================================================================================================
        //if (Object.freeze) {
        //    Object.freeze($Object);
        //    Object.freeze($EventObject);
        //    Object.freeze($Array);
        //    Object.freeze($String);
        //}
        // ====================================================================================================================================
        /** Represents an object that can have a parent object. */
        var DependentObject = /** @class */ (function (_super) {
            __extends(DependentObject, _super);
            function DependentObject() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Object.defineProperty(DependentObject.prototype, "parent", {
                get: function () { return this.__parent; },
                enumerable: true,
                configurable: true
            });
            return DependentObject;
        }(Object.$__type));
        System.DependentObject = DependentObject;
        // =======================================================================================================================
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.PrimitiveTypes.js.map