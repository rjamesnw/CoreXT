using System;
using System.Collections.Generic;

#if NETCORE // (DNXCORE50: https://channel9.msdn.com/Events/dotnetConf/2015/ASPNET-5-Deep-Dive; 0:36)
#else
using System.Web;
using System.Data;
#endif

namespace CoreXT
{
    // =========================================================================================================================

    public static partial class Strings
    {
        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns true if the given object is null, or its string conversion results in an empty/null string.
        /// </summary>
        public static bool IsNullOrEmpty(object value) { return (value == null || string.IsNullOrEmpty(value.ToString())); }

        /// <summary>
        /// Returns true if the string value is null or contains white space (contains all characters less than or equal Unicode value 32).
        /// </summary>
        public static bool IsNullOrWhiteSpace(this string str)
        {
#if V2 || V3 || V3_5 // (this method exists in .NET 4.0+ as a method of the string class)
            if (str == null || str.Length == 0) return true;
            for (var i = 0; i < str.Length; i++)
                if ((int)str[i] <= 32) return true;
            return false;
#else
            return string.IsNullOrWhiteSpace(str);
#endif
        }

        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Selects the first non-null/empty string found in the parameter order given, and returns a default value if
        /// both are null/empty.
        /// </summary>
        public static string SelectNonEmptyString(string str1, string str2, string defaultValue)
        {
            return str1.IsNullOrWhiteSpace() ? (str2.IsNullOrWhiteSpace() ? defaultValue : str2) : str1;
        }
        public static string SelectNonEmptyString(string str1, string str2) { return SelectNonEmptyString(str1, str2, null); }

        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Convert a list of objects into strings and return the concatenated result.
        /// </summary>
        public static string Join(string separator, object[] objects)
        {
            string s = "";
            foreach (object o in objects)
            {
                if (s.Length > 0) s += separator;
                if (o != null)
                    s += o.ToString();
            }
            return s;
        }

        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Join two strings arrays into one big array. The new array is returned.
        /// </summary>
        public static string[] Join(string[] sa1, string[] sa2)
        {
            string[] strings = new string[sa1.Length + sa2.Length];
            CopyTo(sa1, strings, 0);
            CopyTo(sa2, strings, sa1.Length);
            return strings;
        }

        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Copies a given source string array into another (destination), returning the destination array.
        /// </summary>
        /// <param name="src">The array to copy.</param>
        /// <param name="dest">The target of the copy.</param>
        /// <param name="destIndex">The array index into the destination in which copy starts.</param>
        public static string[] CopyTo(string[] src, string[] dest, int destIndex)
        {
            for (int i = 0; i < src.Length; i++)
                dest[destIndex + i] = src[i];
            return dest;
        }

        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Copies the given string and string array to a new array. The new array is returned.
        /// </summary>
        public static string[] Add(string s, string[] strings)
        {
            string[] newStringArray = new string[strings.Length + 1];
            CopyTo(strings, newStringArray, 0);
            newStringArray[strings.Length] = s;
            return newStringArray;
        }

        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary> Formats an integer. This is just a more descriptive way of doing 'n.ToString(format)'. See <see cref="int.ToString(string)"/>.</summary>
        /// <param name="n"> An int to format. </param>
        /// <param name="format"> Describes the format to use. </param>
        /// <returns> The formatted number. </returns>
        public static string FormatNumber(int n, string format)
        {
            return n.ToString(format);
        }

        /// <summary> Formats a number. This is just a more descriptive way of doing 'n.ToString(format)'. See <see cref="double.ToString(string)"/>.</summary>
        /// <param name="n"> A double to format. </param>
        /// <param name="format"> Describes the format to use. </param>
        /// <returns> The formatted number. </returns>
        public static string FormatNumber(double n, string format)
        {
            return n.ToString(format);
        }

        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary> Returns the value plus the singular or plural of a word based on a numerical value. </summary>
        /// <param name="value"> Number value. </param>
        /// <param name="word"> Base word, singular. </param>
        /// <param name="prewordIfSingular"> (Optional) The pre-word if singular, such as "is" in "there are 2" vs "there is 1". </param>
        /// <param name="suffixIfPlural"> (Optional) Suffix to use if "value" is not 1. </param>
        /// <param name="prewordIfPlural"> (Optional) The pre-word if plural, such as "are" in "there are 2" vs "there is 1".  </param>
        /// <param name="numberFormatting">
        ///     The number format, if any (optional). See <see cref="FormatNumber(int, string)"/>.
        /// </param>
        /// <returns> A string. </returns>
        public static string S(int value, string word, string prewordIfSingular = null, string suffixIfPlural = "s", string prewordIfPlural = null, string numberFormatting = null)
        {
            var formattedValue = numberFormatting != null ? FormatNumber(value, numberFormatting) : value.ToString();
            if (value != 1) { word += suffixIfPlural; if (!string.IsNullOrWhiteSpace(prewordIfPlural)) word = prewordIfSingular + " " + word; }
            else if (!string.IsNullOrWhiteSpace(prewordIfSingular)) word = prewordIfSingular + " " + word;
            return formattedValue + " " + word;
        }

