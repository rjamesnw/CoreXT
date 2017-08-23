using CoreXT.Routing;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CoreXT.Routing
{
    /// <summary>
    /// Extension methods for adding the <see cref="RouterMiddleware"/> middleware to an <see cref="IApplicationBuilder"/>.
    /// </summary>
    public static class CoreXTRoutingBuilderExtensions
    {
        /// <summary>
        /// Adds a CoreXT <see cref="MainRouterMiddleware"/> middleware to the specified <see cref="IApplicationBuilder"/> with the specified <see cref="IRouter"/>.
        /// </summary>
        /// <param name="builder">The <see cref="IApplicationBuilder"/> to add the middleware to.</param>
        /// <param name="router">The <see cref="IRouter"/> to use for routing requests.</param>
        /// <returns>A reference to this instance after the operation has completed.</returns>
        public static IApplicationBuilder UseRouterXT(this IApplicationBuilder builder, IRouter router)
        {
            if (builder == null)
                throw new ArgumentNullException(nameof(builder));

            if (router == null)
                throw new ArgumentNullException(nameof(router));

            if (builder.ApplicationServices.GetService(typeof(CoreXTRoutingMarkerService)) == null)
                throw new InvalidOperationException(string.Format("You must call {{{0}}}.{{{1}}} in your '{2}' start up class method first for adding the CoreXT routing pipeline.",
                    nameof(IServiceCollection),
                    nameof(RoutingServiceCollectionExtensions.AddRouting),
                    "ConfigureServices(...)"));

            return builder.UseMiddleware<MainRouterMiddleware>(router);
        }

        /// <summary>
        /// Adds a CoreXT <see cref="MainRouterMiddleware"/> middleware to the specified <see cref="IApplicationBuilder"/>
        /// with the <see cref="IRouter"/> (RouteCollection) built from the configured <see cref="IRouteBuilder"/>.
        /// </summary>
        /// <param name="builder">The <see cref="IApplicationBuilder"/> to add the middleware to.</param>
        /// <param name="action">An <see cref="Action{IRouteBuilder}"/> to configure the provided <see cref="IRouteBuilder"/>.</param>
        /// <returns>A reference to this instance after the operation has completed.</returns>
        public static IApplicationBuilder UseRouterXT(this IApplicationBuilder builder, Action<IRouteBuilder> action)
        {
            if (builder == null)
                throw new ArgumentNullException(nameof(builder));

            if (action == null)
                throw new ArgumentNullException(nameof(action));

            if (builder.ApplicationServices.GetService(typeof(CoreXTRoutingMarkerService)) == null)
                throw new InvalidOperationException(string.Format("You must call {{{0}}}.{{{1}}} in your '{2}' start up class method first for adding the CoreXT routing pipeline.",
                    nameof(IServiceCollection),
                    nameof(RoutingServiceCollectionExtensions.AddRouting),
                    "ConfigureServices(...)"));

            var routeBuilder = new RouteBuilder(builder);
            action(routeBuilder);

            return builder.UseRouterXT(routeBuilder.Build());
        }
    }
}
