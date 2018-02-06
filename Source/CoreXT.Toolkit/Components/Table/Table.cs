using CoreXT.Entities;
using CoreXT.Services.DI;
using CoreXT.Toolkit.Web;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.Components
{
    public class Table : WebComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// A reference to the data table to be rendered.
        /// </summary>
        public ITable<object> DataTable { get; set; }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Creates a menu control.
        /// </summary>
        public Table(ICoreXTServiceProvider sp) : base(sp) { }

        public override Task<IViewComponentResult> InvokeAsync() => base.InvokeAsync();

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Creates a menu control (usually for the layout page).
        /// </summary>
        /// <param name="page"></param>
        /// <param name="caption">The menu title.</param>
        /// <param name="actionName">The action for when the menu title is clicked.</param>
        /// <param name="controllerName">The action for when the menu title is clicked.</param>
        /// <param name="areaName">The area for when the menu title is clicked.</param>
        public Menu Configure(string caption, string actionName = null, string controllerName = null, string areaName = null)
        {
            base.Configure(caption, actionName, controllerName, areaName);
            Caption = caption;
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
