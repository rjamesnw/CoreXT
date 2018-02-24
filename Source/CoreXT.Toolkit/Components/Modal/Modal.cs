using CoreXT.Services.DI;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.Components
{
    public class Modal : WebComponent, IComponentTitle, IComponentHeader, IComponentFooter
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// A razor template delegate used to render the header of the modal window.
        /// </summary>
        public RazorTemplateDelegate<object> Header { get; set; }

        /// <summary>
        /// Returns the header content for rendering in the control's view.
        /// </summary>
        public Task<IHtmlContent> HeaderContent
        {
            get { return GetContentFromTemplateDelegate(Header); }
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// A razor template delegate used to render the footer of the modal window.
        /// </summary>
        public RazorTemplateDelegate<object> Footer { get; set; }

        /// <summary>
        /// Returns the footer content for rendering in the control's view.
        /// </summary>
        public Task<IHtmlContent> FooterContent
        {
            get { return GetContentFromTemplateDelegate(Footer); }
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// The modal window title.
        /// </summary>
        new public RazorTemplateDelegate<object> Title { get; set; }

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

        public Modal Configure(bool allowClose)
        {
            EnableAutomaticID = true;
            AllowClose = allowClose;
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
