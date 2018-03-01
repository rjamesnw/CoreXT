using CoreXT.ASPNet;
using CoreXT.Services.DI;
using CoreXT.Toolkit.Web;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
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

namespace CoreXT.Toolkit.TagHelpers
{
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
}
