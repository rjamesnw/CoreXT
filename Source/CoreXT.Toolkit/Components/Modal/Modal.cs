using CoreXT.Services.DI;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.Components
{
    public class Modal : WebComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// A razor template delegate used to render the header of the modal window.
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
        /// A razor template delegate used to render the footer of the modal window.
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
        /// The modal window title.
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

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Creates an empty modal pop-up.
        /// </summary>
        /// <param name="services"></param>
        public Modal(ICoreXTServiceProvider services) : base(services) { }

        public override Task<IViewComponentResult> InvokeAsync() => base.InvokeAsync();

        // --------------------------------------------------------------------------------------------------------------------

        public Modal Configure(RazorTemplateDelegate<object> title, bool allowClose,
            RazorTemplateDelegate<object> header, RazorTemplateDelegate<object> body, RazorTemplateDelegate<object> footer = null)
        {
            EnableAutomaticID = true;
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

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Sets the modal's title. </summary>
        /// <param name="title"> A razor template delegate used to render the title of the modal. </param>
        /// <returns> A Modal. </returns>
        public Modal SetTitle(RazorTemplateDelegate<object> title)
        {
            Title = title;
            return this;
        }

        /// <summary> Sets the modal's header. </summary>
        /// <param name="header"> A razor template delegate used to render the header of the modal. </param>
        /// <returns> A Modal. </returns>
        public Modal SetHeader(RazorTemplateDelegate<object> header)
        {
            Header = header;
            return this;
        }

        /// <summary> Sets the modal's body content. </summary>
        /// <param name="body"> A razor template delegate used to render the body of the modal. </param>
        /// <returns> A Modal. </returns>
        public Modal SetBody(RazorTemplateDelegate<object> body)
        {
            ContentTemplate = body;
            return this;
        }

        /// <summary> Sets the modal's footer. </summary>
        /// <param name="footer"> A razor template delegate used to render the footer of the modal. </param>
        /// <returns> A Modal. </returns>
        public Modal SetFooter(RazorTemplateDelegate<object> footer)
        {
            Footer = footer;
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
