using CoreXT.MVC;
using CoreXT.Services.DI;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.Components
{
    /// <summary> An action link. </summary>
    /// <seealso cref="T:CoreXT.Toolkit.Components.WebComponent"/>
    public class ActionLink : WebComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        public string RouteName { get; set; }

        public string AreaName
        {
            get
            {
                return _AreaName ?? Page?.ViewContext?.RouteData?.Values["area"] as string;
            }
            set { _AreaName = value; }
        }
        string _AreaName;

        public string ControllerName
        {
            get
            {
                return _ControllerName ?? Page?.ViewContext?.RouteData?.Values["controller"] as string;
            }
            set { _ControllerName = value; }
        }
        string _ControllerName;

        public string ActionName
        {
            get
            {
                return _ActionName ?? Page?.ViewContext?.RouteData?.Values["action"] as string;
            }
            set { _ActionName = value; }
        }
        string _ActionName;

        public string Protocol { get; set; }

        public string HostName { get; set; }

        public int? Port { get; set; }

        public string Fragment { get; set; }

        public RouteValueDictionary RouteValues { get; set; }

        public string Href
        {
            get { return GetAttribute("href"); }
            set { SetAttribute("href", value); }
        }

        /// <summary>
        /// Something to render immediately after the link start tag.
        /// </summary>
        public RazorTemplateDelegate<object> Prefix;

        public Task<IHtmlContent> PrefixContent
        {
            get { return GetContentFromTemplateDelegate(Prefix); }
        }

        /// <summary>
        /// Something to render immediately before the end tag.
        /// </summary>
        public RazorTemplateDelegate<object> Postfix;

        public Task<IHtmlContent> PostfixContent
        {
            get { return GetContentFromTemplateDelegate(Postfix); }
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Creates a menu control.
        /// </summary>
        public ActionLink(ICoreXTServiceProvider sp) : base(sp) { }

        public override Task<IViewComponentResult> InvokeAsync() => base.InvokeAsync();

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Configures the action link. </summary>
        /// <param name="content">        The content. </param>
        /// <param name="actionName">     Name of the action. </param>
        /// <param name="controllerName"> (Optional) Name of the controller. </param>
        /// <param name="areaName">       (Optional) Name of the area. </param>
        /// <param name="fragment">       (Optional) The fragment. </param>
        /// <param name="routeName">      (Optional) Name of the route. </param>
        /// <returns> An ActionLink. </returns>
        public ActionLink Configure(RazorTemplateDelegate<object> content, string actionName, string controllerName = null, string areaName = null,
            string fragment = null, string routeName = null)
        {
            Fragment = fragment;
            ContentTemplate = content;

            SetRoute(actionName, controllerName, areaName, routeName);

            return this;
        }

        /// <summary> Configures the action link. </summary>
        /// <param name="text">           The text. </param>
        /// <param name="actionName">     Name of the action. </param>
        /// <param name="controllerName"> (Optional) Name of the controller. </param>
        /// <param name="areaName">       (Optional) Name of the area. </param>
        /// <param name="fragment">       (Optional) The fragment. </param>
        /// <param name="routeName">      (Optional) Name of the route. </param>
        /// <returns> An ActionLink. </returns>
        public ActionLink Configure(string text, string actionName, string controllerName = null, string areaName = null,
            string fragment = null, string routeName = null)
        {
            Fragment = fragment;
            ContentTemplate = item => text;

            SetRoute(actionName, controllerName, areaName, routeName);

            return this;
        }

        void _CalcHref()
        {
            Href = Url?.GenerateUrl(RouteName, ActionName, ControllerName, AreaName, Protocol, HostName, Port, Fragment, RouteValues);
        }

        public override async Task<WebComponent> Update()
        {
            await base.Update();
            _CalcHref();
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Set a route value for this link.
        /// </summary>
        /// <param name="name">The route value name.</param>
        /// <param name="value">The route value .</param>
        public ActionLink SetRouteValue(string name, object value)
        {
            if (RouteValues == null)
                RouteValues = new RouteValueDictionary();

            RouteValues[name] = value;

            return this;
        }

        /// <summary>
        /// Set route values for this link.
        /// </summary>
        /// <param name="values">
        ///   An object to initialize the dictionary. The value can be of type System.Collections.Generic.IDictionary,
        ///   System.Collections.Generic.IReadOnlyDictionary, or an object with public properties as key-value pairs.
        /// </param>
        public ActionLink SetRouteValues(object values)
        {
            if (RouteValues == null)
                RouteValues = new RouteValueDictionary(values);
            else
                foreach (var item in new RouteValueDictionary(values))
                    RouteValues[item.Key] = item.Value;
            return this;
        }

        /// <summary>
        /// Clears a route value set for this link.
        /// </summary>
        /// <param name="name">The route value name.</param>
        public ActionLink ClearRouteValue(string name)
        {
            if (RouteValues != null)
                RouteValues.Remove(name);
            return this;
        }

        /// <summary>
        /// Allows settings route values for this link.
        /// Pass in null for any optional parameter to use the request URL defaults.
        /// </summary>
        /// <param name="actionName"></param>
        /// <param name="controllerName"></param>
        /// <param name="areaName"></param>
        /// <param name="routeName"></param>
        /// <returns>The current instance to support chained calls.</returns>
        public ActionLink SetRoute(string actionName, string controllerName = null, string areaName = null, string routeName = null)
        {
            ActionName = actionName?.Trim();
            ControllerName = controllerName?.Trim();
            AreaName = areaName?.Trim();
            RouteName = routeName?.Trim();

            if (string.IsNullOrWhiteSpace(ActionName))
                ClearRouteValue("action");
            else
                SetRouteValue("action", ActionName);

            if (string.IsNullOrWhiteSpace(ControllerName))
                ClearRouteValue("controller");
            else
                SetRouteValue("controller", ControllerName);

            if (string.IsNullOrWhiteSpace(AreaName))
                ClearRouteValue("area");
            else
                SetRouteValue("area", AreaName);

            _CalcHref();

            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Allows changing the URL protocol, host name, and/or port for this link.
        /// Pass in null for any parameter to use the request URL defaults.
        /// </summary>
        /// <param name="hostName">A new host for this link.</param>
        /// <param name="protocol">A new protocol for this link.</param>
        /// <param name="port">A new port for this link.</param>
        /// <returns>The current instance to support chained calls.</returns>
        public ActionLink SetHost(string hostName, string protocol = null, int? port = null)
        {
            Protocol = protocol?.Trim();
            HostName = hostName?.Trim();
            Port = port;

            _CalcHref();

            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Something to render immediately after the link start tag.
        /// </summary>
        public ActionLink SetPrefix(RazorTemplateDelegate<object> content)
        {
            Prefix = content;
            return this;
        }

        /// <summary>
        /// Something to render immediately before the end tag.
        /// </summary>
        public ActionLink SetPostfix(RazorTemplateDelegate<object> content)
        {
            Postfix = content;
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
