﻿using CoreXT.ASPNet;
using CoreXT.MVC;
using CoreXT.Toolkit.Controls;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using System.Collections.Generic;
using System.Diagnostics;
using System;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.Web
{
    // ########################################################################################################################

    public interface IViewPage : IRazorPage
    {
        ViewHelper XT { get; }
        ViewDataDictionary ViewData { get; set; }
        HttpContext Context { get; }
        int RenderingLevel { get; }
    }

    public interface IViewPage<TModel> : IViewPage
    {
        new ViewHelper<TModel> XT { get; }
        new ViewDataDictionary<TModel> ViewData { get; set; }
    }

    public abstract partial class ViewPage<TModel> : RazorPage<TModel>, IViewPage<TModel>, IViewPageRenderEvents
    {
        public override Task ExecuteAsync()
        {
            throw new NotImplementedException();
        }
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// A CoreXT helper object reference, typically used to provide access to core level routines within the Toolkit
        /// framework.  This is used by some ViewPage shorthand methods, such as 'CSS()', 'Script()', etc.
        /// <para>If users wish to add other core extension methods for use with razor without having to extend the ViewPage type,
        /// this is where to add them.</para>
        /// </summary>
        public ViewHelper<TModel> XT { get; private set; }

        ViewHelper IViewPage.XT { get { return XT; } }

        ViewDataDictionary IViewPage.ViewData { get { return ViewData; } set { ViewData = new ViewDataDictionary<TModel>(value); } }

        public IHostingEnvironment HostingEnvironment { get; private set; }

        /// <summary>
        /// The nesting level of this view within any other views during the rendering process.
        /// </summary>
        public int RenderingLevel
        {
            get
            {
                //? var stack = _GetStack_Method?.Invoke(null, new object[] { Context }) as Stack<ITemplateFile>;
                //? return stack?.Count ?? (int.MaxValue - _CreationSequence);
                return ViewPageRenderStack != null ? ViewPageRenderStack.Count - 1 : (_CreationSequence++);
            }
        }

        public IViewPageRenderStack ViewPageRenderStack { get; private set; } // (will attempt to use this first if exists)

        static int _CreationSequence; // (gets the order the view was created in; this is a fall back in case the stack method ever fails)

        // --------------------------------------------------------------------------------------------------------------------

        public ViewPage()
        {
        }

        // --------------------------------------------------------------------------------------------------------------------

        protected virtual void OnBeforeRenderView(ViewPageRenderContext renderContext)
        {
            var httpcontext = renderContext.ActionContext.HttpContext;

            EnsureRequiredServicesSet(httpcontext);

            ViewPageRenderStack?.Push(this);

            // ... intercept view output to apply the content files ...

            var TagProcessingService = httpcontext.GetService<IContentTagProcessingService>();

            renderContext.FilterOutput(r => TagProcessingService.Process(r));
        }

        protected virtual IHtmlContent OnRenderException(ViewPageRenderContext renderContext, Exception ex)
        {
            var typicalbscsspath = XT?.Page?.Href("~/lib/bootstrap/dist/css/bootstrap.css");
            var errorMsg = ex.GetFullErrorMessage().Replace("\r\n", "<br/>\r\n");
            var msg = !IsEnvironment(Environments.Production) ? errorMsg
                : "Sorry, and internal error has occurred, please report this to the system administrator.<br/><!--"
                + Environment.NewLine + errorMsg.Replace("-->", "--»") + Environment.NewLine + "-->"; // TODO: Test this in prod.
            return new HtmlString("<html><head><link rel='stylesheet' href='" + typicalbscsspath + "'/></head><body><div class='alert alert-danger'>" + msg + "</div></body></html>");
        }

        protected virtual void OnAfterRenderView(ViewPageRenderContext renderContext)
        {
            if (ViewPageRenderStack != null)
                Debug.Assert(ViewPageRenderStack.Pop() == this, "View page render stack not in sync.");
        }

        protected virtual void OnViewActived(IRazorPage page, ViewContext context)
        {
            // ... the view page was just prepared for rendering, set any values needed for the views now ...
            var httpcontext = context.HttpContext;
            var viewPage = page as ViewPage<TModel>;
            viewPage?.EnsureRequiredServicesSet(httpcontext); // (this is here because 'OnBeforeRenderView()' is only called for normal views, and not '_{name}.cshtml' framework files)
        }

        /// <summary>
        /// Initializes the view page to make sure expected properties are set. 
        /// This is usually done when the MVC system "activates" a page, just before rendering it.
        /// </summary>
        /// <param name="httpcontext"></param>
        internal void EnsureRequiredServicesSet(HttpContext httpcontext)
        {
            if (ViewContext != null && ViewContext.HttpContext == null)
                ViewContext.HttpContext = httpcontext;

            // ... this makes sure the render current stack reference for the request is available ...

            if (ViewPageRenderStack == null)
                ViewPageRenderStack = httpcontext.GetService<IViewPageRenderStack>(); // (IViewPageRenderStack is assumed to be a scoped service [per request])

            // ... add the extension helper property ...

            if (XT == null)
            {
                XT = httpcontext.GetService<ViewHelper<TModel>>();
                if (XT != null && XT.View == null)
                    XT.View = this;
            }

            if (HostingEnvironment == null)
                HostingEnvironment = httpcontext.GetService<IHostingEnvironment>();
        }

        protected virtual void OnViewFound(ActionContext actionContext, ViewResult viewResult, ViewEngineResult searchResult)
        {
        }

        // --------------------------------------------------------------------------------------------------------------------

        void IViewPageRenderEvents.OnViewFound(ActionContext actionContext, ViewResult viewResult, ViewEngineResult searchResult)
        {
            OnViewFound(actionContext, viewResult, searchResult);
        }

        void IViewPageRenderEvents.OnBeforeRenderView(ViewPageRenderContext renderContext)
        {
            OnBeforeRenderView(renderContext);
        }

        IHtmlContent IViewPageRenderEvents.OnRenderException(ViewPageRenderContext renderContext, Exception ex)
        {
            return OnRenderException(renderContext, ex);
        }

        void IViewPageRenderEvents.OnViewActived(IRazorPage page, ViewContext context)
        {
            OnViewActived(page, context);
        }

        void IViewPageRenderEvents.OnAfterRenderView(ViewPageRenderContext renderContext)
        {
            OnAfterRenderView(renderContext);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Adds a script (usually JavaScript) to a view if it has not been added already.
        /// </summary>
        /// <param name="name">An name to use to represent this resource.  Typically this should be the file name and extension of the resource (minus any path information).
        /// You can use the other overloaded method to skip adding a name, and the resource path and file name (if any) will be used instead.
        /// If the name or resource path contains the typical ".min." name part, it will be ignored to make comparisons more consistent.
        /// </param>
        /// <param name="scriptPath">A URI to the script to add to the page.</param>
        /// <param name="renderTarget">Where to render the script.</param>
        public ResourceInfo Script(string name, string scriptPath, RenderTargets renderTarget = RenderTargets.Header)
        {
            return XT.RequireResource(name, scriptPath, ResourceTypes.Script, renderTarget);
        }

        /// <summary>
        /// Adds a script (usually JavaScript) to a view if it has not been added already.
        /// </summary>
        /// <param name="scriptPath">A URI to the script to add to the page.</param>
        /// <param name="renderTarget">Where to render the script.</param>
        public ResourceInfo Script(string scriptPath, RenderTargets renderTarget = RenderTargets.Header)
        {
            return Script(null, scriptPath, renderTarget);
        }

        /// <summary>
        /// Adds one or more scripts (usually JavaScript) to the header of a view if they have not been added already.
        /// </summary>
        /// <param name="scriptPaths">One or more script path URIs to add to the page.</param>
        public IHtmlContent Scripts(params string[] scriptPaths)
        {
            List<string> results = new List<string>();
            foreach (var path in scriptPaths)
            {
                var _ = Script(path).Render();
                if (!string.IsNullOrWhiteSpace(_)) results.Add(_);
            }
            if (results.Count == 0) return HtmlString.Empty;
            return new HtmlString(string.Join(string.Empty, results));
        }

        /// <summary>
        /// Adds one or more scripts (usually JavaScript) to a view if they have not been added already.
        /// </summary>
        /// <param name="renderTarget">Where to render the scripts.</param>
        /// <param name="scriptPaths">One or more script path URIs to add to the page.</param>
        public IHtmlContent Scripts(RenderTargets renderTarget, params string[] scriptPaths)
        {
            List<string> results = new List<string>();
            foreach (var path in scriptPaths)
            {
                var _ = Script(path, renderTarget).Render();
                if (!string.IsNullOrWhiteSpace(_)) results.Add(_);
            }
            if (results.Count == 0) return HtmlString.Empty;
            return new HtmlString(string.Join(string.Empty, results));
        }

        /// <summary>
        /// Adds a CSS reference to a view if it has not been added already.
        /// </summary>
        /// <param name="name">An name to use to represent this resource.  Typically this should be the file name and extension of the resource (minus any path information).
        /// You can use the other overloaded method to skip adding a name, and the resource path and file name (if any) will be used instead.
        /// If the name or resource path contains the typical ".min." name part, it will be ignored to make comparisons more consistent.
        /// </param>
        /// <param name="cssPath">A URI to the script to add to the page.</param>
        /// <param name="renderTarget">Where to render the script.</param>
        public ResourceInfo CSS(string name, string cssPath, RenderTargets renderTarget = RenderTargets.Header)
        {
            return XT.RequireResource(name, cssPath, ResourceTypes.CSS, renderTarget);
        }

        /// <summary>
        /// Adds a CSS reference to a view if it has not been added already.
        /// </summary>
        /// <param name="cssPath">A URI to the script to add to the page.</param>
        /// <param name="renderTarget">Where to render the script.</param>
        public ResourceInfo CSS(string cssPath, RenderTargets renderTarget = RenderTargets.Header)
        {
            return CSS(null, cssPath, renderTarget);
        }

        /// <summary>
        /// Adds one or more CSS references to a view if they have not been added already.
        /// </summary>
        /// <param name="cssPaths">One or more script path URIs to add to the page.</param>
        public IHtmlContent CSS(params string[] cssPaths)
        {
            List<string> results = new List<string>();
            foreach (var path in cssPaths)
            {
                var _ = CSS(path).Render();
                if (!string.IsNullOrWhiteSpace(_)) results.Add(_);
            }
            if (results.Count == 0) return HtmlString.Empty;
            return new HtmlString(string.Join(string.Empty, results));
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Renders header scripts in a view.
        /// <para>Note: ONLY use this in the "_Layout.cshtml" or similar page. For nested views, use one of the 'Require???()'
        /// methods instead.</para>
        /// </summary>
        /// <param name="env">The environment for which the files should be rendered.</param>
        /// <param name="scripts">Additional script files to load for the specified environment.</param>
        public virtual HtmlString RenderHeaderScripts(params string[] scripts)
        {
            foreach (var path in scripts)
                Script(path, RenderTargets.Header);
            return new HtmlString("<COREXT_HEADER_SCRIPTS/>");
        }

        /// <summary>
        /// Renders footer scripts in a view.
        /// <para>Note: ONLY use this in the "_Layout.cshtml" or similar page. For nested views, use one of the 'Require???()'
        /// methods instead.</para>
        /// </summary>
        /// <param name="env">The environment for which the files should be rendered.</param>
        /// <param name="scripts">Additional script files to load for the specified environment.</param>
        public virtual HtmlString RenderFooterScripts(params string[] scripts)
        {
            foreach (var path in scripts)
                Script(path, RenderTargets.Footer);
            return new HtmlString("<COREXT_FOOTER_SCRIPTS/>");
        }

        /// <summary>
        /// Renders styles in a view.
        /// <para>Note: ONLY use this in the "_Layout.cshtml" or similar page. For nested views, use one of the 'Require???()'
        /// methods instead.</para>
        /// </summary>
        /// <param name="env">The environment for which the files should be rendered.</param>
        /// <param name="styles">Additional CSS files to load for the specified environment.</param>
        public virtual HtmlString RenderStyles(params string[] styles)
        {
            foreach (var path in styles)
                CSS(path, RenderTargets.Header);
            return new HtmlString("<COREXT_HEADER_STYLES/>");
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns true if the given environment name matches the current environment setting in
        /// '<seealso cref="IHostingEnvironment"/>.EnvironmentName' (usually set by passing in an argument to the web application,
        /// or by setting the 'ASPNETCORE_ENVIRONMENT' environment variable).
        /// </summary>
        public bool IsEnvironment(string environmentName, bool ignoreCase = false)
        {
            return HostingEnvironment.IsEnvironment(environmentName, ignoreCase);
        }

        /// <summary>
        /// Returns true if any of given environment flags matches the current environment setting in
        /// '<seealso cref="IHostingEnvironment"/>.EnvironmentName' (usually set by passing in an argument to the web application,
        /// or by setting the 'ASPNETCORE_ENVIRONMENT' environment variable).
        /// <para>This method requires that the environment names match the names of the enum type names.</para>
        /// </summary>
        /// <param name="environment">Environment flags to test against. If any match, 'true' is returned.</param>
        /// <param name="ignoreCase">If true (default) case is ignored when comparing against the 'IHostingEnvironment.EnvironmentName' value.</param>
        public bool IsEnvironment(Environments environment, bool ignoreCase = true)
        {
            return HostingEnvironment.IsEnvironment(environment, ignoreCase);
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    //? public abstract class ViewPage : ViewPage<dynamic>, IViewPage
    //{
    //    ///// <summary>
    //    ///// This is only used internally for editing the view pages in the IDE.
    //    ///// </summary>
    //    //internal ViewPage() : base(new ViewPageRenderStack()) { }

    //    public ViewPage()
    //    {
    //    }
    //}

    // ########################################################################################################################
}