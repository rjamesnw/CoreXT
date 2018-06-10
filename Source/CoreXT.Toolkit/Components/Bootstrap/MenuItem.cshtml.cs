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
    [HtmlTargetElement(ComponentPrefix + "menuitem", ParentTag = ComponentPrefix + nameof(Menu))]
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
            var modal = TagContext.Items[typeof(Menu)] as Menu;
            var context = await ProcessContent() ? (IHtmlContent)TagOutput : await TagOutput.GetChildContentAsync();

            if (modal != null)
            {
                modal.Items.Add(context.Render());
                TagOutput.SuppressOutput(); // (this will be processed by the parent modal tag component)
            }
            else TagOutput.Content.SetHtmlContent(context);
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
