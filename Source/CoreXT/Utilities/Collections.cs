#if (NETSTANDARD1_5 || NETSTANDARD1_6 || NETCOREAPP1_0 || DNXCORE50 || NETCORE45  || NETCORE451 || NETCORE50)
#define DOTNETCORE
#endif
// (see more framework monikers here: https://docs.microsoft.com/en-us/nuget/schema/target-frameworks)

using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

using System.Collections.ObjectModel;

#if DOTNETCORE // (DNXCORE50: https://channel9.msdn.com/Events/dotnetConf/2015/ASPNET-5-Deep-Dive; 0:36)
#else
using System.Web;
using System.Data;
#endif

namespace CoreXT
{
    // =========================================================================================================================

    public static partial class Collections
    {
        public enum MergeAction { Skip, Replace, Merge, Remove };

        public static ObservableCollection<T> ToObservableCollection<T>(this IEnumerable<T> list)
        {
            ObservableCollection<T> c = new ObservableCollection<T>();
            foreach (T item in list)
                c.Add(item);
            return c;
        }

        /// <summary>
        /// Synchronizes two IEnumerable lists based on a unique property value.
        /// The process uses reflection to get the unique values as strings, and then compares them.
        /// </summary>
        /// <param name="target">The list to update.</param>
        /// <param name="source">The list to synchronize with.</param>
        /// <param name="uniquePropertyName">A primary key name for the record objects associated with the specified list/collection type.</param>
        /// <param name="removeMissingTargetItems">Set true to remove any target items that are not found in the source.</param>
        /// <param name="addMissingSourceItems">Set true to add any source items now found in the target.</param>
        /// <param name="mergeAction">A primary key name for the record objects associated with the specified list/collection type.</param>
        /// <returns></returns>
        public static void SyncCollections<T>(IList<T> target, IEnumerable<T> source, string uniqueFieldOrPropertyName, bool removeMissingTargetItems, bool addMissingSourceItems, MergeAction mergeAction)
            where T : class
        {
            object targetUID, sourceUID;
            bool tarFieldOrPropFound, srcFieldOrPropFound;
            T targetItem, sourceItem;

            // ... remove the missing records first to allow reused of existing item locations ...

            if (removeMissingTargetItems || mergeAction != MergeAction.Skip) // ("short circuit" attempt, since this effectively does nothing)
                for (int i = target.Count() - 1; i >= 0; i--)
                {
                    targetItem = target[i];
                    if (targetItem == null) continue;
                    tarFieldOrPropFound = Objects.GetFieldOrPropertyValue<object>(targetItem, uniqueFieldOrPropertyName, out targetUID);
                    if (!tarFieldOrPropFound) throw new Exception("Field or property name '" + uniqueFieldOrPropertyName + "' was not found on object '" + typeof(T).Name + "'.");

                    sourceItem = GetUniqueCollectionItem(source, uniqueFieldOrPropertyName, targetUID);

                    if (sourceItem != null)
                    {
                        // (target item exists in source collection)
                        if (mergeAction == MergeAction.Merge)
                            Objects.MergeData(targetItem, sourceItem);
                        else if (mergeAction == MergeAction.Replace)
                            target[i] = sourceItem;
                        continue; // (MergeAction.Remove handled in the second pass below)
                    }

                    // ... not found, or merge action is 'Replace', remove it ...
                    if (removeMissingTargetItems)
                        target.RemoveAt(i);
                }

            // ... add any new items in the source list to the target list (in the correct order) ...
            // (an insert index is used in attempts to maintain the same order - assuming the target list came from the same order)

            if (addMissingSourceItems || mergeAction == MergeAction.Remove)
            {
                int itemIndex = -1, insertIndex = 0;
                for (int i = 0; i < source.Count(); i++)
                {
                    sourceItem = source.ElementAt(i);
                    if (sourceItem == null) continue;
                    srcFieldOrPropFound = Objects.GetFieldOrPropertyValue<object>(sourceItem, uniqueFieldOrPropertyName, out sourceUID);
                    if (!srcFieldOrPropFound) throw new Exception("Field or property name '" + uniqueFieldOrPropertyName + "' was not found on object '" + typeof(T).Name + "'.");

                    targetItem = GetUniqueCollectionItem(target, uniqueFieldOrPropertyName, sourceUID, out itemIndex);

                    if (targetItem != null) // (source exists in the target)
                    {
                        if (mergeAction == MergeAction.Remove)
                            target.RemoveAt(itemIndex); // (no merge, just delete item)
                        if (insertIndex > itemIndex) itemIndex--; // (move insert location back also)
                        insertIndex = itemIndex + 1; // (insert next new source item after target item skipped)
                        continue;
                    }

                    // ... not found, add it ...
                    if (addMissingSourceItems)
                        target.Insert(insertIndex++, sourceItem);

                    //if (addMissingSourceItems)
                    //{
                    //    if (insertIndex >= target.Count)
                    //        target.Add(sourceItem);
                    //    else
                    //        target.Insert(insertIndex, sourceItem);
                    //    insertIndex++;
                    //}
                }
            }
        }
        public static void SyncCollections<T>(IList<T> target, IEnumerable<T> source, string uniqueFieldOrPropertyName, bool removeMissingTargetItems, bool addMissingSourceItems) where T : class
        { SyncCollections(target, source, uniqueFieldOrPropertyName, removeMissingTargetItems, addMissingSourceItems, MergeAction.Merge); }
        public static void SyncCollections<T>(IList<T> target, IEnumerable<T> source, string uniqueFieldOrPropertyName, bool removeMissingTargetItems) where T : class
        { SyncCollections(target, source, uniqueFieldOrPropertyName, removeMissingTargetItems, true); }
        public static void SyncCollections<T>(IList<T> target, IEnumerable<T> source, string uniqueFieldOrPropertyName) where T : class
        { SyncCollections(target, source, uniqueFieldOrPropertyName, true); }

