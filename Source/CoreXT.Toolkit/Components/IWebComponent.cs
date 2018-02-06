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
    public interface IWebComponent : IHtmlContent, IActionResult
    {
        IDictionary<string, string> Attributes { get; }
        string Class { get; set; }
        //??HttpContext Context { get; set; }
        string DataSourceID { get; set; }
        HtmlString EncodedInnerHtml { get; }
        string ID { get; set; }
        string InnerHtml { get; set; }
        string Name { get; set; }
        IViewPage Page { get; set;  }

        IResourceList RequiredResources { get; }
        string Style { get; set; }
        string Title { get; set; }
        string UniqueID { get; }
        string UniqueName { get; }
        IUrlHelper UrlHelper { get; }

        WebComponent AddClass(params string[] classNames);
        WebComponent AddEventScript(string eventAttributeName, string script);
        void ApplyResourcesToRequestContext();
        Task<IHtmlContent> AsAsync();
        IViewComponentResult Content(object value);
        bool Equals(object obj);
        string GetAttribute(string name);
        string[] GetClassNames();
        Task<IHtmlContent> GetContentFromTemplateDelegate(RazorTemplateDelegate<object> templateDelegate);
        IHtmlContent GetElementAttributes(bool includeID = false, bool includeName = false, params string[] attributesToIgnore);
        int GetHashCode();
        bool HasClass(params string[] classNames);
        Task<IViewComponentResult> InvokeAsync();
        WebComponent RemoveClass(params string[] classNames);
        Task<IHtmlContent> Render();
        Task<IHtmlContent> Render(IViewComponentResult viewResult);
        IHtmlContent RenderFor<TModel, TValue>(Expression<Func<TModel, TValue>> expression = null);
        WebComponent RequireCSS(string cssPath, RenderTargets renderTarget = RenderTargets.Header, string environmentName = null);
        WebComponent RequireCSS(string cssPath, RenderTargets renderTarget, Environments environment);
        WebComponent RequireResource(string resourcePath, ResourceTypes resourceType, RenderTargets renderTarget = RenderTargets.Header, int sequence = 0, string environmentName = null);
        WebComponent RequireResource(string resourcePath, ResourceTypes resourceType, RenderTargets renderTarget, int sequence, Environments environment);
        WebComponent RequireScript(string scriptPath, RenderTargets renderTarget = RenderTargets.Header, string environmentName = null);
        WebComponent RequireScript(string scriptPath, RenderTargets renderTarget, Environments environment);
        WebComponent SetAttribute(string name, object value, bool replace = true);
        WebComponent SetAttributes(IDictionary<string, object> attributes);
        WebComponent SetAttributes(object attributes);
        WebComponent SetRenderer(Func<WebComponent, IHtmlContent> renderer);
        string ToString();
        Task<WebComponent> Update();
        ViewViewComponentResult View();
        ViewViewComponentResult View(string viewName);
        ViewViewComponentResult View<TModel>(string viewName, TModel model);
        ViewViewComponentResult View<TModel>(TModel model);
    }
}
