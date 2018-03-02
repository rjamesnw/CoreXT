using System;
using System.Collections.Generic;
using System.IO;
using System.Linq.Expressions;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using CoreXT.ASPNet;
using CoreXT.Toolkit.Web;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewComponents;

namespace CoreXT.Toolkit.Components
{
    public interface IWebViewComponent : IHtmlContent, IActionResult
    {
        IDictionary<string, string> Attributes { get; }
        string Class { get; set; }

        string DataSourceID { get; set; }

        object DataSource { get; set; }

        string ID { get; set; }

        object Content { get; set; }

        /// <summary>
        /// This delegate is used to set the 'InnerHtml' property when 'Update()' is called (usually just before rendering).
        /// The delegate is usually set by derived controls that accept razor template delegates.
        /// Setting this value will take precedence over any previously set 'InnerHtml' content.
        /// </summary>
        RazorTemplateDelegate<object> ContentTemplate { get; set; }

        string Name { get; set; }
        IViewPage Page { get; set; }

        IResourceList RequiredResources { get; }
        string Style { get; set; }
        string Title { get; set; }
        string UniqueID { get; }
        string UniqueName { get; }
        IUrlHelper Url { get; }

        void ApplyResourcesToRequestContext();
        Task<IHtmlContent> AsAsync();

        Task<IHtmlContent> RenderContent();
        Task<IHtmlContent> RenderContent(object content);

        IViewComponentResult GetViewResult(object value);
        IViewComponentResult GetViewResult(RazorTemplateDelegate<object> templateDelegate);

        bool Equals(object obj);
        string GetAttribute(string name);
        string[] GetClassNames();
        IHtmlContent GetElementAttributes(bool includeID = false, bool includeName = false, params string[] attributesToIgnore);
        int GetHashCode();
        bool HasClass(params string[] classNames);
        Task<IViewComponentResult> InvokeAsync();

        Task<IHtmlContent> Render();
        Task<IHtmlContent> RenderView(IViewComponentResult viewResult);
        IHtmlContent RenderFor<TModel, TValue>(Expression<Func<TModel, TValue>> expression = null);
        WebViewComponent SetRenderer(Func<WebViewComponent, IHtmlContent> renderer);
        string ToString();
        Task<WebViewComponent> Update();
        ViewViewComponentResult View();
        ViewViewComponentResult View(string viewName);
        ViewViewComponentResult View<TModel>(string viewName, TModel model);
        ViewViewComponentResult View<TModel>(TModel model);
    }
}
