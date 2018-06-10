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
            services.TryAddSingleton<IActionResultExecutor<ViewResult>, ViewResultExecutor>();
            services.TryAddSingleton<IActionResultExecutor<PartialViewResult>, PartialViewResultExecutor>();
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

        /// <summary>
        ///     Configures the "Features" pattern for views where the controller code and view files are in the same directory.
        ///     <para>
        ///         To use this, rename '/Views' to '/Features', and move your '/Areas' folder directly under '/Features' as a sub-
        ///         folder. Each folder should contain a single controller and ALL view files the controller works with. Keeping
        ///         files in one place makes it easier to find the views related to controller actions.
        ///     </para>
        /// </summary>
        /// <param name="builder"> The builder to act on for this extension method. </param>
        /// <returns> An IMvcBuilder. </returns>
        public static IMvcBuilder AddFeatureRouting(this IMvcBuilder builder)
        {
            return builder.AddMvcOptions(o => o.Conventions.Add(new FeatureConvention()))
                .AddRazorOptions(options =>
                {
                    // {0} - Action Name
                    // {1} - Controller Name
                    // {2} - Area Name
                    // {3} - Feature Name
                    //options.ViewLocationFormats.Insert(0, "/{0}.cshtml");
                    options.ViewLocationFormats.Insert(0, "/Features/Shared/{0}.cshtml");
                    options.ViewLocationFormats.Insert(0, "/Features/{1}/{0}.cshtml");
                    options.AreaViewLocationFormats.Insert(0, "/Features/{2}/Shared/{0}.cshtml");
                    options.AreaViewLocationFormats.Insert(0, "/Features/{2}/{1}/{0}.cshtml"); // (insert more complicated last so it matches first)
                                                                                               //?options.ViewLocationExpanders.Add(new FeatureViewLocationExpander());
                });
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
