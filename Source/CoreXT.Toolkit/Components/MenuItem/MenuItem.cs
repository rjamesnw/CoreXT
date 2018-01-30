using CoreXT.Services.DI;
using CoreXT.Toolkit.Web;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.Components
{
    public class MenuItem : ActionLink
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Creates a menu control.
        /// </summary>
        public MenuItem(ICoreXTServiceProvider sp) : base(sp) { }

        public override Task<IViewComponentResult> InvokeAsync() => base.InvokeAsync();

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Creates a menu control (usually for the layout page).
        /// </summary>
        /// <param name="page"></param>
        public MenuItem Configure(RazorTemplateDelegate<object> content, string actionName = null, string controllerName = null, string areaName = null)
        {
            return (MenuItem)base.Configure(content, actionName, controllerName, areaName);
        }

        /// <summary>
        /// Creates a menu control (usually for the layout page).
        /// </summary>
        /// <param name="page"></param>
        public MenuItem Configure(object content, string actionName = null, string controllerName = null, string areaName = null)
        {
            return Configure(item => content, actionName, controllerName);
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
