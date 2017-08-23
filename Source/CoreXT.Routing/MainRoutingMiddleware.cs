using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Routing.Logging;

namespace CoreXT.Routing
{
    /// <summary>
    /// Acts like a "main" function, which is, in this case, the main entry point for ALL routing as a "rule of thumb".
    /// Typically this should be the ONLY router added to the ASP.Net Core system, which will act as a dispatcher
    /// to either intercept a matching request, or pass it on to the encapsulated 'RouterMiddleware' that comes as the
    /// standard MVC routing object.
    /// </summary>
    public class MainRouterMiddleware
    {
        private readonly ILogger _Logger;
        private readonly RequestDelegate _Next;
        private readonly IRouter _Router;

        private readonly RouterMiddleware _RouterMiddleware;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="next">The next router in the pipeline. If using only the CoreXT router, this should be the
        /// final '404' HTTP status based router. Note that using any other root level router other than the main router
        /// middleware cannot be detected.</param>
        /// <param name="loggerFactory">An injected logger for debugging purposes.</param>
        /// <param name="router">This is usually a 'RouteCollection' object constructed when {RouteBuilder}.'Build()' is called.</param>
        public MainRouterMiddleware(RequestDelegate next, ILoggerFactory loggerFactory, IRouter router)
        {
            _Next = next;
             _Router = router;
            _Logger = loggerFactory.CreateLogger<MainRouterMiddleware>();
            _RouterMiddleware = new RouterMiddleware(next, loggerFactory, router);
        }

        /// <summary>
        /// To use the CoreXT main router properly, this should be the only handler in the whole pipeline.
        /// </summary>
        /// <param name="httpContext">The context of the incoming request.</param>
        /// <returns>A task to handle this request.</returns>
        public async Task Invoke(HttpContext httpContext)
        {
            // ... build a context for this request ...

            var context = new RouteContext(httpContext);
            context.RouteData.Routers.Add(_Router); // (add the root level RouteCollection router, which will cascade the request down other nested routers to find matches)

            // ... attempt to route using the context just created for this request; on failure to find a match, the handler will be null ...

            await _Router.RouteAsync(context);

            if (context.Handler == null)
            {
                _Logger.LogDebug(1, "Request did not match any routes on the main routing middleware.");
                // ... did not find a match ... hand it off to the encapsulated standard MVC middleware ...
                await _RouterMiddleware.Invoke(httpContext);
            }
            else
            {
                httpContext.Features[typeof(IRoutingFeature)] = new RoutingFeature()
                {
                    RouteData = context.RouteData,
                };

                await context.Handler(context.HttpContext);
            }
        }
    }
}
