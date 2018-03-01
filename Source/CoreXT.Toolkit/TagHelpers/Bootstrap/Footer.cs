using CoreXT.Services.DI;
using Microsoft.AspNetCore.Razor.TagHelpers;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.TagHelpers.Bootstrap
{
    /// <summary> Footer content for the modal window. </summary>
    /// <seealso cref="T:CoreXT.Toolkit.TagHelpers.WebComponent"/>
    [HtmlTargetElement(ToolkitComponentPrefix + "footer", ParentTag = ToolkitComponentPrefix + nameof(Modal))]
    public class Footer : WebComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        [HtmlAttributeNotBound]
        public override int Order { get => 2; set => base.Order = value; }

        // --------------------------------------------------------------------------------------------------------------------

        public Footer(ICoreXTServiceProvider services) : base(services) { }

        // --------------------------------------------------------------------------------------------------------------------

        public async override Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            var modal = context.Items[typeof(Modal)] as Modal;
            if (modal != null)
            {
                modal.Footer = await output.GetChildContentAsync();
                output.SuppressOutput(); // (this will be processed by the parent modal tag component)
            }
            else output.Content.SetHtmlContent(await output.GetChildContentAsync());
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
