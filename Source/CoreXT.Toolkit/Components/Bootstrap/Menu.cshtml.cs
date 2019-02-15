using CoreXT.MVC.Components;
using CoreXT.Services.DI;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Razor.TagHelpers;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.Components.Bootstrap
{
    /// <summary> A modal tag helper. </summary>
    /// <seealso cref="T:CoreXT.Toolkit.TagComponents.WebComponent"/>
    /// <seealso cref="T:CoreXT.Toolkit.TagHelpers.CoreXTTagHelper"/>
    /// <seealso cref="T:CoreXT.Toolkit.TagHelpers.IComponentTitle"/>
    /// <seealso cref="T:CoreXT.Toolkit.TagHelpers.IComponentHeader"/>
    /// <seealso cref="T:CoreXT.Toolkit.TagHelpers.IComponentFooter"/>
    [HtmlTargetElement(ComponentPrefix + "menu")]
    [RestrictChildren(ComponentPrefix + nameof(MenuItem), ComponentPrefix + nameof(MenuDropdown))]
    public class Menu : MenuItem
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Gets or sets the menu items. </summary>
        /// <value> The items. </value>
        new public List<object> Items { get => _Items ?? (_Items = new List<object>()); set => _Items = value; }
        List<object> _Items;

        /// <summary> The menu title name. </summary>
        /// <value> The caption. </value>
        public string Caption { get; set; }

        /// <summary>
        /// If true, inverses the colors for the menu (for bootstrap [the default], this means to toggle from white to black).
        /// </summary>
        public bool Inverse { get; set; }

        /// <summary> Keep the menu fixed at the top. </summary>
        /// <value> A true or false value. </value>l
        public bool FixAtTop { get; set; }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Creates an empty modal pop-up. </summary>
        /// <param name="services"></param>
        public Menu(ICoreXTServiceProvider services) : base(services) { }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Creates a menu control (usually for the layout page).
        /// </summary>
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

        /// <summary> Asynchronously processes the component and renders output. </summary>
        /// <returns> An asynchronous result. </returns>
        /// <seealso cref="M:CoreXT.Toolkit.TagComponents.TagComponent.ProcessAsync()"/>
        public async override Task ProcessAsync()
        {
            this.AddClass("navbar");

            if (Inverse)
                this.AddClass("navbar-inverse");
            else
                this.RemoveClass("navbar-inverse");

            if (FixAtTop)
                this.AddClass("navbar-fixed-top");

            // ... try rendering any view or explicitly set content first ...
            if (!await ProcessContent())
            {
                /// ... no view, and no content set, so assume finally that this is a normal tag component with possibly other nested components/tags ...
            }
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Sets a menu item. </summary>
        /// <param name="item"> The item. </param>
        /// <returns> A Menu. </returns>
        public Menu SetItem(MenuItem item)
        {
            Items.Add(item);
            return this;
        }

        /// <summary> Sets a menu item. </summary>
        /// <param name="content"> The content. </param>
        /// <param name="actionName"> (Optional) Name of the action. </param>
        /// <param name="controllerName"> (Optional) Name of the controller. </param>
        /// <param name="areaName"> (Optional) Name of the area. </param>
        /// <param name="routeName"> (Optional) Name of the route. </param>
        /// <returns> A Menu. </returns>
        public Menu SetItem(object content, string actionName = null, string controllerName = null, string areaName = null, string routeName = null)
        {
            Items.Add(GetService<MenuItem>().SetContent(content).SetRoute(actionName, controllerName, areaName));
            return this;
        }

        /// <summary> Sets a menu item. </summary>
        /// <param name="content"> The content. </param>
        /// <param name="actionName"> (Optional) Name of the action. </param>
        /// <param name="controllerName"> (Optional) Name of the controller. </param>
        /// <param name="areaName"> (Optional) Name of the area. </param>
        /// <param name="routeName"> (Optional) Name of the route. </param>
        /// <returns> A Menu. </returns>
        public Menu SetItem(Func<object, object> content, string actionName = null, string controllerName = null, string areaName = null, string routeName = null)
        {
            Items.Add(GetService<MenuItem>().SetContent(content).SetRoute(actionName, controllerName, areaName));
            return this;
        }

        /// <summary> Sets the menu items. </summary>
        /// <param name="items"> The items. </param>
        /// <returns> A Menu. </returns>
        public Menu SetItems(IEnumerable<MenuItem> items)
        {
            Items.AddRange(items);
            return this;
        }

        /// <summary>
        /// Toggles the 'Inverse' property.
        /// </summary>
        public Menu Invert() { Inverse = !Inverse; return this; }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
