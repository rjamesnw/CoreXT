﻿using CoreXT.ASPNet;
using CoreXT.Toolkit.Web;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Mvc.ViewFeatures.Internal;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.Controls
{
    // ########################################################################################################################

    public delegate object RazorTemplateDelegate<in TModel>(TModel item);

    // ########################################################################################################################

    /// <summary>
    /// The base class for all CDS controls.  A view will auto convert a ControlBase instance to unescaped HTML text output, like an HtmlString.
    /// <para>Most ControlBase methods return the underlying instance to allow for nesting other method calls. This helps to reduce
    /// the need to overload helper methods for custom control modifications, such as adding attributes, CSS classes, or other control configurations.</para>
    /// </summary>
    // (https://docs.microsoft.com/en-us/aspnet/core/mvc/views/view-components)
    public abstract class ControlBase : ViewComponent, IControlBase // ('IHtmlString' is the trick that allows the generated MVC views to render this control)

    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// The page that will render the control, if any.
        /// If no page exists when the control is rendered, a temp page will be created.
        /// </summary>
        public IViewPage Page
        {
            get { return _Page ?? (_Page = _ViewPageRenderStack?.Current); }
            set
            {
                _Page = value;
                if (_Page != null)
                    RequiredResources = new ResourceList(_Page.ViewContext); // (this will get rendered out only when the control is rendered)
            }
        }
        IViewPage _Page;

        /// <summary>
        /// The context for this control.  The context is used to get services and access other information about the current
        /// HTTP request.
        /// <para>By default, this reads from 'Page.Context', unless a different context is set. </para>
        /// </summary>
        public Microsoft.AspNetCore.Http.HttpContext Context { get { return _Context ?? Page?.Context; } set { _Context = value; } }
        Microsoft.AspNetCore.Http.HttpContext _Context;

        /// <summary>
        /// Derived types can use this convenience method to get services as required.
        /// <para>The 'Page' property </para>
        /// </summary>
        /// <typeparam name="T">The type of service object to get.</typeparam>
        /// <returns>The service object if found, or 'null' otherwise.</returns>
        protected T GetService<T>() where T : class { return Context.GetService<T>(); }

        /// <summary>
        /// Gets a URL helper to build URLs for ASP.NET MVC within an application.
        /// </summary>
        public IUrlHelper UrlHelper => _UrlHelper ?? (_UrlHelper = GetService<IUrlHelperFactory>()?.GetUrlHelper(Page.ViewContext));
        IUrlHelper _UrlHelper;

        /// <summary>
        /// Controls display or edit modes for this control.
        /// </summary>
        public RenderModes RenderMode;

        // These attributes are merged in GetTagBuilder() after HtmlAttributes.
        // This means that any custom settings are preserved.
        public IDictionary<string, string> Attributes { get; private set; }

        /// <summary>
        /// A list of resource (such as JavaScript, CSS, etc.) required for this control.
        /// </summary>
        public IResourceList RequiredResources { get; private set; }

        /// <summary>
        /// Gets or sets class names for this control.
        /// <para>Note that setting this is a cumulative operation, in that each new value adds to an existing value.  To clear the class attribute pass in 'null'.</para>
        /// </summary>
        public string Class
        {
            get { return Attributes.Value("class"); }
            set { if (value != null) AddClass(value); else Attributes.MergeString("class", null); }
        }

        /// <summary>
        /// A unique ID for this control that identifies the source of any associated data value. This is usually an entity ID (primary key value).
        /// <para>This is helpful when multiple entities or objects are being output to a page. 
        /// If a list of plain old CLR (POCO) objects are used without IDs, a simple numerical iteration index value may be sufficient.</para>
        /// <para>Note: If a value for "ID" exists, the EntityID value will be added as a suffix, delimited by an period.</para>
        /// </summary>
        public string DataSourceID { get; set; }

        public string ID
        {
            get { return Attributes.Value("id"); }
            set { Attributes.MergeString("id", value); }
        }

        /// <summary>
        /// Return a unique ID for this control, usually used as the final ID attribute value to output on an element.
        /// </summary>
        public string UniqueID { get { return Strings.Append(ID, DataSourceID, "_"); } }

        public string Name
        {
            get { return Attributes.Value("name"); }
            set { Attributes.MergeString("name", value); }
        }

        /// <summary>
        /// Return a unique ID for this control, usually used as the final ID attribute value to output on an element.
        /// </summary>
        public string UniqueName { get { return Strings.Append(Name, DataSourceID, "_"); } }

        /// <summary>
        /// Sets the inline style for this control.
        /// </summary>
        public string Style
        {
            set { Attributes.MergeString("style", value); }
            get { return Attributes.Value("style"); }
        }

        /// <summary>
        /// Sets a title for this control (usually displays as a help tip).
        /// </summary>
        public string Title
        {
            set { Attributes.MergeString("title", value); }
            get { return Attributes.Value("title"); }
        }

        /// <summary>
        /// The raw internal HTML that will be placed between the start and end tags, if supported.
        /// This should be overridden in derived classes to throw "NotSupportedException" if not supported.
        /// </summary>
        public virtual string InnerHtml { get { return _InnerHtml; } set { _InnerHtml = value ?? string.Empty; } }
        string _InnerHtml = string.Empty;

        /// <summary>
        /// This delegate is used to set the 'InnerHtml' property when 'Update()' is called (usually just before rendering).
        /// The delegate is usually set by derived controls that accept razor template delegates.
        /// </summary>
        public RazorTemplateDelegate<object> ContentTemplate;

        /// <summary>
        /// Returns 'InnerHtml' as encoded HTML (usually used to output text for display purposes).
        /// </summary>
        public string EncodedInnerHtml { get { return WebUtility.HtmlEncode(InnerHtml); } }

        /// <summary>
        /// If set, this will be called to render the raw HTML result when 'Render()' is called.
        /// </summary>
        Func<ControlBase, IHtmlContent> _Renderer;

        IViewPageRenderStack _ViewPageRenderStack;

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Converts given content to an IViewComponentResult for rendering.
        /// </summary>
        /// <param name="value">A value that represents content to render as a view result.
        /// The content must either be a string, implement IHtmlContent or IViewComponentResult, or override the 'Object.ToString()' method.
        /// <para>The precedence is IViewComponentResult, IHtmlContent, string, then Object.ToString().</para></param>
        /// <returns>Returns an IViewComponentResult result.</returns>
        public IViewComponentResult Content(object value)
        {
            return GetViewResultFromValue(value);
        }

        public static IViewComponentResult GetViewResultFromValue(object value)
        {
            if (value == null)
                return new ContentViewComponentResult(string.Empty);
            else
            {
                var componentResult = value as IViewComponentResult;
                if (componentResult != null)
                    return componentResult;

                var htmlContent = value as IHtmlContent;
                if (htmlContent != null)
                    return new HtmlContentViewComponentResult(htmlContent);

                var stringResult = value as string;
                if (stringResult != null)
                    return new ContentViewComponentResult(stringResult);

                var valueType = value.GetType().GetTypeInfo();

                if (!valueType.IsPrimitive)
                {
                    var valueToStringDeclaringType = ((Func<string>)value.ToString).GetMethodInfo().DeclaringType;
                    if (valueToStringDeclaringType == typeof(object))
                        throw new InvalidOperationException(string.Format("The specified content object cannot be rendered. The content must either be a {0}, implement {1} or {2}, or override the '{3}' method.",
                            typeof(string).Name,
                            nameof(IHtmlContent),
                            nameof(IViewComponentResult),
                            nameof(Object.ToString)));
                }

                stringResult = value.ToString();

                return new ContentViewComponentResult(stringResult);
            }
        }

        /// <summary>
        /// This method is called just before rendering the control to make sure all properties are up to date.
        /// End users (developers) may also call this method before hand to refresh the control properties.
        /// This allows controls to be more efficient by only making updates when needed during a render request.
        /// <para>Example: The CDSActionLink control has properties that configure the HREF URL. Calling 
        /// Update() resets the HREF value to match the currently configured path values.</para>
        /// </summary>
        public virtual async Task<ControlBase> Update()
        {
            if (ContentTemplate != null)
                InnerHtml = (await GetContentFromTemplateDelegate(ContentTemplate)).Render();
            return this;
        }

        /// <summary>
        /// An async method to return an IHtmlContent instance from the specified template delegate.
        /// This is used in controls to support rendering razor template delegates into the underlying views, where applicable.
        /// </summary>
        public async Task<IHtmlContent> GetContentFromTemplateDelegate(RazorTemplateDelegate<object> templateDelegate)
        {
            if (templateDelegate != null)
            {
                var contentResult = templateDelegate(ViewData.Model); // (note: this may be a razor template delegate)
                // TODOTEST: Test that 'ViewData.Model' is the correct one to pass in above.
                if (contentResult is string)
                    return new HtmlString((string)contentResult);
                else
                {
                    var viewResult = Content(contentResult); // (coerce the value to a view result if not already one)
                    return await Render(viewResult);
                }
            }
            return HtmlString.Empty;
        }

        /// <summary>
        /// Constructs a control for a web view page.
        /// </summary>
        /// <remarks>'pageRenderStack' can be null, which is usually only for unit testing controls where applicable.</remarks>
        /// <param name="pageRenderStack">The view page rendering stack to associate with this control. This is used as a hint
        /// to default the 'Page' property to the currently rendering view. You can also use 'SetPage()' instead to be more explicit.</param>
        public ControlBase(IViewPageRenderStack pageRenderStack)
        {
            _ViewPageRenderStack = pageRenderStack;
            Attributes = new SortedDictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        }

        //? public ControlBase Configure(IViewPageRenderStack pageRenderStack) { _ViewPageRenderStack = pageRenderStack; return this;  }

        /// <summary>
        /// Sets a custom renderer to be called when 'Render()' is called.
        /// This is normally used to return a rendered result when a control is used with a strongly typed 'WebViewPage'
        /// (since ControlBase is not a generic type).
        /// </summary>
        /// <param name="renderer">An optional render delegate used for custom rendering when 'Render()' is called.</param>
        /// <returns></returns>
        public ControlBase SetRenderer(Func<ControlBase, IHtmlContent> renderer)
        {
            _Renderer = renderer;
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns attributes for output to editor templates.
        /// </summary>
        /// <param name="includeID">If true, the ID attribute is included (default is false).</param> 
        /// <param name="includeName">If true, the NAME attribute is included (default is false).</param> 
        /// <param name="attributesToIgnore">Attributes not to include in the output. 
        /// By default, if nothing is specified, the ID and NAME attributes are skipped, since these are usually set another way in the templates.
        /// Giving ANY attribute to skip will bypass this default, so you'll have to explicitly name those to 
        /// If these are needed, simply pass in an empty string for an attribute name to ignore.</param>
        /// <returns></returns>
        public IHtmlContent GetElementAttributes(bool includeID = false, bool includeName = false, params string[] attributesToIgnore)
        {
            if (Attributes.Count == 0)
                return new HtmlString("");

            // ... make all lowercase names first ...

            var attributes = Attributes.Where(a => !string.IsNullOrEmpty(a.Value)).ToDictionary(a => a.Key.ToLower(), a => a.Value);
            var ignored = new List<string>(attributesToIgnore.Where(a => !string.IsNullOrWhiteSpace(a)).Select(a => (a ?? "").ToLower()));

            if (includeID)
            {
                ignored.Remove("id");
                attributes["id"] = UniqueID;
            }
            else if (!ignored.Contains("id"))
                ignored.Add("id");

            if (includeName)
            {
                ignored.Remove("name");
                attributes["name"] = UniqueName;
            }
            else if (!ignored.Contains("name"))
                ignored.Add("name");

            // ... get the non ID and NAME attributes for output ...

            return new HtmlString(string.Join(" ",
                (from a in attributes
                 where ignored.Count == 0 || !ignored.Contains(a.Key)
                 select a.Key + "=\"" + WebUtility.HtmlEncode(a.Value) + "\"")));
        }

        /// <summary>
        /// Sets the given attributes on this control.
        /// </summary>
        /// <param name="attributes">A dictionary list of attributes to set.</param>
        /// <returns>This control instance.</returns>
        public ControlBase SetAttributes(IDictionary<string, object> attributes)
        {
            if (attributes != null)
                foreach (var item in attributes)
                    Attributes[item.Key] = item.Value.ND();
            return this;
        }

        string _ObjectMemberNameToAttributeName(string name)
        {
            // (converts "someMemberName" format to "some-member-name")
            return Regex.Replace(name, "([a-z])([A-Z])", m => m.Groups[1].Value + "-" + m.Groups[2].Value.ToLower());
        }

        /// <summary>
        /// Sets the given attributes on this control.
        /// </summary>
        /// <param name="attributes">A dictionary list of attributes to set.</param>
        /// <returns>This control instance.</returns>
        public ControlBase SetAttributes(object attributes)
        {
            if (attributes != null)
            {
                foreach (var prop in attributes.GetType().GetProperties(BindingFlags.Instance | BindingFlags.Public))
                    Attributes[_ObjectMemberNameToAttributeName(prop.Name)] = prop.GetValue(attributes).ND();

                foreach (var field in attributes.GetType().GetFields(BindingFlags.Instance | BindingFlags.Public))
                    Attributes[_ObjectMemberNameToAttributeName(field.Name)] = field.GetValue(attributes).ND();
            }
            return this;
        }

        /// <summary>
        /// Sets the given attribute on this control.
        /// </summary>
        /// <param name="name">The attribute name.</param>
        /// <param name="value">A value for this attribute.</param>
        /// <param name="replace">If true (default) adds a new entry or replaces an existing entry, otherwise the request is ignored.
        /// If this is false, nothing is removed, and any merge requests with existing keys will be ignored.</param>
        public ControlBase SetAttribute(string name, object value, bool replace = true)
        {
            Attributes.MergeString(name, value, replace);
            return this;
        }

        /// <summary>
        /// Gets an attribute value on this control by name.
        /// </summary>
        /// <param name="name">The attribute name.</param>
        public string GetAttribute(string name)
        {
            return Attributes.Value(name);
        }

        // --------------------------------------------------------------------------------------------------------------------

        IEnumerable<string> _TrimNames(IEnumerable<string> classNames)
        {
            return classNames.Select(c => c.Trim()).Where(c => !string.IsNullOrWhiteSpace(c));
        }

        /// <summary>
        /// Parses and returns the current list of class names as a string array.
        /// </summary>
        public string[] GetClassNames()
        {
            string currentClassNames;
            if (Attributes.TryGetValue("class", out currentClassNames))
                return currentClassNames.Trim().Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Select(c => c.ToLower()).ToArray();
            else
                return new string[0];
        }

        /// <summary>
        /// Adds one or more CSS class names to the control.
        /// </summary>
        /// <param name="classNames"></param>
        /// <returns></returns>
        public ControlBase AddClass(params string[] classNames)
        {
            if (classNames.Length > 0)
            {
                // (note: individual string items may already be space delimited, and will be parsed later using {string}.Split())
                var classNamesStr = string.Join(" ", _TrimNames(classNames));

                if (!string.IsNullOrEmpty(classNamesStr))
                {
                    var currentClasses = GetClassNames();

                    if (currentClasses.Length > 0)
                    {
                        // ... need to merge with existing values ...

                        var itemsToAdd = classNamesStr.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Select(c => c.ToLower());

                        Attributes["class"] = string.Join(" ", currentClasses.Union(itemsToAdd));
                    }
                    else
                    {
                        Attributes["class"] = classNamesStr; // (there is no existing class to merge with, so just set the values now)
                    }
                }
            }
            return this;
        }

        /// <summary>
        /// Removes one or more CSS class names to the control.
        /// </summary>
        /// <param name="classNames"></param>
        /// <returns></returns>
        public ControlBase RemoveClass(params string[] classNames)
        {
            if (classNames.Length > 0)
            {
                // (note: individual string items may already be space delimited, and will be parsed later using {string}.Split())
                var classNamesStr = string.Join(" ", _TrimNames(classNames));

                if (!string.IsNullOrEmpty(classNamesStr))
                {
                    var currentClasses = GetClassNames();

                    if (currentClasses.Length > 0)
                    {
                        // ... need to merge with existing values ...

                        var itemsToRemove = classNamesStr.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Select(c => c.ToLower());

                        Attributes["class"] = string.Join(" ", currentClasses.Where(c => !itemsToRemove.Contains(c)));
                    }
                }
            }
            return this;
        }

        /// <summary>
        /// Returns true if the control has ALL the specified CSS class names set.
        /// </summary>
        /// <param name="classNames">A list of class names to test against.  If a single array item has spaces it will be parsed also as separate class names.</param>
        /// <returns>True if the current control current has all the given class names, or false otherwise.</returns>
        public bool HasClass(params string[] classNames)
        {
            if (classNames.Length > 0)
            {
                // (note: individual string items may already be space delimited, and will be parsed later using {string}.Split())
                var classNamesStr = string.Join(" ", _TrimNames(classNames));

                if (!string.IsNullOrEmpty(classNamesStr))
                {
                    var currentClasses = GetClassNames();

                    if (currentClasses.Length > 0)
                    {
                        // ... need to merge with existing values ...

                        var itemsToTest = classNamesStr.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Select(c => c.ToLower()).ToArray();

                        return itemsToTest.All(item => currentClasses.Contains(item));
                    }
                }
            }
            return false;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Inserts an inline script into a given event attribute for this control (i.e. "onclick").
        /// If one or more scripts already exists for the event, this new script is appended.
        /// </summary>
        /// <param name="eventAttributeName">The attribute event name for an event on this control.</param>
        /// <param name="script">The inline script to set.  If a script is already set</param>
        public ControlBase AddEventScript(string eventAttributeName, string script)
        {
            if (string.IsNullOrEmpty(script))
                return this;

            script = script.Trim();

            if (!script.EndsWith("}") && !script.EndsWith(";"))
                script += ";"; // (make sure the script is terminated correctly)

            string currentScript = Attributes.Value(eventAttributeName);

            if (!string.IsNullOrWhiteSpace(currentScript))
            {
                currentScript = currentScript.Trim();

                if (!currentScript.EndsWith("}") && !currentScript.EndsWith(";"))
                    currentScript += ";"; // (make sure the script is terminated correctly)

                Attributes[eventAttributeName] = currentScript + " " + script;
            }
            else Attributes[eventAttributeName] = script;

            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Adds a resource that is required for this control.
        /// If the resource is already added then the request is ignored.
        /// </summary>
        /// <param name="resourcePath">A URI to the script to add to the page.</param>
        /// <param name="resourceType">The type of the resource returned from the given resource path.</param>
        /// <param name="renderTarget">Where to render the resource.</param>
        public ControlBase RequireResource(string resourcePath, ResourceTypes resourceType, RenderTargets renderTarget = RenderTargets.Header, int sequence = 0, string environmentName = null)
        {
            if (RequiredResources == null)
                throw new InvalidOperationException("No view page was supplied for this control.");

            RequiredResources.Add(resourcePath, ResourceTypes.Script, renderTarget, sequence, environmentName);

            return this;
        }

        /// <summary>
        /// Adds a resource that is required for this control.
        /// If the resource is already added then the request is ignored.
        /// </summary>
        /// <param name="resourcePath">A URI to the script to add to the page.</param>
        /// <param name="resourceType">The type of the resource returned from the given resource path.</param>
        /// <param name="renderTarget">Where to render the resource.</param>
        public ControlBase RequireResource(string resourcePath, ResourceTypes resourceType, RenderTargets renderTarget, int sequence, Environments environment)
        {
            if (RequiredResources == null)
                throw new InvalidOperationException("No view page was supplied for this control.");

            RequiredResources.Add(resourcePath, ResourceTypes.Script, renderTarget, sequence, environment);

            return this;
        }

        /// <summary>
        /// Adds a required script (usually JavaScript) to this control, if it has not been added already.
        /// </summary>
        /// <param name="scriptPath">A URI to the script to associated with this control.</param>
        public ControlBase RequireScript(string scriptPath, RenderTargets renderTarget = RenderTargets.Header, string environmentName = null)
        {
            return RequireResource(scriptPath, ResourceTypes.Script, renderTarget, 0, environmentName);
        }

        /// <summary>
        /// Adds a required script (usually JavaScript) to this control, if it has not been added already.
        /// </summary>
        /// <param name="scriptPath">A URI to the script to associated with this control.</param>
        /// <param name="renderTarget">Where to render the script on a page when 'Render()' is called.</param>
        public ControlBase RequireScript(string scriptPath, RenderTargets renderTarget, Environments environment)
        {
            return RequireResource(scriptPath, ResourceTypes.Script, renderTarget, 0, environment);
        }

        /// <summary>
        /// Adds a required CSS reference to this control, if it has not been added already.
        /// </summary>
        /// <param name="cssPath">A URI to the script to associated with this control.</param>
        /// <param name="renderTarget">Where to render the CSS on a page when 'Render()' is called.</param>
        public ControlBase RequireCSS(string cssPath, RenderTargets renderTarget = RenderTargets.Header, string environmentName = null)
        {
            return RequireResource(cssPath, ResourceTypes.Script, renderTarget, 0, environmentName);
        }

        /// <summary>
        /// Adds a required CSS reference to this control, if it has not been added already.
        /// </summary>
        /// <param name="cssPath">A URI to the script to associated with this control.</param>
        /// <param name="renderTarget">Where to render the CSS on a page when 'Render()' is called.</param>
        public ControlBase RequireCSS(string cssPath, RenderTargets renderTarget, Environments environment)
        {
            return RequireResource(cssPath, ResourceTypes.Script, renderTarget, 0, environment);
        }

        /// <summary>
        /// Adds the resources (JavaScript, CSS, etc.) required for this control to the view properties for deferred rendering.
        /// These resources are rendered via a post process before the page is returned to the client.
        /// </summary>
        public void ApplyResourcesToRequestContext()
        {
            if (Page != null && RequiredResources != null)
                foreach (var resource in RequiredResources)
                    Page.XT.RequireResource(resource);
        }

        // --------------------------------------------------------------------------------------------------------------------

        ///// <summary>
        ///// Renders the HTML for this control, assuming the 'Page' property references a simple 'Web.WebViewPage&lt;dynamic>' 
        ///// type, or a renderer is supplied.
        ///// </summary>
        //? public virtual IHtmlContent Render()
        //{
        //    Update();

        //    if (_Renderer != null)
        //        return _Renderer(this);
        //    else 
        //    {
        //        ViewData.Model = this;
        //        return this;
        //        //? throw new InvalidOperationException("Cannot display control, page type is unknown.  If a specific model type was supplied, use the other 'Render()' method overload.");
        //    }
        //}

        /// <summary>
        /// Supports rendering HTML model properties, represented by the given expression.
        /// <para>Note: If a custom renderer delegate is supplied to the control's constructor, it is ignored by this method because the generic 'expression' parameter cannot be passed to it.</para>
        /// </summary>
        /// <param name="expression">An expression that represents a value (usually a model property) to be sent to .</param>
        public virtual IHtmlContent RenderFor<TModel, TValue>(Expression<Func<TModel, TValue>> expression = null) // TODO: May require more testing.
        {
            var helper = GetService<IHtmlHelper>();

            ViewData.ModelExplorer = ExpressionMetadataProvider.FromLambdaExpression(expression,
                new ViewDataDictionary<TModel>(ViewData), helper.MetadataProvider);

            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------
        // Since 'Update()' must be called before rendering, any call to View() for a view component result should call it
        // automatically.

        /// <summary>
        /// Returns a result which will render the partial view with name "Default" for 'Display' render modes, and
        /// "EditorDefault" for 'Edit' render modes (see the 'RenderMode' property).
        /// </summary>
        /// <returns>A Microsoft.AspNetCore.Mvc.ViewComponents.ViewViewComponentResult.</returns>
        new virtual public ViewViewComponentResult View()
        {
            if (RenderMode == RenderModes.Edit)
                return base.View("/Views/Shared/Components/" + GetType().Name + "/Editor.cshtml", this);
            else
                return base.View("/Views/Shared/Components/" + GetType().Name + "/Display.cshtml", this);
        }

        /// <summary>
        /// Returns a result which will render the partial view with name viewName.
        /// </summary>
        /// <param name="viewName">The name of the partial view to render.</param>
        /// <returns>A Microsoft.AspNetCore.Mvc.ViewComponents.ViewViewComponentResult.</returns>
        new virtual public ViewViewComponentResult View(string viewName) { return base.View(viewName); }

        /// <summary>
        /// Returns a result which will render the partial view with name "Default" for 'Display' render modes, and
        /// "EditorDefault" for 'Edit' render modes (see the 'RenderMode' property).
        /// </summary>
        /// <typeparam name="TModel"></typeparam>
        /// <param name="model">The model object for the view.</param>
        /// <returns>A Microsoft.AspNetCore.Mvc.ViewComponents.ViewViewComponentResult.</returns>
        new virtual public ViewViewComponentResult View<TModel>(TModel model)
        {
            if (RenderMode == RenderModes.Edit)
                return base.View("/Views/Shared/Components/" + GetType().Name + "/Editor.cshtml", model);
            else
                return base.View("/Views/Shared/Components/" + GetType().Name + "/Display.cshtml", model);
        }

        /// <summary>
        /// Returns a result which will render the partial view with name viewName.
        /// </summary>
        /// <typeparam name="TModel"></typeparam>
        /// <param name="viewName">The name of the partial view to render.</param>
        /// <param name="model">The model object for the view.</param>
        /// <returns>A Microsoft.AspNetCore.Mvc.ViewComponents.ViewViewComponentResult.</returns>
        new virtual public ViewViewComponentResult View<TModel>(string viewName, TModel model) { return base.View(viewName, model); }

        /// <summary>
        /// These virtual methods are used within the control to get a view, which allows implementers to override if needed.
        /// </summary>
        protected virtual ViewViewComponentResult GetView()
        {
            return View();
        }

        /// <summary>
        /// These virtual methods are used within the control to get a view, which allows implementers to override if needed.
        /// </summary>
        protected virtual ViewViewComponentResult GetView<TModel>(TModel model)
        {
            return View(model);
        }

        // --------------------------------------------------------------------------------------------------------------------

        protected virtual ViewComponentDescriptor ViewComponentDescriptor
        {
            get
            {
                var descriptor = ViewComponentContext.ViewComponentDescriptor;

                if (descriptor.MethodInfo != null)
                    return descriptor;

                // ... the value is not valid, so set it now; first get a service to look it up in case this has been created already before ..

                var type = GetType();
                var descriptorLibrary = GetService<IViewComponentDescriptorLibrary>();

                if (descriptorLibrary != null)
                {
                    lock (descriptorLibrary) descriptor = descriptorLibrary.Value(type);
                    if (descriptor != null) return descriptor;
                }

                ViewComponentContext.ViewComponentDescriptor = descriptor = new ViewComponentDescriptor
                {
                    DisplayName = type.Name,
                    FullName = type.FullName,
                    Id = type.FullName,
                    MethodInfo = ((Func<IViewComponentResult>)GetView).GetMethodInfo(),
                    Parameters = null,
                    ShortName = type.Name,
                    TypeInfo = type.GetTypeInfo()
                };

                if (descriptorLibrary != null)
                    lock (descriptorLibrary)
                        descriptorLibrary[type] = descriptor;

                return descriptor;
            }
        }

        /// <summary>
        /// Renders a given view result and returns it as an IHtmlContent based value, which can be written to an
        /// output stream via a 'TextWriter' instance.
        /// <para>To render to a string value, just call the 'ToString()' method.</para>
        /// </summary>
        public virtual async Task<IHtmlContent> Render(IViewComponentResult viewResult)
        {
            try
            {
                var descriptor = ViewComponentDescriptor;

                var viewBufferScope = GetService<IViewBufferScope>();
                var htmlEncoder = GetService<HtmlEncoder>();
                var viewContext = Page?.ViewContext;// ?? GetService<ViewContext>();
                var invokerFactory = GetService<IViewComponentInvokerFactory>();

                var viewBuffer = new ViewBuffer(viewBufferScope, descriptor.FullName, ViewBuffer.ViewComponentPageSize);

                using (var writer = new ViewBufferTextWriter(viewBuffer, viewContext?.Writer?.Encoding ?? Encoding.UTF8))
                {
                    var context = new ViewComponentContext(descriptor, new Dictionary<string, object>(), htmlEncoder, viewContext, writer);
                    await viewResult.ExecuteAsync(context);
                    return viewBuffer;
                }
            }
            catch (Exception ex)
            {
                return new HtmlString("<div class='alert alert-danger'>" + ex.GetFullErrorMessage().Replace("\r\n", "<br/>\r\n") + "</div>");
            }
        }

        /// <summary>
        /// Renders the current control and returns the result as an IHtmlContent based value, which can be written to an
        /// output stream via a 'TextWriter' instance.
        /// <para>To render a control to a string value, just call the 'ToString()' method instead.</para>
        /// </summary>
        public virtual async Task<IHtmlContent> Render()
        {
            await Update();
            return await Render(GetView(this));
        }

        // --------------------------------------------------------------------------------------------------------------------

        public static implicit operator HtmlString(ControlBase ctrl)
        {
            return new HtmlString(ctrl.ToString());
        }

        /// <summary>
        /// Calls 'Render()' and returns the result as a string.
        /// </summary>
        public override string ToString()
        {
            var content = Render().Wait<IHtmlContent>();
            return content.Render();
        }

        /// <summary>
        /// Does an object reference based comparison.
        /// </summary>
        public override bool Equals(object obj)
        {
            return base.Equals(obj);
        }

        /// <summary>
        /// Returns the default base hash result.
        /// </summary>
        public override int GetHashCode()
        {
            return base.GetHashCode();
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Renders this control for the purpose of output to a view.
        /// <para>Note: Because this method is expected to be used in views, it implicitly calls 
        /// 'ApplyResourcesToRequestContext()'. To render the control, use 'ToString()' instead.</para>
        /// </summary>
        public void WriteTo(TextWriter writer, HtmlEncoder encoder) // (implementation for IHtmlContent)
        {
            ApplyResourcesToRequestContext();
            writer.Write(ToString());
        }

        // --------------------------------------------------------------------------------------------------------------------
        // This is only here to support those who wish to use the '@await  Component.InvokeAsync()' method.

        /// <summary>
        /// This is only here to support the documented '@await Component.InvokeAsync()' semantics of ViewComponent execution.
        /// Please use the '@await {control}' or '@await {control}.Render()' format instead (both do the same thing).
        /// </summary>
        public virtual async Task<IViewComponentResult> InvokeAsync()
        {
            return await Task.FromResult<IViewComponentResult>(GetView(this));
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Exists only to support "async" operations on the object instance.
        /// </summary>
        public Task<IHtmlContent> AsAsync()
        {
            return Render();
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Exists to support writing view component controls to controller actions.
        /// </summary>
        /// <param name="context">The action context from a controller.</param>
        public async Task ExecuteResultAsync(ActionContext context)
        {
            if (Page == null && _Context == null)
                Page = ControlBase.GetCurrentOrDefaultPage(context);
            var output = await Render();
            if (string.IsNullOrWhiteSpace(context.HttpContext.Response.ContentType))
                context.HttpContext.Response.ContentType = "text/html";
            using (var tw = new StreamWriter(context.HttpContext.Response.Body, Encoding.UTF8, 65535, true))
            {
                output.WriteTo(tw, HtmlEncoder.Default);
            }
        }

        public static IViewPage GetCurrentOrDefaultPage(ActionContext context)
        {
            // ... try to get the current view from the DI container (most likely this is null if the control is being returned as an action response ... 
            var pageRenderStack = context.HttpContext.GetService<IViewPageRenderStack>();
            return pageRenderStack?.Current ?? new _TempViewPage(context);
        }

        // --------------------------------------------------------------------------------------------------------------------

        ///// <summary>
        ///// Exists only to support "async" operations on the object instance.
        ///// </summary>
        //? public TaskAwaiter<IHtmlContent> GetAwaiter() >>> Warns people to use ASYNC, won't work as expected, to annoying.
        //{
        //    return Render().GetAwaiter();
        //}

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ########################################################################################################################

    /// <summary>
    /// In most cases, this temp view page is only used once at the controller action level when a control is returned from a controller action (thus, without a parent view).
    /// </summary>
    class _TempViewPage : ViewPage<dynamic>
    {
        class _TempView : IView
        {
            public string Path => "";

            public Task RenderAsync(ViewContext context)
            {
                return Task.CompletedTask;
            }
        }

        internal _TempViewPage(ActionContext context)
        {
            ViewContext = new ViewContext();
            ViewContext.ActionDescriptor = context.ActionDescriptor;
            ViewContext.RouteData = context.RouteData;
            ViewContext.View = new _TempView();
            ViewContext.FormContext = new FormContext();
            EnsureRequiredServicesSet(context.HttpContext);
            //? ViewContext.Writer = new StreamWriter(context.Response.Body);
        }
    }

    // ########################################################################################################################

    public static class ControlBaseExtensions
    {
        /// <summary>
        /// Allows setting the 'Page' property using chained calls.
        /// </summary>
        public static T SetPage<T>(this T control, IViewPage page) where T : IControlBase { control.Page = page; return (T)control; }

        /// <summary>
        /// Get a control with a dummy view context in order to be rendered directly from a controller.
        /// </summary>
        /// <typeparam name="T">The type of control to create.</typeparam>
        /// <param name="controller">The controller to create the control for.</param>
        public static T GetControl<T>(this Controller controller) where T : class, IControlBase
        {
            var control = controller?.HttpContext?.GetService<T>();
            control.Page = ControlBase.GetCurrentOrDefaultPage(controller.ControllerContext);
            return (T)control;
        }

        /// <summary>
        /// Search for and add any public non-abstract class type that implements IControlBase to the services container.
        /// <para>If any control of type 'ControlType' implements an interface named 'IControlType' (eg. 'class ControlType: IControlType {}'),
        /// the interface will be used as the registered service type instead of the implementation type.</para>
        /// <para>Note: 'TryAddTransient()' is used to register the controls to allow injecting custom types.</para>
        /// </summary>
        /// <param name="assembly">The assembly that contains all the 'IControlBase' types to register with the services container.</param>
        public static void AddControls(this IServiceCollection services, Assembly assembly)
        {
            var types = from t in assembly.GetTypes() where typeof(IControlBase).IsAssignableFrom(t) select new { Type = t, Info = t.GetTypeInfo() };
            foreach (var type in types)
                if (type.Info.IsClass && !type.Info.IsAbstract && type.Info.IsPublic)
                {
                    var interfaceTypes = type.Info.GetInterfaces();
                    // ... detect if "Type" has an interface "IType" (typical pattern) and use that as the service type to the implementation type ...
                    Type itype = interfaceTypes?.FirstOrDefault(i => i.Name == "I" + type.Type.Name) ?? type.Type;
                    services.TryAddTransient(itype, type.Type);
                }
        }
    }


    // ########################################################################################################################
}

// (ControlBase is base on the ViewComponent concepts: https://www.youtube.com/watch?v=zxQBIfwqVoA)

// Special thanks to the original source that helped jump start the controls section:
// https://www.codeproject.com/Articles/32356/Custom-controls-in-ASP-NET-MVC
// The final code, however, is a rewrite specific to CDS purposes (rather than retyping the same typical code). The rewrite
// also focuses on using editor and display templates, rather than hard coding the control designs. This gives more design
// power to developers.