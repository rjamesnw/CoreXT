﻿using CoreXT.MVC.Components.Old;
using CoreXT.Services.DI;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.Components.Old
{
    public class Modal : WebViewComponent, IComponentTitle, IComponentHeader, IComponentFooter
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// A razor template delegate used to render the header of the modal window.
        /// </summary>
        public object Header { get; set; }

        /// <summary>
        /// Returns the header content for rendering in the control's view.
        /// </summary>
        public Task<IHtmlContent> HeaderContent
        {
            get { return RenderContent(Header); }
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// A razor template delegate used to render the footer of the modal window.
        /// </summary>
        public object Footer { get; set; }

        /// <summary>
        /// Returns the footer content for rendering in the control's view.
        /// </summary>
        public Task<IHtmlContent> FooterContent
        {
            get { return RenderContent(Footer); }
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// The modal window title.
        /// </summary>
        new public object Title { get; set; }

        /// <summary>
        /// Returns the title content for rendering in the control's view.
        /// </summary>
        public Task<IHtmlContent> TitleContent
        {
            get { return RenderContent(Title); }
        }

        public bool AllowClose = true;

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Creates an empty modal pop-up.
        /// </summary>
        /// <param name="services"></param>
        public Modal(ICoreXTServiceProvider services) : base(services) { }

        public override Task<IViewComponentResult> InvokeAsync() => base.InvokeAsync();

        // --------------------------------------------------------------------------------------------------------------------

        public Modal Configure(bool allowClose = true)
        {
            EnableAutomaticID = true;
            AllowClose = allowClose;
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
