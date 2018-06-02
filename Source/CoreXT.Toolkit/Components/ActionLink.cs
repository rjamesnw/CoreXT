using CoreXT.MVC;
using CoreXT.MVC.Components;
using CoreXT.Services.DI;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Microsoft.AspNetCore.Routing;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.Components
{
    /// <summary> Renders an input control. Use the 'type' attribute to select the input type. </summary>
    /// <seealso cref="T:CoreXT.Toolkit.TagComponents.WebComponent"/>
    [HtmlTargetElement(ComponentPrefix + "action")]
    public class ActionLink : WebComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Gets or sets the name of the route. </summary>
        /// <value> The name of the route. </value>
        [HtmlAttributeName("route")]
        public string RouteName { get; set; }

        /// <summary> Gets or sets the name of the area. </summary>
        /// <value> The name of the area. </value>
        [HtmlAttributeName("area")]
        public string AreaName
        {
            get
            {
                return _AreaName ?? Page?.ViewContext?.RouteData?.Values["area"] as string;
            }
            set { _AreaName = value; }
        }
        string _AreaName;

        /// <summary> Gets or sets the name of the controller. </summary>
        /// <value> The name of the controller. </value>
        [HtmlAttributeName("controller")]
        public string ControllerName
        {
            get
            {
                return _ControllerName ?? Page?.ViewContext?.RouteData?.Values["controller"] as string;
            }
            set { _ControllerName = value; }
        }
        string _ControllerName;

        /// <summary> Gets or sets the name of the controller action. </summary>
        /// <value> The name of the action. </value>
        [HtmlAttributeName("action")]
        public string ActionName
        {
            get
            {
                return _ActionName ?? Page?.ViewContext?.RouteData?.Values["action"] as string;
            }
            set { _ActionName = value; }
        }
        string _ActionName;

        /// <summary> Gets or sets the protocol. </summary>
        /// <value> The protocol. </value>
        public string Protocol { get; set; }

        /// <summary> Gets or sets the name of the host. </summary>
        /// <value> The name of the host. </value>
        public string Host { get; set; }

        /// <summary> Gets or sets the port. </summary>
        /// <value> The port. </value>
        public int? Port { get; set; }

        /// <summary> Gets or sets the fragment (hash-tag style value)). </summary>
        /// <value> The fragment. </value>
        public string Fragment { get; set; }

        /// <summary> Gets or sets the route values, typically used as the link query parameters. </summary>
        /// <value> The route values. </value>
        public RouteValueDictionary RouteValues { get; set; }

        /// <summary> Gets the 'href' attribute value. </summary>
        /// <value> The 'href' attribute value. </value>
        public string Href => Url?.GenerateUrl(RouteName, ActionName, ControllerName, AreaName, Protocol, Host, Port, Fragment, RouteValues) ?? string.Empty;

        /// <summary> Something to render immediately after the link start tag. </summary>
        public string Prefix { get; set; }

        /// <summary> Something to render immediately before the end tag. </summary>
        public string Postfix { get; set; }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Renders a bootstrap form group. </summary>
        /// <param name="services"> The services. </param>
        public ActionLink(ICoreXTServiceProvider services) : base(services)
        {
        }

        /// <summary> Synchronously processes the tag and renders output. </summary>
        /// <seealso cref="M:CoreXT.Toolkit.TagHelpers.CoreXTTagHelper.Process(TagHelperContext,TagHelperOutput)"/>
        public async override Task ProcessAsync()
        {
            if (!await ProcessContent())
            {
                TagOutput.TagName = "a";
                TagOutput.PreContent.SetHtmlContent(RenderContent(Prefix));
                TagOutput.PostContent.SetHtmlContent(RenderContent(Postfix));
                this.SetAttribute("href", Href);
            }
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
            Host = hostName?.Trim();
            Port = port;
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Something to render immediately after the link start tag.
        /// </summary>
        public ActionLink SetPrefix(string content)
        {
            Prefix = content;
            return this;
        }

        /// <summary>
        /// Something to render immediately before the end tag.
        /// </summary>
        public ActionLink SetPostfix(string content)
        {
            Postfix = content;
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
