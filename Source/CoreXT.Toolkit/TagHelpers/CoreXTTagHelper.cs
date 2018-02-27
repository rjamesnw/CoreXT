using CoreXT.ASPNet;
using CoreXT.Services.DI;
using CoreXT.Toolkit.Web;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Razor.TagHelpers;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

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
    public abstract class CoreXTTagHelper : TagHelper, ICoreXTTagHelper, IHtmlContent, IActionResult
    {
        // --------------------------------------------------------------------------------------------------------------------

        protected ICoreXTServiceProvider ServiceProvider { get; }

        protected IHttpContextAccessor ContextAccessor => _ContextAccessor ?? (_ContextAccessor = ServiceProvider.GetService<IHttpContextAccessor>());
        IHttpContextAccessor _ContextAccessor;

        protected HttpContext Context { get { return ContextAccessor.HttpContext; } }

        protected IViewRenderer ViewRenderer => _ViewRenderer ?? (_ViewRenderer = ServiceProvider.GetService<IViewRenderer>());
        protected IViewRenderer _ViewRenderer;

        protected IViewPageRenderStack ViewPageRenderStack => _ViewPageRenderStack ?? (_ViewPageRenderStack = ServiceProvider.GetService<IViewPageRenderStack>());
        protected IViewPageRenderStack _ViewPageRenderStack;

        // --------------------------------------------------------------------------------------------------------------------

        [ViewContext]
        public ViewContext ViewContext { get; set; }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Controls display or edit modes for this component.
        /// </summary>
        public RenderModes RenderMode { get; set; }

        // These attributes are merged in GetTagBuilder() after HtmlAttributes.
        // This means that any custom settings are preserved.
        [HtmlAttributeNotBound]
        public IDictionary<string, string> Attributes { get; private set; }

        /// <summary>
        /// A list of resource (such as JavaScript, CSS, etc.) required for this component.
        /// </summary>
        [HtmlAttributeNotBound]
        public IResourceList RequiredResources { get; private set; }

        /// <summary>
        /// Return a unique ID for this component, usually used as the final ID attribute value to output on an element.
        /// </summary>
        public string UniqueID { get { return Strings.Append(ID, DataSourceID, "_"); } }

        /// <summary>
        ///     A unique ID for this component that identifies the source of any associated data value. This is usually an entity ID
        ///     (primary key value).
        ///     <para>This is helpful when multiple entities or objects are being output to a page.
        ///     If a list of plain old CLR (POCO) objects are used without IDs, a simple numerical iteration index value may be
        ///     sufficient.</para>
        ///     <para>Note: If a value for "ID" exists, the EntityID value will be added as a suffix, delimited by an period.</para>
        /// </summary>
        /// <value> The identifier of the data source. </value>
        public string DataSourceID { get; set; }

        /// <summary>
        ///     If not null, this is a data source use by this tag helper to construct it's view. Typically it's either a single
        ///     entity instance, or an array of entities. The usage is "user-defined" and depends on the derived implementation.
        ///     <para>By default reading this gets the underlying 'ViewContext.ViewData.Model' object. Setting this property will
        ///     set a specific data source for this tag helper instance, leaving the view model as is.</para>
        /// </summary>
        /// <value> The data source. </value>
        public virtual object DataSource { get => _DataSource ?? ViewContext.ViewData.Model; set => _DataSource = value; }
        object _DataSource;

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

        /// <summary>
        /// Gets or sets class names for this component.
        /// <para>Note that setting this is a cumulative operation, in that each new value adds to an existing value.  To clear the class attribute pass in 'null'.</para>
        /// </summary>
        public virtual string Class
        {
            get { return Attributes.Value("class"); }
            set { if (value != null) this.AddClass(value); else Attributes.MergeString("class", null); }
        }

        /// <summary> Gets or sets the 'id' attribute. </summary>
        /// <value> The identifier. </value>
        public virtual string ID
        {
            get { return Attributes.Value("id"); }
            set { Attributes.MergeString("id", value); }
        }

        /// <summary> Gets or sets the name. </summary>
        /// <value> The name. </value>
        public virtual string Name
        {
            get { return Attributes.Value("name"); }
            set { Attributes.MergeString("name", value); }
        }

        /// <summary> Gets or sets the inline style for this component. </summary>
        /// <value> The style. </value>
        public virtual string Style
        {
            set { Attributes.MergeString("style", value); }
            get { return Attributes.Value("style"); }
        }

        /// <summary> Gets or sets the 'title' attribute, which is usually used to display help tips). </summary>
        /// <value> The 'title' attribute. </value>
        public virtual string HelpTip
        {
            set { Attributes.MergeString("title", value); }
            get { return Attributes.Value("title"); }
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
            Attributes = new SortedDictionary<string, string>(StringComparer.OrdinalIgnoreCase);
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

        /// <summary> Renders the underlying view for this tag helper. The current reference in 'DataSource' is passed as the view model. </summary>
        /// <param name="name"> (Optional) A view name to override the default name. </param>
        /// <returns> An asynchronous result that yields HTML. </returns>
        public async Task<HtmlString> RenderView(string name = null)
        {
            var result = await ViewRenderer.RenderAsync("/TagHelpers/", name ?? GetType().Name, DataSource);
            return new HtmlString(result);
        }

        /// <summary> Renders the underlying view for this tag helper. </summary>
        /// <param name="model"> A model to pass to the view. </param>
        /// <param name="name"> (Optional) A view name to override the default name. </param>
        /// <returns> An asynchronous result that yields HTML. </returns>
        public async Task<HtmlString> RenderView(object model, string name = null)
        {
            var result = await ViewRenderer.RenderAsync("/TagHelpers/", name ?? GetType().Name, model);
            return new HtmlString(result);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Called within component views to render the content from either the 'ContentTemplate' or 'Content' properties.
        /// 'ContentTemplate' will always take precedence over setting the 'Content' property.
        /// </summary>
        public virtual async Task<IHtmlContent> RenderContent()
            => await (ContentTemplate != null ? RenderContent(GetViewResult(ContentTemplate)) : RenderContent(Content)); //x WebUtility.HtmlEncode()

        /// <summary>
        /// Typically called within derived component views to render content.
        /// </summary>
        public virtual async Task<IHtmlContent> RenderContent(object content)
            => (content is IHtmlContent) ? (IHtmlContent)content
            : (content is string) ? new HtmlString((string)content)
            : (content is IViewComponentResult) ? await RenderView((IViewComponentResult)content)
            : await RenderView(GetViewResult(content)); //x WebUtility.HtmlEncode()

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
                var contentResult = templateDelegate(DataSource); // (note: this may be a razor template delegate)
                // TODOTEST: Test that 'ViewData.Model' is the correct one to pass in above.
                return GetViewResult(contentResult); // (coerce the value to a view result if not already one)
            }
            return GetViewResult(HtmlString.Empty);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Gets an attribute value on this component by name.
        /// </summary>
        /// <param name="name">The attribute name.</param>
        public virtual string GetAttribute(string name)
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
            string currentClassNames;
            if (Attributes.TryGetValue("class", out currentClassNames))
                return currentClassNames.Trim().Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Select(c => c.ToLower()).ToArray();
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

    public abstract class WebComponent : CoreXTTagHelper
    {
        public WebComponent(ICoreXTServiceProvider services) : base(services)
        {
        }
    }

    // ########################################################################################################################
}
