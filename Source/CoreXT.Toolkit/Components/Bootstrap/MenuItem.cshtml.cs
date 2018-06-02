using CoreXT.Services.DI;
using CoreXT.MVC.Components;
using CoreXT.Toolkit.Components;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
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
            if (!await ProcessContent())
            {
            }
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
