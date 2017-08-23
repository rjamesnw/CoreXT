#if (NETSTANDARD1_5 || NETSTANDARD1_6 || NETCOREAPP1_0 || DNXCORE50 || NETCORE45  || NETCORE451 || NETCORE50)
#define DOTNETCORE
#endif
// (see more framework monikers here: https://docs.microsoft.com/en-us/nuget/schema/target-frameworks)

using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading;
using LinqExpr = System.Linq.Expressions;

using System.Collections.ObjectModel;
using System.Text.RegularExpressions;
using CoreXT.CollectionsAndLists;

#if DOTNETCORE // (DNXCORE50: https://channel9.msdn.com/Events/dotnetConf/2015/ASPNET-5-Deep-Dive; 0:36)
using System.Net;
#else
using System.Web;
using System.Data;
#endif

namespace CoreXT
{
    internal static class _ExtensionMethods
    {
#if !DOTNETCORE
        public static Type GetTypeInfo(this Type type) { return type; }

        public static MethodInfo GetMethodInfo(this Delegate del) { return del?.Method; }
#endif

        public static Delegate CreateDelegate(this Delegate del, Type type, object instance = null)
        {
#if DOTNETCORE
            return del.GetMethodInfo().CreateDelegate(type, instance);
#else
            return del.CreateDelegate(type, instance);
#endif
        }

        public static Delegate CreateDelegate(this MethodInfo m, Type type, object instance = null)
        {
#if DOTNETCORE
            return m.CreateDelegate(type, instance);
#else
            return Delegate.CreateDelegate(type, instance, m);
#endif
        }
    }
}

namespace CoreXT
{
    // =========================================================================================================================

    /// <summary>
    /// This class contains global (shared) utility methods used by most applications.
    /// </summary>
    public static partial class Utilities
    {
        // ---------------------------------------------------------------------------------------------------------------------

#if !SCRIPTSHARP
        /// <summary>
        /// Gets 1 token and returns it.
        /// The tokens are valid as long as 'true' is return.
        /// If false is returned, and the returned 'error' argument is NOT empty, then an error occurred (i.e. missing end limiter).
        /// </summary>
        public static bool GetToken(ref string subject, string startDelimiter, string endDelimiter, ref int index1, ref int index2, ref string token, out string error)
        {
            error = "";

            index1 = index2 + 1; // (move to next char)

            if (index1 + startDelimiter.Length > subject.Length) return false; // (enough space left for start delimiter?)

            bool found = false;

            while (index1 + startDelimiter.Length <= subject.Length)
            {
                if (subject.Substring(index1, startDelimiter.Length) == startDelimiter)
                { found = true; break; } // (found first delimiter)
                index1++;
            }

            if (!found) return false;

            index2 = index1;

            if (index2 + endDelimiter.Length > subject.Length)
            { error = "Missing end delimiter '" + endDelimiter + "'."; return false; } // (enough space left for start delimiter?)

            found = false;
            while (index2 + endDelimiter.Length <= subject.Length)
            {
                if (subject.Substring(index2, endDelimiter.Length) == endDelimiter)
                { found = true; break; } // (found first delimiter)
                index2++;
            }

            if (!found)
            { error = "Missing end delimiter '" + endDelimiter + "'."; return false; } // (enough space left for start delimiter?)

            token = subject.Substring(index1 + startDelimiter.Length, index2 - endDelimiter.Length - index1);

            return true;
        }
        public static void GetTokenBegin(out int index1, out int index2)
        { index1 = 0; index2 = -1; }
#endif

        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Null to Default (used mostly with database related data): Returns the value passed, or a default 
        /// value if the value passed is null, or equal to DBNull.Value.
        /// </summary>
        /// <remarks>Name was inspired from the VBA function 'NZ()' (Null to Zero; see https://support.office.com/en-us/article/Nz-Function-8ef85549-cc9c-438b-860a-7fd9f4c69b6c)</remarks>
        /// <param name="val">Value to check.</param>
        /// <param name="default_val">New value if "val" is null or DBNull.Value.</param>
        /// <returns></returns>
        public static string ND(object val, string default_val)
        { return (val == DBNull.Value || val == null) ? (default_val) : ((val is string) ? (string)val : val.ToString()); }
        public static T ND<T>(object val, T default_val) where T : class
        { return (val == DBNull.Value || val == null) ? (default_val) : ((T)val); }
        public static Int16 ND(object val, Int16 default_val)
        { return (val == DBNull.Value || val == null) ? (default_val) : (ToInt16(val, default_val) ?? default_val); }
        public static Int32 ND(object val, Int32 default_val)
        { return (val == DBNull.Value || val == null) ? (default_val) : (ToInt32(val, default_val) ?? default_val); }
        public static Int64 ND(object val, Int64 default_val)
        { return (val == DBNull.Value || val == null) ? (default_val) : (ToInt64(val, default_val) ?? default_val); }
        public static float ND(object val, float default_val)
        { return (val == DBNull.Value || val == null) ? (default_val) : (ToSingle(val, default_val) ?? default_val); }
        public static decimal ND(object val, decimal default_val)
        { return (val == DBNull.Value || val == null) ? (default_val) : (ToDecimal(val, default_val) ?? default_val); }
        public static bool ND(object val, bool default_val)
        { return (val == DBNull.Value || val == null) ? (default_val) : (ToBoolean(val, default_val) ?? default_val); }
        public static double ND(object val, double default_val)
        { return (val == DBNull.Value || val == null) ? (default_val) : (ToDouble(val, default_val) ?? default_val); }
        public static DateTime ND(object val, DateTime default_val)
        { return (val == DBNull.Value || val == null) ? (default_val) : (ToDateTime(val, default_val) ?? default_val); }

