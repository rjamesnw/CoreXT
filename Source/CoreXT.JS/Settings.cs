using CoreXT.FileSystem;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.StaticFiles.Infrastructure;
using System;
using System.Reflection;

namespace CoreXT.JS
{
    public static class Settings
    {
        /// <summary>
        ///     Full project-relative path to the root of the CoreXT client-side JavaScript files that are embedded in the CoreXT.JS assembly. Users
        ///     can also replace any file with a custom one by creating a file with the same name in the same path on the physical
        ///     file system.
        /// </summary>
        public const string LIBRARY_FILES_ROOT = "wwwroot/js/CoreXT";

        /// <summary>
        ///     The name of the root script file stored in the assembly.
        ///     This is the only file required to use the system.
        /// </summary>
        public const string ROOT_SCRIPT_FILE = "CoreXT.js";

        /// <summary>
        ///     The client URL path to the root CoreXT bootstrapping JavaScript file that is embedded in the CoreXT.JS assembly.
        ///     This is the only file users have to include in their page to use the system.
        ///     This path starts with '~/' to make it relative to the root application path in case virtual directories are used.
        /// </summary>
        public const string CONTENT_INCLUDE_PATH = "~/js/CoreXT/" + ROOT_SCRIPT_FILE;
    }
}

namespace Microsoft.Extensions.DependencyInjection
{
    public static class CoreXTJSExtensions
    {
        /// <summary> An IServiceCollection extension method that adds the static CoreXT.JS JavaScript files in the middleware pipeline. </summary>
        /// <param name="services"> The services to act on. </param>
        /// <returns> An IServiceCollection. </returns>
        public static IApplicationBuilder AddCoreXTJS(this IApplicationBuilder app, IHostingEnvironment hostingEnvironment)
        {
            if (app == null)
                throw new ArgumentNullException(nameof(app));

            // ... need to add a static file provider for the default embedded content files for the controls ...

            app.UseStaticFiles();

            app.UseStaticFiles(new StaticFileOptions(new SharedOptions
            {
                FileProvider = new OverridableEmbeddedFileProvider(typeof(CoreXTJSExtensions).GetTypeInfo().Assembly, hostingEnvironment)
            }));

            return app;
        }
    }
}
