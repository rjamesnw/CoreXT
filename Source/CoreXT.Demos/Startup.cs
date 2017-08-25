using CoreXT.Demos.Models;
using CoreXT.Demos.MVC;
using CoreXT.Toolkit;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace OneCMS
{
    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            HostingEnvironment = env;

            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();

            Configuration = builder.Build();
        }

        public IHostingEnvironment HostingEnvironment { get; }

        public IConfigurationRoot Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services) // (note: 'env.EnvironmentName' above can also be used in "Configure{0}Services")
        {
            services.AddLocalization(options => options.ResourcesPath = "Resources");

            // ... register the CDS controls and their related views ...

            services.Configure<RazorViewEngineOptions>(options =>
            {
                options.ViewLocationFormats.Add("Areas/{2}/{1}/{0}.cshtml"); //? (needed?)
            });

            // ... register the CDS based application settings ...

            services.AddSingleton(_ => Configuration);

            services.AddOptions();

            //Automatically bind AppSettings
            services.Configure<CoreXTDemoAppSettings>(Configuration.GetSection("AppSettings"));

            // ... setup localization ...

            //? services.Configure<RequestLocalizationOptions>(
            //    options =>
            //    {
            //        var supportedCultures = new List<CultureInfo>
            //            {
            //                new CultureInfo("en-US")
            //            };

            //        options.DefaultRequestCulture = new RequestCulture(culture: "en-US", uiCulture: "en-US");
            //        options.SupportedCultures = supportedCultures;
            //        options.SupportedUICultures = supportedCultures;
            //    });

            // ... add the CDS, CDS.Core, CDS.Web.Core, CoreXT.MVC, CoreXT.Toolkit, and MVC framework services ...
            services.AddCoreXTDemos(Configuration, HostingEnvironment)
                .AddJsonOptions(jsonOptions =>
                {
                    jsonOptions.SerializerSettings.MissingMemberHandling = Newtonsoft.Json.MissingMemberHandling.Ignore;
                    jsonOptions.SerializerSettings.NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore;
                }); ;

            //? .AddViewLocalization(
            //?     LanguageViewLocationExpanderFormat.SubFolder,
            //?     opts => { opts.ResourcesPath = "Resources"; })
            //.AddDataAnnotationsLocalization();

            //? services.AddScoped<LanguageActionFilter>(); https://damienbod.com/2015/10/21/asp-net-5-mvc-6-localization/ - good for URL patterns such as http://localhost:5000/api/it-CH/AboutWithCultureInRoute

            // services.AddRouting();

            //Add Session service
            services.AddSession();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, ILoggerFactory loggerFactory) // (note: 'env.EnvironmentName' above can also be used in "Configure{0}")
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            if (HostingEnvironment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseBrowserLink();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            //? var locOptions = app.ApplicationServices.GetService<IOptions<RequestLocalizationOptions>>();
            //?  app.UseRequestLocalization(locOptions.Value);
            //?  (example usage: http://localhost:5000/api/About?culture=en-US)

            app.UseStaticFiles();
            app.UseSession();

            app.UseCoreXTDemos(routes => // (invokes app.UseRouter(routes.Build()); before returning, which adds a Microsoft.AspNetCore.Routing.RouteCollection [IRouter] instance)
            {
                // (areas route)
                routes.MapRoute(
                    name: "area",
                    template: "{area:exists}/{controller=Home}/{action=Index}/{id?}");

                // (default route)
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
            }, HostingEnvironment);

            app.Run(async (context) =>
            {
                await context.Response.WriteAsync("Error: There is no content at this address (URL). Please go back and try again.\r\n URL path was '" + context.Request.Path + "'.");
            });
        }
    }
}

// Coming soon to 1.1: ConfigureContainer (easy 3re party IoC):  http://m.azurewebsites.net/new-asp-net-core-feature-coming-to-1-1-better-integration-of-3rd-party-ioc-containers-in-startup-class/
// Tip: GetService<IEnumerable<ISomeType>>();  ;)
// IStartupFilter: https://andrewlock.net/exploring-istartupfilter-in-asp-net-core/
// app.UseMvc(routes => // app.UseRouter(routes.Build());