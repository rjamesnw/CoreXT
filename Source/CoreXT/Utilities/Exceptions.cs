using System;
using System.Collections.Generic;
using System.Reflection;

#if NETCORE // (DNXCORE50: https://channel9.msdn.com/Events/dotnetConf/2015/ASPNET-5-Deep-Dive; 0:36)
#else
using System.Web;
using System.Data;
#endif

namespace CoreXT
{
    // =========================================================================================================================

    public static partial class Exceptions
    {
        /// <summary>
        /// A simple utility method which formats and returns an exception error object.
        /// The stack trace is also included. The inner exceptions are also recursed and added.
        /// </summary>
        /// <param name="ex">The exception object with error message to format and return.</param>
        /// <param name="includeStackTrace">Set false to not include the stack trace.</param>
        /// <param name="includeLabels">Set false to exclude the "Message: " and "Stack: " sections labels.</param>
        public static string GetFullErrorMessage(this Exception ex, bool includeStackTrace, bool includeLabels) { return _GetFullErrorMessage(ex, "", includeStackTrace, includeLabels); }
        public static string GetFullErrorMessage(this Exception ex) { return _GetFullErrorMessage(ex, "", true, true); }

        static string _GetFullErrorMessage(Exception ex, string margin, bool includeStackTrace, bool includeLabels)
        {
            bool topMargin = string.IsNullOrEmpty(margin);
            var arrow = topMargin ? "" : "» ";
            string msg = margin + arrow + (includeLabels ? "Message: " : "") + ex.Message + "\r\n\r\n" + margin;
            if (includeStackTrace && !string.IsNullOrEmpty(ex.StackTrace)) msg += arrow + (includeLabels ? "Stack Trace: " : "") + ex.StackTrace;
            if (ex.InnerException != null)
                msg += "\r\n\r\n***Inner Exception ***\r\n" + _GetFullErrorMessage(ex.InnerException, margin + "==", includeStackTrace, includeLabels);
            return msg;
        }

        /// <summary>
        /// Returns the current exception and all inner exceptions.
        /// </summary>
        public static IEnumerable<Exception> AllExceptions(this Exception e)
        {
            while (e != null) { yield return e; e = e.InnerException; }
        }

        /// <summary>
        /// Returns the current exception including all inner exceptions that match the specified exception type.
        /// </summary>
        public static IEnumerable<Exception> ExceptionOf<TException>(this Exception e) where TException : Exception
        {
            while (e != null) { if (typeof(TException).GetTypeInfo().IsAssignableFrom(e.GetType())) yield return e; e = e.InnerException; }
        }
    }

    // =========================================================================================================================
}
