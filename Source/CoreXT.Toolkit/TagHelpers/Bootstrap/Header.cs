using CoreXT.Services.DI;
using Microsoft.AspNetCore.Razor.TagHelpers;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.TagHelpers.Bootstrap
{
    [HtmlTargetElement(ParentTag = nameof(Modal))]
    public class Header : WebComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        [HtmlAttributeNotBound]
        public override int Order { get => 0; set => base.Order = value; }

        // --------------------------------------------------------------------------------------------------------------------

        public Header(ICoreXTServiceProvider services) : base(services) { }

        // --------------------------------------------------------------------------------------------------------------------

        public async override Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            var modal = context.Items[typeof(Modal)] as Modal;
            if (modal != null)
            {
                modal.Header = await output.GetChildContentAsync();
                output.SuppressOutput(); // (this will be processed by the parent modal tag component)
            }
            else output.Content.SetHtmlContent(await output.GetChildContentAsync());
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
