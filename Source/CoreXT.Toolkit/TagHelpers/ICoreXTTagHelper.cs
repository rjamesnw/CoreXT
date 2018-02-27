using System.Collections.Generic;
using System.IO;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using CoreXT.Toolkit.Web;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace CoreXT.Toolkit.TagHelpers
{
    public interface ICoreXTTagHelper : IHtmlContent, IActionResult
    {
        IDictionary<string, string> Attributes { get; }
        string Class { get; set; }
        object DataSource { get; set; }
        string DataSourceID { get; set; }
        bool EnableAutomaticID { get; set; }
        string ID { get; set; }
        string Name { get; set; }
        IViewPage Page { get; set; }
        IResourceList RequiredResources { get; }
        string Style { get; set; }
        string HelpTip { get; set; }
        string UniqueID { get; }
        ViewContext ViewContext { get; set; }
        RenderModes RenderMode { get; set; }
        object Content { get; set; }
        RazorTemplateDelegate<object> ContentTemplate { get; set; }

    void ApplyResourcesToRequestContext();
        string GetAttribute(string name);
        string[] GetClassNames();
        IViewComponentResult GetViewResult(object content);
        IViewComponentResult GetViewResult(RazorTemplateDelegate<object> templateDelegate);
        bool HasClass(params string[] classNames);
        Task<IHtmlContent> RenderContent(object content);
        Task<HtmlString> RenderView(string name = null);
        Task<HtmlString> RenderView(object model, string name = null);
    }
}