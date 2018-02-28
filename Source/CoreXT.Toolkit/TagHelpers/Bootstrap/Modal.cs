using CoreXT.Services.DI;
using CoreXT.Toolkit.Components;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Razor.TagHelpers;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.TagHelpers.Bootstrap
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
        /// A razor template delegate used to render the footer of the modal window.
        /// </summary>
        public object Footer { get; set; }

        /// <summary>
        /// The modal window title.
        /// </summary>
        public object Title { get; set; }

        /// <summary> Gets or sets a value indicating whether to allow closing the modal pop-up. </summary>
        /// <value> True (default) to show a close ('x') button, and false not to display it. </value>
        public bool AllowClose { get; set; } = true;

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Creates an empty modal pop-up.
        /// </summary>
        /// <param name="services"></param>
        public Modal(ICoreXTServiceProvider services) : base(services) { }

        // --------------------------------------------------------------------------------------------------------------------

        public async override Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            // ... try rendering any view or explicitly set content first ...
            if (!await ProcessContent(context, output, (vc, cc) =>
            {
                // ... anything here just before the view is rendered ...
            }))
            {
                // ... no view, and no content set, so assume finally that this is a normal tag component with possibly other nested tags ...
                var content = await output.GetChildContentAsync();
                output.Content.SetHtmlContent(content);
            }
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
