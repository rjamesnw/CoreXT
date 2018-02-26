using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;

namespace CoreXT.Toolkit.TagHelpers
{
    /// <summary>
    ///     A base abstract class usually inherited by tag helpers in CoreXT application environments. This base class includes
    ///     code to provide request context details to derived types.
    /// </summary>
    /// <seealso cref="T:Microsoft.AspNetCore.Razor.TagHelpers.TagHelper"/>
    public abstract class CoreXTTagHelper : Microsoft.AspNetCore.Razor.TagHelpers.TagHelper
    {
        private IHttpContextAccessor _ContextAccessor;

        protected HttpContext Context { get { return _ContextAccessor.HttpContext; } }

        protected HttpRequest Request { get { return _ContextAccessor.HttpContext.Request; } }

        [ViewContext]
        public ViewContext ViewContext { get; set; }

        public CoreXTTagHelper(IHttpContextAccessor contextAccessor)
        {
            _ContextAccessor = contextAccessor;
        }
    }
}