        // ... more of the same, but using nullable parameters ...
        public static bool ND(object val, bool? default_val) { return ND(val, default_val ?? false); }
        public static double ND(object val, double? default_val) { return ND(val, default_val ?? 0d); }
        public static decimal ND(object val, decimal? default_val) { return ND(val, default_val ?? 0m); }
        public static float ND(object val, float? default_val) { return ND(val, default_val ?? 0f); }
        public static Int16 ND(object val, Int16? default_val) { return ND(val, default_val ?? 0); }
        public static Int32 ND(object val, Int32? default_val) { return ND(val, default_val ?? 0); }
        public static Int64 ND(object val, Int64? default_val) { return ND(val, default_val ?? 0); }
        public static DateTime ND(object val, DateTime? default_val) { return ND(val, default_val ?? DateTime.MinValue); }
        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns true if the specified SQL text contains only select statements, and nothing else.
        /// </summary>
        public static bool IsSQLSelectOnlyStatement(string sql)
        {
            char[] tempStr = sql.ToUpper().ToCharArray();
            // ... convert any non-letters to spaces ...
            for (int i = 0; i < tempStr.Length; i++)
                if (tempStr[i] < 'A' || tempStr[i] > 'Z')
                    tempStr[i] = ' ';
            sql = new string(tempStr);
            // ... split "words" by spaces ...
            string[] parts = sql.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
            // ... check for invalid words ...
            if (parts.Length == 0 || parts[0] != "SELECT") return false;
            foreach (string word in parts)
                if (word == "INSERT" || word == "DELETE" || word == "UPDATE" || word == "CREATE" || word == "DROP" || word == "ALTER") return false;
            // ... statement is ok ...
            return true;
        }

        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Create a field name from the specified table name.
        /// <para>Note: It is assumed that the table name is already valid.</para>
        /// </summary>
        /// <param name="tableName">Table name to create a field from.</param>
        /// <param name="asIDField">If the field name will represent an ID value for the table (usually "_id").</param>
        /// <param name="fieldSuffix">Text to append to the final result. ("opt_" is recommended)</param>
        /// <param name="foreignKeySuffix">Text to append to the final result for foreign keys. (i.e. on end of "opt_" is recommended)</param>
        public static string CreateColumnNameFromTableName(string tableName, bool asIDField, string fieldSuffix = "", string foreignKeySuffix = null, string optionsTablePrefix = null)
        {
            foreignKeySuffix = foreignKeySuffix ?? "_id";
            optionsTablePrefix = optionsTablePrefix ?? "opt_";

            if (string.IsNullOrEmpty(tableName) && string.IsNullOrEmpty(fieldSuffix))
                return "";

            tableName = ND(tableName, "").Trim().ToLower();
            if (!string.IsNullOrEmpty(fieldSuffix) && !fieldSuffix.StartsWith("_"))
                fieldSuffix = "_" + fieldSuffix;

            int i = tableName.IndexOf(".dbo.");
            if (i >= 0) tableName = tableName.Substring(i + 5);

            if (asIDField)
            {
                string endTag = foreignKeySuffix + fieldSuffix;
                if (tableName.EndsWith(endTag)) return tableName; else return tableName + endTag;
            }

            if (tableName.StartsWith(optionsTablePrefix))
                tableName = tableName.Substring(4);

            if (tableName.EndsWith("ies"))
                tableName = tableName.Substring(0, tableName.Length - 3) + "y";
            else if (tableName.EndsWith("ss")) { /*ignore*/ }
            else if (tableName.EndsWith("s") && tableName.Length > 1)
            {
                i = tableName.Length - 2; // (second last char)
                if (tableName[i] != 'a' && tableName[i] != 'i' && tableName[i] != 'o' && tableName[i] != 'u') // (remove after non-vowel, except for 'e')
                    tableName = tableName.Substring(0, tableName.Length - 1);
            }

            return tableName + fieldSuffix;
        }

        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Converts '_' characters into spaces, separating the words and removing reserved prefixes and suffixes (i.e. remove
        /// "opt_" [option list table prefix], "_id" and "_id_" [foreign keys]), and capitalizes the first letter.
        /// </summary>
        public static string PropertizeColumnName(string name, string defaultOptionsTablePrefix, string defaultKeyName)
        {
            defaultOptionsTablePrefix = defaultOptionsTablePrefix ?? "opt";
            defaultKeyName = defaultKeyName ?? "id";

            if (name.IsNullOrWhiteSpace()) return name;

            name = name.Replace('_', ' ');

            List<string> words = name.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).ToList();

            if (words[0].ToLower() == defaultOptionsTablePrefix)
                words.RemoveAt(0);

            int i = words.LastIndexOf(defaultKeyName);
            if (i > 0)
            {
                if (i == words.Count - 1)
                    words.RemoveAt(i); // (remove "id" from end)
                else // ("id" was not at the end [or beginning], so move words after to beginning)
                {
                    words.RemoveAt(i); // (remove "id" first [words all move down by 1])
                    var moveCount = words.Count - i;
                    for (; moveCount > 0; moveCount--)
                    {
                        words.Insert(0, words[words.Count - 1]); // (copy end word to beginning)
                        words.RemoveAt(words.Count - 1); // (remove the end word copied from)
                    }
                }
            }

            for (i = 0; i < words.Count; i++)
                words[i] = char.ToUpper(words[i][0]) + (words[i].Length > 1 ? words[i].Substring(1) : "");
            return string.Join(" ", words.ToArray());
        }
        public static string PropertizeColumnName(string name) { return PropertizeColumnName(name, null, null); }

