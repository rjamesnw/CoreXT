using CoreXT.ASPNet;
using CoreXT.MVC;
using CoreXT.Services.DI;
using CoreXT.Toolkit.Web;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Razor.TagHelpers;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using System.Web;

namespace CoreXT.Toolkit.TagComponents
{
    // ####################################################################################

    /// <summary>
    ///     An abstract base class usually inherited by CoreXT web components. This base class includes code to provide request
    ///     and view context details to derived types, and contains many more useful features and methods for working with tag
    ///     development. The underlying tag helper context and output methods and properties are merged into this type for
    ///     convenience.
    /// </summary>
    /// <seealso cref="T:CoreXT.Toolkit.TagComponents.ITagComponent"/>
    /// <seealso cref="T:Microsoft.AspNetCore.Razor.TagHelpers.TagHelper"/>
    public abstract partial class TagComponent : ITagComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Gets the service provider. </summary>
        /// <value> The service provider. </value>
        protected ICoreXTServiceProvider ServiceProvider { get; }

        /// <summary> Gets the context accessor. </summary>
        /// <value> The context accessor. </value>
        protected IHttpContextAccessor ContextAccessor => _ContextAccessor ?? (_ContextAccessor = GetService<IHttpContextAccessor>());
        /// <summary> The context accessor. </summary>
        IHttpContextAccessor _ContextAccessor;

        /// <summary> Gets a context for the HTTP. </summary>
        /// <value> The HTTP context. </value>
        protected HttpContext HttpContext { get { return ContextAccessor.HttpContext; } }

        /// <summary> Gets a stack of view page renders. </summary>
        /// <value> A stack of view page renders. </value>
        protected IViewPageRenderStack ViewPageRenderStack => _ViewPageRenderStack ?? (_ViewPageRenderStack = GetService<IViewPageRenderStack>());
        /// <summary> Stack of view page renders. </summary>
        protected IViewPageRenderStack _ViewPageRenderStack;

        /// <summary>
        ///     Derived types can use this convenience method to get services as required.
        ///     <para>The 'Page' property </para>
        /// </summary>
        /// <typeparam name="T"> The type of service object to get. </typeparam>
        /// <returns> The service object if found, or 'null' otherwise. </returns>
        protected T GetService<T>() where T : class { return ServiceProvider.GetService<T>(); }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Gets or sets a context for the view. </summary>
        /// <value> The view context. </value>
        [ViewContext]
        [HtmlAttributeNotBound]
        public ViewContext ViewContext { get => _ViewContext ?? ViewPageRenderStack?.Current?.ViewContext; set => _ViewContext = value; }
        ViewContext _ViewContext;

        /// <summary> If 'ViewContext' is set, this returns the underlying IView instance as a RazorView, or null if the view is not a RazorView. </summary>
        /// <value> The razor view. </value>
        public RazorView RazorView => ViewContext?.View as RazorView;

        /// <summary>
        ///     The page that will render the component, if any. If no page exists when the component is rendered, a temp page will
        ///     be created.
        /// </summary>
        /// <value> The page. </value>
        [HtmlAttributeNotBound]
        public IViewPage Page
        {
            get { return _Page ?? (_Page = RazorView?.RazorPage as IViewPage ?? (IViewPage)ViewPageRenderStack?.Current); }
            set
            {
                _Page = value;
                if (_Page != null)
                    RequiredResources = new ResourceList(_Page.ViewContext); // (this will get rendered out only when the component is rendered)
            }
        }
        /// <summary> The page. </summary>
        IViewPage _Page;

        /// <summary>
        /// Gets a URL helper to build URLs for ASP.NET MVC within an application.
        /// </summary>
        public IUrlHelper Url => ViewContext != null ? (_Url = GetService<IUrlHelperFactory>()?.GetUrlHelper(ViewContext))
            : throw new InvalidOperationException("Url helper not available. Make sure the 'IUrlHelperFactory' service is registered on startup, and that the 'ViewContext' property is not null.");
        IUrlHelper _Url;

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Contains original information related to the execution the current tag component instance. </summary>
        /// <exception cref="InvalidOperationException"> Thrown when the requested operation is invalid. </exception>
        /// <value> The original tag component context. </value>
        /// <seealso cref="P:CoreXT.Toolkit.TagComponents.ITagComponent.TagContext"/>
        public TagHelperContext TagContext { get => _TagContext ?? throw new InvalidOperationException("Invalid access: 'TagContext' is not set yet. Make sure to ONLY access this on or after 'Initialize()' or within one of the '*Process*()' methods."); private set => _TagContext = value; }
        /// <summary> Context for the tag. </summary>
        TagHelperContext _TagContext;

