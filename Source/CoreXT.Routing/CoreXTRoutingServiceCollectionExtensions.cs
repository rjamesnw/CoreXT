using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CoreXT.Routing
{
    /// <summary>
    /// Adds CoreXT.Routing extension methods to <see cref="IServiceCollection"/>.
    /// </summary>
    public static class CoreXTRoutingServiceCollectionExtensions
    {
        /// <summary>
        /// Adds CoreXT and normal MVC based services required for routing requests.
        /// </summary>
        /// <param name="services">The <see cref="IServiceCollection"/> to add the services to.</param>
        /// <returns>The <see cref="IServiceCollection"/> so that additional calls can be chained.</returns>
        public static IServiceCollection AddRoutingXT(this IServiceCollection services)
        {
            if (services == null)
                throw new ArgumentNullException(nameof(services));

            services.AddRouting();

            services.TryAddSingleton(typeof(CoreXTRoutingMarkerService));

            return services;
        }

        /// <summary>
        /// Adds CoreXT and normal MVC based services required for routing requests.
        /// </summary>
        /// <param name="services">The <see cref="IServiceCollection"/> to add the services to.</param>
        /// <param name="configureOptions">The routing options to configure the middleware with.</param>
        /// <returns>The <see cref="IServiceCollection"/> so that additional calls can be chained.</returns>
        public static IServiceCollection AddRoutingXT(this IServiceCollection services, Action<RouteOptions> configureOptions)
        {
            if (services == null)
                throw new ArgumentNullException(nameof(services));

            if (configureOptions == null)
                throw new ArgumentNullException(nameof(configureOptions));

            services.Configure(configureOptions);

            services.AddRoutingXT();

            return services;
        }
    }
}
