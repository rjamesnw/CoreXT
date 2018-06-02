using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using System;
using System.IO;
using System.Text;

namespace CoreXT.MVC.Views
{
    /// <summary>
    /// Holds details on a page render request via a call to 'ViewResultExecutor.ExecuteAsync()' or 'ViewResultProxy.RenderAsync()''.
    /// This class is used with some methods in <see cref="IViewPageRenderEvents"/>.
    /// </summary>
    public class ViewPageRenderContext : IViewPageRenderContext
    {
        public ActionContext ActionContext { get; set; }

        public IViewPageRenderStack ViewStack { get; }

        public IRazorPage Layout { get; set; }

        //x public ActionResult ViewResult { get; set; }

        public ViewPageRenderContext(IViewPageRenderStack viewStack) { ViewStack = viewStack; }

        //? public ViewPageRenderContext(ActionContext actionContext) { ActionContext = actionContext; }

        internal Stream _OriginalBodyStream;
        internal Func<string, string> _Filter;

        /// <summary>
        /// Returns true if this context has a filter call-back registered to execute when 'ApplyOutputFilter()' gets called after output is ready to be sent to the client.
        /// The filter function is passed in via a call to 'BeginOutputFilter()'.
        /// </summary>
        public bool HasFilter => _Filter != null;

        /// <summary>
        /// Intercepts writing view output in order to apply a text filter.
        /// </summary>
        /// <param name="filter">A callback to execute when ready to filter the response for a view.</param>
        /// <returns>Returns the original 'ActionContext.HttpContext.Response.Body' stream that was replaced.
        /// Once a view response is ready, the original 'Body' stream is restored and the filtered text written
        /// to it. In most cases the return value here is ignored.</returns>
        public virtual Stream OnPostProcessing(Func<string, string> filter) // (used with  CoreXT.Toolkit.Web.ViewPage<TModel>.OnBeforeRenderView())
        {
            // ... hook into the body stream to intercept the "(TextWriter)WriterFactory.CreateWriter(response.Body,...)" writes (ViewExecutor.cs) ...
            _Filter = filter ?? throw new ArgumentNullException("filter");
            _OriginalBodyStream = ActionContext.HttpContext.Response.Body;
            ActionContext.HttpContext.Response.Body = new MemoryStream(); // (this is the magic hook to buffer all writes instead of streaming to the client immediately [allows us to modify the contents])
            return _OriginalBodyStream;
        }

        /// <summary>
        /// Called after a view has completed its rendering to the output stream (which was intercepted before this call, and will be restored before this method returns).
        /// </summary>
        public virtual void ApplyOutputFilter()
        {
            var bodyStream = ActionContext.HttpContext.Response.Body;
            ActionContext.HttpContext.Response.Body = _OriginalBodyStream; // (put back the original body stream)
            if (bodyStream.CanRead) // (can we read from it? [usually false is it was disposed somehow])
            {
                using (var reader = new StreamReader(bodyStream, Encoding.UTF8))
                {
                    reader.BaseStream.Seek(0, SeekOrigin.Begin);
                    var text = _Filter(reader.ReadToEnd());
                    var buffer = Encoding.UTF8.GetBytes(text);
                    _OriginalBodyStream.Write(buffer, 0, buffer.Length);
                }
            }
            else _OriginalBodyStream.Dispose(); // (else a redirect or other action may have disposed the stream, so dispose the original one also)
            // TODO: Check if "bodyStream" is disposed, do we also need to dispose "_OriginalBodyStream"? 
        }
    }
}
