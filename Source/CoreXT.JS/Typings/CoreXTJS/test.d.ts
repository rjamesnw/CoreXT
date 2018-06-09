declare namespace CoreXTTest {
    class Test {
        static 'new': (x: number) => Test.$__type;
        static init: (o: Test.$__type, isnew: boolean, x: number) => void;
        static s: number;
    }
    namespace Test {
        class $__type {
            private x;
            y: number;
            protected p: number;
        }
    }
    namespace A {
        class Test2 {
            static 'new': (x: string) => Test2.$__type;
            static init: (o: Test2.$__type, isnew: boolean, x: number) => void;
            static s: number;
        }
        namespace Test2 {
            class $__type {
                private x2;
                y2: number;
            }
        }
    }
}
declare namespace CoreXT {
}
