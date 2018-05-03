var CoreXT;
(function (CoreXT) {
    function dispose(obj, release) {
        if (release === void 0) { release = true; }
        if (typeof obj == 'object')
            if (typeof obj.dispose == 'function' && obj.dispose != CoreXT.noop) {
                obj.dispose(release);
                obj.dispose = CoreXT.noop;
            }
            else if (obj.length > 0)
                for (var i = obj.length; i >= 0; --i)
                    dispose(obj[i], release);
    }
    CoreXT.dispose = dispose;
    function disposeProperties(obj, skipObjects, release) {
        if (release === void 0) { release = true; }
        for (var p in obj) {
            var item = obj[p];
            if (skipObjects && skipObjects.indexOf(item) >= 0)
                continue;
            if (typeof item == 'object')
                dispose(item, release);
        }
    }
    CoreXT.disposeProperties = disposeProperties;
    var Enumerable = (function () {
        function Enumerable() {
        }
        Enumerable.prototype.next = function (value) {
            throw CoreXT.System.Exception.notImplemented('next', this);
        };
        Enumerable.prototype.return = function (value) {
            throw CoreXT.System.Exception.notImplemented('return', this);
        };
        Enumerable.prototype.throw = function (e) {
            throw CoreXT.System.Exception.notImplemented('throw', this);
        };
        return Enumerable;
    }());
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.js.map