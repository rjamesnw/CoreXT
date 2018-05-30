using System;
using System.Threading.Tasks;
using CoreXT.ASPNet;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.Extensions.Options;

namespace CoreXT.MVC
{
    /// <summary> A view result proxy used to hook into the rendering process of a view to provide event method support. </summary>
    /// <seealso cref="T:Microsoft.AspNetCore.Mvc.ViewEngines.IView"/>
    public class ViewResultProxy : IView
    {
        /// <summary> Gets the original view set for this proxy. </summary>
        /// <value> The original view. </value>
        public IView OriginalView { get; private set; }

        public string Path => OriginalView.Path;

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
                renderContext.View = this;
                //renderContext.ViewResult = viewResult;
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

            if (renderContext?.HasFilter == true)
                renderContext.ApplyOutputFilter();

            viewPage?.OnAfterRenderView(renderContext);
        }
    }
}