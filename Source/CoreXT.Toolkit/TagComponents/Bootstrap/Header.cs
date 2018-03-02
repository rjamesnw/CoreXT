using CoreXT.Services.DI;
using Microsoft.AspNetCore.Razor.TagHelpers;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.TagComponents.Bootstrap
{
    /// <summary> Header content for the modal window. </summary>
    /// <seealso cref="T:CoreXT.Toolkit.TagHelpers.WebComponent"/>
    [HtmlTargetElement(ToolkitComponentPrefix + "header", ParentTag = ToolkitComponentPrefix + nameof(Modal))]
    public class Header : WebComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        [HtmlAttributeNotBound]
        public override int Order { get => 0; set => base.Order = value; }

        // --------------------------------------------------------------------------------------------------------------------

        public Header(ICoreXTServiceProvider services) : base(services) { }

        // --------------------------------------------------------------------------------------------------------------------

        public async override Task ProcessAsync()
        {
            var modal = TagContext.Items[typeof(Modal)] as Modal;
            if (modal != null)
            {
                modal.Header = await TagOutput.GetChildContentAsync();
                TagOutput.SuppressOutput(); // (this will be processed by the parent modal tag component)
            }
            else TagOutput.Content.SetHtmlContent(await TagOutput.GetChildContentAsync());
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
