using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace CoreXT.ASPNet
{

    // ########################################################################################################################

    public static class HostingEnvironmentExtensions
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Appends a relative URI path to a base file path.
        /// </summary>
        static string _CombinePath(string baseFilePath, string relatveURIPath) // CONSIDER: Create as utility method?
        {
            baseFilePath = (baseFilePath ?? string.Empty).Trim().Replace('/', Path.DirectorySeparatorChar);
            if (string.IsNullOrWhiteSpace(relatveURIPath)) return baseFilePath;
            relatveURIPath = (relatveURIPath ?? string.Empty).Trim().TrimStart('~', '/').Replace('/', Path.DirectorySeparatorChar);
            return Path.Combine(baseFilePath, relatveURIPath);
        }

        /// <summary>
        /// Uses <seealso cref="IHostingEnvironment"/> to map a path based on an application root path.  If 'path' starts with a tilde ('~'), then
        /// the "IHostingEnvironment.WebRootPath" path is assumed (usually the 'wwwroot' folder), otherwise 'IHostingEnvironment.ContentRootPath'
        /// will be used.
        /// </summary>
        /// <param name="env">A hosting environment settings reference.</param>
        /// <param name="path">The path to map to a physical file path.</param>
        /// <param name="searchRoots">If true (default) both 'IHostingEnvironment.WebRootPath' and 'IHostingEnvironment.ContentRootPath'
        /// will be searched. If 'path' starts with a tilde ('~') then the 'WebRootPath' location is checked
        /// first. If no file exists, the method will fall back to checking the application's root path ('ContentRootPath').
        /// If no tilde character is used, the application's root path ('ContentRootPath') is checked first, falling back to 'WebRootPath'
        /// if the file is not found.
        /// If this is false, no fall-back occurs.</param>
        public static string MapPath(this IUrlHelper urlHelper, string path, bool searchRoots = true)
        {
            if (urlHelper == null)
                throw new ArgumentNullException("urlHelper");
            var env = urlHelper.ActionContext.HttpContext.GetService<IHostingEnvironment>();
            if (env == null)
                throw new InvalidOperationException("Failed to get the service object 'IHostingEnvironment'.");

            if (path.Contains("://"))
            {
                // ... this is an absolute path, so try to resolve to a local file path ...
                var virpath = urlHelper.Link(string.Empty, null).TrimEnd('/');
                if (path.StartsWith(virpath))
                    path = "~" + path.Substring(virpath.Length);
                else
                    return string.Empty; // (cannot map to a local path as the URL is not for a local resource)
            }
            if (path.StartsWith("~"))
            {
                var filepath1 = _CombinePath(env.WebRootPath, path);
                if (searchRoots && !File.Exists(filepath1))
                {
                    var filepath2 = _CombinePath(env.ContentRootPath, path);
                    if (File.Exists(filepath2)) return filepath2; else return filepath1;
                }
                else return filepath1;
            }
            else
            {
                var filepath1 = _CombinePath(env.ContentRootPath, path);
                if (searchRoots && !File.Exists(filepath1))
                {
                    var filepath2 = _CombinePath(env.WebRootPath, path);
                    if (File.Exists(filepath2)) return filepath2; else return filepath1;
                }
                else return filepath1;
            }
        }

        /// <summary>
        /// Gets 'IHostingEnvironment' from the given 'HttpContext' to map a path based on the root application path.
        /// </summary>
        public static string MapPath(this ActionContext actionContext, string path, bool searchRoots = true)
        {
            var urlHelper = actionContext.HttpContext.GetService<IUrlHelperFactory>()?.GetUrlHelper(actionContext);
            if (urlHelper == null)
                throw new InvalidOperationException("MapPath: 'IUrlHelperFactory' service object not found.");
            return urlHelper.MapPath(path, searchRoots);
        }

        ///// <summary>
        ///// Gets 'IHostingEnvironment' from the given 'HttpContext' to map a path based on the root application path.
        ///// <para>This is provided for backwards compatibility with ASP.Net 4. Consider using the other extensions to
        ///// get a 'Uri' object instead, such as '{HttpContext}.MapPath()' or '{IHostingEnvironment}.MapPath()'.</para>
        ///// </summary>
        //? public static string MapPath(this HttpRequest request, string path, bool searchRoots = true)
        //{
        //    return request.HttpContext.MapPath(path, searchRoots).ToString();
        //}

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns true if the given environment name matches the current environment setting in
        /// '<seealso cref="IHostingEnvironment"/>.EnvironmentName' (usually set by passing in an argument to the web application,
        /// or by setting the 'ASPNETCORE_ENVIRONMENT' environment variable).
        /// </summary>
        public static bool IsEnvironment(this IHostingEnvironment env, string environmentName, bool ignoreCase)
        {
            if (ignoreCase)
                return string.Compare(env?.EnvironmentName ?? string.Empty, environmentName ?? string.Empty, true) == 0;
            else
                return (env?.EnvironmentName ?? string.Empty) == (environmentName ?? string.Empty);
        }
        // (note: Microsoft already as a similar one: Microsoft.AspNetCore.Hosting.HostingEnvironmentExtensions)

        /// <summary>
        /// Returns true if any of the given environment flags matches the current environment setting in
        /// '<seealso cref="IHostingEnvironment"/>.EnvironmentName' (usually set by passing in an argument to the web application,
        /// or by setting the 'ASPNETCORE_ENVIRONMENT' environment variable).
        /// <para>Note that the value 'Environments.Any' (0) will match all environments.</para>
        /// <para>This method requires that text matching the environment names in the enum type are used to set the hosting environment names.</para>
        /// </summary>
        /// <param name="environment">Environment flags to test against. If any match, or if 'environment' is 0, 'true' is returned.</param>
        /// <param name="ignoreCase">If true (default) case is ignored when comparing against the 'IHostingEnvironment.EnvironmentName' value.</param>
        public static bool IsEnvironment(this IHostingEnvironment env, Environments environment, bool ignoreCase = true)
        {
            if (environment == Environments.Any) return true;
            if (env != null)
            {
                if (environment.HasFlag(Environments.Production))
                    return env.IsEnvironment(nameof(Environments.Production), ignoreCase);
                if (environment.HasFlag(Environments.Staging))
                    return env.IsEnvironment(nameof(Environments.Staging), ignoreCase);
                if (environment.HasFlag(Environments.Q2))
                    return env.IsEnvironment(nameof(Environments.Q2), ignoreCase);
                if (environment.HasFlag(Environments.QA))
                    return env.IsEnvironment(nameof(Environments.QA), ignoreCase);
                if (environment.HasFlag(Environments.Testing))
                    return env.IsEnvironment(nameof(Environments.Testing), ignoreCase);
                if (environment.HasFlag(Environments.Development))
                    return env.IsEnvironment(nameof(Environments.Development), ignoreCase);
                if (environment.HasFlag(Environments.Sandbox))
                    return env.IsEnvironment(nameof(Environments.Sandbox), ignoreCase);
            }
            return false;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ########################################################################################################################
}
