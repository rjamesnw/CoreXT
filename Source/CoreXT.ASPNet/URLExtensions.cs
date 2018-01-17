using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Extensions;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Text;
using System.Web;

namespace CoreXT.ASPNet
{
    /// <summary>
    /// Contains some extensions to help working with URL creation and manipulation.
    /// </summary>
    public static class URLExtensions
    {
        ///// <summary>
        ///// Returns a 'Uri' instance for an absolute URI string.
        ///// </summary>
        ///// <param name="uriStr">The string that represents a URI.</param>
        ///// <param name="uriKind">The kind of URI to returned (defaults to absolute).</param>
        ///// <returns></returns>
        //?public static Uri ToUri(this string uriStr, UriKind uriKind = UriKind.Absolute)
        //{
        //    return new Uri(uriStr, uriKind);
        //}

        ///// <summary>
        ///// Returns a UriBuilder to work with the specified URI string.
        ///// </summary>
        ///// <param name="uriStr"></param>
        ///// <returns></returns>
        //?public static UriBuilder ToUriBuilder(this string uriStr)
        //{
        //    return new UriBuilder(uriStr);
        //}

        /// <summary>
        /// Returns a Uri for the URL of the given request.
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        public static Uri GetUrl(this HttpRequest request)
        {
            return new Uri(request.GetDisplayUrl(), UriKind.Absolute);
        }

        /// <summary>
        /// Returns a UriBuilder to work with the specified Uri.
        /// </summary>
        /// <param name="uri"></param>
        /// <returns></returns>
        public static UriBuilder ToUriBuilder(this Uri uri)
        {
            return new UriBuilder(uri);
        }

        /// <summary>
        /// Returns a Uri instance from the specified UriBuilder.
        /// </summary>
        /// <param name="uriBuilder"></param>
        /// <returns></returns>
        public static Uri ToUri(this UriBuilder uriBuilder)
        {
            return new Uri(uriBuilder.ToString(), UriKind.Absolute);
        }

        /// <summary>
        /// Returns a collection of "name=value" query items from a URI builder.
        /// </summary>
        /// <param name="uriBuilder"></param>
        /// <returns></returns>
        public static NameValueCollection GetQueryParameters(this UriBuilder uriBuilder)
        {
            return HttpUtility.ParseQueryString(uriBuilder.Query ?? "");
        }

        /// <summary>
        /// Add a "name=value" entry to the query part of the given UriBuilder instance.
        /// </summary>
        /// <param name="uriBuilder"></param>
        /// <param name="name">The name of the parameter to add.</param>
        /// <param name="value">The parameter value.</param>
        /// <returns></returns>
        public static UriBuilder AddQueryValue(this UriBuilder uriBuilder, string name, object value)
        {
            var nameValues = uriBuilder.GetQueryParameters();
            if (value == null) value = "";
            nameValues.Add(name, (value is string) ? (string)value : value.ToString());
            uriBuilder.Query = nameValues.ToString();
            return uriBuilder;
        }

        /// <summary>
        /// Add a "name=value" entry to a NameValueCollection.
        /// </summary>
        /// <param name="nameValueCollection"></param>
        /// <param name="name">The name of the value to add.</param>
        /// <param name="value">The value to add. If the value is null, and empty string will be added.</param>
        /// <returns></returns>
        public static NameValueCollection Add(this NameValueCollection nameValueCollection, string name, object value)
        {
            if (value == null) value = "";
            nameValueCollection.Add(name, (value is string) ? (string)value : value.ToString());
            return nameValueCollection;
        }

        /// <summary>
        /// Merge "name=value" items (delimited by an ampersand symbol '&amp;') in a string with the query parameters of the given UriBuilder instance.
        /// </summary>
        /// <param name="uriBuilder"></param>
        /// <param name="items"></param>
        /// <returns></returns>
        public static UriBuilder MergeQueryParameters(this UriBuilder uriBuilder, string queryString)
        {
            var nameValues = uriBuilder.GetQueryParameters();
            var newValues = HttpUtility.ParseQueryString(queryString ?? "");
            nameValues.Add(newValues);
            uriBuilder.Query = nameValues.ToString();
            return uriBuilder;
        }

        /// <summary>
        /// Merge a name-value collection with the query parameters of the given UriBuilder instance.
        /// </summary>
        /// <param name="uriBuilder"></param>
        /// <param name="items"></param>
        /// <returns></returns>
        public static UriBuilder MergeQueryParameters(this UriBuilder uriBuilder, NameValueCollection items)
        {
            var nameValues = uriBuilder.GetQueryParameters();
            nameValues.Add(items);
            uriBuilder.Query = nameValues.ToString();
            return uriBuilder;
        }

        /// <summary>
        /// Sets the path on the UriBuilder and returns the same instance.
        /// </summary>
        /// <param name="uriBuilder"></param>
        /// <param name="newPath">A new path to replace the current path.
        /// If the path is an absolute URI itself, the path is extract from it.</param>
        /// <returns></returns>
        public static UriBuilder SetPath(this UriBuilder uriBuilder, string newPath)
        {
            //var returnURL = new UriBuilder(_HttpContext.Request.GetDisplayUrl());
            if (newPath == null) newPath = "";
            if (newPath.Contains("://"))
                uriBuilder.Path = new Uri(newPath, UriKind.Absolute).AbsolutePath;
            else
                uriBuilder.Path = newPath;
            return uriBuilder;
        }

        /// <summary>
        /// Appends a sub-path to any existing path on the UriBuilder then returns the same instance.
        /// If the path is an absolute URI then the path is extracted and the current UriBuilder path will be replaced instead.
        /// </summary>
        /// <param name="uriBuilder"></param>
        /// <param name="subPath"></param>
        /// <returns></returns>
        public static UriBuilder AppendPath(this UriBuilder uriBuilder, string subPath)
        {
            //var returnURL = new UriBuilder(_HttpContext.Request.GetDisplayUrl());
            if (subPath.Contains("://"))
                uriBuilder.SetPath(subPath);
            else
                uriBuilder.Path = Strings.Append(uriBuilder.Path, subPath, "/");
            return uriBuilder;
        }
    }
}
