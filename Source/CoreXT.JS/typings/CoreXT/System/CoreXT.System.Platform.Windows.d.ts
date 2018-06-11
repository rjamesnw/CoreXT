declare namespace CoreXT.System.Platform {
    const Window_base: {
        new (...args: any[]): {
            $__disposing?: boolean;
            $__disposed?: boolean;
        };
        $__type: IType<object>;
        readonly super: typeof Object;
        'new'?(...args: any[]): any;
        init?(o: object, isnew: boolean, ...args: any[]): void;
        $__register<TClass extends IType<object>, TFactory extends IFactory<IType<object>, NewDelegate<object>, InitDelegate<object>> & IType<object>>(this: TFactory & ITypeInfo & {
            $__type: TClass;
        }, namespace: object, addMemberTypeInfo?: boolean): TFactory;
    } & ObjectConstructor;
    class Window extends Window_base {
        /** Creates a new window object.  If null is passed as the root element, then a new pop-up window is created when the window is shown. */
        static 'new'(rootElement?: HTMLElement, url?: string): IWindow;
        static init(o: IWindow, isnew: boolean, rootElement?: HTMLElement, url?: string): void;
    }
    namespace Window {
        const $__type_base: typeof Object.$__type;
        class $__type extends $__type_base {
            private _guid;
            private _target;
            private _header;
            private _body;
            private _url;
            show(): void;
            moveTo(x: number, y: number): void;
            moveby(deltaX: number, deltaY: number): void;
        }
    }
    interface IWindow extends Window.$__type {
    }
}
