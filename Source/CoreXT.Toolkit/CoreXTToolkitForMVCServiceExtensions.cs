﻿using CoreXT.Entities;
using CoreXT.FileSystem;
using CoreXT.MVC.Components;
using CoreXT.Services.DI;
using CoreXT.Toolkit.Components;
using Microsoft.AspNetCore.Session;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.FileProviders;
using System;
using System.Reflection;
using Microsoft.AspNetCore.Builder;

namespace Microsoft.Extensions.DependencyInjection
{
    public static class CoreXTToolkitForMVCServiceExtensions
    {
        /// <summary>
        ///     Adds CoreXT.Toolkit (includes various utility services) and MVC services to the specified
        ///     <see cref="IServiceCollection" />.
        /// </summary>
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
        public static IMvcBuilder AddToolkit(this IServiceCollection services, Action<MvcOptions> setupAction, IConfiguration configuration, IHostingEnvironment hostingEnvironment = null)
        {
            // ... register CoreXT service objects ...

            services.TryAddTransient<ICoreXTServiceProvider, CoreXTServiceProvider>();

            services.TryAddTransient(typeof(ITable), typeof(Table<object>));
            services.TryAddTransient(typeof(ITable<>), typeof(Table<>));
            services.TryAddTransient(typeof(ITableRow), typeof(TableRow<object>));
            services.TryAddTransient(typeof(ITableRow<>), typeof(TableRow<>));
            services.TryAddTransient(typeof(ITableColumn), typeof(TableColumn<object>));
            services.TryAddTransient(typeof(ITableColumn<>), typeof(TableColumn<>));

            services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.TryAddSingleton<IActionContextAccessor, ActionContextAccessor>();

            //services.TryAddSingleton<ILogger, logger>(); // TODO: Create customer logger.

            var currentAssembly = typeof(CoreXTToolkitForMVCServiceExtensions).GetTypeInfo().Assembly;

            // ... add the embedded providers first, then 'AddMvcXT()' will add the physical file provider next ...
            // (NOTE: derived assemblies should ALWAYS add embedded files providers FIRST to make sure the first one takes priority over inner ones)

            //? services.AddOptions();

            services.Configure<RazorViewEngineOptions>(options =>
            {
                // TODO: options.FileProviders.Add(new VirtualFileProvider("CoreXT", hostingEnvironment));
                options.FileProviders.Add(new PhysicalFileProvider(hostingEnvironment.ContentRootPath)); // (allow returning a non-embedded file for overriding embedded ones)
                // TODO: Needs testing            ^ with v
                options.FileProviders.Add(new OverridableEmbeddedFileProvider(currentAssembly, (IHostingEnvironment)null/*hostingEnvironment*/));
            });

            // ... get MVC builder, which also, by default, adds the physical file provider ...

            IMvcBuilder mvcBuilder;

            mvcBuilder = services.AddMvcXT(opts =>
            {
                opts.ModelBinderProviders.Insert(0, new TableSetBinderProvider()); // (will automatically handle any Table<T> parameter types in controller actions that capture form posts)
                setupAction?.Invoke(opts);
            });

            mvcBuilder.AddJsonOptions(o => o.SerializerSettings.Converters.Add(new TableJsonConverter()));

            services.AddComponents(currentAssembly);

            //services.AddSwaggerGen(c =>
            //{
            //    c.SwaggerDoc("CoreXT API v1", new Info { Version = "v1", Title = "CoreXT.Toolkit API", });
            //});

            //services.AddGlimpse();

            return mvcBuilder;
        }

        /// <summary>
        ///     Adds CoreXT.Toolkit (includes various utility services) and MVC services to the specified
        ///     <see cref="IServiceCollection" />.
        /// </summary>
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

            return services.AddToolkit(null, configuration, hostingEnvironment);
        }

        /// <summary>
        ///     Calls 'AddSession()' and configures it with CoreXT defaults. The defaults are as follows:
        ///     <para/>1. Cookie name changed to '.CoreXT.Session'.
        ///      <para/>2. Idle timeout set to 60 minutes and IO timeout set to 1 minute.
        ///      <para/>3. If a debugger is attached the Idle timeout changes to 120 minutes and IO timeout to 10 minutes.
        /// </summary>
        /// <param name="services"> The services to act on for this extension method. </param>
        /// <param name="configure"> (Optional) An action that can modify the default CoreXT configurations. </param>
        /// <returns> The underlying IServiceCollection. </returns>
        public static IServiceCollection AddCoreXTSession(this IServiceCollection services, Action<SessionOptions> configure = null)
        {
            return services.AddSession(opts =>
            {
                opts.Cookie.Name = ".CoreXT.Session";
                if (System.Diagnostics.Debugger.IsAttached)
                {
                    opts.IdleTimeout = TimeSpan.FromMinutes(120);
                    opts.IOTimeout = TimeSpan.FromMinutes(10);
                }
                else
                {
                    opts.IdleTimeout = TimeSpan.FromMinutes(60);
                    opts.IOTimeout = TimeSpan.FromMinutes(1);
                }
                configure?.Invoke(opts);
            });
        }
    }
}