        // ---------------------------------------------------------------------------------------------------------------------

        public static bool IsBoolean(Type t)
        {
            return (t == typeof(bool) || t == typeof(Boolean));
        }

        public static bool IsDateTime(Type t)
        {
            return (t == typeof(DateTime));
        }
        public static bool IsDateTime(string text)
        {
            DateTime dt; return DateTime.TryParse(text, out dt);
        }

        public static bool IsInt(Type t)
        {
            return (t == typeof(SByte) || t == typeof(int) || t == typeof(Int16) || t == typeof(Int32) || t == typeof(Int64));
        }
        public static bool IsInt64(string text)
        {
            Int64 i; return Int64.TryParse(text, out i);
        }
        public static bool IsInt(string text)
        {
            int i; return int.TryParse(text, out i);
        }

        public static bool IsUInt(Type t)
        {
            return (t == typeof(Byte) || t == typeof(uint) || t == typeof(UInt16) || t == typeof(UInt32) || t == typeof(UInt64));
        }

        public static bool IsFloat(Type t)
        {
            return (t == typeof(float) || t == typeof(double) || t == typeof(decimal));
        }

        public static bool IsNumeric(Type t)
        {
            return (IsInt(t) || IsUInt(t) || IsFloat(t));
        }
        public static bool IsNumeric(string text)
        {
            return Regex.IsMatch(text, @"^[+|-]?\d+\.?\d*$");
            //decimal d; return decimal.TryParse(text, out d);
        }
        public static bool IsSimpleNumeric(string text)
        {
            // http://derekslager.com/blog/posts/2007/09/a-better-dotnet-regular-expression-tester.ashx
            return Regex.IsMatch(text, @"^(?:\+|\-)?\d+\.?\d*$");
        }

