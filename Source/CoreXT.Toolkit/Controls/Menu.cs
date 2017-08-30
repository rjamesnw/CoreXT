using CoreXT.Toolkit.Web;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.Controls
{
    public class Menu : MenuItem
    {
        public List<object> Items { get; private set; } = new List<object>();

        /// <summary>
        /// The menu title name.
        /// </summary>
        public string Caption;

        /// <summary>
        /// If true, inverses the colors for the menu (for bootstrap [the default], this means to toggle from white to black).
        /// </summary>
        public bool Inverse
        {
            get
            {
                return HasClass("navbar-inverse");
            }
            set
            {
                if (value)
                    AddClass("navbar-inverse");
                else
                    RemoveClass("navbar-inverse");
            }
        }

        /// <summary>
        /// Creates a menu control.
        /// </summary>
        public Menu(IViewPageRenderStack pageRenderStack) : base(pageRenderStack) { }

        public override Task<IViewComponentResult> InvokeAsync()
        {
            return base.InvokeAsync();
        }

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

        public Menu SetItem(MenuItem item)
        {
            Items.Add(item);
            return this;
        }

        public Menu SetItem(object content, string actionName = null, string controllerName = null, string areaName = null)
        {
            Items.Add(GetService<MenuItem>().SetPage(Page).Configure(content, actionName, controllerName, areaName));
            return this;
        }

        public Menu SetItem(Func<object, object> content, string actionName = null, string controllerName = null, string areaName = null)
        {
            Items.Add(GetService<MenuItem>().SetPage(Page).Configure(content, actionName, controllerName, areaName));
            return this;
        }

        public Menu SetItems(IEnumerable<MenuItem> items)
        {
            Items.AddRange(items);
            return this;
        }

        /// <summary>
        /// Toggles the 'Inverse' property.
        /// </summary>
        public Menu Invert() { Inverse = !Inverse; return this; }
    }
}