        /// <summary> Returns the value plus the singular or plural of a word based on a numerical value. </summary>
        /// <param name="value"> Number value. </param>
        /// <param name="word"> Base word, singular. </param>
        /// <param name="prewordIfSingular"> (Optional) The pre-word if singular, such as "is" in "there are 2" vs "there is 1". </param>
        /// <param name="suffixIfPlural"> (Optional) Suffix to use if "value" is not 1. </param>
        /// <param name="prewordIfPlural"> (Optional) The pre-word if plural, such as "are" in "there are 2" vs "there is 1".  </param>
        /// <param name="numberFormatting">
        ///     The number format, if any (optional). See <see cref="FormatNumber(double, string)"/>.
        /// </param>
        /// <returns> A string. </returns>
        public static string S(double value, string word, string prewordIfSingular = null, string suffixIfPlural = "s", string prewordIfPlural = null, string numberFormatting = null)
        {
            var formattedValue = numberFormatting != null ? FormatNumber(value, numberFormatting) : value.ToString();
            if (value != 1) { word += suffixIfPlural; if (!string.IsNullOrWhiteSpace(prewordIfPlural)) word = prewordIfSingular + " " + word; }
            else if (!string.IsNullOrWhiteSpace(prewordIfSingular)) word = prewordIfSingular + " " + word;
            return formattedValue + " " + word;
        }

        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Appends the source string to the target string and returns the result.
        /// If 'target' and 'source' are both not empty, then the delimiter is inserted between them, and the resulting string returned.
        /// </summary>
        /// <param name="target">The string to append to.</param>
        /// <param name="source">The string to append.</param>
        /// <param name="delimiter">If specified, the delimiter is placed between the target and source if the target is NOT empty.</param>
        /// <returns>The new string.</returns>
        public static string Append(string target, string source, string delimiter)
        {
            if (string.IsNullOrEmpty(target)) return source;
            if (string.IsNullOrEmpty(source)) return target;

            if (delimiter == null) delimiter = "";

            var targetEndsWithDel = target.EndsWith(delimiter);
            var sourceStartsWithDel = source.StartsWith(delimiter);

            if (!targetEndsWithDel && !sourceStartsWithDel)
                target += delimiter + source;
            else if (targetEndsWithDel && sourceStartsWithDel)
                target += source.Substring(delimiter.Length); // (have to remove the delimiter from one of them)
            else
                target += source; // (one or the other already contains the delimiter)

            return target;
        }

        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns the number of occurrences of the given character in the given string.
        /// </summary>
        /// <param name="str">The string to look in.</param>
        /// <param name="chr">The character to count.</param>
        public static int CharCount(string str, char chr)
        {
            int count = 0;
            if (!string.IsNullOrEmpty(str))
                for (int i = 0; i < str.Length; i++)
                    if (str[i] == chr) count++;
            return count;
        }

        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Performs a textual comparison, where the letter casing is ignored, and returns 'true' if the specified strings are a match.
        /// </summary>
        /// <param name="strA">The first string to compare.</param>
        /// <param name="strB">The second string to compare.</param>
        public static bool TextEqual(string strA, string strB)
        {
            return string.Compare(strA, strB, StringComparison.CurrentCultureIgnoreCase) == 0;
        }

        // ---------------------------------------------------------------------------------------------------------------------

        public static int GetChecksum(string str)
        {
            int checksum = 0;
            for (int i = 0; i < str.Length; i++)
                checksum += str[i];
            return checksum;
        }

        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns the given string up to a maximum of 'maxlength' characters.
        /// If more than 'maxlength' characters exist, an ellipse character is appended to the returned substring.
        /// </summary>
        public static string Limit(string text, uint maxLength, bool includeElipseInMaxLength)
        {
            if (maxLength == 0) return "";
            if (text.Length <= maxLength) return text;
            return text.Substring(0, (int)maxLength - (includeElipseInMaxLength ? 1 : 0)) + "…";
        }
        public static string Limit(string text, uint maxLength) { return Limit(text, maxLength, false); }

        // ---------------------------------------------------------------------------------------------------------------------

        /// <summary> Fixes words with 2 or more letters, making them all lowercase except for the first letter. </summary>
        /// <param name="text"> The string to change. </param>
        /// <returns> The result. </returns>
        public static string Propertize(string text)
        {
            string propertizedText = "";

            if (!string.IsNullOrEmpty(text))
            {
                bool wordStart = false;

                for (int i = 0; i < text.Length; i++)
                {
                    char c = text[i];
                    if (TextReader.IsAlpha(c))
                    {
                        if (!wordStart)
                        {
                            propertizedText += c.ToString().ToUpper();
                            wordStart = true;
                        }
                        else
                            propertizedText += c.ToString().ToLower();
                    }
                    else
                    {
                        propertizedText += c;
                        wordStart = false;
                    }
                }
            }

            return propertizedText.Trim();
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Converts a string collection into a delimited string.
        /// </summary>
        /// <param name="strings">A collection of strings.</param>
        /// <param name="delimiter">If specified (not empty) is used as a string separator.</param>
        /// <returns></returns>
        public static string ToString(this List<string> strings, string delimiter)
        {
            return string.Join(delimiter, strings);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Search an array of strings for a "whole" match.
        /// </summary>
        /// <param name="strings">List of strings to search.</param>
        /// <param name="text">String to look for.</param>
        /// <param name="caseSensitive">If 'false', the search is not case sensitive.</param>
        public static int IndexOf(this string[] strings, string text, bool caseSensitive)
        {
            if (caseSensitive)
            {
                for (int i = 0; i < strings.Length; i++)
                    if (strings[i] == text)
                        return i;
            }
            else
            {
                text = text.ToLower();
                for (int i = 0; i < strings.Length; i++)
                    if (string.Compare(strings[i], text, true) == 0)
                        return i;
            }
            return -1;
        }

        // ---------------------------------------------------------------------------------------------------------------------
    }

    // =========================================================================================================================
}
