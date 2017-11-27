using CoreXT.Toolkit.Components;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.StaticFiles.Infrastructure;
using System;
using System.Reflection;

namespace CoreXT.MVC
{
    /// <summary>
    /// Extension methods for <see cref="IApplicationBuilder"/> to add the Core Extended (CoreXT) MVC framework 
    /// to the request execution pipeline.
    /// </summary>
    public static class CoreXTToolkitForMvcApplicationBuilderExtensions
    {
        /// <summary>
        /// Adds Core Extended (CoreXT) toolkit framework middleware and MVC to the <see cref="IApplicationBuilder"/> request execution pipeline.
        /// </summary>
        /// <param name="app">The <see cref="IApplicationBuilder"/>.</param>
        /// <returns>A reference to this instance after the operation has completed.</returns>
        /// <remarks>This method only supports attribute routing. To add conventional routes use
        /// <see cref="UseMvc(IApplicationBuilder, Action{IRouteBuilder})"/>.</remarks>
        public static IApplicationBuilder UseToolkit(this IApplicationBuilder app, IHostingEnvironment hostingEnvironment)
        {
            _AddMiddleware(app, hostingEnvironment);
            return app.UseMvcXT();
        }

        /// <summary>
        /// Adds Core Extended (CoreXT) toolkit framework middleware and MVC to the <see cref="IApplicationBuilder"/> request execution pipeline
        /// with a default route named 'default' and the following template:
        /// '{controller=Home}/{action=Index}/{id?}'.
        /// </summary>
        /// <param name="app">The <see cref="IApplicationBuilder"/>.</param>
        /// <returns>A reference to this instance after the operation has completed.</returns>
        public static IApplicationBuilder UseToolkitWithDefaultRoute(this IApplicationBuilder app, IHostingEnvironment hostingEnvironment)
        {
            _AddMiddleware(app, hostingEnvironment);
            return app.UseMvcXTWithDefaultRoute();
        }

        /// <summary>
        /// Adds MVC to the <see cref="IApplicationBuilder"/> request execution pipeline.
        /// </summary>
        /// <param name="app">The <see cref="IApplicationBuilder"/>.</param>
        /// <param name="configureRoutes">A callback to configure MVC routes.</param>
        /// <returns>A reference to this instance after the operation has completed.</returns>
        public static IApplicationBuilder UseToolkit(this IApplicationBuilder app, Action<IRouteBuilder> configureRoutes, IHostingEnvironment hostingEnvironment)
        {
            _AddMiddleware(app, hostingEnvironment);
            return app.UseMvcXT(configureRoutes);
        }

        static void _AddMiddleware(IApplicationBuilder app, IHostingEnvironment hostingEnvironment)
        {
            if (app == null)
                throw new ArgumentNullException(nameof(app));

            // ... need to add a static file provider for the default embedded content files for the controls ...

            app.UseStaticFiles(new StaticFileOptions(new SharedOptions
            {
                FileProvider = new CoreXTEmbeddedFileProvider(typeof(CoreXTToolkitForMvcApplicationBuilderExtensions).GetTypeInfo().Assembly, hostingEnvironment)
            }));
        }
    }
}
