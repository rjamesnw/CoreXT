declare namespace CoreXT.System.Collections {
    interface NotifyCollectionChangingEventHandler<TItem> {
        (sender: {}, oldItems: TItem[], oldIndex: number, newItems: TItem[], newIndex: number): any;
    }
    interface NotifyCollectionChangedEventHandler<TItem> {
        (sender: {}, oldItems: TItem[], oldIndex: number, newItems: TItem[], newIndex: number): any;
    }
    interface INotifyCollectionChanging<TOwner extends object, TItems> {
        collectionChanging: Events.IEventDispatcher<TOwner, NotifyCollectionChangingEventHandler<TItems>>;
    }
    interface INotifyCollectionChanged<TOwner extends object, TItems> {
        collectionChanged: Events.IEventDispatcher<TOwner, NotifyCollectionChangedEventHandler<TItems>>;
    }
    const ObservableCollection_base: {
        new (): {
            $__disposing?: boolean;
            $__disposed?: boolean;
        };
        $__type: IType<object>;
        readonly super: typeof Array;
        'new'?(...args: any[]): any;
        init?(o: object, isnew: boolean, ...args: any[]): void;
        $__register<TClass extends IType<object>, TFactory extends IFactory<IType<object>, NewDelegate<object>, InitDelegate<object>> & IType<object>>(this: TFactory & ITypeInfo & {
            $__type: TClass;
        }, namespace: object, addMemberTypeInfo?: boolean): TFactory;
    };
    /** Holds an array of items, and implements notification functionality for when the collection changes. */
    class ObservableCollection extends ObservableCollection_base {
        static 'new'<TOwner extends object, T>(...items: T[]): IObservableCollection<TOwner, T>;
        static init<TOwner extends object, T>(o: IObservableCollection<TOwner, T>, isnew: boolean, ...items: T[]): void;
    }
    namespace ObservableCollection {
        const $__type_base: typeof Array.$__type;
        class $__type<TOwner extends object, T> extends $__type_base<T> implements INotifyCollectionChanging<TOwner, T>, INotifyCollectionChanged<TOwner, T> {
            [name: string]: any;
            collectionChanging: Events.IEventDispatcher<TOwner, NotifyCollectionChangingEventHandler<T>>;
            collectionChanged: Events.IEventDispatcher<TOwner, NotifyCollectionChangedEventHandler<T>>;
        }
    }
    interface IObservableCollection<TOwner extends object, T> extends ObservableCollection.$__type<TOwner, T> {
    }
}