        /// <summary>
        /// Sync an IEnumerable source with an IList target.
        /// Existing items will be left alone, while non-existing items will be inserted/added accordingly.
        /// </summary>
        public static void SyncCollections(IList target, IEnumerable source)
        {
            // ... remove items first, just to free up internal item positions in the list ...
            object targetItem;
            for (int i = target.Count - 1; i >= 0; i--)
            {
                targetItem = target[i];
                if (!source.Contains(targetItem))
                    target.RemoveAt(i);
            }
            // ... insert missing items ...
            int targetItemIndex, insertIndex = 0;
            foreach (object sourceItem in source)
            {
                targetItemIndex = target.IndexOf(sourceItem);
                if (targetItemIndex == -1)
                {
                    target.Insert(insertIndex, sourceItem);
                    insertIndex++;
                }
                else
                {
                    insertIndex = targetItemIndex + 1; // (next item will insert by default before this position)
                }
            }
        }

        /// <summary>
        /// Uses reflection to search for an item who's field value, named 'uniquePropertyName', matches the value given in 'uniqueID'.
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="collection"></param>
        /// <param name="uniquePropertyName"></param>
        /// <returns></returns>
        public static T GetUniqueCollectionItem<T>(IEnumerable<T> collection, string uniqueFieldOrPropertyName, object uniqueID, out int index)
            where T : class
        {
            object uid;
            for (int i = 0; i < collection.Count(); i++)
            {
                T item = collection.ElementAt(i);
                if (Objects.GetFieldOrPropertyValue<object>(item, uniqueFieldOrPropertyName, out uid)
                    && uid != null && uid.Equals(uniqueID))
                {
                    index = i;
                    return item;
                }
            }

            index = -1;
            return null;
        }
        public static T GetUniqueCollectionItem<T>(IEnumerable<T> collection, string uniqueFieldOrPropertyName, object uniqueID) where T : class
        { int i; return GetUniqueCollectionItem(collection, uniqueFieldOrPropertyName, uniqueID, out i); }

        public static T GetSimilarItem<T>(IEnumerable<T> collection, object itemToLookFor, string uniquePropertyOrFieldName) where T : class
        {
            object valueToLookFor, uid;
            if (Objects.GetPropertyOrFieldValue<object>(itemToLookFor, uniquePropertyOrFieldName, out valueToLookFor)
                && valueToLookFor != null)
            {
                for (int i = 0; i < collection.Count(); i++)
                {
                    T item = collection.ElementAt(i);
                    if (Objects.GetPropertyOrFieldValue<object>(item, uniquePropertyOrFieldName, out uid)
                        && uid != null && valueToLookFor.Equals(uid))
                        return item;
                }
            }
            return null;
        }
    }

    public static class DictionaryExtensions
    {
        /// <summary>
        /// Merges a value as a string (by calling 'value.ToString()'.
        /// If the value is null, the entry is removed from the dictionary instead.
        /// </summary>
        /// <typeparam name="TKey">The key type of the dictionary.</typeparam>
        /// <param name="collection">The collection to add to.</param>
        /// <param name="key">The key to set a value for.</param>
        /// <param name="value">The value to set for the specified key, which will be converted to a string first. If null, any existing entry is removed instead (if 'replace' is true).</param>
        /// <param name="replace">If true (default) adds a new entry or replaces an existing entry, otherwise the request is ignored.
        /// If this is false, nothing is removed, and any merge requests with existing keys will be ignored.</param>
        public static void MergeString<TKey>(this IDictionary<TKey, string> collection, TKey key, object value, bool replace = true)
        {
            if (!typeof(TKey).GetTypeInfo().IsValueType)
                if (key == null)
                    throw new ArgumentException("Value cannot be null.", "key");
                else if (key is string && string.IsNullOrEmpty((string)(object)key))
                    throw new ArgumentException("Value cannot be null or empty.", "key");

            if (replace || value != null && !collection.ContainsKey(key))
                if (value == null)
                    collection.Remove(key);
                else
                    collection[key] = value.ToString();
        }
    }

    // =========================================================================================================================
}
