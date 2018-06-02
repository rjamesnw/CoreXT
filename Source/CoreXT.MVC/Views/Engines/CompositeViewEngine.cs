using System.Collections.Generic;
using CoreXT.Services.DI;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.Extensions.Options;

namespace CoreXT.MVC.Views.Engines
{
    public class CompositeViewEngine : ICompositeViewEngine
    {
        Microsoft.AspNetCore.Mvc.ViewEngines.CompositeViewEngine _CompositeViewEngine;

        ICoreXTServiceProvider _Services;

        /// <summary>
        /// Initializes a new instance of <see cref="CompositeViewEngine"/>.
        /// </summary>
        /// <param name="optionsAccessor">The options accessor for <see cref="MvcViewOptions"/>.</param>
        public CompositeViewEngine(IOptions<MvcViewOptions> optionsAccessor, ICoreXTServiceProvider services)
        {
            _CompositeViewEngine = new Microsoft.AspNetCore.Mvc.ViewEngines.CompositeViewEngine(optionsAccessor);
            _Services = services;
        }

        public IReadOnlyList<IViewEngine> ViewEngines => _CompositeViewEngine.ViewEngines;

        /// <summary> Locate a view by name using all view location search paths. </summary>
        /// <param name="context"> The controller action context. </param>
        /// <param name="viewName"> The name or path of the view that is rendered to the response. </param>
        /// <param name="isMainPage"> Determines if the page being found is the main page for an action.. </param>
        /// <returns> The found view. </returns>
        public ViewEngineResult FindView(ActionContext context, string viewName, bool isMainPage)
        {
            var result = _CompositeViewEngine.FindView(context, viewName, isMainPage);
            if (result.Success)
            {
                var newResult = ((result.View as RazorView)?.RazorPage as IViewPageRenderEvents)?.OnViewFound(context, result);
                result = newResult ?? ViewEngineResult.Found(result.ViewName, new ViewResultProxy(result.View));
            }
            return result;
        }

        /// <summary> Return a view by giving a specific file location. </summary>
        /// <param name="executingFilePath"> The absolute path to the currently-executing view, if any (sets a base path to locate the view by). </param>
        /// <param name="viewPath"> The relative path to the view (relative to 'executingFilePath', if given). </param>
        /// <param name="isMainPage"> Determines if the page being found is the main page for an action.. </param>
        /// <returns> The view. </returns>
        public ViewEngineResult GetView(string executingFilePath, string viewPath, bool isMainPage)
        {
            var result = _CompositeViewEngine.GetView(executingFilePath, viewPath, isMainPage);
            if (result.Success)
            {
                var newResult = ((result.View as RazorView)?.RazorPage as IViewPageRenderEvents)?.OnViewFound(_Services.GetService<IActionContextAccessor>()?.ActionContext, result);
                result = newResult ?? ViewEngineResult.Found(result.ViewName, new ViewResultProxy(result.View));
            }
            return result;
        }
    }
}
