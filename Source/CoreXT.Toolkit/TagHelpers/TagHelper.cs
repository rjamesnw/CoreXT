using Microsoft.AspNetCore.Http;

namespace CoreXT.Toolkit.TagHelpers
{
    /// <summary>
    ///     A base abstract class usually inherited by tag helpers in CoreXT application environments. This base class includes
    ///     code to provide request context details to derived types.
    /// </summary>
    /// <seealso cref="T:Microsoft.AspNetCore.Razor.TagHelpers.TagHelper"/>
    public abstract class CoreXTTagHelper : Microsoft.AspNetCore.Razor.TagHelpers.TagHelper
    {
        protected IHttpContextAccessor ContextAccessor { get; private set; }
        protected HttpContext Context { get { return ContextAccessor.HttpContext; } }
        protected HttpRequest Request { get { return ContextAccessor.HttpContext.Request; } }
        public CoreXTTagHelper(IHttpContextAccessor contextAccessor)
        {
            ContextAccessor = contextAccessor;
        }
    }
}
