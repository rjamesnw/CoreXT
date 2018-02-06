using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Http.Features;
using System;
using System.Collections.Generic;
using System.Linq;
using CoreXT;
using System.IO;
using System.Text.Encodings.Web;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;

namespace CoreXT.ASPNet
{
    // ########################################################################################################################

    /// <summary>
    /// Static utility methods.
    /// </summary>
    public static class UtilityExtensions
    {
        // --------------------------------------------------------------------------------------------------------------------

        public static string GetIPAddress(this HttpContext context) //IServerVariablesFeature
        {
            string ipAddress = context.Request.Headers.Value("HTTP_X_FORWARDED_FOR"); // (used to be in Request.ServerVariables[])

            if (!string.IsNullOrEmpty(ipAddress))
            {
                string[] addresses = ipAddress.Split(',');
                if (addresses.Length != 0)
                    return addresses[0];
            }

            ipAddress = context.Request.Headers.Value("REMOTE_ADDR");

            if (!string.IsNullOrWhiteSpace(ipAddress))
                return ipAddress;

            return context.Connection.RemoteIpAddress.ToString();
        }

        // --------------------------------------------------------------------------------------------------------------------

        public static string GetHostName(this HttpContext context)
        {
            return context.Request.Host.Host;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Renders an 'IHtmlContent' object to a string. If 'htmlContent' is null, then an empty string is returned. 
        /// </summary>
        public static string Render(this IHtmlContent htmlContent)
        {
            if (htmlContent != null)
                using (var tw = new StringWriter())
                {
                    htmlContent.WriteTo(tw, HtmlEncoder.Default);
                    tw.Flush();
                    return tw.ToString();
                }
            else return string.Empty;
        }

        /// <summary>
        /// Writes a given <seealso cref="IHtmlContent"/> instance to another stream.
        /// </summary>
        /// <param name="htmlContent"></param>
        /// <param name="stream"></param>
        public static void WriteTo(this IHtmlContent htmlContent, Stream stream)
        {
            var bytes = Encoding.UTF8.GetBytes(htmlContent.Render());
            stream?.Write(bytes, 0, bytes.Length);
        }

        // --------------------------------------------------------------------------------------------------------------------

        public static T GetService<T>(this IServiceProvider sp) where T : class
        {
            return (T)sp.GetService(typeof(T));
        }

        public static T GetService<T>(this HttpContext context) where T : class
        {
            return context?.RequestServices?.GetService<T>();
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns zero/null, one, or many string values from a form collection for a given key.
        /// </summary>
        /// <param name="formCollection">The form collection to get values for.</param>
        /// <param name="key">A key name in the form with the values to retrieve. If not found, then 'StringValues.Empty' is returned.</param>
        /// <returns></returns>
        public static StringValues GetValues(this IFormCollection formCollection, string key) => formCollection.TryGetValue(key, out var values) ? values : StringValues.Empty;

        // --------------------------------------------------------------------------------------------------------------------
    }
}
