using Microsoft.AspNetCore.Http;

namespace CoreXT.Toolkit.TagHelpers
{
    /// <summary>
    /// A base abstract class usually inherited by tag helpers in the CDS environment.
    /// This base class includes code to provide request context details to derived types.
    /// </summary>
    public abstract class TagHelper : Microsoft.AspNetCore.Razor.TagHelpers.TagHelper
    {
        protected IHttpContextAccessor ContextAccessor { get; private set; }
        protected HttpContext Context { get { return ContextAccessor.HttpContext; } }
        protected HttpRequest Request { get { return ContextAccessor.HttpContext.Request; } }
        public TagHelper(IHttpContextAccessor contextAccessor)
        {
            ContextAccessor = contextAccessor;
        }
    }
}
