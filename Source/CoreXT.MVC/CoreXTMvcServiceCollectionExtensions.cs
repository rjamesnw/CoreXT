﻿using CoreXT.Routing;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.ViewFeatures.Internal;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CoreXT.MVC
{
    /// <summary>
    /// Extension methods for setting up CoreXT.MVC services in an <see cref="IServiceCollection" />,
    /// which also includes most of the normal MVC services.
    /// </summary>
    public static class CoreXTMvcServiceCollectionExtensions
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Adds CoreXT.MVC services to the specified <see cref="IServiceCollection" />.
        /// This also includes most of the normal MVC services by default.
        /// </summary>
        /// <param name="services">The <see cref="IServiceCollection" /> to add services to.</param>
        /// <returns>An <see cref="IMvcBuilder"/> that can be used to further configure the MVC services.</returns>
        public static IMvcBuilder AddMvcXT(this IServiceCollection services)
        {
            _AddServices(services);
            return services.AddMvc();
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Adds CoreXT.MVC services to the specified <see cref="IServiceCollection" />.
        /// This also includes most of the normal MVC services by default.
        /// </summary>
        /// <param name="services">The <see cref="IServiceCollection" /> to add services to.</param>
        /// <param name="setupAction">An <see cref="Action{MvcOptions}"/> to configure the provided <see cref="MvcOptions"/>.</param>
        /// <returns>An <see cref="IMvcBuilder"/> that can be used to further configure the MVC services.</returns>
        public static IMvcBuilder AddMvcXT(this IServiceCollection services, Action<MvcOptions> setupAction)
        {
            if (services == null)
                throw new ArgumentNullException(nameof(services));

            if (setupAction == null)
                throw new ArgumentNullException(nameof(setupAction));

            var builder = services.AddMvcXT();

            builder.Services.Configure(setupAction);

            return builder;
        }

        // --------------------------------------------------------------------------------------------------------------------

        private static void _AddServices(IServiceCollection services)
        {
            services.TryAddSingleton<IRazorViewEngine, CoreXTRazorViewEngine>(); // (this must get added first before MVC core types get added)
            services.TryAddSingleton<ICoreXTRazorViewEngine, CoreXTRazorViewEngine>(); // (this must get added first before MVC core types get added)
            services.TryAddSingleton<ViewResultExecutor, CoreXTViewResultExecutor>();
            services.TryAddSingleton<ViewPageRenderContext, ViewPageRenderContext>();
            services.TryAddSingleton<IRazorPageActivator, CoreXTRazorPageActivator>();

            services.AddRoutingXT();

            services.TryAddSingleton<MvcXTMarkerService, MvcXTMarkerService>();
            services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
