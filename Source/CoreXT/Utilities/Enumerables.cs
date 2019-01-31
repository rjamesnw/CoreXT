using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

using System.Collections.ObjectModel;

#if NETCORE // (DNXCORE50: https://channel9.msdn.com/Events/dotnetConf/2015/ASPNET-5-Deep-Dive; 0:36)
#else
using System.Web;
using System.Data;
#endif

namespace CoreXT
{
    // =========================================================================================================================

    public static partial class Enumerables
    {
        /// <summary>
        ///     An IEnumerable&lt;T&gt; extension method that applies an operation to all items in this collection.
        /// </summary>
        /// <typeparam name="T"> Generic type parameter. </typeparam>
        /// <param name="this"> The enumeration to act on. </param>
        /// <param name="action"> The action to run on each item. </param>
        public static void ForEach<T>(this IEnumerable<T> @this, Action<T> action)
        {
            foreach (T item in @this)
                action(item);
        }
    }

    // =========================================================================================================================
}
