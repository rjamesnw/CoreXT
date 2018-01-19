using CoreXT.ASPNet;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Internal;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Mvc.ViewFeatures.Internal;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Diagnostics;
using System.Text;
using System.Threading.Tasks;

namespace CoreXT.MVC
{
    /// <summary>
    /// The  CoreXT implementation that locates and executes a Microsoft.AspNetCore.Mvc.ViewEngines.IView for a Microsoft.AspNetCore.Mvc.ViewResult.
    /// 
    /// </summary>
    public class CoreXTViewResultExecutor : ViewResultExecutor
    {
        public CoreXTViewResultExecutor(
            IOptions<MvcViewOptions> viewOptions,
            IHttpResponseStreamWriterFactory writerFactory,
            ICompositeViewEngine viewEngine,
            ITempDataDictionaryFactory tempDataFactory,
            DiagnosticSource diagnosticSource,
            ILoggerFactory loggerFactory,
            IModelMetadataProvider modelMetadataProvider)
            : base(viewOptions, writerFactory, viewEngine, tempDataFactory, diagnosticSource, loggerFactory, modelMetadataProvider)
        {
        }

        /// <summary>
        /// Called by the standard MVC system to render a view.
        /// </summary>
        /// <param name="actionContext">The action context represented by this view.</param>
        /// <param name="view">The view (usually a RazorView type) that represents the view to be rendered.
        /// This value is obtained by the system upon calling the accompanying 'FindView()' method in this class.</param>
        /// <param name="viewResult">Represents an <see cref="ActionResult"/> that renders a view to the response.</param>
        /// <returns></returns>
        public override async Task ExecuteAsync(ActionContext actionContext, IView view, ViewResult viewResult)
        {
            var viewPage = (view as RazorView)?.RazorPage as IViewPageRenderEvents;
            var renderContext = viewPage == null ? null : actionContext.HttpContext.GetService<ViewPageRenderContext>();

            if (renderContext != null)
            {
                renderContext.ActionContext = actionContext;
                renderContext.View = view;
                renderContext.ViewResult = viewResult;
                viewPage?.OnBeforeRenderView(renderContext);
            }

            try
            {
                await base.ExecuteAsync(actionContext, view, viewResult);
            }
            catch (Exception ex) when (actionContext.HttpContext.Response.Body.CanWrite)
            {
                var result = viewPage?.OnRenderException(renderContext, ex);
                if (result == null) throw ex;
                result.WriteTo(actionContext.HttpContext.Response.Body);
            }

            if (renderContext?._Filter != null)
                renderContext.OnApplyFilter();

            viewPage?.OnAfterRenderView(renderContext);
        }

        /// <summary>
        /// Called before 'ExecuteAsync()' to locate the view to be rendered.
        /// </summary>
        /// <param name="actionContext">The action context represented by this view.</param>
        /// <param name="viewResult">Represents an <see cref="ActionResult"/> that renders a view to the response.</param>
        public override ViewEngineResult FindView(ActionContext actionContext, ViewResult viewResult)
        {
            var result = base.FindView(actionContext, viewResult);
            ((result.View as RazorView)?.RazorPage as IViewPageRenderEvents)?.OnViewFound(actionContext, viewResult, result);
            return result;
        }
    }
}
