declare namespace CoreXT {
    namespace System {
        /** AppDomain Bridge, for use with 'AppDomain.with()' when selecting a different application domain when operating on CoreXT class types. */
        interface IADBridge extends IDomainObjectInfo {
        }
        const AppDomain_base: {
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
        /**
         * Application domains encapsulate applications and confine them to a root working space.  When application scripts are
         * loaded, they are isolated and run in the context of a new global scope.  This protects the main window UI, and also
         * protects the user from malicious applications that may try to hook into and read a user's key strokes to steal
         * logins, payment details, etc.
         * Note: While script isolation is the default, trusted scripts can run in the system context, and are thus not secured.
         */
        class AppDomain extends AppDomain_base {
            /** Get a new app domain instance.
                * @param application An optional application to add to the new domain.
                */
            static 'new': (application?: IApplication) => IAppDomain;
            /** Constructs an application domain for the specific application instance. */
            static init: (o: IAppDomain, isnew: boolean, application?: IApplication) => void;
            /** The default system wide application domain.
              * See 'System.Platform.AppDomain' for more details.
              */
            static default: IAppDomain;
            private static _default;
            /** A list of all application domains in the system. */
            static readonly appDomains: IAppDomain[];
        }
        namespace AppDomain {
            const $__type_base: typeof Object.$__type;
            class $__type extends $__type_base {
                private _applications;
                private _modules;
                /** A type bridge is a object instance who's prototype points to the actual static function object.
                  * Each time "{AppDomain}.with()" is used, a bridge is created and cached here under the type name for reuse.
                  */
                private readonly __typeBridges;
                /** Automatically tracks new objects created under this app domain. The default is undefined, in which case the global 'Types.autoTrackInstances' is used instead. */
                autoTrackInstances: boolean;
                private __objects;
                /**
                 * A collection of all objects tracked by this application domain instance (see the 'autoTrackInstances' property).
                 * Each object is given an ID value that is unique for this specific AppDomain instance only.
                 */
                readonly objects: Collections.IIndexedObjectCollection<IDomainObjectInfo>;
                /** Returns the default (first) application for this domain. */
                application(): IApplication;
                /** Holds a list of all applications on this domain.
                  * Do not add applications directly to this array.  Use the 'createApplication()' function.
                  * To remove an application, just dispose it.
                  */
                applications: IApplication[];
                /** Disposes this AppDomain instance. */
                dispose(): void;
                /** Disposes a specific object in this AppDomain instance.
                  * When creating thousands of objects continually, object disposal (and subsequent cache of the instances) means the GC doesn't have
                  * to keep engaging to clear up the abandoned objects.  While using the "new" operator may be faster than using "{type}.new()" at
                  * first, the application actually becomes very lagged while the GC keeps eventually kicking in.  This is why CoreXT objects are
                  * cached and reused as much as possible.
                  * @param {object} object The object to dispose and release back into the "disposed objects" pool.
                  * @param {boolean} release If true (default) allows the objects to be released back into the object pool.  Set this to
                  *                          false to request that child objects remain connected after disposal (not released). This
                  *                          can allow quick initialization of a group of objects, instead of having to pull each one
                  *                          from the object pool each time.
                  */
                dispose(object: IDisposable, release?: boolean): void;
                /** Attaches the object to this AppDomain.  The object must never exist in any other domains prior to this call.
                  * 'ITypeInfo' details will be updated for the object.  This is useful when
                  * See also: {AppDomain}.registerType()
                  * @param {T} object The object to add to this app domain.
                  * @param {{}} parentModule The parent module or scope in which the type exists.
                  * @param {{}} parentModule The parent module or scope in which the type exists.
                  */
                attachObject<T extends object>(object: T): T;
                /** Selects this application domain instance as the active domain when calling methods on a type. This is usually used
                  * as a chain method for getting a new instance from a type.
                  * Note: The focus for this AppDomain instance is limited to this call only (i.e. not persisted).
                  */
                with<TFactory extends IFactory>(type: TFactory): TFactory;
                createApplication<TApp extends IType<IApplication>>(factory?: IFactory<TApp>, title?: string, description?: string): TApp;
            }
        }
        interface IAppDomain extends AppDomain.$__type {
        }
        const Application_base: {
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
        /** Applications wrap window reference targets, and any specified HTML for configuration and display. There can be many
          * applications in a single AppDomain.
          */
        class Application extends Application_base {
            static 'new': (title: string, description: string, appID: number) => IApplication;
            static init: (o: IApplication, isnew: boolean, title: string, description: string, appID: number) => void;
            /** The default system wide application domain.
              * See 'System.Platform.AppDomain' for more details.
              */
            static default: IApplication;
            private static _default;
            /** References the current running application that owns the current running environment. */
            static readonly current: IApplication;
            private static _current;
            /** A list of all applications in the system. */
            static applications: IApplication[];
            /** References the application who's window currently has user focus. You can also set this property to change window focus. */
            static focused: IApplication;
            private static _focused;
        }
        namespace Application {
            const $__type_base_1: typeof Object.$__type;
            class $__type extends $__type_base_1 {
                /** Returns true if this application is focused. */
                readonly isFocused: boolean;
                private _isFocused;
                readonly appID: number;
                private _appID;
                readonly title: string;
                private _title;
                readonly description: string;
                private _description;
                readonly appDomains: IAppDomain[];
                private _appDomains;
                private _applications;
                private _modules;
                /** Returns the default (first) application for this domain. */
                application(): Application;
                /** Holds a list of all applications on this domain.
                  * Do not add applications directly to this array.  Use the 'createApplication()' function.
                  * To remove an application, just dispose it.
                  */
                applications: Application[];
                protected _onAddToAppDomain(appDomain: IAppDomain, app: IApplication): void;
                /** Try to bring the window for this application to the front. */
                focus(): void;
                /** Closes the application by disposing all owned AppDomain instances, which also closes any opened windows, including the application's own window as well. */
                close(): void;
            }
        }
        interface IApplication extends Application.$__type {
        }
    }
}
