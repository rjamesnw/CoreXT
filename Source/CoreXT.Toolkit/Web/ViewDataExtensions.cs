using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using System;
using System.Globalization;

namespace CoreXT.Toolkit.Web
{
    public static class ViewDataExtensions
    {
        /// <summary>
        /// Get the value of a named property path on the view data as a boolean.
        /// </summary>
        public static bool EvalBoolean(this ViewDataDictionary viewData, string propertyPath)
        {
            return Convert.ToBoolean(viewData.Eval(propertyPath), CultureInfo.InvariantCulture);
        }

        /// <summary>
        /// Get the value of a named property path on the view data as a string.
        /// </summary>
        public static string EvalString(this ViewDataDictionary viewData, string propertyPath)
        {
            return Convert.ToString(viewData.Eval(propertyPath), CultureInfo.CurrentCulture);
        }

        /// <summary>
        /// Returns the raw value that is converted to a string for display.
        /// </summary>
        /// <param name="key">A key name for the model state to retrieve.</param>
        /// <returns>A displayable value.</returns>
        public static string GetModelAttemptedValue(this ViewDataDictionary viewData, string key)
        {
            ModelStateEntry modelState;

            if (viewData != null && viewData.ModelState != null && viewData.ModelState.TryGetValue(key, out modelState))
            {
                return modelState.AttemptedValue;
            }

            return null;
        }
    }
}
