using CoreXT.MVC;
using CoreXT.MVC.Components;
using CoreXT.MVC.PostProcessing;
using CoreXT.MVC.ResourceManagement;
using CoreXT.MVC.Views;
using CoreXT.MVC.Views.Engines;
using CoreXT.MVC.Views.Razor;
using CoreXT.Routing;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.Extensions.DependencyInjection.Extensions;
using System;

namespace Microsoft.Extensions.DependencyInjection
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
            services.TryAddSingleton<AspNetCore.Mvc.Razor.IRazorViewEngine, RazorViewEngine>(); // (this must get added first before MVC core types get added)
            services.TryAddSingleton<IRazorViewEngine, RazorViewEngine>(); // (this must get added first before MVC core types get added)
            services.TryAddSingleton<AspNetCore.Mvc.ViewFeatures.Internal.ViewResultExecutor, ViewResultExecutor>();
            services.TryAddSingleton<AspNetCore.Mvc.ViewFeatures.Internal.PartialViewResultExecutor, PartialViewResultExecutor>();
            services.TryAddSingleton<AspNetCore.Mvc.ViewEngines.ICompositeViewEngine, CompositeViewEngine>();
            services.TryAddSingleton<AspNetCore.Mvc.Razor.IRazorPageActivator, RazorPageActivator>();
            services.TryAddScoped<IViewPageRenderContext, ViewPageRenderContext>(); // (MUST BE "Scoped", since it holds per-request data and requires it's own instance)

            services.TryAddSingleton<IViewRenderer, ViewRenderer>(); // (IRazorViewEngine and ITempDataProvider are singletons also)
            services.TryAddTransient(typeof(ViewHelper<>), typeof(ViewHelper<>));
            //? services.TryAddTransient<ViewHelper, ViewHelper>(); // not sure if this is needed...?
            services.TryAddScoped<IResourceList, ResourceList>();
            services.TryAddScoped<IContentPostProcessor, ContentPostProcessor>();
            services.TryAddScoped<IViewPageRenderStack, ViewPageRenderStack>();
            services.TryAddSingleton<IViewComponentDescriptorLibrary, ViewComponentDescriptorLibrary>();

            services.AddRoutingXT();

            services.TryAddSingleton<MvcXTMarkerService, MvcXTMarkerService>();
            services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.TryAddSingleton<IActionContextAccessor, ActionContextAccessor>();
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
