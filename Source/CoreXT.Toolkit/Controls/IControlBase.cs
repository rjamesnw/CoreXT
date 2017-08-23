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

namespace CoreXT.Toolkit.Controls
{
    public interface IControlBase : IHtmlContent, IActionResult
    {
        IDictionary<string, string> Attributes { get; }
        string Class { get; set; }
        HttpContext Context { get; set; }
        string DataSourceID { get; set; }
        string EncodedInnerHtml { get; }
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

        ControlBase AddClass(params string[] classNames);
        ControlBase AddEventScript(string eventAttributeName, string script);
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
        ControlBase RemoveClass(params string[] classNames);
        Task<IHtmlContent> Render();
        Task<IHtmlContent> Render(IViewComponentResult viewResult);
        IHtmlContent RenderFor<TModel, TValue>(Expression<Func<TModel, TValue>> expression = null);
        ControlBase RequireCSS(string cssPath, RenderTargets renderTarget = RenderTargets.Header, string environmentName = null);
        ControlBase RequireCSS(string cssPath, RenderTargets renderTarget, Environments environment);
        ControlBase RequireResource(string resourcePath, ResourceTypes resourceType, RenderTargets renderTarget = RenderTargets.Header, int sequence = 0, string environmentName = null);
        ControlBase RequireResource(string resourcePath, ResourceTypes resourceType, RenderTargets renderTarget, int sequence, Environments environment);
        ControlBase RequireScript(string scriptPath, RenderTargets renderTarget = RenderTargets.Header, string environmentName = null);
        ControlBase RequireScript(string scriptPath, RenderTargets renderTarget, Environments environment);
        ControlBase SetAttribute(string name, object value, bool replace = true);
        ControlBase SetAttributes(IDictionary<string, object> attributes);
        ControlBase SetAttributes(object attributes);
        ControlBase SetRenderer(Func<ControlBase, IHtmlContent> renderer);
        string ToString();
        Task<ControlBase> Update();
        ViewViewComponentResult View();
        ViewViewComponentResult View(string viewName);
        ViewViewComponentResult View<TModel>(string viewName, TModel model);
        ViewViewComponentResult View<TModel>(TModel model);
    }
}