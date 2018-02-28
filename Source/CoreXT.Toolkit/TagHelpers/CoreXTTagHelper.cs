using CoreXT.ASPNet;
using CoreXT.Services.DI;
using CoreXT.Toolkit.Web;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Mvc.ViewFeatures.Internal;
using Microsoft.AspNetCore.Razor.TagHelpers;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;

namespace CoreXT.Toolkit.TagHelpers
{
    // ########################################################################################################################

    public delegate object RazorTemplateDelegate<in TModel>(TModel item);

    // ########################################################################################################################

    /// <summary>
    ///     A base abstract class usually inherited by tag helpers in CoreXT application environments. This base class includes
    ///     code to provide request context details to derived types.
    /// </summary>
    /// <seealso cref="T:Microsoft.AspNetCore.Razor.TagHelpers.TagHelper"/>
    public abstract class CoreXTTagHelper : ICoreXTTagHelper
    {
        // --------------------------------------------------------------------------------------------------------------------

        protected ICoreXTServiceProvider ServiceProvider { get; }

        protected IHttpContextAccessor ContextAccessor => _ContextAccessor ?? (_ContextAccessor = GetService<IHttpContextAccessor>());
        IHttpContextAccessor _ContextAccessor;

        protected HttpContext Context { get { return ContextAccessor.HttpContext; } }

        protected IViewPageRenderStack ViewPageRenderStack => _ViewPageRenderStack ?? (_ViewPageRenderStack = GetService<IViewPageRenderStack>());
        protected IViewPageRenderStack _ViewPageRenderStack;

        /// <summary>
        /// Derived types can use this convenience method to get services as required.
        /// <para>The 'Page' property </para>
        /// </summary>
        /// <typeparam name="T">The type of service object to get.</typeparam>
        /// <returns>The service object if found, or 'null' otherwise.</returns>
        protected T GetService<T>() where T : class { return ServiceProvider.GetService<T>(); }

        // --------------------------------------------------------------------------------------------------------------------

        [ViewContext]
        public ViewContext ViewContext { get; set; }

        // --------------------------------------------------------------------------------------------------------------------

        // These attributes are merged in GetTagBuilder() after HtmlAttributes.
        // This means that any custom settings are preserved.
        [HtmlAttributeNotBound]
        public TagHelperAttributeList Attributes { get; protected set; }

        /// <summary>
        /// A list of resource (such as JavaScript, CSS, etc.) required for this component.
        /// </summary>
        [HtmlAttributeNotBound]
        public IResourceList RequiredResources { get; private set; }

        /// <summary>
        /// Controls display or edit modes for this component.
        /// </summary>
        public RenderModes RenderMode { get; set; }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        ///     When a set of components are executed, their 'Init()' methods are first invoked in the specified order, then their
        ///     '???ProcessAsync()' methods are invoked in the specified order. Lower values are executed first.
        /// </summary>
        /// <value> The order. </value>
        public virtual int Order { get; set; }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Gets or sets class names for this component.
        /// <para>Note that setting this is a cumulative operation, in that each new value adds to an existing value.  To clear the class attribute pass in 'null'.</para>
        /// </summary>
        public virtual string Class
        {
            get { return Attributes.Value("class", string.Empty); }
            set { if (value != null) this.AddClass(value); else Attributes.MergeAttribute("class", null); }
        }

        /// <summary> Gets or sets the 'id' attribute. </summary>
        /// <value> The identifier. </value>
        public virtual string ID
        {
            get { return Attributes.Value("id", string.Empty); }
            set { Attributes.MergeAttribute("id", value); }
        }

        /// <summary> Gets or sets the name. </summary>
        /// <value> The name. </value>
        public virtual string Name
        {
            get { return Attributes.Value("name", string.Empty); }
            set { Attributes.MergeAttribute("name", value); }
        }

        /// <summary> Gets or sets the inline style for this component. </summary>
        /// <value> The style. </value>
        public virtual string Style
        {
            get { return Attributes.Value("style", string.Empty); }
            set { Attributes.MergeAttribute("style", value); }
        }

