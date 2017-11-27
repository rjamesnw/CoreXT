using CoreXT.Toolkit.Components;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.StaticFiles.Infrastructure;
using System;
using System.Reflection;
using CoreXT.MVC;

namespace CoreXT.Demos.MVC
{
    /// <summary>
    /// Extension methods for <see cref="IApplicationBuilder"/> to add CoreXT.Demos middleware to the request execution pipeline.
    /// </summary>
    public static class CoreXTDemosForMvcApplicationBuilderExtensions
    {
        /// <summary>
        /// Adds CoreXT Toolkit and MVC middleware to the <see cref="IApplicationBuilder"/> request execution pipeline.
        /// </summary>
        /// <param name="app">The <see cref="IApplicationBuilder"/>.</param>
        /// <returns>A reference to this instance after the operation has completed.</returns>
        /// <remarks>This method only supports attribute routing. To add conventional routes use
        /// <see cref="UseMvc(IApplicationBuilder, Action{IRouteBuilder})"/>.</remarks>
        public static IApplicationBuilder UseCoreXTDemos(this IApplicationBuilder app, IHostingEnvironment hostingEnvironment)
        {
            _AddMiddleware(app, hostingEnvironment);
            return app.UseToolkit(hostingEnvironment);
        }

        /// <summary>
        /// Adds CoreXT Toolkit and MVC middleware to the <see cref="IApplicationBuilder"/> request execution pipeline
        /// with a default route named 'default' and the following template:
        /// '{controller=Home}/{action=Index}/{id?}'.
        /// </summary>
        /// <param name="app">The <see cref="IApplicationBuilder"/>.</param>
        /// <returns>A reference to this instance after the operation has completed.</returns>
        public static IApplicationBuilder UseCoreXTDemosWithDefaultRoute(this IApplicationBuilder app, IHostingEnvironment hostingEnvironment)
        {
            _AddMiddleware(app, hostingEnvironment);
            return app.UseToolkitWithDefaultRoute(hostingEnvironment);
        }

        /// <summary>
        /// Adds CoreXT Toolkit and MVC middleware to the <see cref="IApplicationBuilder"/> request execution pipeline.
        /// </summary>
        /// <param name="app">The <see cref="IApplicationBuilder"/>.</param>
        /// <param name="configureRoutes">A callback to configure MVC routes.</param>
        /// <returns>A reference to this instance after the operation has completed.</returns>
        public static IApplicationBuilder UseCoreXTDemos(this IApplicationBuilder app, Action<IRouteBuilder> configureRoutes, IHostingEnvironment hostingEnvironment)
        {
            _AddMiddleware(app, hostingEnvironment);
            return app.UseToolkit(configureRoutes, hostingEnvironment);
        }

        static void _AddMiddleware(IApplicationBuilder app, IHostingEnvironment hostingEnvironment)
        {
            if (app == null)
                throw new ArgumentNullException(nameof(app));

            // ... not used yet ...
        }
    }
}
