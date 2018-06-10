using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using System;

namespace CoreXT.MVC
{
    public static class UrlHelperExtensions
    {
        // --------------------------------------------------------------------------------------------------------------------
        public static string GenerateUrl(this IUrlHelper urlHelper, string routeName, string actionName, string controllerName,
            string areaName, string protocol, string hostName, int? port, string query, string fragment, RouteValueDictionary values)
        {
            // ... get the URL path part for this request ...

            string virtualPath = urlHelper.GenerateUrl(routeName, actionName, controllerName, areaName, values);

            // ... determine the protocol and host names ...

            Uri requestUrl = new Uri(urlHelper.ActionContext.HttpContext.Request.GetDisplayUrl());

            protocol = string.IsNullOrEmpty(protocol) ? requestUrl.Scheme : protocol;
            hostName = string.IsNullOrEmpty(hostName) ? requestUrl.Host : hostName;
            port = port == null || port == 0 ? requestUrl.Port : port;

            var url = new UriBuilder(protocol, hostName, port.Value, virtualPath);
            if (!string.IsNullOrWhiteSpace(query))
                url.Query = query.StartsWith("?") ? query : "?" + query;
            if (!string.IsNullOrWhiteSpace(fragment))
                url.Fragment = fragment.StartsWith("#") ? fragment : "#" + fragment;

            return url.ToString();
        }

        public static string GenerateUrl(this IUrlHelper urlHelper, string routeName, string actionName, string controllerName, string areaName, RouteValueDictionary values)
        {
            values = new RouteValueDictionary(values); // (get a copy so we don't change the original)

            if (!string.IsNullOrWhiteSpace(actionName))
                values["action"] = actionName;

            if (!string.IsNullOrWhiteSpace(controllerName))
                values["controller"] = controllerName;

            if (!string.IsNullOrWhiteSpace(areaName))
                values["area"] = areaName;

            //? areaName = values["area"].ND();

            //? VirtualPathData virtualPathData;

            //? var vpc = new VirtualPathContext(View.Context, null, values, routeName);
            //? new RouteBuilder(appBuilder).Build().GetVirtualPath(vpc).VirtualPath

            //if (string.IsNullOrEmpty(areaName))
            //{
            //    // ... get path data for current area ...
            //    if (!string.IsNullOrWhiteSpace(routeName))
            //        virtualPathData = Routes.GetVirtualPathForArea(View.ViewContext.RequestContext, routeName.Trim(), values);
            //    else
            //        virtualPathData = Routes.GetVirtualPathForArea(View.ViewContext.RequestContext, values);
            //}
            //else
            //{
            //    // ... get path data for a specific area ...
            //    if (!string.IsNullOrWhiteSpace(routeName))
            //        virtualPathData = Routes.GetVirtualPath(View.ViewContext.RequestContext, routeName.Trim(), values);
            //    else
            //        virtualPathData = Routes.GetVirtualPath(View.ViewContext.RequestContext, values);
            //}

            //return virtualPathData?.VirtualPath;

            // (The default MVC RouteCollection is set in the first item when requests arrive:
            //   View.Context.GetRouteData().Routers[0]
            //   Controller.ControllerContext.RouteData.Routers[0]
            // The route collection is used with 'IUrlHelper', such as 'Controller.Url'.
            // Note: Cannot access other routers from this info.)

            if (!string.IsNullOrWhiteSpace(routeName))
                return urlHelper.RouteUrl(routeName, values); // TODO: Test routing to other controller or area.
            else
                return urlHelper.RouteUrl(values); // TODO: Test routing to other controller or area.
        }
    }
}
