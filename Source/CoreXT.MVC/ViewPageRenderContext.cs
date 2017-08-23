using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using System;
using System.IO;
using System.Text;

namespace CoreXT.MVC
{
    /// <summary>
    /// Holds details on a page render request via a call to 'CoreXTViewResultExecutor.ExecuteAsync()'. 
    /// This class is used with some methods in <see cref="IViewPageRenderEvents"/>.
    /// </summary>
    public class ViewPageRenderContext
    {
        public ActionContext ActionContext { get; set; }
        public IView View { get; set; }
        public ViewResult ViewResult { get; set; }

        public ViewPageRenderContext() { }

        //? public ViewPageRenderContext(ActionContext actionContext) { ActionContext = actionContext; }

        internal Stream _OriginalBodyStream;
        internal Func<string, string> _Filter;

        /// <summary>
        /// Intercepts writing view output in order to apply a text filter.
        /// </summary>
        /// <param name="filter">A callback to execute when ready to filter the response for a view.</param>
        /// <returns>Returns the original 'ActionContext.HttpContext.Response.Body' stream that was replaced.
        /// Once a view response is ready, the original 'Body' stream is restored and the filtered text written
        /// to it. In most cases the return value here is ignored.</returns>
        public virtual Stream FilterOutput(Func<string, string> filter)
        {
            if (filter == null)
                throw new ArgumentNullException("filter");
            // ... hook into the body stream to intercept the "(TextWriter)WriterFactory.CreateWriter(response.Body,...)" writes (ViewExecutor.cs) ...
            _Filter = filter;
            _OriginalBodyStream = ActionContext.HttpContext.Response.Body;
            ActionContext.HttpContext.Response.Body = new MemoryStream();
            return _OriginalBodyStream;
        }

        /// <summary>
        /// Called after a view has completed its rendering to the output stream (which was intercepted before this call, and will be restored before this method returns).
        /// </summary>
        public virtual void OnApplyFilter()
        {
            using (var reader = new StreamReader(ActionContext.HttpContext.Response.Body, Encoding.UTF8))
            {
                reader.BaseStream.Seek(0, SeekOrigin.Begin);
                ActionContext.HttpContext.Response.Body = _OriginalBodyStream;
                var text = _Filter(reader.ReadToEnd());
                var buffer = Encoding.UTF8.GetBytes(text);
                _OriginalBodyStream.Write(buffer, 0, buffer.Length);
            }
        }
    }
}