        public static bool IsString(Type t)
        {
            return (t == typeof(string) || t == typeof(String));
        }

        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns true if the string is only letters.
        /// </summary>
        public static bool IsAlpha(string s)
        {
            if (s.Length == 0) return false;
            for (int i = 0; i < s.Length; i++)
                if ((s[i] < 'a' || s[i] > 'z') && (s[i] < 'A' || s[i] > 'Z'))
                    return false;
            return true;
        }

        /// <summary>
        /// Returns true if the string is only letters or numbers.
        /// </summary>
        public static bool IsAlphaNumeric(string s)
        {
            if (s.Length == 0) return false;
            for (int i = 0; i < s.Length; i++)
                if ((s[i] < 'a' || s[i] > 'z') && (s[i] < 'A' || s[i] > 'Z') && (s[i] < '0' || s[i] > '9'))
                    return false;
            return true;
        }

        /// <summary>
        /// Returns true if the string is only letters, numbers, or underscores, and the first character is not a number.
        /// This is useful to validate strings to be used as code-based identifiers, database column names, etc.
        /// </summary>
        public static bool IsIdent(string s)
        {
            if (s.Length == 0 || (s[0] >= '0' && s[0] <= '9')) return false;
            for (int i = 0; i < s.Length; i++)
                if ((s[i] < 'a' || s[i] > 'z') && (s[i] < 'A' || s[i] > 'Z') && (s[i] < '0' || s[i] > '9') && s[i] != '_')
                    return false;
            return true;
        }

        /// <summary>
        /// Returns true if the string is only numbers.
        /// </summary>
        public static bool IsDigits(string s)
        {
            if (s.Length == 0) return false;
            for (int i = 0; i < s.Length; i++)
                if (s[i] < '0' || s[i] > '9')
                    return false;
            return true;
        }

        // ---------------------------------------------------------------------------------------------------------------------

        public static bool IsDatePartOnly(string date)
        {
            if (date.IsNullOrWhiteSpace()) return false;
            var dt = Utilities.ToDateTime(date, null);
            if (dt == null) return false;
            if (dt.Value.Date == DateTime.MinValue)
                return false;
            date = date.ToLower();
            return !date.Contains(":") && !date.Contains(";") && !date.Contains("am") && !date.Contains("pm");
        }
        // ---------------------------------------------------------------------------------------------------------------------

        public static bool IsTimePartOnly(string time)
        {
            return Regex.IsMatch(time, @"(^\s*((([01]?\d)|(2[0-3])):((0?\d)|([0-5]\d))(:((0?\d)|([0-5]\d)))?)\s*$)|(^\s*((([1][0-2])|\d)(:((0?\d)|([0-5]\d)))?(:((0?\d)|([0-5]\d)))?)\s*[apAP][mM]\s*$)");
        }

        // ---------------------------------------------------------------------------------------------------------------------
        // (Test Here: http://derekslager.com/blog/posts/2007/09/a-better-dotnet-regular-expression-tester.ashx)

        public static bool IsValidURL(string url)
        {
            return url != null && Regex.IsMatch(url, @"^(?:http://|https://)\w{2,}.\w{2,}");
        }

        // ---------------------------------------------------------------------------------------------------------------------

        public static bool IsValidEmailAddress(string email)
        {
            if (email != null)
            {
                int nFirstAT = email.IndexOf('@');
                int nLastAT = email.LastIndexOf('@');
                if ((nFirstAT > 0) && (nLastAT == nFirstAT) && (nFirstAT < (email.Length - 1)))
                {
                    // address is ok regarding the single @ sign
                    return Regex.IsMatch(email, @"^(?:[A-Za-z0-9_\-]+\.)*(?:[A-Za-z0-9_\-]+)@(?:[A-Za-z0-9_\-]+)(?:\.[A-Za-z]+)+$");
                }
            }
            return false;
        }

        // ---------------------------------------------------------------------------------------------------------------------

        public static bool IsValidPhoneNumber(string number)
        {
            return number != null && Regex.IsMatch(number, @"^((\+?\d{1,3}(-|.| )?\(?\d\)?(-|.| )?\d{1,5})|(\(?\d{2,6}\)?))(-|.| )?(\d{3,4})(-|.| )?(\d{4})(( x| ext)( |\d)?\d{1,5}){0,1}$");
        }

        // --------------------------------------------------------------------------------------------------------------------- 