        /// <summary>
        ///     Contains methods and properties used to render this component as a tag. See also: <seealso cref="WebComponent"/>
        /// </summary>
        /// <exception cref="InvalidOperationException"> Thrown when the requested operation is invalid. </exception>
        /// <value> The tag component output configurations. </value>
        /// <seealso cref="P:CoreXT.Toolkit.TagComponents.ITagComponent.TagOutput"/>
        public TagHelperOutput TagOutput { get => _TagOutput ?? throw new InvalidOperationException("Invalid access: 'TagOutput' is not set yet. Make sure to ONLY access the output within one of the '*Process*()' methods."); private set => _TagOutput = value; }
        /// <summary> The tag output. </summary>
        TagHelperOutput _TagOutput;

        // --------------------------------------------------------------------------------------------------------------------

        //// These attributes are set from the original tag context attributes.
        //// This means that any user-added attributes are copied forward automatically for use within this tag component.
        //[HtmlAttributeNotBound]
        //public TagHelperAttributeList Attributes { get; protected set; }

        /// <summary> A list of resource (such as JavaScript, CSS, etc.) required for this component. </summary>
        /// <value> The required resources. </value>
        [HtmlAttributeNotBound]
        public IResourceList RequiredResources { get; private set; }

        /// <summary> Controls display or edit modes for this component. </summary>
        /// <value> The render mode. </value>
        public RenderModes RenderMode { get; set; }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        ///     When a set of components are executed, their 'Initialize()' methods are first invoked in the specified order, then their
        ///     '*Process*()' methods are invoked in the specified order. Lower values are executed first.
        /// </summary>
        /// <value> Returns the order value. </value>
        public virtual int Order { get; set; }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        ///     Gets or sets class names for this component.
        ///     <para>Note that setting this is a cumulative operation, in that each new value adds to an existing value.  To clear
        ///     the class attribute pass in 'null'.</para>
        /// </summary>
        /// <value> The class. </value>
        [HtmlAttributeNotBound]
        public virtual string Class
        {
            get { return Attributes.Value("class", string.Empty); }
            set { Attributes.MergeAttribute("class", value); }
        }

        /// <summary> Gets or sets the 'id' attribute. </summary>
        /// <value> The identifier. </value>
        [HtmlAttributeNotBound]
        public virtual string ID
        {
            get { return Attributes.Value("id", string.Empty); }
            set { Attributes.MergeAttribute("id", value); }
        }

        /// <summary> Gets or sets the name. </summary>
        /// <value> The name. </value>
        [HtmlAttributeNotBound]
        public virtual string Name
        {
            get { return Attributes.Value("name", string.Empty); }
            set { Attributes.MergeAttribute("name", value); }
        }

        /// <summary> Gets or sets the inline style for this component. </summary>
        /// <value> The style. </value>
        [HtmlAttributeNotBound]
        public virtual string Style
        {
            get { return Attributes.Value("style", string.Empty); }
            set { Attributes.MergeAttribute("style", value); }
        }

