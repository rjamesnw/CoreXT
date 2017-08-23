using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using System.Diagnostics;
using System.Text.Encodings.Web;

namespace CoreXT.MVC
{
    /// <summary>
    /// Used to intercept razor page activation, which sets some properties before rendering a view.
    /// </summary>
    public class CoreXTRazorPageActivator : IRazorPageActivator
    {
        RazorPageActivator _RazorPageActivator;

        public CoreXTRazorPageActivator(
            IModelMetadataProvider metadataProvider,
            IUrlHelperFactory urlHelperFactory,
            IJsonHelper jsonHelper,
            DiagnosticSource diagnosticSource,
            HtmlEncoder htmlEncoder,
            IModelExpressionProvider modelExpressionProvider)
        {
            _RazorPageActivator = new RazorPageActivator(metadataProvider, urlHelperFactory, jsonHelper, diagnosticSource, htmlEncoder, modelExpressionProvider);
        }

        /// <summary>
        /// Activates a page by setting some properties before rendering.
        /// If 'page' implements 'IViewPageRenderEvents', then 'OnViewActived()' will be called.
        /// </summary>
        /// <param name="page">The page to set properties for.</param>
        /// <param name="context">The view context.</param>
        public virtual void Activate(IRazorPage page, ViewContext context)
        {
            _RazorPageActivator.Activate(page, context);
            (page as IViewPageRenderEvents)?.OnViewActived(page, context);
        }
    }
}
