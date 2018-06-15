using CoreXT.ASPNet;
using CoreXT.MVC.Views;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Mvc.ViewFeatures.Internal;
using Microsoft.Extensions.Diagnostics.Tracing;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Diagnostics;
using System.Threading.Tasks;

namespace CoreXT.MVC
{
    /// <summary>
    /// The  CoreXT implementation that locates and executes a Microsoft.AspNetCore.Mvc.ViewEngines.IView for a Microsoft.AspNetCore.Mvc.ViewResult.
    /// 
    /// </summary>
    public class ViewResultExecutor : Microsoft.AspNetCore.Mvc.ViewFeatures.ViewResultExecutor
    {
        public ViewResultExecutor(
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
        /// <param name="result">Represents an <see cref="ActionResult"/> that renders a view to the response.</param>
        /// <returns></returns>
        public override async Task ExecuteAsync(ActionContext actionContext, IView view, ViewDataDictionary viewData, ITempDataDictionary tempData, string contentType, int? statusCode)
        {
            // . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

            if (actionContext == null)
                throw new ArgumentNullException(nameof(actionContext));

            if (view == null)
                throw new ArgumentNullException(nameof(view));

            // . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

            IViewPageRenderEvents viewPage = (view as ViewResultProxy)?.RazorPage as IViewPageRenderEvents;

            var renderContext = viewPage == null ? null : actionContext.HttpContext.GetService<IViewPageRenderContext>();
            if (renderContext != null)
                renderContext.ActionContext = actionContext;

            viewPage?.OnViewExecuting(renderContext);

            try
            {
                // . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

                await base.ExecuteAsync(actionContext, view, viewData, tempData, contentType, statusCode);

                // . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
            }
            catch (Exception ex) when (actionContext.HttpContext.Response.Body.CanWrite)
            {
                var exceptionViewResult = viewPage?.OnRenderException(renderContext, ex);
                if (exceptionViewResult == null) throw ex;
                exceptionViewResult.WriteTo(actionContext.HttpContext.Response.Body);
            }

            // ... apply any post-processing (if a custom filter handler was supplied) ...

            if (renderContext?.HasFilter == true)
                renderContext.ApplyOutputFilter();

            viewPage?.OnViewExecuted(renderContext);

            //if (renderContext?.ViewStack.Count > 0)
            //{
            //    Debug.Assert(renderContext.Layout != null, "Layout page missing from the render context.");
            //    var layoutPage = renderContext.ViewStack.Pop() as IViewPageRenderEvents;
            //    Debug.Assert(layoutPage == renderContext.Layout, "Layout page expected in the view stack - the stack is not in sync.");

            //    layoutPage.OnAfterRenderView(renderContext);

            //    // ... apply any post-processing (if a custom filter handler was supplied) ...

            //    if (renderContext?.HasFilter == true)
            //        renderContext.ApplyOutputFilter();
            //}

            // . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        }

        //public async Task ExecuteAsync(ActionContext context, ViewResult result)
        //{
        //}

        ///// <summary>
        ///// Called before 'ExecuteAsync()' to locate the view to be rendered.
        ///// </summary>
        ///// <param name="actionContext">The action context represented by this view.</param>
        ///// <param name="viewResult">Represents an <see cref="ActionResult"/> that renders a view to the response.</param>
        //public override ViewEngineResult FindView(ActionContext actionContext, ViewResult viewResult)
        //{
        //    var result = base.FindView(actionContext, viewResult);
        //    ((result.View as RazorView)?.RazorPage as IViewPageRenderEvents)?.OnViewFound(actionContext, result);
        //    return result;
        //}
    }
}
