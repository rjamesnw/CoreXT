﻿using CoreXT.FileSystem;
using CoreXT.MVC;
//using Glimpse;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.StaticFiles.Infrastructure;
using System;
using System.Reflection;

namespace Microsoft.Extensions.DependencyInjection
{
    /// <summary>
    /// Extension methods for <see cref="IApplicationBuilder"/> to add the Core Extended (CoreXT) MVC framework 
    /// to the request execution pipeline.
    /// </summary>
    public static class CoreXTToolkitForMvcApplicationBuilderExtensions
    {
        /// <summary>
        ///     Adds Core Extended (CoreXT) toolkit framework middleware and MVC to the <see cref="IApplicationBuilder"/> request
        ///     execution pipeline.
        /// </summary>
        /// <remarks>
        ///     This method only supports attribute routing. To add conventional routes use
        ///     <see cref="UseToolkit(IApplicationBuilder, Action{IRouteBuilder}, IHostingEnvironment)"/>.
        /// </remarks>
        /// <param name="app"> The <see cref="IApplicationBuilder"/>. </param>
        /// <param name="hostingEnvironment"> The hosting environment. </param>
        /// <returns> A reference to this instance after the operation has completed. </returns>
        public static IApplicationBuilder UseToolkit(this IApplicationBuilder app, IHostingEnvironment hostingEnvironment)
        {
            _AddMiddleware(app, hostingEnvironment);
            return app.UseMvcXT();
        }

        /// <summary>
        ///     Adds Core Extended (CoreXT) toolkit framework middleware and MVC to the <see cref="IApplicationBuilder"/> request
        ///     execution pipeline with a default route named 'default' and the following template:
        ///     '{controller=Home}/{action=Index}/{id?}'.
        /// </summary>
        /// <param name="app"> The <see cref="IApplicationBuilder"/>. </param>
        /// <param name="hostingEnvironment"> The hosting environment. </param>
        /// <returns> A reference to this instance after the operation has completed. </returns>
        public static IApplicationBuilder UseToolkitWithDefaultRoute(this IApplicationBuilder app, IHostingEnvironment hostingEnvironment)
        {
            _AddMiddleware(app, hostingEnvironment);
            return app.UseMvcXTWithDefaultRoute();
        }

        /// <summary>
        ///     Adds Core Extended (CoreXT) toolkit framework middleware and MVC to the <see cref="IApplicationBuilder"/> request
        ///     execution pipeline with routes named 'features' and 'subFeatures' following these templates:
        ///     <para/>'subFeatures': '{area:exists}/{controller=Home}/{action=Index}/{id?}'.
        ///     <para/>'features': '{controller=Home}/{action=Index}/{id?}'.
        /// </summary>
        /// <param name="app"> The <see cref="IApplicationBuilder"/>. </param>
        /// <param name="hostingEnvironment"> The hosting environment. </param>
        /// <returns> A reference to this instance after the operation has completed. </returns>
        public static IApplicationBuilder UseToolkitWithFeatureRoutes(this IApplicationBuilder app, IHostingEnvironment hostingEnvironment)
        {
            _AddMiddleware(app, hostingEnvironment);
            return app.UseMvcXT(routes =>
            {
                //routes.MapRoute(
                //    name: "api",
                //    template: "api/{controller}/{id?}",
                //    defaults: null,
                //    constraints: new { id = @"\d+" }
                //);

                routes.MapRoute(
                    name: "subFeatures",
                    template: "{area:exists}/{controller=Home}/{action=Index}/{id?}", // {area:exists}
                    defaults: null,
                    constraints: new { id = @"\d+" }
                );

                routes.MapRoute(
                    name: "features",
                    template: "{controller=Home}/{action=Index}/{id?}",
                    defaults: null,
                    constraints: new { id = @"\d+" }
                );
            });
        }

        /// <summary> Adds MVC to the <see cref="IApplicationBuilder"/> request execution pipeline. </summary>
        /// <param name="app"> The <see cref="IApplicationBuilder"/>. </param>
        /// <param name="configureRoutes"> A callback to configure MVC routes. </param>
        /// <param name="hostingEnvironment"> The hosting environment. </param>
        /// <returns> A reference to this instance after the operation has completed. </returns>
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

            app.AddCoreXTJS(hostingEnvironment);

            app.UseStaticFiles(new StaticFileOptions(new SharedOptions
            {
                FileProvider = new OverridableEmbeddedFileProvider(typeof(CoreXTToolkitForMvcApplicationBuilderExtensions).GetTypeInfo().Assembly, hostingEnvironment)
            }));
        }
    }
}
