using CoreXT.Services.DI;
using CoreXT.Toolkit.Components;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Razor.TagHelpers;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.TagHelpers
{
    //[OutputElementHint("div")]

    /// <summary> A modal tag helper. </summary>
    /// <seealso cref="T:CoreXT.Toolkit.TagHelpers.CoreXTTagHelper"/>
    /// <seealso cref="T:CoreXT.Toolkit.TagHelpers.IComponentTitle"/>
    /// <seealso cref="T:CoreXT.Toolkit.TagHelpers.IComponentHeader"/>
    /// <seealso cref="T:CoreXT.Toolkit.TagHelpers.IComponentFooter"/>
    public class Modal : WebComponent, IComponentTitle, IComponentHeader, IComponentFooter
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
        public object Title { get; set; }

        /// <summary>
        /// Returns the title content for rendering in the control's view.
        /// </summary>
        public Task<IHtmlContent> TitleContent
        {
            get { return RenderContent(Title); }
        }

        // --------------------------------------------------------------------------------------------------------------------

        public bool AllowClose { get; set; } = true;

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Creates an empty modal pop-up.
        /// </summary>
        /// <param name="services"></param>
        public Modal(ICoreXTServiceProvider services) : base(services) { }

        [System.ComponentModel.EditorBrowsable(System.ComponentModel.EditorBrowsableState.Never)]
        public void Test() { }

        // --------------------------------------------------------------------------------------------------------------------

        public async override Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            // ... try rendering any view or explicitly set content first ...
            if (!await ProcessContent(context, output))
            {
                // ... no view, and no content set, so assume finally that this is a normal tag component with possibly other nested tags ...
                var content = await output.GetChildContentAsync();
                output.Content.SetHtmlContent(content);
            }
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