        /// <summary>
        ///     Gets or sets the 'title' attribute, which is usually used to display native browser help tip pop-ups when the cursor
        ///     is over the element).
        /// </summary>
        /// <value> The 'title' attribute. </value>
        [HtmlAttributeNotBound]
        public virtual string HelpTip
        {
            get { return Attributes.Value("title", string.Empty); }
            set { Attributes.MergeAttribute("title", value); }
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Constructor. </summary>
        /// <exception cref="ArgumentNullException"> Thrown when one or more required arguments are null. </exception>
        /// <param name="services"> The services. </param>
        public TagComponent(ICoreXTServiceProvider services)
        {
            ServiceProvider = services ?? throw new ArgumentNullException(nameof(services));
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        ///     Renders this component for the purpose of output to a view.
        ///     <para>Note: Because this method is expected to be used in views, it implicitly calls
        ///     'ApplyResourcesToRequestContext()'. To render the component, use 'ToString()' instead.</para>
        /// </summary>
        /// <param name="writer"> The writer. </param>
        /// <param name="encoder"> The encoder. </param>
        public virtual void WriteTo(TextWriter writer, HtmlEncoder encoder) // (implementation for IHtmlContent)
        {
            ApplyResourcesToRequestContext();

            var tagContext = TagContext ?? new TagHelperContext(new TagHelperAttributeList(), new Dictionary<object, object>(), Guid.NewGuid().ToString("N"));
            var tagOutput = TagOutput ?? new TagHelperOutput(GetType().Name, new TagHelperAttributeList(), null);

            ((ITagHelper)this).Init(tagContext);
            ((ITagHelper)this).ProcessAsync(tagContext, tagOutput).Wait(300 * 1000);

            writer.Write(TagOutput.Render());
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Exists to support writing the tag to controller actions. </summary>
        /// <param name="context"> The action context from a controller. </param>
        /// <returns> An asynchronous result. </returns>
        public async Task ExecuteResultAsync(ActionContext context)
        {
            if (Page == null)
                Page = GetCurrentOrTempPage(context);

            var tagContext = TagContext ?? new TagHelperContext(new TagHelperAttributeList(), new Dictionary<object, object>(), Guid.NewGuid().ToString("N"));
            var tagOutput = TagOutput ?? new TagHelperOutput(GetType().Name, new TagHelperAttributeList(), null);

            ((ITagHelper)this).Init(tagContext);
            await ((ITagHelper)this).ProcessAsync(tagContext, tagOutput);

            if (string.IsNullOrWhiteSpace(context.HttpContext.Response.ContentType))
                context.HttpContext.Response.ContentType = "text/html";

            using (var tw = new StreamWriter(context.HttpContext.Response.Body, Encoding.UTF8, 65535, true))
            {
                tagOutput.WriteTo(tw, HtmlEncoder.Default);
            }
        }

        /// <summary>
        ///     Try to get the current view, or create a new temp one).
        /// </summary>
        /// <param name="context"> . </param>
        /// <returns> The current or default page. </returns>
        protected IViewPage GetCurrentOrTempPage(ActionContext context)
        {
            return Page ?? new _TempViewPage(context);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Gets an attribute entry on this component by name. </summary>
        /// <param name="name"> The attribute name. </param>
        /// <param name="valueIfNullOrEmpty"> (Optional) A default value if null or empty. </param>
        /// <returns> The attribute entry. </returns>
        /// <seealso cref="M:CoreXT.Toolkit.TagComponents.ITagComponent.GetAttribute(string,TagHelperAttribute)"/>
        public virtual TagHelperAttribute GetAttribute(string name, TagHelperAttribute valueIfNullOrEmpty = null)
        {
            return Attributes.Value(name, valueIfNullOrEmpty);
        }

        /// <summary> Gets an attribute as a string value on this component by name. </summary>
        /// <param name="name"> The attribute name. </param>
        /// <param name="valueIfNullOrEmpty"> A default value if null or empty. </param>
        /// <returns> The attribute value. </returns>
        /// <seealso cref="M:CoreXT.Toolkit.TagComponents.ITagComponent.GetAttribute(string,string)"/>
        public virtual string GetAttribute(string name, string valueIfNullOrEmpty)
        {
            return Attributes.Value(name, valueIfNullOrEmpty);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> A simple method filter to trim the CSS class name strings. </summary>
        /// <param name="classNames"> List of CSS class names. </param>
        /// <returns> An enumerator that allows 'foreach' to be used to process trimmed CSS class names in this collection. </returns>
        public static IEnumerable<string> TrimClassNames(IEnumerable<string> classNames)
        {
            return classNames.Select(c => c.Trim()).Where(c => !string.IsNullOrWhiteSpace(c));
        }

        /// <summary> Parses and returns the current list of class names as a string array. </summary>
        /// <returns> An array of string. </returns>
        public string[] GetClassNames()
        {
            if (Attributes.TryGetAttribute("class", out var currentClassNames))
                return currentClassNames.Render().Trim().Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Select(c => c.ToLower()).ToArray();
            else
                return new string[0];
        }

        /// <summary> Returns true if the component has ALL the specified CSS class names set. </summary>
        /// <param name="classNames">
        ///     A list of class names to test against.  If a single array item has spaces it will be parsed also as separate class
        ///     names.
        /// </param>
        /// <returns> True if the current component current has all the given class names, or false otherwise. </returns>
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
        ///     Adds the resources (JavaScript, CSS, etc.) required for this component to the view properties for deferred
        ///     rendering. These resources are rendered via a post process before the page is returned to the client.
        /// </summary>
        public void ApplyResourcesToRequestContext()
        {
            if (Page != null && RequiredResources != null)
                foreach (var resource in RequiredResources)
                    Page.XT.RequireResource(resource);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Initializes this object. </summary>
        /// <param name="context"> The context. </param>
        void ITagHelperComponent.Init(TagHelperContext context)
        {
            TagContext = context;
            Initialize();
        }

        ///// <summary> Copies the forward all attributes from the original context so that they can be output on the final tag. This allows users to specify custom attributes to include in the output. </summary>
        //x public void CopyForwardAllAttributes()
        //{
        //    foreach (var attr in TagContext.AllAttributes)
        //        Attributes.SetAttribute(attr);
        //}

        /// <summary>
        ///     Initializes the component with the given context. Additions to
        ///     <see cref="P:Microsoft.AspNetCore.Razor.TagHelpers.TagHelperContext.Items" /> should be done within this method to
        ///     ensure they're added prior to executing the children.
        /// </summary>
        /// <remarks>
        ///     When more than one <see cref="T:Microsoft.AspNetCore.Razor.TagHelpers.ITagHelper" /> runs on the same element,
        ///     <see cref="M:TagHelperOutput.GetChildContentAsync" /> may be invoked prior to
        ///     <see cref="M:Microsoft.AspNetCore.Razor.TagHelpers.TagHelper.ProcessAsync(Microsoft.AspNetCore.Razor.TagHelpers.TagHelperContext,Microsoft.AspNetCore.Razor.TagHelpers.TagHelperOutput)" />.
        /// </remarks>
        /// <seealso cref="M:CoreXT.Toolkit.TagComponents.ITagComponent.Initialize()"/>
        /// <seealso cref="M:CoreXT.Toolkit.TagHelpers.ICoreXTTagHelper.Initialize(TagHelperContext)"/>
        /// <seealso cref="M:Microsoft.AspNetCore.Razor.TagHelpers.TagHelper.Init(TagHelperContext)"/>
        public virtual void Initialize() { }

        /// <summary> Initializes this object. </summary>
        internal virtual void _Init() { }

        /// <summary> Process the asynchronous. </summary>
        /// <param name="context"> The context. </param>
        /// <param name="output"> The output. </param>
        /// <returns> An asynchronous result. </returns>
        async Task ITagHelperComponent.ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            this.TagContext = context;
            this.TagOutput = output;
            _Init(); // (allow internal initialization for derived components before anything else)
            await PreProcessAsync();
            await ProcessAsync();
            await PostProcessAsync();
        }

        /// <summary>
        ///     Allows for setup and configuration prior to processing.
        ///     <para>This is handy to allow derived base-type classes to implement common logic shared by child classes. </para>
        /// </summary>
        /// <seealso cref="M:CoreXT.Toolkit.TagComponents.ITagComponent.PreProcess()"/>
        public virtual void PreProcess() { }

        /// <summary>
        ///     Allows for setup and configuration prior to processing.
        ///     <para>This is handy to allow derived base-type classes to implement common logic shared by child classes. </para>
        /// </summary>
        /// <returns> An asynchronous result. </returns>
        /// <seealso cref="M:CoreXT.Toolkit.TagComponents.ITagComponent.PreProcessAsync()"/>
        public virtual Task PreProcessAsync()
        {
            PreProcess();
            return Task.CompletedTask;
        }

        /// <summary> Synchronously processes the component and renders output. </summary>
        /// <seealso cref="M:CoreXT.Toolkit.TagComponents.ITagComponent.Process()"/>
        public virtual void Process() { }

        /// <summary> Asynchronously processes the component and renders output. </summary>
        /// <returns> An asynchronous result. </returns>
        /// <seealso cref="M:CoreXT.Toolkit.TagComponents.ITagComponent.ProcessAsync()"/>
        public virtual Task ProcessAsync()
        {
            Process();
            return Task.CompletedTask;
        }

        /// <summary>
        ///     Allows for any final post processing.
        ///     <para>This is handy to allow derived base-type classes to implement common logic shared by child classes. </para>
        /// </summary>
        /// <seealso cref="M:CoreXT.Toolkit.TagComponents.ITagComponent.PostProcess()"/>
        public void PostProcess() { }

        /// <summary>
        ///     Allows for any final post processing.
        ///     <para>This is handy to allow derived base-type classes to implement common logic shared by child classes. </para>
        /// </summary>
        /// <returns> An asynchronous result. </returns>
        /// <seealso cref="M:CoreXT.Toolkit.TagComponents.ITagComponent.PostProcessAsync()"/>
        public virtual Task PostProcessAsync()
        {
            PostProcess();
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

    // ####################################################################################
    // Merging in the tag context and output properties and methods:

    public partial class TagComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> The parsed HTML tag name of the element used to invoke this instance. </summary>
        /// <value> The name of the tag. </value>
        public string OriginalTagName => TagContext.TagName;

        /// <summary>
        ///     Gets the collection of items used to communicate with other tag components (or other tag helpers).
        ///     <para>
        ///     This dictionary is copy-on-write in order to ensure items added to this collection are visible only to other
        ///     components or tag helpers targeting child elements. This means any items you set within a child component or tag
        ///     helper will not be reflected in the parent items.  To get around this, put a reference to the parent instance in the
        ///     list and allow the children to work with the parent instead.
        ///     </para>
        /// </summary>
        /// <value> The items. </value>
        public IDictionary<object, object> Items => TagContext.Items;

        /// <summary> An identifier unique to the HTML element this context is for. </summary>
        /// <value> A unique identifier. </value>
        public string UniqueId => TagContext.UniqueId;

        // . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

        /// <summary> 'true' if 'Content' has been set, false otherwise. </summary>
        public bool IsContentModified => TagOutput.IsContentModified;

        /// <summary>
        ///     Content that follows the HTML element.
        ///     <para>Value is rendered after the HTML element.</para>
        /// </summary>
        /// <value> The post-element to render. </value>
        public TagHelperContent PostElement => TagOutput.PostElement;

        /// <summary>
        ///     The HTML element's post content.
        ///     <para>Value is appended to the final output.</para>
        /// </summary>
        /// <value> The post-content to render. </value>
        public TagHelperContent PostContent => TagOutput.PostContent;

        /// <summary>
        ///     Get or set the HTML element's main content.
        ///     <para>
        ///     The content is output after 'PreContent' and before 'PostContent'.</para>
        /// </summary>
        /// <value> The content. </value>
        [HtmlAttributeNotBound]
        public TagHelperContent Content { get => TagOutput.Content; set => TagOutput.Content = value; }

        /// <summary>
        ///     The HTML element's pre-content.
        ///     <para>
        ///     The content is prepended to the final output.
        ///     </para>
        /// </summary>
        /// <value> The pre-content to render. </value>
        public TagHelperContent PreContent => TagOutput?.PreContent;

        /// <summary>
        ///     Content that precedes the rendered HTML element for this component.
        /// </summary>
        /// <value> The pre-element content to render. </value>
        public TagHelperContent PreElement => TagOutput?.PreElement;

        /// <summary> Syntax of the element in the generated HTML. </summary>
        /// <value> The tag mode. </value>
        [HtmlAttributeNotBound]
        public TagMode TagMode { get => TagOutput.TagMode; set => TagOutput.TagMode = value; }

        /// <summary>
        ///     The HTML element's tag name.
        ///     <para>A whitespace or null value results in no start or end tag being rendered.</para>
        /// </summary>
        /// <remarks> A whitespace or null value results in no start or end tag being rendered. </remarks>
        /// <value> The name of the tag. </value>
        [HtmlAttributeNotBound]
        public string TagName { get => TagOutput.TagName; set => TagOutput.TagName = value; }

        /// <summary> The HTML element's attributes to output. </summary>
        /// <remarks>
        ///     MVC will HTML encode System.String values when generating the start tag. It will not HTML encode a
        ///     Microsoft.AspNetCore.Mvc.Rendering.HtmlString instance. MVC converts most other types to a System.String, then HTML
        ///     encodes the result.
        /// </remarks>
        /// <value> The attributes. </value>
        [HtmlAttributeNotBound]
        public TagHelperAttributeList Attributes => TagOutput?.Attributes;

        /// <summary> Executes children asynchronously with the given encoder in scope and returns their rendered content. </summary>
        /// <param name="useCachedResult">
        ///     If true, multiple calls with the same System.Text.Encodings.Web.HtmlEncoder will not cause children to re- execute;
        ///     returns cached content.
        /// </param>
        /// <param name="encoder">
        ///     The System.Text.Encodings.Web.HtmlEncoder to use when the page handles non- Microsoft.AspNetCore.Html.IHtmlContent
        ///     C# expressions. If null, executes children with the page's current System.Text.Encodings.Web.HtmlEncoder.
        /// </param>
        /// <returns> A System.Threading.Tasks.Task that on completion returns content rendered by children. </returns>
        public Task<TagHelperContent> GetChildContentAsync(bool useCachedResult, HtmlEncoder encoder) => TagOutput.GetChildContentAsync(useCachedResult, encoder);

        /// <summary> Executes children asynchronously with the given encoder in scope and returns their rendered content. </summary>
        /// <remarks>
        ///     This method is memoized. Multiple calls with the same System.Text.Encodings.Web.HtmlEncoder instance will not cause
        ///     children to re-execute with that encoder in scope.
        /// </remarks>
        /// <param name="encoder">
        ///     The System.Text.Encodings.Web.HtmlEncoder to use when the page handles non- Microsoft.AspNetCore.Html.IHtmlContent
        ///     C# expressions. If null, executes children with the page's current System.Text.Encodings.Web.HtmlEncoder.
        /// </param>
        /// <returns> A System.Threading.Tasks.Task that on completion returns content rendered by children. </returns>
        public Task<TagHelperContent> GetChildContentAsync(HtmlEncoder encoder) => TagOutput.GetChildContentAsync(encoder);

        /// <summary> Executes children asynchronously and returns their rendered content. </summary>
        /// <param name="useCachedResult">
        ///     If true, multiple calls will not cause children to re-execute with the page's original
        ///     System.Text.Encodings.Web.HtmlEncoder; returns cached content.
        /// </param>
        /// <returns> A System.Threading.Tasks.Task that on completion returns content rendered by children. </returns>
        public Task<TagHelperContent> GetChildContentAsync(bool useCachedResult) => TagOutput.GetChildContentAsync(useCachedResult);

        /// <summary> Executes children asynchronously and returns their rendered content. </summary>
        /// <remarks>
        ///     This method is memoized. Multiple calls will not cause children to re-execute with the page's original
        ///     System.Text.Encodings.Web.HtmlEncoder.
        /// </remarks>
        /// <returns> A System.Threading.Tasks.Task that on completion returns content rendered by children. </returns>
        public Task<TagHelperContent> GetChildContentAsync() => TagOutput.GetChildContentAsync();

        /// <summary> Prevents the component from rendering any tag-related content. This has no affect if rendering views. </summary>
        /// <remarks>
        ///     Sets Microsoft.AspNetCore.Razor.TagHelpers.TagHelperOutput.TagName to null, and clears
        ///     Microsoft.AspNetCore.Razor.TagHelpers.TagHelperOutput.PreElement,
        ///     Microsoft.AspNetCore.Razor.TagHelpers.TagHelperOutput.PreContent,
        ///     Microsoft.AspNetCore.Razor.TagHelpers.TagHelperOutput.Content,
        ///     Microsoft.AspNetCore.Razor.TagHelpers.TagHelperOutput.PostContent, and
        ///     Microsoft.AspNetCore.Razor.TagHelpers.TagHelperOutput.PostElement to suppress output.
        /// </remarks>
        public void SuppressTagOutput() => TagOutput.SuppressOutput();

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ####################################################################################
}
