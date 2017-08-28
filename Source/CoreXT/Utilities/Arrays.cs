#if (NETSTANDARD1_6 || NETSTANDARD2_0 || NETCOREAPP1_0 || NETCOREAPP2_0 || DNXCORE50 || NETCORE45  || NETCORE451 || NETCORE50)
#define DOTNETCORE
#endif
// (see more framework monikers here: https://docs.microsoft.com/en-us/nuget/schema/target-frameworks)

using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;

#if DOTNETCORE // (DNXCORE50: https://channel9.msdn.com/Events/dotnetConf/2015/ASPNET-5-Deep-Dive; 0:36)
#else
using System.Web;
using System.Data;
#endif

namespace CoreXT
{
    // =========================================================================================================================

    public static partial class Arrays
    {
        /// <summary>
        /// Concatenate a list of arrays. Specify one array for each parameter.
        /// To concatenate one list of arrays, use Join().
        /// </summary>
        /// <typeparam name="T">Array type for each argument.</typeparam>
        /// <param name="args">A concatenated array made form the specified arrays.</param>
        /// <returns></returns>
        public static T[] Concat<T>(params T[][] args)
        {
            return Join<T>(args);
        }
        /// <summary>
        /// Concatenate a list of arrays.
        /// </summary>
        /// <typeparam name="T">Array type for each argument.</typeparam>
        /// <param name="arrays">A concatenated array made form the specified arrays.</param>
        /// <returns></returns>
        public static T[] Join<T>(T[][] arrays)
        {
            if (arrays.Length == 0) return null;
            Int32 newLength = 0, i;
            for (i = 0; i < arrays.Length; i++)
                newLength += arrays[i].Length;
            T[] newArray = new T[newLength];
            T[] array;
            Int32 writeIndex = 0;
            for (i = 0; i < arrays.Length; i++)
            {
                array = arrays[i];
                Array.Copy(array, 0, newArray, writeIndex, array.Length);
                writeIndex += array.Length;
            }
            return newArray;
        }
        public static string Join<T>(IEnumerable<T> list)
        {
            string s = "";
            foreach (T item in list)
                s += item != null ? item.ToString() : "";
            return s;
        }

        public static T[] Convert<T>(IList array)
        {
            if (array == null) return null;
            T[] convertedItems = new T[array.Count];
            for (int i = 0; i < array.Count; i++)
                convertedItems[i] = (T)System.Convert.ChangeType(array[i], typeof(T), CultureInfo.CurrentCulture);
            return convertedItems;
        }

        public static T[] ConvertWithDefaults<T>(IList array)
        {
            if (array == null) return null;
            T[] convertedItems = new T[array.Count];
            for (int i = 0; i < array.Count; i++)
            {
                try { convertedItems[i] = (T)System.Convert.ChangeType(array[i], typeof(T), CultureInfo.CurrentCulture); }
                catch { convertedItems[i] = default(T); }
            }
            return convertedItems;
        }

        /// <summary>
        /// Select an item from the end of the array.
        /// </summary>
        /// <typeparam name="T">Array type.</typeparam>
        /// <param name="items">The array.</param>
        /// <param name="index">0, or a negative value, that is the offset of the item to retrieve.</param>
        public static T FromEnd<T>(this T[] items, int index)
        {
            return items[items.Length - 1 + index];
        }
        /// <summary>
        /// Select an item from the end of the list.
        /// </summary>
        /// <typeparam name="T">List type.</typeparam>
        /// <param name="items">The list.</param>
        /// <param name="index">0, or a negative value, that is the offset of the item to retrieve.</param>
        public static T FromEnd<T>(this IList<T> items, int index)
        {
            return items[items.Count - 1 + index];
        }
    }

    // =========================================================================================================================
}
