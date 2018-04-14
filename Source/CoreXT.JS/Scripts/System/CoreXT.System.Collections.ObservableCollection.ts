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

        static '$ObservableCollection Factory' = function () {
            type TInstance<TOwner extends object, T> = $ObservableCollection<TOwner, T>
            return frozen(class Factory implements IFactory {
                $Type = $ObservableCollection;
                $InstanceType = <{}>null && new this.$Type();
                $BaseFactory = this.$Type['$Array Factory'].prototype;

                'new'<TOwner extends object, T>(...items: T[]): TInstance<TOwner, T> { return null; }

                init<TOwner extends object, T>($this: TInstance<TOwner, T>, isnew: boolean, ...items: T[]): TInstance<TOwner, T> {
                    this.$BaseFactory.init<T>($this, isnew, ...items);
                    return $this;
                }
            });
        }();

        // ----------------------------------------------------------------------------------------------------------------
    }

    export interface IObservableCollection<TOwner extends object, T> extends $ObservableCollection<TOwner, T> { }
    export var ObservableCollection = Types.__registerFactoryType($ObservableCollection, $ObservableCollection['$ObservableCollection Factory'], [CoreXT, System, Collections]);

    // =======================================================================================================================

} // (end Collections)
