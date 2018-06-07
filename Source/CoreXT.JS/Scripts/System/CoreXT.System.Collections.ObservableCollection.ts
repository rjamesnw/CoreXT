// ############################################################################################################################################
// Collections: ObservableCollection
// ############################################################################################################################################

namespace CoreXT.System.Collections {
    namespace(() => CoreXT.System.Collections);
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
    export class ObservableCollection extends FactoryBase(Array) {
        static 'new'<TOwner extends object, T>(...items: T[]): IObservableCollection<TOwner, T> { return null; }

        static init<TOwner extends object, T>(o: IObservableCollection<TOwner, T>, isnew: boolean, ...items: T[]): void {
            this.super.init<T>(o, isnew, ...items);
        }
    }
    export namespace ObservableCollection {
        export class $__type<TOwner extends object, T> extends FactoryType(Array)<T> implements INotifyCollectionChanging<TOwner, T>, INotifyCollectionChanged<TOwner, T> {
            // --------------------------------------------------------------------------------------------------------------------------

            [name: string]: any;

            collectionChanging: Events.IEventDispatcher<TOwner, NotifyCollectionChangingEventHandler<T>>; // TODO: Implement
            collectionChanged: Events.IEventDispatcher<TOwner, NotifyCollectionChangedEventHandler<T>>; // TODO: Implement

            // --------------------------------------------------------------------------------------------------------------------------
            private static [constructor](factory: typeof ObservableCollection) {
                //factory.init = (o, isnew) => {
                //};
            }
            // --------------------------------------------------------------------------------------------------------------------------
        }

        ObservableCollection.$__register(Collections);
    }

    export interface IObservableCollection<TOwner extends object, T> extends ObservableCollection.$__type<TOwner, T> { }

    // ========================================================================================================================================

} // (end Collections)
