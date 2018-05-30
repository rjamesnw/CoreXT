using CoreXT.ASPNet;
using CoreXT.Services.DI;
using CoreXT.Toolkit.Components;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace CoreXT.MVC
{
    public class CoreXTController : Controller
    {
        /// <summary>
        /// The ISO string format constant, which is simply "o".
        /// <para>This is the format used in date/time communications with the client.</para>
        /// </summary>
        public const string ISO_DATE_FORMAT = DateTimes.ISO_DATE_FORMAT; //"yyyy-MM-ddTHH:mm:ss.fffZ";
        /// <summary>
        /// The global default date-only format - typically used for display purposes. The default is "yyyy-MM-dd".
        /// </summary>
        public static string DATE_FORMAT = "yyyy-MM-dd";
        /// <summary>
        /// The global default time-only format - typically used for display purposes. The default is "HH:mm:ss".
        /// </summary>
        public static string TIME_FORMAT = "HH:mm:ss";
        /// <summary>
        /// The global default date and time format - typically used for display purposes. The default is "yyyy-MM-dd HH:mm:ss".
        /// </summary>
        public static string DATETIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
        /// <summary>
        /// The global default compact date format (without separators). The default is "yyyyMMdd".
        /// </summary>
        public static string COMPACT_DATE_FORMAT = "yyyyMMdd";
        /// <summary>
        /// The global default compact date and time format (without separators). The default is "yyyyMMddHHmmss".
        /// </summary>
        public static string COMPACT_DATETIME_FORMAT = "yyyyMMddHHmmss";

        public ICoreXTServiceProvider ServiceProvider { get; private set; }

        public CoreXTController(ICoreXTServiceProvider services)
        {
            ServiceProvider = services;
        }

        /// <summary>
        /// Get a control with a dummy view context in order to be rendered directly from a controller.
        /// </summary>
        /// <typeparam name="T">The type of control to create.</typeparam>
        protected T GetControl<T>() where T : class, IWebViewComponent
        {
            return ComponentBaseExtensions.GetComponent<T>(this);
        }

        /// <summary>
        /// Parses a JavaScript ISO date and returns a CLR DateTimeOffset.
        /// </summary>
        /// <param name="dateStr">JavaScript date in the ISO format "yyyy-MM-ddTHH:mm:ss.FFFZ".</param>
        /// <returns></returns>
        protected DateTimeOffset? ParseISODate(string dateStr) => DateTimes.ParseISODate(dateStr);

        /// <summary>
        /// Returns the current date and time in the JavaScript 'Date.toUTCString(); format.
        /// </summary>
        /// <returns></returns>
        protected string GetCurrentISODate() => DateTimes.GetCurrentISODate();

        /// <summary>
        /// Converts a DateimTimeOffset to an ISO date string. 
        /// </summary>
        /// <param name="dt">The DateTimeOffset to get an ISO string for. If this is null, then a null string is returned.</param>
        /// <returns></returns>
        protected string ToISODate(DateTimeOffset? dt) => dt.ToISODate();

        /// <summary>
        /// Converts a DateimTimeOffset to an ISO date string. 
        /// </summary>
        /// <param name="dt">The DateTimeOffset to get an ISO string for.</param>
        /// <returns></returns>
        protected string ToISODate(DateTimeOffset dt) => dt.ToISODate();

        /// <summary>
        /// Converts a DateimTime to an ISO date string. 
        /// </summary>
        /// <param name="dt">The DateTime to get an ISO string for. If this is null, then a null string is returned.</param>
        /// <returns></returns>
        protected string ToISODate(DateTime? dt) => dt.ToISODate();

        /// <summary>
        /// Converts a DateimTime to an ISO date string. 
        /// </summary>
        /// <param name="dt">The DateTime to get an ISO string for.</param>
        /// <returns></returns>
        protected string ToISODate(DateTime dt) => dt.ToISODate();
    }
}
