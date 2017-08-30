using CoreXT.Toolkit.Controls;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CoreXT.Toolkit.Web;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;

namespace CoreXT.Toolkit.Controls
{
    public class Modal : ControlBase
    {
        /// <summary>
        /// A razor template delegate used to render the header of the model window.
        /// </summary>
        public RazorTemplateDelegate<object> Header;

        /// <summary>
        /// Returns the header content for rendering in the control's view.
        /// </summary>
        public Task<IHtmlContent> HeaderContent
        {
            get { return GetContentFromTemplateDelegate(Header); }
        }

        /// <summary>
        /// A razor template delegate used to render the footer of the model window.
        /// </summary>
        public RazorTemplateDelegate<object> Footer;

        /// <summary>
        /// Returns the footer content for rendering in the control's view.
        /// </summary>
        public Task<IHtmlContent> FooterContent
        {
            get { return GetContentFromTemplateDelegate(Footer); }
        }

        /// <summary>
        /// The model window title.
        /// </summary>
        new public RazorTemplateDelegate<object> Title;

        /// <summary>
        /// Returns the title content for rendering in the control's view.
        /// </summary>
        public Task<IHtmlContent> TitleContent
        {
            get { return GetContentFromTemplateDelegate(Title); }
        }

        public bool AllowClose = true;

        /// <summary>
        /// Creates an empty modal popup.
        /// </summary>
        /// <param name="pageRenderStack"></param>
        public Modal(IViewPageRenderStack pageRenderStack) : base(pageRenderStack) { }

        public override Task<IViewComponentResult> InvokeAsync()
        {
            return base.InvokeAsync();
        }

        public Modal Configure(RazorTemplateDelegate<object> title, bool allowClose,
            RazorTemplateDelegate<object> header, RazorTemplateDelegate<object> body, RazorTemplateDelegate<object> footer = null)
        {
            ID = Guid.NewGuid().ToString("N");
            Title = title;
            AllowClose = allowClose;
            Header = header;
            ContentTemplate = body;
            Footer = footer;
            return this;
        }

        public Modal Configure(string title, bool allowClose,
            RazorTemplateDelegate<object> header, RazorTemplateDelegate<object> body, RazorTemplateDelegate<object> footer = null)
        {
            return Configure(item => title, allowClose, header, body, footer);
        }

        public Modal Configure(string title, string header, RazorTemplateDelegate<object> body,
            RazorTemplateDelegate<object> footer = null, bool allowClose = true)
        {
            return Configure(item => title, allowClose, item => header, body, footer);
        }

        public Modal Configure(string title, string header, string body, string footer = null, bool allowClose = true)
        {
            return Configure(item => title, allowClose, item => header, item => body, item => footer);
        }

        public Modal SetTitle(RazorTemplateDelegate<object> title)
        {
            Title = title;
            return this;
        }

        public Modal SetHeader(RazorTemplateDelegate<object> header)
        {
            Header = header;
            return this;
        }

        public Modal SetBody(RazorTemplateDelegate<object> body)
        {
            ContentTemplate = body;
            return this;
        }

        public Modal SetFooter(RazorTemplateDelegate<object> footer)
        {
            Footer = footer;
            return this;
        }
    }
}