        public static bool IsValidPasword(string password, int minCharacters, int maxCharacters, bool requireOneUpperCase, bool requireDigit, string validSymbols)
        {
            string requiredCharacters = "";
            if (requireOneUpperCase) requiredCharacters += @"(?=.*[a-z])(?=.*[A-Z])"; else requiredCharacters += @"(?=.*[A-Za-z])";
            if (requireDigit) requiredCharacters += @"(?=.*\d)";
            if (validSymbols != null)
            {
                validSymbols = validSymbols.Replace(@"\", @"\\").Replace("-", @"\-");
                requiredCharacters += @"(?=.*[" + validSymbols + @"])";
            }
            return password != null && password.Length <= maxCharacters
                && Regex.IsMatch(password, @"^.*(?=.{" + minCharacters + @",})" + requiredCharacters + @".*$");
            // http://nilangshah.wordpress.com/2007/06/26/password-validation-via-regular-expression/
            /*
             * - Must be at least 6 characters.
             * - Must contain at least one letter, one digit, and one special character.
             * - Valid special characters are: `~!@#$%^&_-+=|\:;',./?
             */
        }

        public static bool IsValidPasword(string password, int minCharacters, int maxCharacters)
        {
            return IsValidPasword(password, minCharacters, maxCharacters, true, true, @"`~!@#$%^&_-+=|\:;',./?");
        }
        public static bool IsValidPasword(string password)
        {
            return IsValidPasword(password, 6, 20, true, true, @"`~!@#$%^&_-+=|\:;',./?");
        }

        // ---------------------------------------------------------------------------------------------------------------------

        public static bool? ToBoolean(object value, bool? defaultValue)
        {
            if (value is bool) return (bool)value;
            string txt = ND(value, "").ToLower(); // (convert to string and test for 'true' state equivalent)
            if (txt == "true" || txt == "yes" || txt == "y" || txt == "1" || txt == "ok" || txt == "pass" || txt == "on") return true;
            if (txt == "false" || txt == "no" || txt == "n" || txt == "0" || txt == "cancel" || txt == "fail" || txt == "off") return false;
            return defaultValue;
        }
        public static Int16? ToInt16(object value, Int16? defaultValue)
        {
            if (value is Int16) return (Int16)value;
            string txt = ND(value, ""); // (convert to string, and then convert to expected type)
            Int16 convertedValue;
            if (Int16.TryParse(txt, out convertedValue))
                return convertedValue;
            return defaultValue;
        }
        public static Int32? ToInt32(object value, Int32? defaultValue)
        {
            if (value is Int32) return (Int32)value;
            if (value is Int16) return (Int16)value;
            string txt = ND(value, ""); // (convert to string, and then convert to expected type)
            Int32 convertedValue;
            if (Int32.TryParse(txt, out convertedValue))
                return convertedValue;
            return defaultValue;
        }
        public static Int64? ToInt64(object value, Int64? defaultValue)
        {
            if (value is Int64) return (Int64)value;
            if (value is Int32) return (Int32)value;
            if (value is Int16) return (Int16)value;
            string txt = ND(value, ""); // (convert to string, and then convert to expected type)
            Int64 convertedValue;
            if (Int64.TryParse(txt, out convertedValue))
                return convertedValue;
            return defaultValue;
        }
        public static Single? ToSingle(object value, Single? defaultValue)
        {
            if (value is Single) return (Single)value;
            string txt = ND(value, ""); // (convert to string, and then convert to expected type)
            Single convertedValue;
            if (Single.TryParse(txt, out convertedValue))
                return convertedValue;
            return defaultValue;
        }
        public static Double? ToDouble(object value, Double? defaultValue)
        {
            if (value is Double) return (Double)value;
            if (value is Single) return (Single)value;
            if (value is Decimal) return (Double)(Decimal)value;
            string txt = ND(value, ""); // (convert to string, and then convert to expected type)
            Double convertedValue;
            if (Double.TryParse(txt, out convertedValue))
                return convertedValue;
            return defaultValue;
        }
        public static Decimal? ToDecimal(object value, Decimal? defaultValue)
        {
            if (value is Decimal) return (Decimal)value;
            if (value is Double) return (Decimal)(Double)value;
            if (value is Single) return (Decimal)(Single)value;
            string txt = ND(value, ""); // (convert to string, and then convert to expected type)
            Decimal convertedValue;
            if (Decimal.TryParse(txt, out convertedValue))
                return convertedValue;
            return defaultValue;
        }
        public static DateTime? ToDateTime(object value, DateTime? defaultValue)
        {
            if (value is DateTime) return (DateTime)value;
            string txt = ND(value, ""); // (convert to string, and then convert to expected type)
            DateTime convertedValue;
            if (DateTime.TryParse(txt, out convertedValue))
                return convertedValue;
            return defaultValue;
        }

        // ---------------------------------------------------------------------------------------------------------------------
        /// <summary>
        /// Extracts and returns all digits in the given string.
        /// The resulting sting is a consecutive sequence of numerical characters.
        /// </summary>
        public static string ExtractDigits(string text)
        {
            if (text == null) return null;
            var digits = "";
            for (var i = 0; i < text.Length; i++)
                if (text[i] >= '0' && text[i] <= '9')
                    digits += text[i];
            return digits;
        }

        /// <summary>
        /// Strips all digits out of the given text and returns the result.
        /// </summary>
        public static string StripDigits(string text)
        {
            if (text == null) return null;
            var newText = "";
            for (var i = 0; i < text.Length; i++)
                if (text[i] < '0' || text[i] > '9')
                    newText += text[i];
            return newText;
        }

        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Formats a date field value using conversion #107 (MMM dd, yyyy) format.
        /// </summary>
        /// <param name="fieldName">Name of the date field to format.</param>
        /// <param name="newFieldName">New name to use for the result set.</param>
        /// <returns></returns>
        public static string SQLDate107(string fieldName, string newFieldName)
        {
            if (fieldName == "") throw new Exception("SQLDate107(): 'fieldName' cannot be empty.");
            if (newFieldName == "") newFieldName = fieldName;
            return "CONVERT(VARCHAR(50), " + BracketSQLFieldName(fieldName) + ", 107) AS " + BracketSQLFieldName(newFieldName);
        }
        public static string SQLDate107(string fieldName)
        {
            return SQLDate107(fieldName, fieldName);
        }

        /// <summary>
        /// Generates a SELECT CASE query part using the supplied parameters.
        /// </summary>
        /// <param name="value">The value or field name which is the value to translate.</param>
        /// <param name="trueValue">The value that determines the true value part. Any other values select the false value part.</param>
        /// <param name="valueIfTrue">The value to use when a true value is a match.</param>
        /// <param name="valueIfFalse">The value to use when a true value is not a match.</param>
        /// <param name="newFieldName">The field name to hold the returned result.</param>
        /// <returns></returns>
        public static string SQLIIF(string value, string trueValue, string valueIfTrue, string valueIfFalse, string newFieldName)
        {
            if (newFieldName.Trim() != "") newFieldName = " AS " + BracketSQLFieldName(newFieldName); else newFieldName = "";
            return "(SELECT CASE " + value + " WHEN " + trueValue + " THEN " + valueIfTrue + " ELSE " + valueIfFalse + " END)" + newFieldName;
        }
        public static string SQLIIF(string fieldName, string trueValue, string valueIfTrue, string valueIfFalse)
        {
            return SQLIIF(fieldName, trueValue, valueIfTrue, valueIfFalse, fieldName);
        }

        /// <summary>
        /// Determines if a bracket is needed for a given field based on the characters.  Only "a-z", "A-Z", "0-9", and "_" are accepted.
        /// <para>Note: Key words are not checked.</para>
        /// </summary>
        public static string BracketSQLFieldName(string table_field)
        {
            string[] name_parts = table_field.Split('.');
            string name = name_parts[name_parts.Length - 1];
            if (name.StartsWith("[") && name.EndsWith("]")) return table_field;
            bool useBrackets = false;
            for (int i = 0; i < name.Length; i++)
                if ((name[i] < 'a' || name[i] > 'z') && (name[i] < 'A' || name[i] > 'Z') && (name[i] < '0' || name[i] > '9') && name[i] != '_')
                { useBrackets = true; break; }
            name_parts[name_parts.Length - 1] = (useBrackets) ? ("[" + name + "]") : (name);
            return string.Join(".", name_parts);
        }

        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Strips all postal codes found in the given address and returns the new address.
        /// When used with 'StripDigits()', this is helpful in displaying addresses to the public in a more private and secure manor (in this case 'StripDigits()' must be called LAST).
        /// </summary>
        public static string RemovePostalCode(string address)
        {
            if (address == null) return address;
            return Regex.Replace(address, @"\w\d\w\s+\d\w\d", "");
        }

        // ---------------------------------------------------------------------------------------------------------------------

        public static List<char> URLEncodableCharacters = new List<char> { '$', '&', '+', '-', ',', '/', ':', ';', '=', '?', '@', ' ', '?', '<', '>', '#', '%', '{', '}', '|', '\\', '^', '~', '[', ']', '`' };

        public static string URLEncode(string url)
        {
            if (url == null) return "";
            string newUrl = "";
            char c;
            for (int i = 0; i < url.Length; i++)
            {
                c = url[i];
                if (URLEncodableCharacters.Contains(c))
                    newUrl += "%" + ((int)c).ToString("x");
                else
                    newUrl += c;
            }
            return newUrl;
        }

        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Converts the given byte size to the shortest size possible by appending a unit suffix ("byte[s]", "Kb", "Mb", or "Gb") based on the given byte size value.
        /// </summary>
        public static string GetShortByteSizeDescription(Int64 byteSize)
        {
            if (byteSize < 1024)
                return Strings.S(byteSize, "byte", "s", "");
            else if (byteSize < 1024 * 1024)
                return Strings.S(byteSize / 1024, "Kb", "", "0.##");
            else if (byteSize < 1024 * 1024 * 1024)
                return Strings.S(byteSize / (1024 * 1024), "Mb", "", "0.##");
            else
                return Strings.S(byteSize / (1024 * 1024 * 1024), "Gb", "", "0.##");
        }

        // ---------------------------------------------------------------------------------------------------------------------

        public static string StripHTMLTags(string text)
        {
            return
#if DOTNETCORE
                WebUtility.
#else
                HttpUtility.
#endif
                HtmlDecode(Regex.Replace(text, @"(<[^>]+>)", "")); //Regex.Replace(, @"&[^;]+?;", " ");
        }

        // ---------------------------------------------------------------------------------------------------------------------
    }

