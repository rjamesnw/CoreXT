﻿using CoreXT.Services.DI;
using Microsoft.AspNetCore.Razor.TagHelpers;
using System.Threading.Tasks;
using CoreXT.MVC.Components;

namespace CoreXT.Toolkit.Components.Bootstrap
{
    /// <summary> Body content for the modal window. </summary>
    /// <seealso cref="T:CoreXT.Toolkit.TagHelpers.WebComponent"/>
    [HtmlTargetElement(ComponentPrefix + "body", ParentTag = ComponentPrefix + nameof(Modal))]
    public class Body : WebComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        [HtmlAttributeNotBound]
        public override int Order { get => 1; set => base.Order = value; }

        // --------------------------------------------------------------------------------------------------------------------

        public Body(ICoreXTServiceProvider services) : base(services) { }

        // --------------------------------------------------------------------------------------------------------------------

        public async override Task ProcessAsync()
        {
            var modal = Items[typeof(Modal)] as Modal;
            if (modal != null)
            {
                modal.Content = await GetChildContentAsync();
                SuppressTagOutput(); // (this will be processed by the parent modal tag component)
            }
            else TagOutput.Content.SetHtmlContent(await TagOutput.GetChildContentAsync());
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
