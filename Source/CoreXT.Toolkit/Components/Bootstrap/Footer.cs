using CoreXT.MVC.Components;
using CoreXT.Services.DI;
using Microsoft.AspNetCore.Razor.TagHelpers;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.Components.Bootstrap
{
    /// <summary> Footer content for the modal window. </summary>
    /// <seealso cref="T:CoreXT.Toolkit.TagHelpers.WebComponent"/>
    [HtmlTargetElement(ComponentPrefix + "footer", ParentTag = ComponentPrefix + nameof(Modal))]
    public class Footer : WebComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        [HtmlAttributeNotBound]
        public override int Order { get => 2; set => base.Order = value; }

        // --------------------------------------------------------------------------------------------------------------------

        public Footer(ICoreXTServiceProvider services) : base(services) { }

        // --------------------------------------------------------------------------------------------------------------------

        public async override Task ProcessAsync()
        {
            var modal = TagContext.Items[typeof(Modal)] as Modal;
            var context = await TagOutput.GetChildContentAsync();
            if (modal != null)
            {
                modal.Footer = context;
                TagOutput.SuppressOutput(); // (this will be processed by the parent modal tag component)
            }
            else TagOutput.Content.SetHtmlContent(context);
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
