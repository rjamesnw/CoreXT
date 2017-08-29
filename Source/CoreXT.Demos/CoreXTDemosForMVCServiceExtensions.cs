using CoreXT.MVC;
using CoreXT.Toolkit;
using CoreXT.Toolkit.Controls;
using CoreXT.Toolkit.Web;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using System;
using System.Reflection;
using MySQL.Data.EntityFrameworkCore.Extensions;
using MySQL.Data.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using CoreXT.Services.DI;
using CoreXT.Demos.Models;
using CoreXT.Models;

namespace CoreXT.Demos.MVC
{
    public static class CoreXTDemosForMVCServiceExtensions
    {
        /// <summary>
        /// Adds CoreXT.Demos and related services to the specified <see cref="IServiceCollection" />.
        /// </summary>
        /// <param name="services">The <see cref="IServiceCollection" /> to add services to.</param>
        /// <param name="setupAction">An <see cref="Action{MvcOptions}"/> to configure the provided <see cref="MvcOptions"/>.</param>
        /// <param name="configuration">The configuration of the host application in order to pull settings, such as database connection strings.</param>
        /// <param name="hostingEnvironment">If present, allows the embedded .cshtml content for the CoreXT.Toolkit controls (view components) to be overridden
        /// by custom local files matching the same path.</param>
        /// <returns>An <see cref="IMvcBuilder"/> that can be used to further configure the MVC services.</returns>
        public static IMvcBuilder AddCoreXTDemos(this IServiceCollection services, Action<MvcOptions> setupAction, IConfigurationRoot configuration, IHostingEnvironment hostingEnvironment = null)
        {
            // ... register CoreXT.Demos service objects ...

            services.TryAddTransient<IAppSettings, CoreXTDemoAppSettings>();
            services.TryAddTransient<ICoreXTDemoContext, CoreXTDemoContext>();
            services.TryAddScoped<ICoreXTDemoReadonlyContext, CoreXTDemoReadonlyContext>();

            // ... configure the CoreXT.Demos services and settings ...

            services.Configure<CoreXTDemoAppSettings>(configuration.GetSection("AppSettings:CoreXT.Demos"));

            services.AddDbContext<CoreXTDemoContext>(
                options => options.UseMySQL("Server=localhost", b => b.CommandTimeout(120)),
                ServiceLifetime.Transient
            );

            services.AddDbContext<CoreXTDemoReadonlyContext>(
                options => options.UseMySQL("Server=localhost", b => b.CommandTimeout(120)),
                ServiceLifetime.Scoped
            );

            var currentAssembly = typeof(CoreXTDemosForMVCServiceExtensions).GetTypeInfo().Assembly;

            services.AddControls(currentAssembly); // (this scans CoreXT.Demos for controls [CoreXT ControlBase view components])

            // ... continue on to add the CDS, CDS.Core, CDS.Web.Core, CoreXT.MVC, CoreXT.Toolkit, and MVC framework services ...

            return services.AddToolkit(setupAction, configuration, hostingEnvironment);
        }

        /// <summary>
        /// Adds CoreXT.Demos and related services to the specified <see cref="IServiceCollection" />.
        /// </summary>
        /// <param name="services">The <see cref="IServiceCollection" /> to add services to.</param>
        /// <param name="configuration">The configuration of the host application in order to pull settings, such as database connection strings.</param>
        /// <param name="hostingEnvironment">If present, allows the embedded .cshtml content for the CoreXT.Toolkit controls (view components) to be overridden
        /// by custom local files matching the same path.</param>
        /// <returns>An <see cref="IMvcBuilder"/> that can be used to further configure the MVC services.</returns>
        public static IMvcBuilder AddCoreXTDemos(this IServiceCollection services, IConfigurationRoot configuration, IHostingEnvironment hostingEnvironment = null)
        {
            // ... register CoreXT.Demos service objects ...

            return services.AddCoreXTDemos(null, configuration, hostingEnvironment);
        }
    }
}
