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
    [HtmlTargetElement(ComponentPrefix + "menudropdown")]
    [RestrictChildren(ComponentPrefix + nameof(Title), ComponentPrefix + nameof(MenuItem))]
    public class MenuDropdown : ActionLink
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Gets or sets the menu items. </summary>
        /// <value> The items. </value>
        new public List<object> Items { get => EntityMap.Get(ref _Items, ); set => _Items = value; }
        List<object> _Items;

        /// <summary> The menu title name. </summary>
        /// <value> The caption. </value>
        public string Caption { get; set; }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Creates an empty modal pop-up. </summary>
        /// <param name="services"></param>
        public MenuDropdown(ICoreXTServiceProvider services) : base(services) { }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Asynchronously processes the component and renders output. </summary>
        /// <returns> An asynchronous result. </returns>
        /// <seealso cref="M:CoreXT.Toolkit.TagComponents.TagComponent.ProcessAsync()"/>
        public async override Task ProcessAsync()
        {
            var context = await ProcessContent() ? (IHtmlContent)TagOutput : await TagOutput.GetChildContentAsync();

            TagContext.Items.TryGetValue(typeof(Menu), out var menu);
            TagContext.Items.TryGetValue(typeof(MenuDropdown), out var menuDropdown);

            if (menuDropdown != null) // (check this first! these can be nested)
            {
                ((MenuDropdown)menuDropdown).Items.Add(context.Render());
                TagOutput.SuppressOutput(); // (this will be processed by the parent modal tag component)
            }
            else if (menu != null)
            {
                ((Menu)menu).Items.Add(context.Render());
                TagOutput.SuppressOutput(); // (this will be processed by the parent modal tag component)
            }
            else TagOutput.Content.SetHtmlContent(context);
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
