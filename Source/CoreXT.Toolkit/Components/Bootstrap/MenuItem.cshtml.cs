using CoreXT.Services.DI;
using CoreXT.MVC.Components;
using CoreXT.Toolkit.Components;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Razor.TagHelpers;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CoreXT.ASPNet;

namespace CoreXT.Toolkit.Components.Bootstrap
{
    /// <summary> A menu item element for a menu. </summary>
    /// <seealso cref="T:CoreXT.Toolkit.Components.ActionLink"/>
    /// <seealso cref="T:CoreXT.Toolkit.TagComponents.WebComponent"/>
    /// <seealso cref="T:CoreXT.Toolkit.TagHelpers.CoreXTTagHelper"/>
    /// <seealso cref="T:CoreXT.Toolkit.TagHelpers.IComponentTitle"/>
    /// <seealso cref="T:CoreXT.Toolkit.TagHelpers.IComponentHeader"/>
    /// <seealso cref="T:CoreXT.Toolkit.TagHelpers.IComponentFooter"/>
    [HtmlTargetElement(ComponentPrefix + "menuitem")]
    public class MenuItem : ActionLink
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Creates an empty modal pop-up. </summary>
        /// <param name="services"></param>
        public MenuItem(ICoreXTServiceProvider services) : base(services) { }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Asynchronously processes the component and renders output. </summary>
        /// <returns> An asynchronous result. </returns>
        /// <seealso cref="M:CoreXT.Toolkit.TagComponents.TagComponent.ProcessAsync()"/>
        public async override Task ProcessAsync()
        {
            var context = await ProcessContent() ? (IHtmlContent)TagOutput : await TagOutput.GetChildContentAsync();

            TagContext.Items.TryGetValue(typeof(Menu), out var menu);
            TagContext.Items.TryGetValue(typeof(MenuDropdown), out var menuDropdown);

            if (menu != null)
            {
                ((Menu)menu).Items.Add(context.Render());
                TagOutput.SuppressOutput(); // (this will be processed by the parent modal tag component)
            }
            else  if (menuDropdown != null)
            {
                ((MenuDropdown)menuDropdown).Items.Add(context.Render());
                TagOutput.SuppressOutput(); // (this will be processed by the parent modal tag component)
            }
            else TagOutput.Content.SetHtmlContent(context);
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
