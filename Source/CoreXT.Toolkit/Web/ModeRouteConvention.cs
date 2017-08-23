using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.Web
{
    /// <summary>
    /// Supports switching test/live modes within the URL.
    /// </summary>
    public class ModeRouteConvention : IApplicationModelConvention // (example only, not used yet; from here: http://benjii.me/2016/08/global-routes-for-asp-net-core-mvc/)
    {
        public void Apply(ApplicationModel application)
        {
            var modeRoutingPrefix = new AttributeRouteModel(new RouteAttribute("api/{mode}"));

            foreach (var controller in application.Controllers)
            {
                var routeSelector = controller.Selectors.FirstOrDefault(x => x.AttributeRouteModel != null);

                if (routeSelector != null)
                {
                    routeSelector.AttributeRouteModel = AttributeRouteModel.CombineAttributeRouteModel(modeRoutingPrefix,
                        routeSelector.AttributeRouteModel);
                }
                else
                {
                    controller.Selectors.Add(new SelectorModel() { AttributeRouteModel = modeRoutingPrefix });
                }
            }
        }
    }
}

// (http://benjii.me/2016/08/global-routes-for-asp-net-core-mvc/)