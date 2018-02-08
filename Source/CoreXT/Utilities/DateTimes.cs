#if (NETSTANDARD1_6 || NETSTANDARD2_0 || NETCOREAPP1_0 || NETCOREAPP2_0 || DNXCORE50 || NETCORE45  || NETCORE451 || NETCORE50)
#define DOTNETCORE
#endif
// (see more framework monikers here: https://docs.microsoft.com/en-us/nuget/schema/target-frameworks)

using System;
using System.Globalization;

#if DOTNETCORE // (DNXCORE50: https://channel9.msdn.com/Events/dotnetConf/2015/ASPNET-5-Deep-Dive; 0:36)
#else
using System.Web;
using System.Data;
#endif

namespace CoreXT
{
    // =========================================================================================================================

    public static class DateTimes
    {
        // ---------------------------------------------------------------------------------------------------------------------

        public const string ISO_DATE_FORMAT = "o"; //"yyyy-MM-ddTHH:mm:ss.fffZ";

        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Parses a JavaScript ISO date and returns a CLR DateTimeOffset.
        /// </summary>
        /// <param name="dateStr">JavaScript date in the ISO format "yyyy-MM-ddTHH:mm:ss.FFFZ".</param>
        /// <returns></returns>
        public static DateTimeOffset? ParseISODate(string dateStr)
        {
            // ... parse a JavaScript based date format such as "Tue, Jul 12 2011 16:00:00 GMT-0700" ...
            if (DateTimeOffset.TryParse(dateStr, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var result))
                return result;
            else
                return null;
        }

        /// <summary>
        /// Returns the current date and time in the JavaScript 'Date.toUTCString(); format.
        /// </summary>
        /// <returns></returns>
        public static string GetCurrentISODate() => DateTime.UtcNow.ToString(ISO_DATE_FORMAT);

        /// <summary>
        /// Converts a DateimTimeOffset to an ISO date string. 
        /// </summary>
        /// <param name="dt">The DateTimeOffset to get an ISO string for.</param>
        /// <returns></returns>
        public static string ToISODate(this DateTimeOffset dt)
        {
            if (dt == null) return null;
            return dt.ToString(ISO_DATE_FORMAT);
        }
        /// <summary>
        /// Converts a DateimTimeOffset to an ISO date string. 
        /// </summary>
        /// <param name="dt">The DateTimeOffset to get an ISO string for. If this is null, then a null string is returned.</param>
        /// <returns></returns>
        public static string ToISODate(this DateTimeOffset? dt)
        {
            if (dt == null) return null;
            return dt.Value.ToISODate();
        }

        /// <summary>
        /// Converts a DateimTime to an ISO date string. 
        /// </summary>
        /// <param name="dt">The DateTime to get an ISO string for.</param>
        /// <returns></returns>
        public static string ToISODate(this DateTime dt)
        {
            if (dt.Kind == DateTimeKind.Local) dt = dt.ToUniversalTime();
            else if (dt.Kind != DateTimeKind.Utc) dt = new DateTime(dt.Ticks, DateTimeKind.Utc); // (assume the db date is stored as UTC)
            return dt.ToString(ISO_DATE_FORMAT);
        }

        /// <summary>
        /// Converts a DateimTime to an ISO date string. 
        /// </summary>
        /// <param name="dt">The DateTime to get an ISO string for. If this is null, then a null string is returned.</param>
        /// <returns></returns>
        public static string ToISODate(this DateTime? dt)
        {
            if (dt == null) return null;
            return dt.Value.ToISODate();
        }

        // ---------------------------------------------------------------------------------------------------------------------
    }

    // =========================================================================================================================
}
