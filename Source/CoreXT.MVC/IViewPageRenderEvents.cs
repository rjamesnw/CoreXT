using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using System;

namespace CoreXT.MVC
{
    public interface IViewPageRenderEvents
    {
        /// <summary>
        ///     Gets or sets the sequence in which the view is rendered. This is used by <seealso cref="CoreXTRazorPageActivator"/>
        ///     in order to tag the render ordering of pages so dependent resources are also rendered in the correct order.
        /// </summary>
        /// <value> The identifier of the sequence. </value>
        int ActivationSequence { get; set; }

        /// <summary>
        /// Executed when a view is found.
        /// </summary>
        void OnViewFound(ActionContext actionContext, ViewResult viewResult, ViewEngineResult searchResult);

        /// <summary>
        /// If a render exception occurs, this method is called to provide an error response to the client.
        /// Returning 'null' will re-throw the exception passed in. If the event occurs, it is usually after
        /// the page is activated, during the rendering process.
        /// </summary>
        IHtmlContent OnRenderException(IViewPageRenderContext renderContext, Exception ex);

        /// <summary>
        /// Executed after a view is found, but before it is activated and rendered.
        /// <para>Note: Many RazorPage properties are not set until 'OnViewActived()' is triggered.</para>
        /// </summary>
        void OnBeforeRenderView(IViewPageRenderContext renderContext);

        /// <summary>
        /// Executed just after a view is activated for rendering.
        /// The 'RazorView' type uses a view activator to set some properties just before it is rendered.
        /// <para>If you have a custom view page, this is where you can "inject" property values (since constructor injection is not supported for razor pages).</para>
        /// </summary>
        void OnViewActivated(IRazorPage page, ViewContext context);

        /// <summary>
        /// Executed just after a view is rendered.
        /// </summary>
        void OnAfterRenderView(IViewPageRenderContext renderContext);
    }
}
