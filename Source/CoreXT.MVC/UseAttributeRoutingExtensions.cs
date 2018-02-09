using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.Internal;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CoreXT.MVC
{
    public static class UseAttributeRoutingExtensions
    {
        /// <summary>
        /// Adds attribute routing for MVC applications by adding them to the global route collection,
        /// instead of throwing them into an isolated router which prevents enumeration.
        /// </summary>
        public static void UseAttributeRouting(this RouteBuilder routBuilder)
        {
            //routBuilder.Routes.Insert(0, AttributeRouting.CreateAttributeMegaRoute(app.ApplicationServices));

            var services = routBuilder.ApplicationBuilder.ApplicationServices;

            // ... first, get all controller and action attributes ...

            var actionsProvider = services.GetService<IActionDescriptorCollectionProvider>();
            var actions = actionsProvider.ActionDescriptors;

            // ... add attribute routes to beginning of the route builder list (they must be hit first) ...
        }
    }
}
