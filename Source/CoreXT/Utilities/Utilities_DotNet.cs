#if (NETSTANDARD1_6 || NETSTANDARD2_0 || NETCOREAPP1_0 || NETCOREAPP2_0 || DNXCORE50 || NETCORE45  || NETCORE451 || NETCORE50)
#define DOTNETCORE
#endif

using System;
using System.IO;

#if !DOTNETCORE
using System.Management; // System.Management.dll
#else
#endif

namespace CoreXT
{
    // =========================================================================================================================

    /// <summary>
    /// This class contains global (shared) utility methods. Although many methods are
    /// static, the properties are not. Some situations require shared properties, such
    /// as error messages.
    /// </summary>
    public static partial class Utilities
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns the text contents of the specified file.
        /// </summary>
        /// <param name="filepath">The path+filename of the file to retrieve. If the file is not found, an attempt will be made to map it to the current path using 'Server.MapPath'.</param>
        /// <returns></returns>
        public static string GetTextFile(string filepath, bool ignoreError)
        {
            if (ignoreError && !File.Exists(filepath))
                return "";
            return File.ReadAllText(filepath);
        }

        // --------------------------------------------------------------------------------------------------------------------

        public static string RangeErrorMsg(int result, object value, string typeName, string objectName, object min, object max)
        {
            if (typeName != "") typeName = " " + typeName;
            if (objectName != "") objectName = " for " + objectName;
            if (result == 0)
                return "The" + typeName + " value '" + value.ToString() + "'" + objectName + " must be between " + min.ToString() + " and " + max.ToString() + " (inclusive).";
            else if (result == -2)
                return "The" + typeName + " value '" + value.ToString() + "'" + objectName + " is not valid.";
            else if (result < 0)
                return "The" + typeName + " value '" + value.ToString() + "'" + objectName + " must be greater than " + min.ToString();
            else if (result > 0)
                return "The" + typeName + " value '" + value.ToString() + "'" + objectName + " must be less than " + max.ToString();
            return "";
        }
        /// <summary>
        /// Determines if the value, converted to type "dataType" falls within the specified range.
        /// </summary>
        /// <param name="value">Value to convert.</param>
        /// <param name="dataType">New or existing data type for the value.</param>
        /// <param name="min">Minimum value allowed.</param>
        /// <param name="max">Maximum value allowed.</param>
        /// <param name="msg">A detailed message of the failed range test.</param>
        /// <returns>'true' if the value is within range, and 'false' otherwise.</returns>
        public static int RangeTest(object value, Type dataType, object min, object max)
        {
            try
            {
                value = ND(value, "");

                if (IsDateTime(dataType))
                {
                    DateTime v = Convert.ToDateTime(value);
                    if (min != null && min.ToString() != "")
                        if (v < Convert.ToDateTime(min)) return -1;
                    if (max != null && max.ToString() != "")
                        if (v > Convert.ToDateTime(max)) return 1;
                    return 0;
                }
                else if (IsFloat(dataType))
                {
                    double v = Convert.ToDouble(value);
                    if (min != null && min.ToString() != "")
                        if (v < Convert.ToDouble(min)) return -1;
                    if (max != null && max.ToString() != "")
                        if (v > Convert.ToDouble(max)) return 1;
                    return 0;
                }
                else if (IsNumeric(dataType))
                {
                    Int64 v = Convert.ToInt64(value);
                    if (min != null && min.ToString() != "")
                        if (v < Convert.ToInt64(min)) return -1;
                    if (max != null && max.ToString() != "")
                        if (v > Convert.ToInt64(max)) return 1;
                    return 0;
                }
            }
            catch { return -2; }

            throw new Exception("Range cannot be tested, specified data type is not supported.");
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// The value is added to the target, appending a delimiter if the target is not empty. This 
        /// is used mainly when compiling a list of strings, such as a comma delimited string list, 
        /// where some strings in the list are optional.
        /// <para>Note: This method does not check if target or value contains a delimiter.</para>
        /// </summary>
        public static string AddDelimited(object target, object delimiter, object value)
        {
            string _target = ND(target, "").Trim();
            if (_target != "")
                return _target + delimiter + ND(value, "");
            else
                return ND(value, "");
        }

        // --------------------------------------------------------------------------------------------------------------------

        public static DateTime GetDateTime(string dateTimeString)
        {   // Supports YYYYMMDD (assumed if only 8 characters)
            DateTime dateTime;
            if (dateTimeString.Length == 8)
                dateTime = new DateTime(
                    Convert.ToInt32(dateTimeString.Substring(0, 4)),
                    Convert.ToInt32(dateTimeString.Substring(4, 2)),
                    Convert.ToInt32(dateTimeString.Substring(6, 2)));
            else
                dateTime = DateTime.Parse(dateTimeString);
            return dateTime;
        }

        // --------------------------------------------------------------------------------------------------------------------

        static string _DateTimeStringFormat = "MMM dd, yyyy";

        /// <summary>
        /// Set an application's globally used date format string (default is "MMM dd, yyyy").
        /// </summary>
        public static string DateTimeStringFormat
        {
            get { return _DateTimeStringFormat; }
            set { _DateTimeStringFormat = value; }
        }

        /// <summary>
        /// Format a DateTime
        /// </summary>
        /// <param name="d"></param>
        /// <returns></returns>
        public static string FormatDateTime(object d)
        {
            DateTime dt;
            if (d is DateTime)
                dt = (DateTime)d;
            else
            {
                d = ND<object>(d, null); // (filter "database null" type)
                if (d == null) return "";
                dt = Convert.ToDateTime(d);
            }
            return dt.ToString(DateTimeStringFormat);
        }

        // --------------------------------------------------------------------------------------------------------------------


        public delegate double TimeElapsedMethod(object dateValue1, object dateValue2, bool absolute);

        /// <summary>
        /// Calculates the number of seconds between to date values.
        /// </summary>
        /// <param name="dateValue1">The first date value.</param>
        /// <param name="dateValue2">The second date value.</param>
        /// <param name="absolute">If true, a non-negative (absolute) value is always returned.</param>
        /// <returns></returns>
        public static double SecondsElapsed(object dateValue1, object dateValue2, bool absolute)
        {
            DateTime dt1 = Convert.ToDateTime(dateValue1);
            DateTime dt2 = Convert.ToDateTime(dateValue2);
            // Note: Ticks = 100 nanosecond intervals, or 100*10000000 ticks/second (1,000,000,000 nanoseconds in a second)
            Int64 diff = (dt2.Ticks - dt1.Ticks) / TimeSpan.TicksPerSecond;
            return (absolute) ? (System.Math.Abs(diff)) : (diff);
        }

        /// <summary>
        /// Calculates the number of minutes between to date values.
        /// </summary>
        /// <param name="dateValue1">The first date value.</param>
        /// <param name="dateValue2">The second date value.</param>
        /// <param name="absolute">If true, a non-negative (absolute) value is always returned.</param>
        /// <returns></returns>
        public static double MinutesElapsed(object dateValue1, object dateValue2, bool absolute)
        {
            double diff = SecondsElapsed(dateValue1, dateValue2, false) / 60;
            return (absolute) ? (System.Math.Abs(diff)) : (diff);
        }

        /// <summary>
        /// Calculates the number of hours between to date values.
        /// </summary>
        /// <param name="dateValue1">The first date value.</param>
        /// <param name="dateValue2">The second date value.</param>
        /// <param name="absolute">If true, a non-negative (absolute) value is always returned.</param>
        /// <returns></returns>
        public static double HoursElapsed(object dateValue1, object dateValue2, bool absolute)
        {
            double diff = MinutesElapsed(dateValue1, dateValue2, false) / 60;
            return (absolute) ? (System.Math.Abs(diff)) : (diff);
        }

        /// <summary>
        /// Calculates the number of days between to date values.
        /// </summary>
        /// <param name="dateValue1">The first date value.</param>
        /// <param name="dateValue2">The second date value.</param>
        /// <param name="absolute">If true, a non-negative (absolute) value is always returned.</param>
        /// <returns></returns>
        public static double DaysElapsed(object dateValue1, object dateValue2, bool absolute)
        {
            double diff = HoursElapsed(dateValue1, dateValue2, false) / 24;
            return (absolute) ? (System.Math.Abs(diff)) : (diff);
        }

        /// <summary>
        /// Calculates the number of weeks between to date values.
        /// </summary>
        /// <param name="dateValue1">The first date value.</param>
        /// <param name="dateValue2">The second date value.</param>
        /// <param name="absolute">If true, a non-negative (absolute) value is always returned.</param>
        /// <returns></returns>
        public static double WeeksElapsed(object dateValue1, object dateValue2, bool absolute)
        {
            double diff = DaysElapsed(dateValue1, dateValue2, false) / 7;
            return (absolute) ? (System.Math.Abs(diff)) : (diff);
        }

        /// <summary>
        /// Calculates the number of years between to date values.
        /// </summary>
        /// <param name="dateValue1">The first date value.</param>
        /// <param name="dateValue2">The second date value.</param>
        /// <param name="absolute">If true, a non-negative (absolute) value is always returned.</param>
        /// <returns></returns>
        public static double YearsElapsed(object dateValue1, object dateValue2, bool absolute)
        {
            double diff = DaysElapsed(dateValue1, dateValue2, false) / 365;
            return (absolute) ? (System.Math.Abs(diff)) : (diff);
        }

        /// <summary>
        /// Simply calls a "Time Elapsed" method and returns a default value on failure.
        /// </summary>
        /// <param name="timeElapsedMethod">The method to call.</param>
        /// <param name="defaultValue">The default value on failure.</param>
        /// <param name="dateValue1">The first date of the difference calculation.</param>
        /// <param name="dateValue2">The second date of the difference calculation.</param>
        /// <param name="absolute">Whether or not to return an absolute value.</param>
        /// <returns>The requested time laps.</returns>
        public static object TimeElapsedOrDefault(TimeElapsedMethod timeElapsedMethod, object defaultValue, object dateValue1, object dateValue2, bool absolute)
        {
            try
            {
                return timeElapsedMethod(dateValue1, dateValue2, absolute);
            }
            catch
            {
                return defaultValue;
            }
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns the difference between the two values, or "default" on error.
        /// An effort is made to convert the given objects to numerical representations, then a difference is determined.
        /// <para>Note: The difference is inclusive. (example: difference between Jan 1 and Jan 2 is 2 days).</para>
        /// </summary>
        /// <param name="val1">First value.</param>
        /// <param name="val2">Second value.</param>
        /// <param name="defaultValue">The default value.</param>
        /// <param name="absolute">For values that can be negative, this insures a positive difference.</param>
        /// <returns></returns>
        public static object DiffOrDefault(object val1, Type val1Type, object val2, Type val2Type, object defaultValue, bool absolute, bool inclusive, TimeElapsedMethod timeElapsedMethod)
        {
            if (val1Type == null) val1Type = val1.GetType();
            if (val2Type == null) val2Type = val2.GetType();
            try
            {
                if (IsFloat(val1Type))
                {
                    double v1 = Convert.ToDouble(val1);
                    object diff = null;
                    if (IsFloat(val2Type))
                        diff = Convert.ToDouble(val2) - v1;
                    else if (IsNumeric(val2Type))
                        diff = Convert.ToDouble(val2) - v1;
                    else if (IsDateTime(val2Type))
                        diff = Convert.ToDouble(Convert.ToDateTime(val2).Ticks) - v1;
                    if (absolute && diff != null) diff = System.Math.Abs((double)diff);
                    return (double)diff + ((inclusive) ? (System.Math.Sign((double)diff)) : (0.0));
                }
                else if (IsNumeric(val1Type))
                {
                    Int64 v1 = Convert.ToInt64(val1);
                    object diff = null;
                    if (IsFloat(val2Type))
                        diff = Convert.ToInt64(val2) - v1;
                    else if (IsNumeric(val2Type))
                        diff = Convert.ToInt64(val2) - v1;
                    else if (IsDateTime(val2Type))
                        diff = Convert.ToInt64(Convert.ToDateTime(val2).Ticks) - v1;
                    if (absolute && diff != null) diff = System.Math.Abs((Int64)diff);
                    return (Int64)diff + ((inclusive) ? (System.Math.Sign((Int64)diff)) : (0));
                }
                else if (IsDateTime(val1Type))
                {

                    DateTime v1 = Convert.ToDateTime(val1);
                    object diff = null;
                    if (IsFloat(val2Type))
                        diff = Convert.ToInt64(val2) - v1.Ticks;
                    else if (IsNumeric(val2Type))
                        diff = Convert.ToInt64(val2) - v1.Ticks;
                    else if (IsDateTime(val2Type))
                        if (timeElapsedMethod != null)
                        {
                            diff = TimeElapsedOrDefault(timeElapsedMethod, defaultValue, v1, val2, absolute);
                            return (double)diff + ((inclusive) ? (System.Math.Sign((double)diff)) : (0.0));

                        }
                        else
                            diff = Convert.ToInt64(Convert.ToDateTime(val2).Ticks) - v1.Ticks;
                    if (absolute && diff != null) diff = System.Math.Abs((Int64)diff);
                    return (Int64)diff + ((inclusive) ? (System.Math.Sign((Int64)diff)) : (0));
                }
            }
            catch
            {
                return defaultValue;
            }
            return null;
        }
        public static object DiffOrDefault(object val1, Type val1Type, object val2, Type val2Type, object defaultValue, bool absolute, bool inclusive)
        {
            return DiffOrDefault(val1, val1Type, val2, val2Type, defaultValue, absolute, inclusive, null);
        }

        // --------------------------------------------------------------------------------------------------------------------

        public static string KillProcessByName(string name)
        {
            System.Diagnostics.Process[] processes = System.Diagnostics.Process.GetProcessesByName(name);
            foreach (System.Diagnostics.Process process in processes)
            {
#if !DOTNETCORE
                if (!process.CloseMainWindow()) // (try to close the window gracefully first)
#endif
                {
                    try { process.Kill(); }
                    catch (Exception ex) { return ex.Message; }
                }
            }
            return "";
        }

        public static String KillProcessByID(int procid)
        {
            System.Diagnostics.Process process = System.Diagnostics.Process.GetProcessById(procid);
            if (process != null)
#if !DOTNETCORE
                if (!process.CloseMainWindow()) // (try to close the window gracefully first)
#endif
            {
                try { process.Kill(); }
                catch (Exception ex) { return ex.Message; }
            }
            return "";
        }

#if !DOTNETCORE
        public static void KillProcessByOwner(string procName, string owner)
        {
            SelectQuery selectQuery = new SelectQuery("select * from Win32_Process where name='" + procName + "'");
            using (ManagementObjectSearcher searcher = new ManagementObjectSearcher(selectQuery))
            {
                ManagementObjectCollection processes = searcher.Get();
                foreach (ManagementObject process in processes)
                {
                    //out argument to return user and domain
                    string[] s = new String[2];
                    //Invoke the GetOwner method and populate the array with the user name and domain
                    process.InvokeMethod("GetOwner", (object[])s);
                    //Console.WriteLine("User: " + s[1] + "\\" + s[0]);
                    if (owner == s[0])
                    {
                        int procid = Convert.ToInt32(process.GetPropertyValue("processId"));
                        // locate the same process via System.Diagnostics and try to close it gracefully..,
                        KillProcessByID(procid);
                    }
                }
            }
        }
#endif

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns the right most value of a string based on a given separator character.
        /// </summary>
        public static string GetRightValue(string value, char separator)
        {
            string[] parts = value.Split(separator);
            return parts.Length > 1 ? parts[1].Trim() : "";
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Converts a given string to a name that is appropriate for use as database object names (tables, fields, etc.).
        /// </summary>
        public static string FixNameForDatabase(string name)
        {
            string newName = "";
            name = name.ToLower();
            for (int i = 0; i < name.Length; i++)
                if (name[i] >= 'a' && name[i] <= 'z' || name[i] >= '0' && name[i] <= '9')
                    newName += name[i];
                else if (newName.Length > 0 && i + 1 < name.Length && newName[newName.Length - 1] != '_')
                    newName += "_";
            return newName;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // =========================================================================================================================

    public static class Currencies
    {
#if !DOTNETCORE
        // -----------------------------------------------------------------------------------------------------------
        // (http://msdn.microsoft.com/en-us/goglobal/bb964664.aspx - LCID codes, if ever there's a need to port this client side [i.e. Silverlight])

        static Dictionary<string, CultureInfo> _CurrencyCodeCultureMap = new Dictionary<string, CultureInfo>();

        static Currencies()
        {
            _PopulateCurrencyCodeCultureMap();
        }

        static void _PopulateCurrencyCodeCultureMap()
        {
            CultureInfo[] cultures = CultureInfo.GetCultures(CultureTypes.SpecificCultures);
            foreach (CultureInfo ci in cultures)
            {
                RegionInfo ri = new RegionInfo(ci.LCID);
                _CurrencyCodeCultureMap[ri.ISOCurrencySymbol] = ci;
            }
        }

        public static CultureInfo GetCultureInfoFromCurrencyCode(string currencyCode)
        {
            CultureInfo ci;
            if (_CurrencyCodeCultureMap.TryGetValue(currencyCode, out ci))
                return ci;
            else
                return null;
        }

        public static string FormatCurrency(decimal value, string currencyCode)
        {
            var ci = GetCultureInfoFromCurrencyCode(currencyCode);
            return value.ToString("C", ci != null ? ci.NumberFormat : CultureInfo.CurrentCulture.NumberFormat); //?Thread.CurrentThread.
        }

        // ---------------------------------------------------------------------------------------------------------------------
#endif
    }

    // =========================================================================================================================

    public static partial class ExtentionMethods
    {
#if !DOTNETCORE
        public static bool SetIfExists(this DataRow row, string columnName, object value)
        {
            if (row != null)
                if (row.Table.Columns[columnName] != null)
                {
                    row[columnName] = value;
                    return true;
                }
            return false;
        }
#endif
    }

    // =========================================================================================================================
}
