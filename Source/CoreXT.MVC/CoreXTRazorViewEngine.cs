using Microsoft.AspNetCore.Mvc.Razor;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using System.Text.Encodings.Web;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;

namespace CoreXT.MVC
{
    public interface ICoreXTRazorViewEngine : IRazorViewEngine { }

    public class CoreXTRazorViewEngine : ICoreXTRazorViewEngine
    {
        RazorViewEngine _RazorViewEngine;

        public CoreXTRazorViewEngine(IRazorPageFactoryProvider pageFactory, IRazorPageActivator pageActivator,
            HtmlEncoder htmlEncoder, IOptions<RazorViewEngineOptions> optionsAccessor, ILoggerFactory loggerFactory)
        {
            _RazorViewEngine = new RazorViewEngine(pageFactory, pageActivator, htmlEncoder, optionsAccessor, loggerFactory);
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
