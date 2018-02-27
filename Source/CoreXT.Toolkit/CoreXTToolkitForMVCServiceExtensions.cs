using CoreXT.Entities;
using CoreXT.MVC;
using CoreXT.Services.DI;
using CoreXT.Toolkit.Components;
using CoreXT.Toolkit.TagHelpers;
using CoreXT.Toolkit.Web;
//using Glimpse;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;
using Swashbuckle.AspNetCore.Swagger;
using System;
using System.Reflection;

namespace Microsoft.Extensions.DependencyInjection
{
    public static class CoreXTToolkitForMVCServiceExtensions
    {
        /// <summary> Adds CoreXT.Toolkit and MVC services to the specified <see cref="IServiceCollection" />. </summary>
        /// <param name="services"> The <see cref="IServiceCollection" /> to add services to. </param>
        /// <param name="setupAction">
        ///     An <see cref="Action{MvcOptions}"/> to configure the provided <see cref="MvcOptions"/>.
        /// </param>
        /// <param name="configuration"> The configuration. </param>
        /// <param name="hostingEnvironment">
        ///     (Optional) If present, allows the embedded .cshtml content for the controls (view components) to be overridden by
        ///     custom local files matching the same path.
        /// </param>
        /// <returns> An <see cref="IMvcBuilder"/> that can be used to further configure the MVC services. </returns>
        public static IMvcBuilder AddToolkit(this IServiceCollection services, Action<MvcOptions> setupAction, IConfigurationRoot configuration, IHostingEnvironment hostingEnvironment = null)
        {
            // ... register CoreXT service objects ...

            services.TryAddTransient<ICoreXTServiceProvider, CoreXTServiceProvider>();

            services.TryAddSingleton<IViewRenderer, ViewRenderer>(); // (IRazorViewEngine and ITempDataProvider are singletons also)

            services.TryAddTransient(typeof(ViewHelper<>), typeof(ViewHelper<>));
            //? services.TryAddTransient<ViewHelper, ViewHelper>(); // not sure if this is needed...?

            services.TryAddScoped<IViewPageRenderStack, ViewPageRenderStack>();
            services.TryAddScoped<IResourceList, ResourceList>();
            services.TryAddScoped<IContentTagProcessingService, ContentTagProcessingService>();

            services.TryAddSingleton<IViewComponentDescriptorLibrary, ViewComponentDescriptorLibrary>();
            services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.TryAddSingleton<IActionContextAccessor, ActionContextAccessor>();

            //services.TryAddSingleton<ILogger, logger>(); // TODO: Create customer logger.

            var currentAssembly = typeof(CoreXTToolkitForMVCServiceExtensions).GetTypeInfo().Assembly;

            services.Configure<RazorViewEngineOptions>(options =>
            {
                options.FileProviders.Add(new CoreXTEmbeddedFileProvider(currentAssembly, hostingEnvironment));
            });

            services.AddComponents(currentAssembly);

            IMvcBuilder mvcBuilder;

            if (setupAction != null)
            {
                mvcBuilder = services.AddMvcXT(opts =>
                {
                    opts.ModelBinderProviders.Insert(0, new TableSetBinderProvider()); // (will automatically handle any Table<T> parameter types in controller actions that capture form posts)
                    setupAction(opts);
                });
            }
            else
                mvcBuilder = services.AddMvcXT();

            //services.AddSwaggerGen(c =>
            //{
            //    c.SwaggerDoc("CoreXT API v1", new Info { Version = "v1", Title = "CoreXT.Toolkit API", });
            //});

            //services.AddGlimpse();

            return mvcBuilder;
        }

        /// <summary> Adds CoreXT.Toolkit and MVC services to the specified <see cref="IServiceCollection" />. </summary>
        /// <param name="services"> The <see cref="IServiceCollection" /> to add services to. </param>
        /// <param name="configuration"> The configuration. </param>
        /// <param name="hostingEnvironment">
        ///     (Optional) If present, allows the embedded .cshtml content for the controls (view components) to be overridden by
        ///     custom local files matching the same path.
        /// </param>
        /// <returns> An <see cref="IMvcBuilder"/> that can be used to further configure the MVC services. </returns>
        public static IMvcBuilder AddToolkit(this IServiceCollection services, IConfigurationRoot configuration, IHostingEnvironment hostingEnvironment = null)
        {
            // ... register CoreXT service objects ...

            return services.AddToolkit(null, hostingEnvironment);
        }
    }
}
