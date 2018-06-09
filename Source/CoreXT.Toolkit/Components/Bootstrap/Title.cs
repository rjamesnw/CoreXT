using CoreXT.MVC.Components;
using CoreXT.Services.DI;
using Microsoft.AspNetCore.Razor.TagHelpers;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.Components.Bootstrap
{
    /// <summary> Header content for the modal window. </summary>
    /// <seealso cref="T:CoreXT.Toolkit.TagHelpers.WebComponent"/>
    [HtmlTargetElement(ComponentPrefix + "title", ParentTag = ComponentPrefix + nameof(Modal))]
    public class Title : WebComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        [HtmlAttributeNotBound]
        public override int Order { get => 0; set => base.Order = value; }

        // --------------------------------------------------------------------------------------------------------------------

        public Title(ICoreXTServiceProvider services) : base(services) { }

        // --------------------------------------------------------------------------------------------------------------------

        public async override Task ProcessAsync()
        {
            var modal = TagContext.Items[typeof(Modal)] as Modal;
            if (modal != null)
            {
                modal.Title = await TagOutput.GetChildContentAsync();
                TagOutput.SuppressOutput(); // (this will be processed by the parent modal tag component)
            }
            else TagOutput.Content.SetHtmlContent(await TagOutput.GetChildContentAsync());
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
