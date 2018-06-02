using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using System;
using System.Threading.Tasks;

namespace CoreXT.MVC.Components
{
    public interface IWebComponent : ITagComponent
    {
        object Content { get; set; }
        RazorTemplateDelegate<object> ContentTemplate { get; set; }
        bool EnableAutomaticID { get; set; }
        object Model { get; set; }
        string ModelID { get; set; }
        string UniqueID { get; }

        IViewComponentResult GetViewResult(object content);
        IViewComponentResult GetViewResult(RazorTemplateDelegate<object> templateDelegate);

        /// <summary>
        ///     Attempts to render any view or explicitly set content first.  If no underlying view is found, or 'Content' or
        ///     'ContentTemplate' is null, then false is returned.
        ///     <para>Derived components should call this first, and if false, can continue to render their own inner tag content.
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
        Task<bool> ProcessContent(OnBeforeViewRender onBeforeViewRender = null, bool required = false, Type type = null);

        IHtmlContent RenderInnerContent();
        IHtmlContent RenderContent(object content);

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
        Task<HtmlString> RenderView(string name, bool required, Action<ViewContext> onBeforeRender = null);

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
        Task<HtmlString> RenderView(Type type, bool required = true, Action<ViewContext> onBeforeRender = null);

        IHtmlContent RenderAttributes(bool includeID = false, bool includeName = false, params string[] attributesToIgnore);
    }
}