using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Razor.Language;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Diagnostics;
using System.Text.Encodings.Web;

namespace CoreXT.MVC
{
    public interface ICoreXTRazorViewEngine : IRazorViewEngine { }

    public class CoreXTRazorViewEngine : ICoreXTRazorViewEngine
    {
        RazorViewEngine _RazorViewEngine;

        public CoreXTRazorViewEngine(IRazorPageFactoryProvider pageFactory, IRazorPageActivator pageActivator,
            HtmlEncoder htmlEncoder, IOptions<RazorViewEngineOptions> optionsAccessor, RazorProject razorProject, ILoggerFactory loggerFactory, DiagnosticSource diagnosticSource)
        {
            _RazorViewEngine = new RazorViewEngine(pageFactory, pageActivator, htmlEncoder, optionsAccessor, razorProject, loggerFactory, diagnosticSource);
        }

        public virtual RazorPageResult FindPage(ActionContext context, string pageName)
        {
            return _RazorViewEngine.FindPage(context, pageName);
        }

        public virtual ViewEngineResult FindView(ActionContext context, string viewName, bool isMainPage)
        {
            return _RazorViewEngine.FindView(context, viewName, isMainPage);
        }

        public virtual string GetAbsolutePath(string executingFilePath, string pagePath)
        {
            return _RazorViewEngine.GetAbsolutePath(executingFilePath, pagePath);
        }

        public virtual RazorPageResult GetPage(string executingFilePath, string pagePath)
        {
            return _RazorViewEngine.GetPage(executingFilePath, pagePath);
        }

        public virtual ViewEngineResult GetView(string executingFilePath, string viewPath, bool isMainPage)
        {
            return _RazorViewEngine.GetView(executingFilePath, viewPath, isMainPage);
        }
    }
}
