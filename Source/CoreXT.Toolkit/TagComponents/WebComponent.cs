using CoreXT.ASPNet;
using CoreXT.Services.DI;
using CoreXT.Toolkit.Web;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewComponents;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Mvc.ViewFeatures.Internal;
using Microsoft.AspNetCore.Razor.TagHelpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.TagComponents
{
    // ########################################################################################################################

    public delegate object RazorTemplateDelegate<in TModel>(TModel item);

    /// <summary> Executes the before view render action for a web component. </summary>
    /// <param name="viewContext"> Context for the view. </param>
    /// <param name="childContent"> The child content that was rendered just prior to rendering the view. </param>
    public delegate void OnBeforeViewRender(ViewContext viewContext, TagHelperContent childContent);

    // ########################################################################################################################

    /// <summary>
    ///     A web component that which usually contains an accompanying view template ({ClassName}.cshtml file). The
    ///     '<see cref="TagComponent.TagOutput"/>' property, which is usually used in rendering tags, is not used when a view is
    ///     present since it becomes the view's responsibility to render the content where applicable.
    ///     <para>When overriding 'ProcessAsync()', and a view file exists, make sure to call 'ProcessContent()' to render the
    ///     underlying view. This method allows falling back if a view is missing so something else can be rendered instead.
    ///     There is also an optional hook just before the view gets rendered.</para>
    /// </summary>
    /// <remarks>
    ///     Example implementation for derived classes:
    ///     <code>
    ///        public async override Task ProcessAsync()
    ///        {
    ///           // ... try rendering any view or explicitly set content first ...
    ///           if (!await ProcessContent((viewContext, childContent) =&gt;
    ///           {
    ///               // ... anything here needed just before the view is rendered ...
    ///           }))
    ///           {
    ///               // ... no view, and no content set, so assume finally that this is a normal tag component with possibly other nested components/tags ...
    ///               var content = await TagOutput.GetChildContentAsync();
    ///               TagOutput.Content.SetHtmlContent(content);
    ///           }
    ///        }
    ///     </code>
    /// </remarks>
    /// <seealso cref="T:CoreXT.Toolkit.TagComponents.TagComponent"/>
    /// <seealso cref="T:CoreXT.Toolkit.TagComponents.IWebComponent"/>
    public abstract class WebComponent : TagComponent, IWebComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> The toolkit specific tag component prefix. </summary>
        public const string ToolkitComponentPrefix = "xt-";

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Gets the view renderer. </summary>
        /// <value> The view renderer. </value>
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
                _ViewSearchLocations = new List<string> { "/" + nameof(TagComponents), "/" + DottedNamesToPath(thisType.Namespace) };
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
        ///     The raw inner HTML that will be placed within the body of the rendered HTML for this web component, if supported.
        ///     <para>This can be overridden in derived classes to throw "NotSupportedException" if content output is not
        ///     supported.</para>
        ///     <para>Note: The base 'Content' property is hidden to support this more general property, since WebComponents usually
        ///     render views with special content placement within the view template. Any object set is converted to IHtmlContent
        ///     for output (where supported). Setting this property overwrites any existing content.</para>
        /// </summary>
        /// <value> The content. </value>
        new public virtual object Content { get { return _Content; } set { _Content = value; } }
        /// <summary> The content. </summary>
        object _Content;

        ///// <summary>
        /////     The raw inner HTML that will be placed within the body of the rendered HTML for this web component, if supported.
        /////     <para>This can be overridden in derived classes to throw "NotSupportedException" if content output is not
        /////     supported.</para>
        /////     <para>Note: The base 'Content' property is hidden to support this more general property. Any object set is converted
        /////     to IHtmlContent for output (where supported). Setting this property overwrites any existing content. </para>
        ///// </summary>
        ///// <value> The content. </value>
        //x new public virtual object Content { get { return base.Content; } set { base.Content.SetHtmlContent(RenderContent(value)); } }

        /// <summary>
        ///     Supports razor template delegates to set the content that will be placed within the body of the rendered HTML for
        ///     this component, if supported. Setting this value will take precedence over any previously set 'Content' value.
        ///     <para>This should be overridden in derived classes to throw "NotSupportedException" if not supported.</para>
        ///     <para>Note: The base 'Content()' method of same name is hidden to support this property.  Developers should be using
        ///     'GetViewResult()' instead, which has better conversion support for more types.</para>
        /// </summary>
        /// <value> The content template. </value>
        public virtual RazorTemplateDelegate<object> ContentTemplate { get; set; }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Constructor. </summary>
        /// <param name="services"> The services. </param>
        public WebComponent(ICoreXTServiceProvider services) : base(services)
        {
        }

        /// <summary> Initializes this object. </summary>
        internal override void _Init()
        {
            base._Init();
            TagContext.Items[GetType()] = this; // (set and entry to this instance base on its type by default)
            TagOutput.TagName = null; // (hide the outer tag by default)
        }

        // --------------v------------------------------------------------------------------------------------------------------

        /// <summary>
        ///     Attempts to render any view or explicitly set content first.  If no underlying view is found, or 'Content' or
        ///     'ContentTemplate' is null, then null is returned.
        ///     <para>Derived components can call this method to render the view or inner content of base types.
        ///     </para>
        /// </summary>
        /// <param name="onBeforeViewRender">
        ///     (Optional) A callback to trigger just before the view is rendered, and just after the child content is pulled. If no
        ///     view was found, the callback will not trigger. This allows components to perform some setup just prior to the view
        ///     getting rendered (such as getting references to the child components from 'context.Items[]' to configure special
        ///     content).
        /// </param>
        /// <param name="required">
        ///     (Optional) True if the view is required. If required and not found an exception will be thrown. Default is true.
        /// </param>
        /// <param name="type"> (Optional) The component type to render. This is the current component type by default.  </param>
        /// <returns> An asynchronous result that yields true if it succeeds, false if it fails. </returns>
        /// <seealso cref="M:CoreXT.Toolkit.TagComponents.IWebComponent.ProcessContent(OnBeforeViewRender)"/>
        public async Task<IHtmlContent> RenderContent(OnBeforeViewRender onBeforeViewRender = null, bool required = false, Type type = null)
        {
            // ... try rendering the view first, if one exists (otherwise null is returned) ...
            var viewContent = await RenderView(GetType(), required, onBeforeRender: async viewContext =>
            {
                var childContent = await TagOutput.GetChildContentAsync();
                if (Content != null)
                    Content = RenderContent(Content).Render() + childContent.Render(); // (the content was previously set already; perhaps by a child component, so merge them [rendering should be inner most to outer most, so render the child content first])
                else
                    Content = childContent;
                onBeforeViewRender?.Invoke(viewContext, childContent);
            });  // (if a view is found, this will also set the content before it renders)

            if (viewContent != null)
                return viewContent; // (view was found; the view is now responsible to render the inner content, if supported)
            else if (Content != null || ContentTemplate != null)
            {
                // ... no view exists; however, there IS content explicitly set, so render that as the inner HTML ...
                return RenderInnerContent();
            }

            return null;
        }

        public async Task<IHtmlContent> RenderComponent(OnBeforeViewRender onBeforeViewRender = null, bool required = false, Type type = null)
        {
            var result =;
        }

        /// <summary>
        ///     Attempts to render any view or explicitly set content first.  If no underlying view is found, or 'Content' or
        ///     'ContentTemplate' is null, then false is returned.
        ///     <para>Derived components should call this first, and if false, can continue to render their content in "tag mode".
        ///     </para>
        /// </summary>
        /// <param name="onBeforeViewRender">
        ///     (Optional) A callback to trigger just before the view is rendered, and just after the child content is pulled. If no
        ///     view was found, the callback will not trigger. This allows components to perform some setup just prior to the view
        ///     getting rendered (such as getting references to the child components from 'context.Items[]' to configure special
        ///     content).
        /// </param>
        /// <param name="required">
        ///     (Optional) True if the view is required. If required and not found an exception will be thrown. Default is true.
        /// </param>
        /// <param name="type"> (Optional) The component type to render. This is the current component type by default.  </param>
        /// <returns> An asynchronous result that yields true if it succeeds, false if it fails. </returns>
        /// <seealso cref="M:CoreXT.Toolkit.TagComponents.IWebComponent.ProcessContent(OnBeforeViewRender)"/>
        public async Task<bool> ProcessContent(OnBeforeViewRender onBeforeViewRender = null, bool required = false, Type type = null)
        {
            var content = await RenderContent(onBeforeViewRender, required, type);
            if (content != null)
            {
                TagOutput.Content.SetHtmlContent(content);
                return true;
            }
            else return false;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        ///     Renders the underlying view for this tag helper. The current reference in 'DataSource' is passed as the view model.
        ///     <para> Note: If 'required' is false, and the view cannot be found, a null value
        ///     will be returned. </para>
        /// </summary>
        /// <param name="name"> A view name to override the default name. </param>
        /// <param name="required">
        ///     (Optional) True if the view is required. If required and not found an exception will be thrown. Default is true.
        /// </param>
        /// <param name="onBeforeRender"> (Optional) A callback to trigger just before the view is rendered. </param>
        /// <returns> An asynchronous result that yields HTML. </returns>
        /// <seealso cref="M:CoreXT.Toolkit.TagComponents.IWebComponent.RenderView(bool,string,Action{ViewContext})"/>
        /// <seealso cref="M:CoreXT.Toolkit.TagHelpers.ICoreXTTagHelper.RenderView(string,bool)"/>
        public async Task<HtmlString> RenderView(string name, bool required, Action<ViewContext> onBeforeRender = null)
        {
            var result = await ViewRenderer.RenderAsync(ViewSearchLocations, name ?? GetType().Name, this, required, onBeforeRender);
            return result != null ? new HtmlString(result) : null;
        }

        /// <summary>
        ///     Renders the underlying view for this tag helper. The current reference in 'DataSource' is passed as the view model.
        ///     <para> Note: If 'required' is false, and the view cannot be found, a null value
        ///     will be returned. </para>
        /// </summary>
        /// <param name="type"> (Optional) A view type to override the default name. </param>
        /// <param name="required">
        ///     (Optional) True if the view is required. If required and not found an exception will be thrown. Default is true.
        /// </param>
        /// <param name="onBeforeRender"> (Optional) A callback to trigger just before the view is rendered. </param>
        /// <returns> An asynchronous result that yields HTML. </returns>
        /// <seealso cref="M:CoreXT.Toolkit.TagComponents.IWebComponent.RenderView(bool,string,Action{ViewContext})"/>
        /// <seealso cref="M:CoreXT.Toolkit.TagHelpers.ICoreXTTagHelper.RenderView(string,bool)"/>
        public async Task<HtmlString> RenderView(Type type, bool required = true, Action<ViewContext> onBeforeRender = null)
        {
            var result = await ViewRenderer.RenderAsync(ViewSearchLocations, type?.Name ?? throw new ArgumentNullException(nameof(type)), this, required, onBeforeRender);
            return result != null ? new HtmlString(result) : null;
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
        ///     Called within component views to render the content from either the 'ContentTemplate' or 'Content' properties.
        ///     'ContentTemplate' will always take precedence over setting the 'Content' property.
        /// </summary>
        /// <returns> An IHtmlContent. </returns>
        public virtual IHtmlContent RenderInnerContent()
            => ContentTemplate != null ? RenderContent(GetViewResult(ContentTemplate)) : RenderContent(Content); //x WebUtility.HtmlEncode()

        /// <summary> Typically called within derived component views to render content. </summary>
        /// <param name="content">
        ///     The raw inner HTML that will be placed within the body of the rendered HTML for this web component, if supported.
        ///     <para>This can be overridden in derived classes to throw "NotSupportedException" if content output is not
        ///     supported.</para>
        ///     <para>Note: The base 'Content' property is hidden to support this more general property, since WebComponents usually
        ///     render views with special content placement within the view template. Any object set is converted to IHtmlContent
        ///     for output (where supported). Setting this property overwrites any existing content.</para>
        /// </param>
        /// <returns> An IHtmlContent. </returns>
        public virtual IHtmlContent RenderContent(object content)
            => content == null ? null
            : (content is IHtmlContent) ? (IHtmlContent)content
            : (content is RazorTemplateDelegate<object>) ? RenderContent(((RazorTemplateDelegate<object>)content).Invoke(Model))
            : (content is string) ? new HtmlString((string)content)
            : new HtmlString(content?.ND());
        //? : (content is IViewComponentResult) ? await RenderView((IViewComponentResult)content)
        //? : await RenderView(GetViewResult(content)); //x WebUtility.HtmlEncode()

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Renders the attributes for this component. </summary>
        /// <param name="includeID"> (Optional) If true, the ID attribute is included (default is false). </param>
        /// <param name="includeName"> (Optional) If true, the NAME attribute is included (default is false). </param>
        /// <param name="attributesToIgnore">
        ///     Attributes not to include in the output. By default, if nothing is specified, the ID and NAME attributes are skipped,
        ///     since these are usually set another way in the templates. Giving ANY attribute to skip will bypass this default, so
        ///     you'll have to explicitly name those to If these are needed, simply pass in an empty string for an attribute name to
        ///     ignore.
        /// </param>
        /// <returns> An IHtmlContent. </returns>
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
        ///     An async method to return an IHtmlContent instance from the specified template delegate. This is used in controls to
        ///     support rendering razor template delegates into the underlying views, where applicable.
        /// </summary>
        /// <param name="templateDelegate"> The template delegate. </param>
        /// <returns> The view result. </returns>
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

        /// <summary>
        ///     Converts a Pascal-style name (typical of most public class/struct/interface properties) to a valid attribute name.
        ///     This places dashes '-' before all capitalized letters that follow a lower case letter, and makes the whole string
        ///     lowercase.
        ///     <para>A Pascal style name is where the first letter in the identifier and the first letter of each subsequent
        ///     concatenated word are capitalized.</para>
        /// </summary>
        /// <param name="name"> A property name. </param>
        /// <returns> A string. </returns>
        /// <seealso cref="!:https://msdn.microsoft.com/en-us/library/ms229043%28v=vs.100%29.aspx"/>
        public static string PascalNameToAttributeName(string name)
        {
            // (converts "someMemberName" format to "some-member-name")
            return Regex.Replace(name, "([a-z])([A-Z])", m => m.Groups[1].Value + "-" + m.Groups[2].Value).ToLower();
        }

        /// <summary>
        ///     Converts a Pascal-style name (typical of most public class/struct/interface properties) to a valid attribute name.
        ///     This places dashes '-' before all capitalized letters that follow a lower case letter, and makes the whole string
        ///     lowercase.
        ///     <para>A Pascal style name is where the first letter in the identifier and the first letter of each subsequent
        ///     concatenated word are capitalized.</para>
        /// </summary>
        /// <typeparam name="T"> Generic value type parameter. </typeparam>
        /// <param name="value"> A property name. </param>
        /// <returns> A string. </returns>
        /// <seealso cref="!:https://msdn.microsoft.com/en-us/library/ms229043%28v=vs.100%29.aspx"/>
        public static string PascalNameToAttributeName<T>(T value) where T : struct
        {
            // (converts "someMemberName" format to "some-member-name")
            return PascalNameToAttributeName(value.ToString());
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
}
