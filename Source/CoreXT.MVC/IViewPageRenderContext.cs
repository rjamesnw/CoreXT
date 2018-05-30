using System;
using System.IO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewEngines;

namespace CoreXT.MVC
{
    public interface IViewPageRenderContext
    {
        ActionContext ActionContext { get; set; }
        IView View { get; set; }
        ActionResult ViewResult { get; set; }

        /// <summary>
        /// Returns true if this context has a filter call-back registered to execute when 'ApplyOutputFilter()' gets called after output is ready to be sent to the client.
        /// The filter function is passed in via a call to 'BeginOutputFilter()'.
        /// </summary>
        bool HasFilter { get; }

        /// <summary>
        /// Intercepts writing view output in order to apply a text filter.
        /// </summary>
        /// <param name="filter">A callback to execute when ready to filter the response for a view.</param>
        /// <returns>Returns the original 'ActionContext.HttpContext.Response.Body' stream that was replaced.
        /// Once a view response is ready, the original 'Body' stream is restored and the filtered text written
        /// to it. In most cases the return value here is ignored.</returns>
        Stream BeginOutputFilter(Func<string, string> filter);

        /// <summary>
        /// Called after a view has completed its rendering to the output stream (which was intercepted before this call, and will be restored before this method returns).
        /// </summary>
        void ApplyOutputFilter();
    }
}