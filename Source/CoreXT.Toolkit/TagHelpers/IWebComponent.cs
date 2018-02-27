using System.Threading.Tasks;
using CoreXT.Toolkit.Web;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace CoreXT.Toolkit.TagHelpers
{
    public interface IWebComponent: ICoreXTTagHelper
    {
        object Content { get; set; }
        RazorTemplateDelegate<object> ContentTemplate { get; set; }
        bool EnableAutomaticID { get; set; }
        object Model { get; set; }
        string ModelID { get; set; }
        string UniqueID { get; }

        IViewComponentResult GetViewResult(object content);
        IViewComponentResult GetViewResult(RazorTemplateDelegate<object> templateDelegate);
        Task<bool> ProcessContent(TagHelperContext context, TagHelperOutput output);
        Task<IHtmlContent> RenderContent();
        Task<IHtmlContent> RenderContent(object content);

        /// <summary> Renders the underlying view for this tag helper. The current reference in 'DataSource' is passed as the view model. </summary>
        /// <param name="name"> (Optional) A view name to override the default name. </param>
        /// <param name="required">
        ///     (Optional) True if the view is required. If required and not found an exception will be thrown. Default is true.
        /// </param>
        /// <returns> An asynchronous result that yields HTML. </returns>
        Task<HtmlString> RenderView(bool required = true, string name = null);

        /// <summary> Renders the underlying view for this tag helper. </summary>
        /// <param name="model"> A model to pass to the view. </param>
        /// <param name="name"> (Optional) A view name to override the default name. </param>
        /// <param name="required">
        ///     (Optional) True if the view is required. If required and not found an exception will be thrown. Default is true.
        /// </param>
        /// <returns> An asynchronous result that yields HTML. </returns>
        Task<HtmlString> RenderView(object model, bool required = true, string name = null);

    }
}