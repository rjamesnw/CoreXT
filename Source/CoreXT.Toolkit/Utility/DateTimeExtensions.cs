using Microsoft.Extensions.Configuration;
using System;

namespace CoreXT.Toolkit.Utility
{
    public static class DateTimeExtensions
    {
        public static DateTime ToLocalTime(this DateTime dt, IConfiguration config)
        {
            if (config == null)
                throw new ArgumentNullException("config");
            var timeZoneId = config["TimeZoneId"] ?? "W. Europe Standard Time";
            // dt.DateTimeKind should be Utc!
            var tzi = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
            return TimeZoneInfo.ConvertTime(DateTime.SpecifyKind(dt, DateTimeKind.Utc), tzi);
        }

        /// <summary>
        /// Converts UTC date and times to local dates.
        /// </summary>
        /// <param name="dt"></param>
        /// <param name="zoneID"></param>
        public static DateTime ToLocalTime(this DateTime dt, string zoneID)
        {
            if (dt.Kind == DateTimeKind.Local)
                return dt;
            var timeZoneId = zoneID ?? "Eastern Standard Time"; //"W. Europe Standard Time";
            // dt.Kind should be Utc!
            var tzi = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
            return TimeZoneInfo.ConvertTime(DateTime.SpecifyKind(dt, DateTimeKind.Utc), tzi);
        }

        /// <summary>
        /// Converts local date and times to UTC.
        /// </summary>
        /// <param name="dt"></param>
        /// <returns></returns>
        public static DateTime ToUtcTime(this DateTime dt)
        {
            if (dt.Kind == DateTimeKind.Utc)
                return dt;
            var tzi = TimeZoneInfo.FindSystemTimeZoneById("GMT Standard Time");
            return TimeZoneInfo.ConvertTime(dt, tzi);
        }

        public static DateTime RoundDown(this DateTime dateTime, int minutes)
        {
            return new DateTime(dateTime.Year, dateTime.Month,
                 dateTime.Day, dateTime.Hour, (dateTime.Minute / minutes) * minutes, 0);
        }
    }
}
