// ############################################################################################################################################
// Collections: ObservableCollection
// ############################################################################################################################################

namespace CoreXT.System.Collections {
    // ========================================================================================================================================

    export interface NotifyCollectionChangingEventHandler<TItem> { (sender: {}, oldItems: TItem[], oldIndex: number, newItems: TItem[], newIndex: number): any }
    export interface NotifyCollectionChangedEventHandler<TItem> { (sender: {}, oldItems: TItem[], oldIndex: number, newItems: TItem[], newIndex: number): any }

    export interface INotifyCollectionChanging<TOwner extends object, TItems> {
        collectionChanging: Events.IEventDispatcher<TOwner, NotifyCollectionChangingEventHandler<TItems>>;
    }

    export interface INotifyCollectionChanged<TOwner extends object, TItems> {
        collectionChanged: Events.IEventDispatcher<TOwner, NotifyCollectionChangedEventHandler<TItems>>;
    }

    /** Holds an array of items, and implements notification functionality for when the collection changes. */
    export var ObservableCollection = ClassFactory(Collections, Array,
        (base) => {
            class ObservableCollection<TOwner extends object, T> extends base<T> implements INotifyCollectionChanging<TOwner, T>, INotifyCollectionChanged<TOwner, T>  {
                [name: string]: any;

                collectionChanging: Events.IEventDispatcher<TOwner, NotifyCollectionChangingEventHandler<T>>; // TODO: Implement
                collectionChanged: Events.IEventDispatcher<TOwner, NotifyCollectionChangedEventHandler<T>>; // TODO: Implement

                // --------------------------------------------------------------------------------------------------------------------------

                protected static readonly 'ObservableCollectionFactory' = class Factory extends FactoryBase(ObservableCollection, base['ArrayFactory']) {
                    'new'<TOwner extends object, T>(...items: T[]): ObservableCollection<TOwner, T> { return null; }

                    init<TOwner extends object, T>(o: ObservableCollection<TOwner, T>, isnew: boolean, ...items: T[]): ObservableCollection<TOwner, T> {
                        this.super.init<T>(o, isnew, ...items);
                        return o;
                    }
                };

                // --------------------------------------------------------------------------------------------------------------------------
            }
            return [ObservableCollection, ObservableCollection["ObservableCollectionFactory"]];
        },
        "ObservableCollection"
    );

    declare class ObservableCollectionClass<TOwner extends object, T> extends ObservableCollection.$__type<TOwner, T> { }
    export interface IObservableCollection<TOwner extends object, T> extends ObservableCollectionClass<TOwner, T> { }

    // ========================================================================================================================================

} // (end Collections)
