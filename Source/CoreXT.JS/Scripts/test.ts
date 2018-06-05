namespace CoreXTTest {

    function ClassFactory<TBase, TNew extends Function, TInit extends Function,
        TClass extends any>(b: { $__type: TBase }, f: (base: TBase) => [TClass, TNew, TInit])
        : TClass & { new: TNew; init: TInit; } & { $__type: TClass } {
        return null;
    }

    let constructor = Symbol("static constructor");

    export class Test {
        static 'new': (x: number) => Test.$__type;
        static init: (o: Test.$__type, isnew: boolean, x: number) => void;
        static s = 3;
    }
    export namespace Test {
        export class $__type {
            private static [constructor](factory: typeof Test) {
                factory['new'] = (x) => {
                    return null;
                };
                factory['init'] = (o, isnew, x) => {
                    o.x = 1;
                };
            }
        }
    }

    var t = Test.new(0);

    export namespace A {
        export class Test2 {
            static 'new': (x: string) => Test2.$__type;
            static init: (o: Test2.$__type, isnew: boolean, x: number) => void;
            static s = 3;
        }
        export namespace Test2 {
            export class $__type {
                private x = 1;
                y = 2;
                private static [constructor](factory: typeof Test2) {
                    factory['new'] = (x) => {
                        return null;
                    };
                    factory['init'] = (o, isnew, x) => {
                        o.x = 1;
                    };
                }
            }
        }
    }

    var t2 = A.Test2.new('');

    CoreXT.nameof(() => A.Test2.$__type);
}

namespace CoreXT {
    @Namespace(() => CoreXT)
    export class MyFactory {
        static 'new': (...args: any[]) => MyFactory.$__type;
        static init: (o: MyFactory.$__type, isnew: boolean, ...args: any[]) => void;
    }
    export namespace MyFactory {
        @Factory(() => CoreXT.MyFactory)
        export class $__type {
            private static [constructor](factory: typeof MyFactory) {
                factory['init'] = (o, isnew) => { };
            }
        }
    }
}