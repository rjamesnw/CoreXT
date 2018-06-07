var CoreXTTest;
(function (CoreXTTest) {
    function ClassFactory(b, f) {
        return null;
    }
    var constructor = Symbol("static constructor");
    var Test = /** @class */ (function () {
        function Test() {
        }
        Test.s = 3;
        return Test;
    }());
    CoreXTTest.Test = Test;
    (function (Test) {
        var $__type = /** @class */ (function () {
            function $__type() {
                this.x = 1;
                this.y = 2;
                this.p = 3;
            }
            $__type[constructor] = function (factory) {
                factory.new = function (x) {
                    return null;
                };
                factory.init = function (o, isnew, x) {
                    o.x = 1;
                };
            };
            return $__type;
        }());
        Test.$__type = $__type;
    })(Test = CoreXTTest.Test || (CoreXTTest.Test = {}));
    var t = Test.new(0);
    var A;
    (function (A) {
        var Test2 = /** @class */ (function () {
            function Test2() {
            }
            Test2.s = 3;
            return Test2;
        }());
        A.Test2 = Test2;
        (function (Test2) {
            var $__type = /** @class */ (function () {
                function $__type() {
                    this.x2 = 1;
                    this.y2 = 2;
                }
                $__type[constructor] = function (factory) {
                    factory['new'] = function (x) {
                        return null;
                    };
                    factory['init'] = function (o, isnew, x) {
                        o.x2 = 1;
                    };
                };
                return $__type;
            }());
            Test2.$__type = $__type;
        })(Test2 = A.Test2 || (A.Test2 = {}));
    })(A = CoreXTTest.A || (CoreXTTest.A = {}));
    var t2 = A.Test2.new('');
    CoreXT.nameof(function () { return A.Test2.$__type; });
})(CoreXTTest || (CoreXTTest = {}));
//# sourceMappingURL=test.js.map