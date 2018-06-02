using CoreXT.ASPNet;
using CoreXT.MVC.Views;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using System.Diagnostics;
using System.IO;
using System.Text.Encodings.Web;
using MvcRazor = Microsoft.AspNetCore.Mvc.Razor;

namespace CoreXT.MVC.Razor
{
    /// <summary>
    /// Used to intercept razor page activation, which sets some properties before rendering a view.
    /// </summary>
    public class RazorPageActivator : MvcRazor.IRazorPageActivator
    {
        MvcRazor.RazorPageActivator _RazorPageActivator;

        int _ActivationSequence = 1;

        public RazorPageActivator(
            IModelMetadataProvider metadataProvider,
            IUrlHelperFactory urlHelperFactory,
            IJsonHelper jsonHelper,
            DiagnosticSource diagnosticSource,
            HtmlEncoder htmlEncoder,
            IModelExpressionProvider modelExpressionProvider)
        {
            _RazorPageActivator = new MvcRazor.RazorPageActivator(metadataProvider, urlHelperFactory, jsonHelper, diagnosticSource, htmlEncoder, modelExpressionProvider);
        }

        /// <summary>
        /// Activates a page by setting some properties before rendering.
        /// If 'page' implements 'IViewPageRenderEvents', then 'OnViewActived()' will be called.
        /// </summary>
        /// <param name="page">The page to set properties for.</param>
        /// <param name="context">The view context.</param>
        public virtual void Activate(MvcRazor.IRazorPage page, ViewContext context)
        {
            _RazorPageActivator.Activate(page, context);
            var view = page as IViewPageRenderEvents;
            if (view != null)
            {
                view.OnViewActivated(page, context);

                var viewFilename = Path.GetFileName(page.Path).ToLower();

                if (viewFilename == "_layout.cshtml")
                {
                    view.ActivationSequence = 0;
                    var renderContext = context.HttpContext.GetService<IViewPageRenderContext>(); // (the layout is the final rendering step)
                    renderContext.ViewStack.Push(view as IViewPage);
                    renderContext.Layout = page;
                    view.OnBeforeRenderView(renderContext);
                }
                else
                    view.ActivationSequence = _ActivationSequence++;
            }
        }
    }
}
