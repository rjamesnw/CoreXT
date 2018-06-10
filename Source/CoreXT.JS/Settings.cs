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
        ///     Full path to the root of the CoreXT client-side JavaScript files that are embedded in the CoreXT.JS assembly. Users
        ///     can also replace any file with a custom one by creating a file with the same name in the same path on the physical
        ///     file system.
        /// </summary>
        const string LIBRARY_PATH = "wwwroot/js/corext";
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
