var CoreXT;
(function (CoreXT) {
    var System;
    (function (System) {
        var SerializedData = (function () {
            function SerializedData() {
            }
            SerializedData.prototype.addValue = function (name, value) {
                this[name] = value;
            };
            SerializedData.prototype.addObject = function (name, obj) {
                var o = new SerializedData();
                if (!obj.getData)
                    return;
                obj.getData(o);
                for (var p in o)
                    if (o.hasOwnProperty(p)) {
                        this[name] = o;
                        return o;
                    }
                this[name] = null;
                return null;
            };
            SerializedData.prototype.getValue = function (name, valueIfUndefined) {
                var value = this[name];
                if (value === void 0)
                    return valueIfUndefined;
                return typeof value == 'string' ? value : value.toString();
            };
            SerializedData.prototype.getNumber = function (name, valueIfUndefined) {
                var value = this[name];
                if (value === void 0)
                    return valueIfUndefined;
                return typeof value == 'number' ? value : (typeof value == 'string' ? parseInt(value) : parseInt(value.toString()));
            };
            SerializedData.prototype.getObject = function (name, valueIfUndefined) {
                var value = this[name];
                if (value === void 0)
                    return valueIfUndefined;
                return value;
            };
            SerializedData.prototype.valueExists = function (name) {
                return !(name in this);
            };
            return SerializedData;
        }());
        System.SerializedData = SerializedData;
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.Serialization.js.map