        /// <summary> Gets or sets the 'title' attribute, which is usually used to display help tips). </summary>
        /// <value> The 'title' attribute. </value>
        public virtual string HelpTip
        {
            get { return Attributes.Value("title", string.Empty); }
            set { Attributes.MergeAttribute("title", value); }
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// The page that will render the component, if any.
        /// If no page exists when the component is rendered, a temp page will be created.
        /// </summary>
        [HtmlAttributeNotBound]
        public IViewPage Page
        {
            get { return _Page ?? (_Page = ViewPageRenderStack?.Current); }
            set
            {
                _Page = value;
                if (_Page != null)
                    RequiredResources = new ResourceList(_Page.ViewContext); // (this will get rendered out only when the component is rendered)
            }
        }
        IViewPage _Page;

        // --------------------------------------------------------------------------------------------------------------------

        public CoreXTTagHelper(ICoreXTServiceProvider services)
        {
            ServiceProvider = services ?? throw new ArgumentNullException(nameof(services));
            Attributes = new TagHelperAttributeList();
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Renders this component for the purpose of output to a view.
        /// <para>Note: Because this method is expected to be used in views, it implicitly calls 
        /// 'ApplyResourcesToRequestContext()'. To render the component, use 'ToString()' instead.</para>
        /// </summary>
        public void WriteTo(TextWriter writer, HtmlEncoder encoder) // (implementation for IHtmlContent)
        {
            ApplyResourcesToRequestContext();
            writer.Write(ToString());
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Exists to support writing the tag to controller actions.
        /// </summary>
        /// <param name="context">The action context from a controller.</param>
        public async Task ExecuteResultAsync(ActionContext context)
        {
            if (Page == null)
                Page = GetCurrentOrDefaultPage(context);

            var tagContext = new TagHelperContext(new TagHelperAttributeList(), new Dictionary<object, object>(), Guid.NewGuid().ToString("N"));
            var tagOutput = new TagHelperOutput(GetType().Name, new TagHelperAttributeList(), null);
            await ProcessAsync(tagContext, tagOutput);
            if (string.IsNullOrWhiteSpace(context.HttpContext.Response.ContentType))
                context.HttpContext.Response.ContentType = "text/html";
            using (var tw = new StreamWriter(context.HttpContext.Response.Body, Encoding.UTF8, 65535, true))
            {
                tagOutput.WriteTo(tw, HtmlEncoder.Default);
            }
        }

        /// <summary>
        /// Try to get the current view from the DI container (most likely this is null if the component is being returned as an action response).
        /// </summary>
        /// <param name="context"></param>
        /// <returns></returns>
        public static IViewPage GetCurrentOrDefaultPage(ActionContext context)
        {
            var pageRenderStack = context.HttpContext.GetService<IViewPageRenderStack>();
            return pageRenderStack?.Current ?? new _TempViewPage(context);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Gets an attribute value on this component by name.
        /// </summary>
        /// <param name="name">The attribute name.</param>
        public virtual TagHelperAttribute GetAttribute(string name)
        {
            return Attributes.Value(name);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> A simple method filter to trim the CSS class name strings. </summary>
        /// <param name="classNames"> List of CSS class names. </param>
        /// <returns> An enumerator that allows 'foreach' to be used to process trimmed CSS class names in this collection. </returns>
        public static IEnumerable<string> TrimClassNames(IEnumerable<string> classNames)
        {
            return classNames.Select(c => c.Trim()).Where(c => !string.IsNullOrWhiteSpace(c));
        }

        /// <summary>
        /// Parses and returns the current list of class names as a string array.
        /// </summary>
        public string[] GetClassNames()
        {
            if (Attributes.TryGetAttribute("class", out var currentClassNames))
                return currentClassNames.Render().Trim().Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Select(c => c.ToLower()).ToArray();
            else
                return new string[0];
        }

        /// <summary>
        /// Returns true if the component has ALL the specified CSS class names set.
        /// </summary>
        /// <param name="classNames">A list of class names to test against.  If a single array item has spaces it will be parsed also as separate class names.</param>
        /// <returns>True if the current component current has all the given class names, or false otherwise.</returns>
        public virtual bool HasClass(params string[] classNames)
        {
            if (classNames.Length > 0)
            {
                // (note: individual string items may already be space delimited, and will be parsed later using {string}.Split())
                var classNamesStr = string.Join(" ", TrimClassNames(classNames));

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

        /// <summary>
        /// Adds the resources (JavaScript, CSS, etc.) required for this component to the view properties for deferred rendering.
        /// These resources are rendered via a post process before the page is returned to the client.
        /// </summary>
        public void ApplyResourcesToRequestContext()
        {
            if (Page != null && RequiredResources != null)
                foreach (var resource in RequiredResources)
                    Page.XT.RequireResource(resource);
        }

        // --------------------------------------------------------------------------------------------------------------------

        void ITagHelperComponent.Init(TagHelperContext context)
        {
            foreach (var attr in context.AllAttributes)
                Attributes.Add(attr);
            Initialize(context);
        }

        /// <summary>
        ///     Initializes the WebComponent with the given context. Additions to
        ///     <see cref="P:Microsoft.AspNetCore.Razor.TagHelpers.TagHelperContext.Items" /> should be done within this method to
        ///     ensure they're added prior to executing the children.
        /// </summary>
        /// <remarks>
        ///     When more than one <see cref="T:Microsoft.AspNetCore.Razor.TagHelpers.ITagHelper" /> runs on the same element,
        ///     <see cref="M:TagHelperOutput.GetChildContentAsync" /> may be invoked prior to
        ///     <see cref="M:Microsoft.AspNetCore.Razor.TagHelpers.TagHelper.ProcessAsync(Microsoft.AspNetCore.Razor.TagHelpers.TagHelperContext,Microsoft.AspNetCore.Razor.TagHelpers.TagHelperOutput)" />.
        /// </remarks>
        /// <param name="context"> Contains information associated with the current HTML tag. </param>
        /// <seealso cref="M:Microsoft.AspNetCore.Razor.TagHelpers.TagHelper.Init(TagHelperContext)"/>
        public virtual void Initialize(TagHelperContext context) { }

        internal virtual void _Init(TagHelperContext context, TagHelperOutput output) { }

        async Task ITagHelperComponent.ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            _Init(context, output); // (allow internal initialization for derived components before anything else)
            await PreProcessAsync(context, output);
            await ProcessAsync(context, output);
            await PostProcessAsync(context, output);
        }

        /// <summary>
        ///     Allows for setup and configuration prior to processing.
        ///     <para>This is handy to allow derived base-type classes to implement common logic shared by child classes. </para>
        /// </summary>
        /// <param name="context"> The tag component context. </param>
        /// <param name="output"> The component's output. </param>
        public virtual void PreProcess(TagHelperContext context, TagHelperOutput output) { }

        /// <summary>
        ///     Allows for setup and configuration prior to processing.
        ///     <para>This is handy to allow derived base-type classes to implement common logic shared by child classes. </para>
        /// </summary>
        /// <param name="context"> The tag component context. </param>
        /// <param name="output"> The component's output. </param>
        public virtual Task PreProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            PreProcess(context, output);
            return Task.CompletedTask;
        }

        /// <summary> Synchronously processes the tag and renders output. </summary>
        /// <param name="context"> The tag component context. </param>
        /// <param name="output"> The component's output. </param>
        public virtual void Process(TagHelperContext context, TagHelperOutput output) { }

        /// <summary> Asynchronously processes the tag and renders output. </summary>
        /// <param name="context"> The tag component context. </param>
        /// <param name="output"> The component's output. </param>
        public virtual Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            Process(context, output);
            return Task.CompletedTask;
        }

        /// <summary>
        ///     Allows for any final post processing.
        ///     <para>This is handy to allow derived base-type classes to implement common logic shared by child classes. </para>
        /// </summary>
        /// <param name="context"> The tag component context. </param>
        /// <param name="output"> The component's output. </param>
        public void PostProcess(TagHelperContext context, TagHelperOutput output) { }

        /// <summary>
        ///     Allows for any final post processing.
        ///     <para>This is handy to allow derived base-type classes to implement common logic shared by child classes. </para>
        /// </summary>
        /// <param name="context"> The tag component context. </param>
        /// <param name="output"> The component's output. </param>
        /// <returns> An asynchronous result. </returns>
        public virtual Task PostProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            PostProcess(context, output);
            return Task.CompletedTask;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Encodes an HTML tag attribute. </summary>
        /// <param name="value"> The value. </param>
        /// <returns> A string. </returns>
        public static string EncodeAttribute(string value) => HttpUtility.HtmlAttributeEncode(value);

        /// <summary> Decodes an HTML tag attribute. </summary>
        /// <param name="value"> The value. </param>
        /// <returns> A string. </returns>
        public static string DecodeAttribute(string value) => HttpUtility.HtmlDecode(value);

        /// <summary> Encodes HTML text. </summary>
        /// <param name="value"> The value. </param>
        /// <returns> A string. </returns>
        public static string EncodeHTML(string value) => HttpUtility.HtmlEncode(value);

        /// <summary> Decodes HTML encoded text. </summary>
        /// <param name="value"> The value. </param>
        /// <returns> A string. </returns>
        public static string DecodeHTML(string value) => HttpUtility.HtmlDecode(value);

        /// <summary> Parses a URL query string using the default UTF8 encoding. </summary>
        /// <param name="value"> The value. </param>
        /// <returns> A string. </returns>
        public static NameValueCollection ParseQueryString(string value) => HttpUtility.ParseQueryString(value);

        /// <summary> Escapes a string for use within JavaScript code. </summary>
        /// <param name="value"> The string value to escape. </param>
        /// <param name="addDoubleQuotes"> (Optional) True to add double quotes around the encoded JavaScript string. </param>
        /// <returns> A string. </returns>
        public static string EscapeJSString(string value, bool addDoubleQuotes = false) => HttpUtility.JavaScriptStringEncode(value, addDoubleQuotes);

        /// <summary> Encodes a string for use with URLs (typically for setting query parameters). </summary>
        /// <param name="value"> Text to encode. </param>
        /// <returns> The encoded string. </returns>
        public static string URLEncode(string value) => HttpUtility.UrlEncode(value);

        /// <summary> Decodes a string for use with URLs (typically for decoding query parameter values). </summary>
        /// <param name="value"> Text to decode. </param>
        /// <returns> The decoded string. </returns>
        public static string URLDecode(string value) => HttpUtility.UrlDecode(value);

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ########################################################################################################################

    /// <summary>
    /// In most cases, this temp view page is only used once at the controller action level when a component is returned from a controller action (thus, without a parent view).
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
            ConfigureRequiredServices(context.HttpContext);
            //? ViewContext.Writer = new StreamWriter(context.Response.Body);
        }
    }

    // ########################################################################################################################

    /// <summary> Executes the before view render action for a web component. </summary>
    /// <param name="viewContext"> Context for the view. </param>
    /// <param name="childContent"> The child content that was rendered just prior to rendering the view. </param>
    public delegate void OnBeforeViewRender(ViewContext viewContext, TagHelperContent childContent);

    public abstract class WebComponent : CoreXTTagHelper, IWebComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        protected IViewRenderer ViewRenderer => _ViewRenderer ?? (_ViewRenderer = GetService<IViewRenderer>());
        protected IViewRenderer _ViewRenderer;

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        ///     Gets the search locations (paths) used to locate this component's view (.cshtml files). This defaults to
        ///     "/TagHelpers", and some others based on the type's namespace, but derived types can add other paths.
        ///     <para>Reading this property builds the list only once per new instance and returns the same list on subsequent
        ///     reads. Developers can override this property and return a fixed path for best efficiency if needed. Having a list
        ///     that can be modified introduces an ability to provide dynamic search locations based on internal states (such as
        ///     display mode vs edit mode using the base 'RenderMode' property)</para>
        /// </summary>
        /// <value> The view search locations. </value>
        public virtual List<string> ViewSearchLocations
        {
            get
            {
                if (_ViewSearchLocations != null) return _ViewSearchLocations;
                var thisType = GetType();
                _ViewSearchLocations = new List<string> { "/TagHelpers", "/" + DottedNamesToPath(thisType.Namespace) };
                var searchNameSpaces = new List<string[]> {
                    Assembly.GetExecutingAssembly().GetName().Name.Split('.'),
                    Assembly.GetEntryAssembly().GetName().Name.Split('.')
                };
                var thisTypeNSParts = thisType.Namespace.Split('.');
                var searchPaths = searchNameSpaces.Select(s => TrimMatchingStartNames(thisTypeNSParts.ToList(), s));
                foreach (var pathParts in searchPaths)
                {
                    var path = "/" + JoinURLPathNames(pathParts);
                    if (!_ViewSearchLocations.Contains(path))
                        _ViewSearchLocations.Add(path);
                }
                return _ViewSearchLocations;
            }
        }
        List<string> _ViewSearchLocations;

        /// <summary> Join URL path names (i.e. into "A/B/C"). Any null/empty strings are skipped. </summary>
        /// <param name="names"> The path names to join. </param>
        /// <returns> A string. </returns>
        public static string JoinURLPathNames(IEnumerable<string> names) => string.Join("/", names.Where(s => !string.IsNullOrWhiteSpace(s)).Select(s => s.Trim()));

        /// <summary> Converts '.' to '/'. </summary>
        /// <param name="name"> Dot delimited names. </param>
        /// <returns> A string. </returns>
        public static string DottedNamesToPath(string name) => JoinURLPathNames(name.Split('.'));

        /// <summary> Trim all matching names from the start until difference is found, then return the remainder. </summary>
        /// <param name="namesToTrim"> The names to trim. </param>
        /// <param name="namesToMatch"> Names to match with. </param>
        /// <returns> A List&lt;string&gt; </returns>
        public static List<string> TrimMatchingStartNames(List<string> namesToTrim, IList<string> namesToMatch) // TODO: Match this into a LINQ extension.
        {
            int i = 0, n1 = namesToTrim.Count, n2 = namesToMatch.Count;
            do
            {
                if (i >= n1 || i >= n2 || namesToTrim[i] != namesToMatch[i])
                    break;
                ++i;
            } while (true);
            return namesToTrim.GetRange(i, namesToTrim.Count - i);
        }

        /// <summary> Return all matching names from the start until difference is found, trimming the remainder. </summary>
        /// <param name="namesToTrim"> The names to trim. </param>
        /// <param name="namesToMatch"> Names to match with. </param>
        /// <returns> A List&lt;string&gt; </returns>
        public static List<string> TrimNonMatchingEndNames(List<string> namesToTrim, IList<string> namesToMatch) // TODO: Match this into a LINQ extension.
        {
            for (int i = 0, n1 = namesToTrim.Count, n2 = namesToMatch.Count; i < n1 && i < n2; ++i)
                if (namesToTrim[i] != namesToMatch[i])
                    return namesToTrim.GetRange(0, i);
            return namesToTrim;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        ///     A unique ID for this component that identifies the source of any associated data value. This is usually an entity ID
        ///     (primary key value).
        ///     <para>This is helpful when multiple entities or objects are being output to a page.
        ///     If a list of plain old CLR (POCO) objects are used without IDs, a simple numerical iteration index value may be
        ///     sufficient.  This value is used when return 'UniqueID' and 'UniqueName', along with any set 'id' attribute. </para>
        ///     <para>Note: If a value for "ID" exists, the EntityID value will be added as a suffix, delimited by an period.</para>
        /// </summary>
        /// <value> The identifier of the data source. </value>
        public string ModelID { get; set; }

        /// <summary>
        /// Returns a unique ID for this component, usually used as the "final" ID attribute value rendered to the output.
        /// <para>An "id" attribute, 'ModelID', or both, should exist.</para>
        /// </summary>
        public string UniqueID { get { return Strings.Append(ID, ModelID, "_"); } }

        /// <summary>
        /// Returns a unique ID for this component, usually used as the "final" NAME attribute value rendered to the output.
        /// </summary>
        public string UniqueName { get { return Strings.Append(Name, ModelID, "_"); } }

        /// <summary>
        ///     If not null, this is a data source use by this tag helper to construct it's view. Typically it's either a single
        ///     entity instance, or an array of entities. The usage is "user-defined" and depends on the derived implementation.
        ///     <para>By default reading this gets the underlying 'ViewContext.ViewData.Model' object. Setting this property will
        ///     set a specific data source for this tag helper instance, leaving the view model as is.</para>
        /// </summary>
        /// <value> The data source. </value>
        public virtual object Model { get => _Model ?? ViewContext.ViewData.Model; set => _Model = value; }
        object _Model;

        /// <summary> Gets or sets a value indicating whether the element ID is generated by default using a GUID. </summary>
        /// <value> True to automate the ID generation, or false if not. </value>
        public bool EnableAutomaticID { get; set; }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// The raw inner HTML that will be placed within the body of the rendered HTML for this component, if supported.
        /// <para>This should be overridden in derived classes to throw "NotSupportedException" if content output is not supported.</para>
        /// <para>Note: The base 'Content()' method of same name is hidden to support this property.  Developers should be using 'GetViewResult()' instead, which has better conversion support for more types.</para>
        /// </summary>
        public virtual object Content { get { return _Content; } set { _Content = value; } }
        object _Content;

        /// <summary>
        /// Supports razor template delegates to set the content that will be placed within the body of the rendered HTML for this component, if supported.
        /// Setting this value will take precedence over any previously set 'Content' value.
        /// <para>This should be overridden in derived classes to throw "NotSupportedException" if not supported.</para>
        /// <para>Note: The base 'Content()' method of same name is hidden to support this property.  Developers should be using 'GetViewResult()' instead, which has better conversion support for more types.</para>
        /// </summary>
        public virtual RazorTemplateDelegate<object> ContentTemplate { get; set; }

        // --------------------------------------------------------------------------------------------------------------------

        public WebComponent(ICoreXTServiceProvider services) : base(services)
        {
        }

        internal override void _Init(TagHelperContext context, TagHelperOutput output)
        {
            base._Init(context, output);
            context.Items[GetType()] = this;
            output.TagName = null; // (hide the outer tag by default)
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        ///     Attempts to render any view or explicitly set content first.  If no underlying view is found, or 'Content' or
        ///     'ContentTemplate' is null, then false is returned.
        ///     <para>Derived components should call this first, and if false, can continue to render their own inner tag content.
        ///     </para>
        /// </summary>
        /// <param name="context"> The context. </param>
        /// <param name="output"> The output. </param>
        /// <param name="onBeforeViewRender">
        ///     (Optional) A callback to trigger just before the view is rendered, and just after the child content is pulled. If no
        ///     view was found, the callback will not trigger. This allows components to perform some setup just prior to the view
        ///     getting rendered (such as getting references to the child components from 'context.Items[]' to configure special
        ///     content).
        /// </param>
        /// <returns> An asynchronous result that yields true if it succeeds, false if it fails. </returns>
        public async Task<bool> ProcessContent(TagHelperContext context, TagHelperOutput output, OnBeforeViewRender onBeforeViewRender = null)
        {
            // ... try rendering the view first, if one exists (otherwise null is returned) ...
            var viewContent = await RenderView(false, onBeforeRender: async viewContext => { var childContent = await output.GetChildContentAsync(); Content = childContent; onBeforeViewRender?.Invoke(viewContext, childContent); }); // (if a view is found, set the 
            if (viewContent != null)
            {
                output.Content.SetHtmlContent(viewContent); // (view was found; the view is now responsible to render the inner content, if supported)
            }
            else if (Content != null || ContentTemplate != null)
            {
                // ... no view exists; however, there IS content explicitly set, so render that as the inner HTML ...
                var result = RenderContent();
                output.Content.SetHtmlContent(result);
            }
            else return false;
            return true;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        ///     Renders the underlying view for this tag helper. The current reference in 'DataSource' is passed as the view model.
        ///     <para> Note: If 'required' is false, and the view cannot be found, a null value
        ///     will be returned. </para>
        /// </summary>
        /// <param name="required">
        ///     (Optional) True if the view is required. If required and not found an exception will be thrown. Default is true.
        /// </param>
        /// <param name="name"> (Optional) A view name to override the default name. </param>
        /// <param name="onBeforeRender"> (Optional) A callback to trigger just before the view is rendered. </param>
        /// <returns> An asynchronous result that yields HTML. </returns>
        /// <seealso cref="M:CoreXT.Toolkit.TagHelpers.ICoreXTTagHelper.RenderView(string,bool)"/>
        public async Task<HtmlString> RenderView(bool required = true, string name = null, Action<ViewContext> onBeforeRender = null)
        {
            var result = await ViewRenderer.RenderAsync(ViewSearchLocations, name ?? GetType().Name, this, required, onBeforeRender);
            return new HtmlString(result);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        ///     Gets a view component descriptor for use with calling 'RenderViewComponent()' to render view components.
        /// </summary>
        /// <exception cref="ArgumentNullException"> Thrown when one or more required arguments are null. </exception>
        /// <exception cref="MissingMethodException"> Thrown when a Missing Method error condition occurs. </exception>
        /// <param name="componentType"> Type of the component to render. </param>
        /// <param name="actionMethodName">
        ///     (Optional) The name of the action method to execute on the view component (the default is "InvokeAsync").
        /// </param>
        /// <returns> The component descriptor. </returns>
        public virtual ViewComponentDescriptor GetViewComponentDescriptor(Type componentType, string actionMethodName = null)
        {
            if (componentType == null)
                throw new ArgumentNullException(nameof(componentType));

            if (string.IsNullOrWhiteSpace(actionMethodName))
                actionMethodName = "InvokeAsync";

            // ... the value is not valid, so set it now; first get a service to look it up in case this has been created already before ..

            var descriptorLibrary = GetService<Components.IViewComponentDescriptorLibrary>();
            ViewComponentDescriptor descriptor;

            if (descriptorLibrary != null)
            {
                lock (descriptorLibrary)
                {
                    descriptor = descriptorLibrary.Value(componentType);
                    if (descriptor != null) return descriptor;
                }
            }

            var actionMethod = componentType.GetMethod(actionMethodName, BindingFlags.Public | BindingFlags.Instance | BindingFlags.FlattenHierarchy)
                ?? throw new MissingMethodException(componentType.Name, actionMethodName);

            descriptor = new ViewComponentDescriptor
            {
                DisplayName = componentType.Name,
                FullName = componentType.FullName,
                Id = componentType.FullName,
                MethodInfo = actionMethod,
                Parameters = null,
                ShortName = componentType.Name,
                TypeInfo = componentType.GetTypeInfo()
            };

            if (descriptorLibrary != null)
                lock (descriptorLibrary)
                    descriptorLibrary[componentType] = descriptor;

            return descriptor;
        }

        /// <summary>
        ///     Renders a given view result and return it as an IHtmlContent based value, which can be written to an output stream
        ///     via a 'TextWriter' instance, or placed directly on a razor view using '@'.
        ///     <para>To render to a string value, just call either 'ToString()' or 'Render()' methods.</para>
        /// </summary>
        /// <exception cref="ArgumentNullException"> Thrown when one or more required arguments are null. </exception>
        /// <param name="viewResult"> The view component result to render. </param>
        /// <param name="descriptor"> The descriptor. </param>
        /// <returns> An asynchronous result that yields an IHtmlContent. </returns>
        public virtual async Task<IHtmlContent> RenderViewComponent(IViewComponentResult viewResult, ViewComponentDescriptor descriptor)
        {
            if (viewResult == null)
                throw new ArgumentNullException(nameof(viewResult));

            if (descriptor == null)
                throw new ArgumentNullException(nameof(descriptor));

            try
            {
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
        ///     Renders a given view result and return it as an IHtmlContent based value, which can be written to an output stream
        ///     via a 'TextWriter' instance, or placed directly on a razor view using '@'.
        ///     <para>To render to a string value, just call either 'ToString()' or 'Render()' methods.</para>
        /// </summary>
        /// <typeparam name="T"> The view component type. </typeparam>
        /// <param name="viewResult">
        ///     The view component result to render. This is usually obtain by calling one of the 'View()' methods on the view
        ///     component.
        /// </param>
        /// <param name="viewComponent"> The descriptor. </param>
        /// <param name="actionMethodName">
        ///     (Optional) The name of the action method to execute on the view component (the default is "InvokeAsync").
        /// </param>
        /// <returns> An asynchronous result that yields an IHtmlContent. </returns>
        public virtual async Task<IHtmlContent> RenderViewComponent<T>(IViewComponentResult viewResult, T viewComponent, string actionMethodName = null)
            where T : ViewComponent
            => await RenderViewComponent(viewResult, GetViewComponentDescriptor(viewComponent?.GetType(), actionMethodName));

        /// <summary>
        ///     Renders a given view result and return it as an IHtmlContent based value, which can be written to an output stream
        ///     via a 'TextWriter' instance, or placed directly on a razor view using '@'.
        ///     <para>To render to a string value, just call either 'ToString()' or 'Render()' methods.</para>
        /// </summary>
        /// <typeparam name="T"> The view component type. </typeparam>
        /// <param name="viewResult">
        ///     The view component result to render. This is usually obtain by calling one of the 'View()' methods on the view
        ///     component.
        /// </param>
        /// <param name="actionMethodName">
        ///     (Optional) The name of the action method to execute on the view component (the default is "InvokeAsync").
        /// </param>
        /// <returns> An asynchronous result that yields an IHtmlContent. </returns>
        public virtual async Task<IHtmlContent> RenderViewComponent<T>(IViewComponentResult viewResult, string actionMethodName = null)
            where T : ViewComponent
            => await RenderViewComponent(viewResult, GetViewComponentDescriptor(typeof(T), actionMethodName));

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Called within component views to render the content from either the 'ContentTemplate' or 'Content' properties.
        /// 'ContentTemplate' will always take precedence over setting the 'Content' property.
        /// </summary>
        public virtual IHtmlContent RenderContent()
            => ContentTemplate != null ? RenderContent(GetViewResult(ContentTemplate)) : RenderContent(Content); //x WebUtility.HtmlEncode()

        /// <summary>
        /// Typically called within derived component views to render content.
        /// </summary>
        public virtual IHtmlContent RenderContent(object content)
            => (content is IHtmlContent) ? (IHtmlContent)content
            : (content is string) ? new HtmlString((string)content)
            : new HtmlString(content?.ND());
        //? : (content is IViewComponentResult) ? await RenderView((IViewComponentResult)content)
        //? : await RenderView(GetViewResult(content)); //x WebUtility.HtmlEncode()

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Renders the attributes for this component.
        /// </summary>
        /// <param name="includeID">If true, the ID attribute is included (default is false).</param> 
        /// <param name="includeName">If true, the NAME attribute is included (default is false).</param> 
        /// <param name="attributesToIgnore">Attributes not to include in the output. 
        /// By default, if nothing is specified, the ID and NAME attributes are skipped, since these are usually set another way in the templates.
        /// Giving ANY attribute to skip will bypass this default, so you'll have to explicitly name those to 
        /// If these are needed, simply pass in an empty string for an attribute name to ignore.</param>
        /// <returns></returns>
        public virtual IHtmlContent RenderAttributes(bool includeID = false, bool includeName = false, params string[] attributesToIgnore)
        {
            if (Attributes.Count == 0)
                return new HtmlString("");

            // ... render the attributes ...

            var renderedAttributes = Attributes.Select(a => new KeyValuePair<string, string>(a.Name.ToLower(), a.Render().Trim()));

            // ... filter out empty attributes ...

            var attributes = renderedAttributes.Where(a => !string.IsNullOrEmpty(a.Value)).ToDictionary(a => a.Key, a => a.Value);

            // ... get the attributes to skip ...

            var ignored = new List<string>(attributesToIgnore.Select(a => (a ?? "").Trim()).Where(a => !string.IsNullOrWhiteSpace(a)).Select(a => a.ToLower()));

            if (includeID)
            {
                ignored.Remove("id"); // (explicit request to include this, so remove from the ignore list if set)
                attributes["id"] = UniqueID;
            }
            else if (!ignored.Contains("id"))
                ignored.Add("id");

            if (includeName)
            {
                ignored.Remove("name"); // (explicit request to include this, so remove from the ignore list if set)
                attributes["name"] = UniqueName;
            }
            else if (!ignored.Contains("name"))
                ignored.Add("name");

            // ... get the non ID and NAME attributes for output ...

            return new HtmlString(string.Join(" ",
                (from a in attributes
                 where ignored.Count == 0 || !ignored.Contains(a.Key)
                 select a.Key + "=\"" + EncodeAttribute(a.Value) + "\"")));
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Converts given content to an IViewComponentResult for rendering. </summary>
        /// <param name="content">
        ///     A value that represents content to render as a view result. The content must either be a string, implement
        ///     IHtmlContent or IViewComponentResult, or override the 'Object.ToString()' method.
        ///     <para>The precedence is IViewComponentResult, IHtmlContent, string, then Object.ToString().</para>
        /// </param>
        /// <returns> Returns an IViewComponentResult result. </returns>
        public virtual IViewComponentResult GetViewResult(object content)
        {
            return GetViewResultFromContent(content);
        }

        /// <summary>
        /// An async method to return an IHtmlContent instance from the specified template delegate.
        /// This is used in controls to support rendering razor template delegates into the underlying views, where applicable.
        /// </summary>
        public virtual IViewComponentResult GetViewResult(RazorTemplateDelegate<object> templateDelegate)
        {
            if (templateDelegate != null)
            {
                var contentResult = templateDelegate(Model); // (note: this may be a razor template delegate)
                // TODOTEST: Test that 'ViewData.Model' is the correct one to pass in above.
                return GetViewResult(contentResult); // (coerce the value to a view result if not already one)
            }
            return GetViewResult(HtmlString.Empty);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Converts a model member name to a valid attribute name. </summary>
        /// <param name="name"> A property name. </param>
        /// <returns> A string. </returns>
        public static string ModelMemberNameToAttributeName(string name)
        {
            // (converts "someMemberName" format to "some-member-name")
            return Regex.Replace(name, "([a-z])([A-Z])", m => m.Groups[1].Value + "-" + m.Groups[2].Value.ToLower());
        }

        /// <summary> Converts given content to an IViewComponentResult for rendering. </summary>
        /// <exception cref="InvalidOperationException"> Thrown when the requested type . </exception>
        /// <param name="content">
        ///     A value that represents content to render as a view result. The content must either be a string, implement
        ///     IHtmlContent or IViewComponentResult, or override the 'Object.ToString()' method.
        ///     <para>The precedence is IViewComponentResult, IHtmlContent, string, then Object.ToString().</para>
        /// </param>
        /// <returns> Returns an IViewComponentResult result. </returns>
        public static IViewComponentResult GetViewResultFromContent(object content)
        {
            if (content == null)
                return new ContentViewComponentResult(string.Empty);
            else
            {
                var componentResult = content as IViewComponentResult;
                if (componentResult != null)
                    return componentResult;

                var htmlContent = content as IHtmlContent;
                if (htmlContent != null)
                    return new HtmlContentViewComponentResult(htmlContent);

                var stringResult = content as string;
                if (stringResult != null)
                    return new ContentViewComponentResult(stringResult);

                var valueType = content.GetType().GetTypeInfo();

                if (!valueType.IsPrimitive)
                {
                    var valueToStringDeclaringType = ((Func<string>)content.ToString).GetMethodInfo().DeclaringType;
                    if (valueToStringDeclaringType == typeof(object))
                        throw new InvalidOperationException(string.Format("The specified content object cannot be rendered. The content must either be a {0} or primitive type, implement {1} or {2}, or override the '{3}' method.",
                            typeof(string).Name,
                            nameof(IHtmlContent),
                            nameof(IViewComponentResult),
                            nameof(Object.ToString)));
                }

                stringResult = content.ToString();

                return new ContentViewComponentResult(stringResult);
            }
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ########################################################################################################################
}