    // =========================================================================================================================

    /// <summary>
    /// Common miscellaneous extension methods.
    /// </summary>
    public static partial class ExtentionMethods
    {
        // ---------------------------------------------------------------------------------------------------------------------

        public static bool Contains(this IEnumerable items, object item)
        {
            foreach (object _item in items)
                if (_item == item) return true;
            return false;
        }

        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Adds an array of items to the given list.
        /// </summary>
        /// <typeparam name="T">Item type.</typeparam>
        /// <param name="listItems">The list to add the items to.</param>
        /// <param name="items">The items to add.</param>
        public static void AddArray<T>(this IList<T> listItems, T[] items)
        {
            foreach (T _item in items)
                listItems.Add(_item);
        }

        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Adds and returns the specified item.
        /// The normal list 'Add()' method doesn't return the added item, which prevents short-hand code.
        /// </summary>
        /// <typeparam name="T">Item type.</typeparam>
        /// <param name="listItems">The list to add the item to.</param>
        /// <param name="item">The item to add.</param>
        public static T AddItem<T>(this IList<T> listItems, T item)
        {
            listItems.Add(item);
            return item;
        }

        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns true if character is either a letter, digit, or underscore.
        /// </summary>
        public static bool IsIdent(this char c)
        {
            return char.IsLetterOrDigit(c) || c == '_';
        }

