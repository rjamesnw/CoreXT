using CoreXT.MVC;
using CoreXT.Routing;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc.Internal;
using Microsoft.AspNetCore.Routing;
using System;

namespace Microsoft.Extensions.DependencyInjection
{
    /// <summary>
    /// Extension methods for <see cref="IApplicationBuilder"/> to add the Core Extended (CoreXT) MVC framework 
    /// to the request execution pipeline.
    /// </summary>
    public static class CoreXTMvcApplicationBuilderExtensions
    {
        /// <summary>
        /// Adds the Core Extended (CoreXT) MVC framework to the <see cref="IApplicationBuilder"/> request execution pipeline.
        /// </summary>
        /// <param name="app">The <see cref="IApplicationBuilder"/>.</param>
        /// <returns>A reference to this instance after the operation has completed.</returns>
        /// <remarks>This method only supports attribute routing. To add conventional routes use
        /// <see cref="UseMvc(IApplicationBuilder, Action{IRouteBuilder})"/>.</remarks>
        public static IApplicationBuilder UseMvcXT(this IApplicationBuilder app)
        {
            if (app == null)
                throw new ArgumentNullException(nameof(app));

            return app.UseMvcXT(null);
        }

        /// <summary>
        /// Adds  Extended (CoreXT) MVC framework to the <see cref="IApplicationBuilder"/> request execution pipeline
        /// with a default route named 'default' and the following template:
        /// '{controller=Home}/{action=Index}/{id?}'.
        /// </summary>
        /// <param name="app">The <see cref="IApplicationBuilder"/>.</param>
        /// <returns>A reference to this instance after the operation has completed.</returns>
        public static IApplicationBuilder UseMvcXTWithDefaultRoute(this IApplicationBuilder app)
        {
            if (app == null)
                throw new ArgumentNullException(nameof(app));

            return app.UseMvcXT(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
            });
        }

        /// <summary>
        /// Adds MVC to the <see cref="IApplicationBuilder"/> request execution pipeline.
        /// </summary>
        /// <param name="app">The <see cref="IApplicationBuilder"/>.</param>
        /// <param name="configureRoutes">A callback to configure MVC routes.</param>
        /// <returns>A reference to this instance after the operation has completed.</returns>
        public static IApplicationBuilder UseMvcXT(this IApplicationBuilder app, Action<IRouteBuilder> configureRoutes)
        {
            if (app == null)
                throw new ArgumentNullException(nameof(app));

            // ... verify if AddMvcXT was done before calling UseMvcXT;
            // MvcXTMarkerService is here to make sure if all the services were added ...

            if (app.ApplicationServices.GetService(typeof(MvcXTMarkerService)) == null)
                throw new InvalidOperationException(string.Format("You must call {{{0}}}.{{{1}}} in your '{2}' start up class method first for adding the CoreXT MVC pipeline.",
                    nameof(IServiceCollection),
                    "AddMvcXT",
                    "ConfigureServices(...)"));

            var middlewarePipelineBuilder = app.ApplicationServices.GetRequiredService<MiddlewareFilterBuilder>(); //?
            middlewarePipelineBuilder.ApplicationBuilder = app.New(); //?

            var routes = new RouteBuilder(app, app.ApplicationServices.GetRequiredService<MvcRouteHandler>());
            // ('MvcRouteHandler' is the default handler for mapping routes [i.e. routes.MapRoute()]) 

            configureRoutes?.Invoke(routes); // (note: if users call 'MapRoute()', it requires 'routes.DefaultHandler' to be set on the route builder)

            routes.Routes.Insert(0, AttributeRouting.CreateAttributeMegaRoute(app.ApplicationServices));
            //routes.UseAttributeRouting();

            return app.UseRouterXT(routes.Build());
        }
    }
}
