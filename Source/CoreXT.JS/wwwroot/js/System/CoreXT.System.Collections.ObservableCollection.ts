// ###########################################################################################################################
// Collections: ObservableCollection
// ###########################################################################################################################

namespace CoreXT.System.Collections {
    // =======================================================================================================================

    export interface NotifyCollectionChangingEventHandler<TItem> { (sender: {}, oldItems: TItem[], oldIndex: number, newItems: TItem[], newIndex: number): any }
    export interface NotifyCollectionChangedEventHandler<TItem> { (sender: {}, oldItems: TItem[], oldIndex: number, newItems: TItem[], newIndex: number): any }

    export interface INotifyCollectionChanging<TOwner extends object, TItems> {
        collectionChanging: Events.IEventDispatcher<TOwner, NotifyCollectionChangingEventHandler<TItems>>;
    }

    export interface INotifyCollectionChanged<TOwner extends object, TItems> {
        collectionChanged: Events.IEventDispatcher<TOwner, NotifyCollectionChangedEventHandler<TItems>>;
    }

    /** Holds an array of items, and implements notification functionality for when the collection changes. */
    class $ObservableCollection<TOwner extends object, T> extends Array.$Type<T> implements INotifyCollectionChanging<TOwner, T>, INotifyCollectionChanged<TOwner, T>  {
        [name: string]: any;

        collectionChanging: Events.IEventDispatcher<TOwner, NotifyCollectionChangingEventHandler<T>>; // TODO: Implement
        collectionChanged: Events.IEventDispatcher<TOwner, NotifyCollectionChangedEventHandler<T>>; // TODO: Implement

        // ----------------------------------------------------------------------------------------------------------------

        static ' '() {
            var _super_factory = super[' ']().Array_factory;
            return class {
                static ObservableCollection_factory?= class {
                    static 'new'<TOwner extends object, T>(...items: T[]): $ObservableCollection<TOwner, T> { return null; }

                    static init<TOwner extends object, T>($this: $ObservableCollection<TOwner, T>, isnew: boolean, ...items: T[]): $ObservableCollection<TOwner, T> {
                        _super_factory.init<T>($this, isnew, ...items);
                        return $this;
                    }
                }
            }
        }

        // ----------------------------------------------------------------------------------------------------------------
    }

    export interface ICollection<TOwner extends object, T> extends $ObservableCollection<TOwner, T> { }

    export var ObservableCollection = AppDomain.registerClass($ObservableCollection, $ObservableCollection[' ']().ObservableCollection_factory, [CoreXT, System, Collections]);

    // =======================================================================================================================

} // (end Collections)