        // ---------------------------------------------------------------------------------------------------------------------

        public static Uri Append(this Uri uri, object path)
        {
            var _path = Utilities.ND(path, "").Replace('\\', '/');
            Uri result = null;
            uri = uri.AbsoluteUri.ND().ApendIfNotExists("/").ToURI();
            if (Uri.TryCreate(uri, Utilities.ND(_path, ""), out result)) // (note: this also works with '..\' scenarios)
                return result;
            return new Uri(Path.Combine(uri.AbsoluteUri, _path).Replace('\\', '/')); // (note: this doesn't work with '..\' scenarios, so is only provided as a fall-back)
        }

        // ---------------------------------------------------------------------------------------------------------------------

        public static Uri ToURI(this string uri, string defaultIfNull) { return new Uri((uri ?? defaultIfNull) ?? ""); }
        public static Uri ToURI(this string uri) { return ToURI(uri, ""); }

        public static Uri ToRelativeURI(this string uri, string defaultIfNull) { return new Uri((uri ?? defaultIfNull) ?? "", UriKind.Relative); }
        public static Uri ToRelativeURI(this string uri) { return ToRelativeURI(uri, ""); }

        public static Uri ToAbsoluteURI(this string uri, string defaultIfNull) { return new Uri((uri ?? defaultIfNull) ?? "", UriKind.Absolute); }
        public static Uri ToAbsoluteURI(this string uri) { return ToAbsoluteURI(uri, ""); }

        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Null to Default: Return the string value, or a default value if null.
        /// </summary>
        public static string ND(this object str, string defaultIfNull) { return Utilities.ND(str, defaultIfNull); }
        /// <summary>
        /// Null to Default: Return the string value, or default to empty string if null.
        /// </summary>
        public static string ND(this object str) { return ND(str, string.Empty); }

