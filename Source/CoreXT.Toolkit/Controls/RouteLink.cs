using System;
using System.Web.Mvc;
using System.Web.Routing;

namespace CoreXT.Toolkit.Controls
{
    public class RouteLink : ControlBase
    {
        public string Fragment { protected get; set; }

        public string HostName { protected get; set; }

        public string Protocol { protected get; set; }

        public string RouteName { protected get; set; }

        public object Values { protected get; set; }

        public RouteLink(ViewContext viewContext, string text, string routeName)
            : base("a", viewContext)
        {
            UrlHelper urlHelper = new UrlHelper(new RequestContext(viewContext.HttpContext, viewContext.RouteData));
            Attributes.MergeString("href", urlHelper.GenerateUrl(RouteName, null /* actionName */, null /* controllerName */, Protocol, HostName, Fragment, new RouteValueDictionary(Values)));

            if (string.IsNullOrEmpty(text))
            {
                throw new ArgumentException("Value cannot be null or empty.", "text");
            }

            if (string.IsNullOrEmpty(routeName))
            {
                throw new ArgumentException("Value cannot be null or empty.", "routeName");
            }

            SetInnerText(text);

            RouteName = routeName;
        }
    }
}
