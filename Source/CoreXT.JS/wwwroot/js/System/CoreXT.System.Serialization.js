// ###########################################################################################################################
// Supports serialization of CoreXT objects.
// ###########################################################################################################################
var CoreXT;
(function (CoreXT) {
    var System;
    (function (System) {
        CoreXT.registerNamespace("CoreXT", "System");
        // =======================================================================================================================
        /** An empty object that contains prototype methods for serializing data.
        */
        var SerializedData = /** @class */ (function () {
            function SerializedData() {
            }
            SerializedData.prototype.addValue = function (name, value) {
                this[name] = value;
            };
            /** Add a serializable object as a serialized data property.
            * (Note: If the object doesn't produce any serialized data, the result will be a null property.)
            */
            SerializedData.prototype.addObject = function (name, obj) {
                var o = new SerializedData();
                if (!obj.getData)
                    return;
                obj.getData(o);
                // ... if the object is empty, don't bother adding it ...
                for (var p in o)
                    if (o.hasOwnProperty(p)) {
                        this[name] = o;
                    }
                this[name] = null;
                return null;
            };
            /** Returns the requested property value, or a default value if not found.
            * This always returns a string, since serialized data is in string form.
            */
            SerializedData.prototype.getValue = function (name, valueIfUndefined) {
                var value = this[name];
                if (value === void 0)
                    return valueIfUndefined;
                return typeof value == 'string' ? value : value.toString();
            };
            /** Returns the requested property value as a number, or a default value if not found.
            */
            SerializedData.prototype.getNumber = function (name, valueIfUndefined) {
                var value = this[name];
                if (value === void 0)
                    return valueIfUndefined;
                return typeof value == 'number' ? value : (typeof value == 'string' ? parseInt(value) : parseInt(value.toString()));
            };
            /** Returns the requested property value as an object, or a default value if not found.
            */
            SerializedData.prototype.getObject = function (name, valueIfUndefined) {
                var value = this[name];
                if (value === void 0)
                    return valueIfUndefined;
                return value;
            };
            /** Returns true if the specific property exists, and false otherwise. */
            SerializedData.prototype.valueExists = function (name) {
                return !(name in this);
            };
            return SerializedData;
        }());
        System.SerializedData = SerializedData;
        // =======================================================================================================================
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.Serialization.js.map