using CoreXT.ASPNet;
using CoreXT.Toolkit.Components;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace CoreXT.Toolkit.Web
{
    // ########################################################################################################################

    /// <summary>
    /// The CoreXT helper object, typically used to provide access to core level routines within the Toolkit
    /// framework.  This is used by some ViewPage shorthand methods, such as 'CSS()', 'Script()', etc.
    /// <para>If users wish to add other core extension methods for use with razor without having to extend the ViewPage type,
    /// this is where to add them.</para>
    /// </summary>
    public class ViewHelper
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// The CDS web view page that is the context for this CDS helper.
        /// </summary>
        public IViewPage View
        {
            get { return _View; }
            set { if (_View == null) _View = value; else throw new InvalidOperationException("You cannot change the view once one has been set."); }
        }
        protected IViewPage _View;

        /// <summary>
        /// Returns the view typed as a 'Microsoft.AspNetCore.Mvc.Razor.RazorPage&lt;TModel>' type.
        /// This exposes methods not available using the 'View' interface type property.
        /// </summary>
        public RazorPage Page { get { return (RazorPage)_View; } }

        /// <summary>
        /// Gets or sets a dictionary that contains data passed from the controller to the view.
        /// </summary>
        public ViewDataDictionary ViewData { get { return View?.ViewData; } set { View.ViewData = value; } }

        ///// <summary>
        ///// Returns a collection of routes used for ASP.NET routing, associated with the current application.
        ///// </summary>
        ///// <remarks>This is a shortcut for 'View.Html.RouteCollection'.</remarks>
        //? public RouteCollection Routes
        //{
        //    get
        //    {
        //        ((Controller)View.ViewContext.RouteData.Values["controller"]).se
        //        return View?..GetRouteData()..Routers[0]...Html?.RouteCollection;
        //    }
        //}

        /// <summary>
        /// Returns a reference to the controller for this view.
        /// </summary>
        public Controller Controller => Page?.ViewContext?.RouteData?.Values["controller"] as Controller;

        /// <summary>
        /// Get the name of the current controller.
        /// </summary>
        public string ControllerName => Controller?.ControllerContext?.ActionDescriptor?.ControllerName ?? "";

        /// <summary>
        /// Get the name of the current controller action.
        /// </summary>
        public string ActionName => Controller?.ControllerContext?.ActionDescriptor?.ActionName ?? "";

        // --------------------------------------------------------------------------------------------------------------------

        public ViewHelper()
        {
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns a service object of the specified type.
        /// </summary>
        /// <typeparam name="T">A type registered with the dependency injection system (usually in the 'Configuration' method of a 'Startup' class).</typeparam>
        /// <returns>A service object of the specified type, or 'null' if not type was registered.</returns>
        public T GetService<T>() where T : class { return View.Context.GetService<T>(); }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Adds a resource to a view if it has not been added yet.
        /// </summary>
        /// <param name="name">An name to use to represent this resource.  Typically this should be the file name and extension of the resource (minus any path information).</param>
        /// <param name="resourcePath">A URI to the script to add to the page.</param>
        /// <param name="resourceType">The type of the resource returned from the given resource path.</param>
        /// <param name="renderTarget">Where to render the resource.</param>
        public virtual ResourceInfo RequireResource(string name, string resourcePath, ResourceTypes resourceType, RenderTargets renderTarget = RenderTargets.Header)
        {
            var context = Page.Context;

            if (context == null)
                throw new InvalidOperationException("RequireScript: No valid '{CDS}.View.Context' exists.");

            // ... find the file location so we can validate based on the actual location of the file, and not a virtual path ...

            var actionContext = View.ViewContext;

            // ... next, update the global content resource list ...

            var resourceList = GetService<IResourceList>();

            if (resourceList == null)
                throw new InvalidOperationException("The service type 'IResourceList' has no implementation (this is usually 'ResourceList').");

            var resource = resourceList.Find(name, resourcePath, actionContext);

            if (resource == null)
            {
#if DEBUG
                var debug = true;
#else
                var debug = false;
#endif
                resource = resourceList.Add(name, resourcePath, resourceType, renderTarget, View.RenderingLevel, null, debug);
            }

            return resource;
        }

        public virtual ResourceInfo RequireResource(ResourceInfo resourceInfo)
        {
            var context = Page.Context;

            if (context == null)
                throw new InvalidOperationException("RequireScript: No valid '{CDS}.View.Context' exists.");

            // ... find the file location so we can validate based on the actual location of the file, and not a virtual path ...

            var actionContext = View.ViewContext;

            // ... next, update the global content resource list ...

            var resourceList = GetService<IResourceList>();

            if (resourceList == null)
                throw new InvalidOperationException("The service type 'IResourceList' has no implementation (this is usually 'ResourceList').");

            var resource = resourceList.Find(resourceInfo.Name, resourceInfo.Path, actionContext);

            if (resource == null)
            {
                resource = resourceList.Add(resourceInfo);
            }

            return resource;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ########################################################################################################################

    /// <summary>
    /// The CoreXT helper object, typically used to provide access to core level routines within the Toolkit
    /// framework.  This is used by some ViewPage shorthand methods, such as 'CSS()', 'Script()', etc.
    /// <para>If users wish to add other core extension methods for use with razor without having to extend the ViewPage type,
    /// this is where to add them.</para>
    /// </summary>
    public class ViewHelper<TModel> : ViewHelper
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// The CDS web view page that is the context for this CDS helper.
        /// </summary>
        new public IViewPage<TModel> View
        {
            get { return _View as IViewPage<TModel>; }
            set { base.View = value; }
        }

        /// <summary>
        /// Returns the view typed as a 'Microsoft.AspNetCore.Mvc.Razor.RazorPage&lt;TModel>' type.
        /// This exposes methods not available using the 'View' interface type property.
        /// </summary>
        new public RazorPage<TModel> Page { get { return _View as RazorPage<TModel>; } }

        /// <summary>
        /// Gets or sets a dictionary that contains data passed from the controller to the view.
        /// </summary>
        new public ViewDataDictionary<TModel> ViewData { get { return View?.ViewData; } set { View.ViewData = value; } }

        // --------------------------------------------------------------------------------------------------------------------

        public ViewHelper()
        {
        }

        // --------------------------------------------------------------------------------------------------------------------

        public class TemplatePartDetails<TControl> where TControl : WebComponent
        {
            /// <summary>
            /// The property name for expressions used with template partial views.
            /// </summary>
            public string PropertyName;
            /// <summary>
            /// The property value for expressions used with template partial views.
            /// </summary>
            public object PropertyValue;
            /// <summary>
            /// 'PropertyValue' converted to a string value.
            /// </summary>
            public string Text;
            /// <summary>
            /// The resulting control, either from the control being the view model itself, or by creating a transient control for rendering purposes only.
            /// </summary>
            public TControl Control;
        }

        /// <summary>
        /// Returns details for use with WebComponent based template partial views.
        /// </summary>
        /// <typeparam name="TControl">The type of WebComponent the display or editor template partial view is for.</typeparam>
        /// <param name="constructor">If the model for the template part does not contain a control instance, this callback
        /// (usually a simple lambda expression) is called to create a new control instance within the context of the 
        /// calling template.</param>
        /// <returns>An object that holds common details across all WebComponent type template views.</returns>
        public TemplatePartDetails<TControl> GetTemplatePartDetails<TControl>(Func<TemplatePartDetails<TControl>, TControl> constructor)
            where TControl : WebComponent
        {
            if (constructor == null)
                throw new ArgumentNullException("'constructor' is required in case a calling template does not have a control instance as a model.");

            var model = Page.Model;

            if (model is WebComponent && !(model is TControl))
                throw new InvalidOperationException("A ControlBase was given as a template view's model, but it is not of the expected derived type.");

            var details = new TemplatePartDetails<TControl>();

            var propertyIsControlBase = ViewData.TemplateInfo.FormattedModelValue is WebComponent;
            // (note: if NO model property is given, 'ViewData.TemplateInfo.FormattedModelValue' will become the WebComponent
            //  instance [in order to call this template], and the property name and values will be set to 'null')

            // ... determined the property name and value, in case an entity model is used ...

            details.PropertyName = propertyIsControlBase ? null : ViewData.TemplateInfo.HtmlFieldPrefix;
            details.PropertyValue = propertyIsControlBase ? null : ViewData.TemplateInfo.FormattedModelValue;
            details.Text = propertyIsControlBase ? null : ViewData.TemplateInfo.FormattedModelValue.ND();

            // ... get a control for this partial template ...

            details.Control = model as TControl ?? constructor(details); // (if the mode is not a CDS control, then this will become null.

            // (Note: At this point a control MUST exist.)
            if (details.Control == null)
                throw new InvalidOperationException("The constructor callback did not return a control instance, as is required.");

            // ... now that we have a control, configure it with any ViewBag values from the partial template ...

            details.Control.SetAttributes(Page.ViewBag); // TODO: Need to filter this?  Perhaps not all values are valid to output?

            return details;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ########################################################################################################################
}

// Notes:
//   In 'RouterMiddleware', an IRouter is injected, and on 'Invoke()', is added to 'RouteData.Routers':
//     |  var context = new RouteContext(httpContext);
//     |  context.RouteData.Routers.Add(_router); <- This is most likely why 'ControllerContext.RouteData.Routers[0]' can be used to generate URLs for the currently activated router for the request (but this fails to provide a means to get links for other routers).
//   Interesting to try: ((RouteCollection)Controller.ControllerContext.RouteData.Routers[0]).Add() / http://stackoverflow.com/questions/32565768/change-route-collection-of-mvc6-after-startup