        /// <summary>
        /// Null to Default: Return the string value, or a default value if 'null', and trim the result before returning.
        /// If the result before trimming is 'null', then nothing is trimmed, and 'null' is returned.
        /// </summary>
        public static string NDTrim(this object str, string defaultIfNull) { var result = Utilities.ND(str, defaultIfNull); return result != null ? result.Trim() : null; }
        /// <summary>
        /// Null to Default: Return the string value, or an empty string if 'null', and trim the result before returning.
        /// If the result before trimming is 'null', then nothing is trimmed, and an empty string is returned.
        /// </summary>
        public static string NDTrim(this object str) { return NDTrim(str, string.Empty); }

        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Appends a given string if it doesn't already exist at the end of the target.
        /// </summary>
        public static string ApendIfNotExists(this string str, string strToAppend)
        { return !(str ?? "").EndsWith(strToAppend) ? (str ?? "") + strToAppend : str; }

        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns the given string converted to the specified type 'T', and returns 'defaultValue' instead if conversion fails.
        /// </summary>
        public static T As<T>(this string str, T defaultValue)
        {
            try { return Types.ChangeType<T>(str); }
            catch { return defaultValue; }
        }
        public static T As<T>(this string str)
        { return As<T>(str, default(T)); }

        // ---------------------------------------------------------------------------------------------------------------------

#if !SILVERLIGHT && !DOTNETCORE
        /// <summary>
        /// Creates a new data column for a table.
        /// </summary>
        /// <param name="table">The table to create a column for.</param>
        /// <param name="columnName">The name of the column to create.</param>
        /// <param name="caption">A display friendly name for the column (otherwise the column name is used).</param>
        /// <param name="dataType">A "System" type for this column.</param>
        /// <param name="isKey">If true, the column is marked unique and readonly, and is appended to the array of primary keys.</param>
        public static DataColumn CreateColumn(this DataTable table, string columnName, string caption, Type dataType, bool isKey)
        {
            if (table != null)
            {
                var column = table.Columns.Contains(columnName) ? table.Columns[columnName] : table.Columns.Add(columnName, dataType);
                if (caption != null) column.Caption = caption;
                if (isKey)
                {
                    column.Unique = true;
                    column.ReadOnly = true;
                    var keys = table.PrimaryKey;
                    Array.Resize(ref keys, keys.Length + 1);
                    keys[keys.Length - 1] = column;
                    table.PrimaryKey = keys;
                }
                return column;
            }
            return null;
        }
        public static DataColumn CreateColumn(this DataTable table, string columnName, Type dataType, bool isKey) { return table.CreateColumn(columnName, null, dataType, isKey); }
        public static DataColumn CreateColumn(this DataTable table, string columnName, string caption, Type dataType) { return table.CreateColumn(columnName, caption, dataType, false); }
        public static DataColumn CreateColumn(this DataTable table, string columnName, Type dataType) { return table.CreateColumn(columnName, null, dataType, false); }
#endif

        // ---------------------------------------------------------------------------------------------------------------------

        public static T Value<K, T>(this IDictionary<K, T> _this, K key) { T v; if (_this != null && _this.TryGetValue(key, out v)) return v; else return default(T); }

        public static T Value<K, T>(this IDictionary<K, T> _this, K key, T defaultValue) { T v; if (_this != null && _this.TryGetValue(key, out v)) return v; else return defaultValue; }

        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns the first element of a sequence, or a default value if the sequence contains no elements, or is null.
        /// </summary>
        public static T FirstOrDefault<T>(this IEnumerable<T> _this, T defaultValue) { return _this != null ? _this.FirstOrDefault() : default(T); }

        // ---------------------------------------------------------------------------------------------------------------------
    }

    // =========================================================================================================================
}
