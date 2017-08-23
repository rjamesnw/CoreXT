#if (NETSTANDARD1_5 || NETSTANDARD1_6 || NETCOREAPP1_0 || DNXCORE50 || NETCORE45  || NETCORE451 || NETCORE50)
#define DOTNETCORE
#endif
// (see more framework monikers here: https://docs.microsoft.com/en-us/nuget/schema/target-frameworks)

using System;
using System.Collections.Generic;
using System.Reflection;

#if DOTNETCORE // (DNXCORE50: https://channel9.msdn.com/Events/dotnetConf/2015/ASPNET-5-Deep-Dive; 0:36)
#else
using System.Web;
using System.Data;
#endif

namespace CoreXT
{
    // =========================================================================================================================

    public static class LinqExtensions
    {
        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Executes an Update statement block on all elements in an IEnumerable&lt;T> sequence.
        /// </summary>
        /// <typeparam name="TSource">The source element type.</typeparam>
        /// <param name="source">The source sequence.</param>
        /// <param name="update">The update statement to execute for each element.</param>
        /// <returns>The number of records affected.</returns>
        public static int Update<TSource>(this IEnumerable<TSource> source, Action<TSource> update)
        {
            if (source == null) throw new ArgumentNullException("source");
            if (update == null) throw new ArgumentNullException("update");

            if (typeof(TSource).GetTypeInfo().IsValueType)
                throw new NotSupportedException("Value type elements are not supported, since values are only copies of original values. Object references are required.");

            int count = 0;

            foreach (TSource element in source)
            {
                update(element);
                count++;
            }

            return count;
        }
        // ---------------------------------------------------------------------------------------------------------------------
    }

    // =========================================================================================================================
}
