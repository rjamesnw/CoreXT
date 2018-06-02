using CoreXT.ASPNet;
using CoreXT.MVC.Views;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;

namespace CoreXT.MVC
{
    /// <summary> A view result proxy used to hook into the rendering process of a view to provide event method support. </summary>
    /// <seealso cref="T:Microsoft.AspNetCore.Mvc.ViewEngines.IView"/>
    public class ViewResultProxy : IView
    {
        /// <summary> Gets the original view set for this proxy. </summary>
        /// <value> The original view. </value>
        public IView OriginalView { get; private set; }

        /// <summary>
        ///     Gets the path of the view as resolved by the <see cref="T:Microsoft.AspNetCore.Mvc.ViewEngines.IViewEngine" />.
        /// </summary>
        /// <value> The full pathname of the file. </value>
        /// <seealso cref="P:Microsoft.AspNetCore.Mvc.ViewEngines.IView.Path"/>
        public string Path => OriginalView.Path;

        /// <summary> Gets Microsoft.AspNetCore.Mvc.Razor.IRazorPage instance that the views executes on. </summary>
        /// <value> The razor page. </value>
        public IRazorPage RazorPage => (OriginalView as RazorView)?.RazorPage;

        /// <summary>
        ///     Gets the sequence of _ViewStart Microsoft.AspNetCore.Mvc.Razor.IRazorPage instances that are executed by this
        ///     view.
        /// </summary>
        /// <value> The view start pages. </value>
        public IReadOnlyList<IRazorPage> ViewStartPages => (OriginalView as RazorView)?.ViewStartPages;

        public ViewResultProxy(IView originalView)
        {
            OriginalView = originalView ?? throw new ArgumentNullException(nameof(originalView));
        }

        public async Task RenderAsync(ViewContext context)
        {
            var viewPage = (OriginalView as RazorView)?.RazorPage as IViewPageRenderEvents;
            var renderContext = viewPage == null ? null : context.HttpContext.GetService<IViewPageRenderContext>();

            if (renderContext != null)
            {
                renderContext.ActionContext = context;
                renderContext.ViewStack.Push(viewPage as IViewPage);
                //x renderContext.ViewResult = viewResult;
                viewPage?.OnBeforeRenderView(renderContext);
            }

            try
            {
                await OriginalView.RenderAsync(context);
            }
            catch (Exception ex) when (context.HttpContext.Response.Body.CanWrite)
            {
                var result = viewPage?.OnRenderException(renderContext, ex);
                if (result == null) throw ex;
                result.WriteTo(context.HttpContext.Response.Body);
            }

            if (renderContext != null)
            {
                Debug.Assert(renderContext.ViewStack.Pop() == viewPage, "View page render stack not in sync.");
            }

            viewPage?.OnAfterRenderView(renderContext);
        }
    }
}