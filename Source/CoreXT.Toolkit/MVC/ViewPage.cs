using CoreXT.ASPNet;
using CoreXT.Entities;
using CoreXT.MVC.Components.Old;
using CoreXT.Toolkit.Components.Old;
using Microsoft.AspNetCore.Html;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace CoreXT.Toolkit
{
    // ########################################################################################################################

    public abstract partial class ViewPage<TModel>: CoreXT.MVC.Views.ViewPage<TModel>
    {
        // --------------------------------------------------------------------------------------------------------------------

        public T GetControl<T>() where T : class, IWebViewComponent { return Context?.GetService<T>().SetPage(this); }

        /// <summary>
        /// Returns a link element with the given text and URL (href).
        /// </summary>
        /// <param name="text">The text for the link.</param>
        /// <param name="href">The URL for the link.</param>
        public Link Link(string text, string href)
        {
            //return new Link(text, href);
            return GetControl<Link>().Configure(text, href);
        }

        /// <summary>
        /// Returns a element with the given text and URL (href).
        /// </summary>
        /// <param name="expression">Provides a value for the link's 'href' attribute.</param>
        /// <param name="text">The text for the link.</param>
        public IHtmlContent Link<TValue>(Expression<Func<TModel, TValue>> expression, string text = null)
        {
            return GetControl<Link>().Configure(text, null).RenderFor(expression);
            // (uses a special renderer in order to invoke the strongly typed 'Render()' method to support model property expressions)
        }

        /// <summary> Returns a link element with the given text and URL (href). </summary>
        /// <param name="text"> The text for the link. </param>
        /// <param name="actionName"> The URL for the link. </param>
        /// <param name="controllerName"> (Optional) Name of the controller. </param>
        /// <param name="areaName"> (Optional) Name of the area. </param>
        /// <param name="fragment"> (Optional) The fragment. </param>
        /// <param name="routeName"> (Optional) Name of the route. </param>
        /// <returns> An ActionLink. </returns>
        public ActionLink ActionLink(string text, string actionName, string controllerName = null, string areaName = null,
            string fragment = null, string routeName = null)
        {
            return GetControl<ActionLink>().Configure(text, actionName, controllerName, areaName, fragment, routeName);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns a menu component to construct menu elements.
        /// </summary>
        public Menu Menu(string caption, string actionName = null, string controllerName = null, string areaName = null)
        {
            return GetControl<Menu>().Configure(caption, actionName, controllerName, areaName);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        ///     Returns a modal component to construct modal window elements. Razor template delegates can be used for the title,
        ///     header, and footer parameters (typically in the form '@&lt;element&gt;&lt;/element&gt;' such as '@&lt;div&gt;&lt;/div&gt;').
        ///     <para>Use the fluent style API to build the modal component (using supported extension methods).</para>
        /// </summary>
        /// <param name="allowClose"> If true, and "X" button is added to the modal window so it can be closed. </param>
        /// <returns> A Modal. </returns>
        public Modal Modal(bool allowClose= true)
        {
            return GetControl<Modal>().Configure(allowClose);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Configures a button control for rendering on a web view page. </summary>
        /// <param name="content">    The button content. </param>
        /// <param name="buttonStyle"> (Optional) Style of the button. </param>
        /// <param name="buttonType"> (Optional) Type of the button. </param>
        /// <returns> The button instance. </returns>
        public Button Button(RazorTemplateDelegate<object> content, ButtonStyles buttonStyle = ButtonStyles.Primary, ButtonTypes buttonType = ButtonTypes.Button)
        {
            return GetControl<Button>().Configure(content, buttonStyle, buttonType);
        }

        /// <summary> Configures a button control for rendering on a web view page. </summary>
        /// <param name="content">    The button content. </param>
        /// <param name="buttonStyle"> (Optional) Style of the button. </param>
        /// <param name="buttonType"> (Optional) Type of the button. </param>
        /// <returns> The button instance. </returns>
        public Button Button(string content, ButtonStyles buttonStyle = ButtonStyles.Primary, ButtonTypes buttonType = ButtonTypes.Button)
        {
            return GetControl<Button>().Configure(content, buttonStyle, buttonType);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        ///     Creates a panel component for rendering on a web view page.
        ///     <para>Use the fluent style API to build the modal component (using supported extension methods).</para>
        /// </summary>
        /// <param name="panelStyle"> (Optional) Style of the panel. </param>
        /// <returns> The panel instance. </returns>
        public Panel Panel(PanelStyles panelStyle = PanelStyles.Default)
        {
            return GetControl<Panel>().Configure(panelStyle);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Creates a panel group component. </summary>
        /// <param name="panels"> The panels for this panel group. </param>
        /// <returns> The panel group instance. </returns>
        public PanelGroup PanelGroup(params Panel[] panels)
        {
            return GetControl<PanelGroup>().Configure(panels);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns a table component based on the specified table.
        /// </summary>
        public Table Table<TEntity>(string id, IVariantTable<TEntity> table) where TEntity : class, new()
        {
            return GetControl<Table>().Configure(id, table);
        }

        /// <summary>
        /// Returns a table component based on the specified entities.
        /// </summary>
        public Table Table<TEntity>(string id, IEnumerable<TEntity> items) where TEntity : class, new()
        {
            return GetControl<Table>().Configure(id, items);
        }

        // --------------------------------------------------------------------------------------------------------------------

        public HtmlString RenderCoreXTBootstrap()
        {
            return new HtmlString(@"
    <script>
        var CoreXT = function (CoreXT) {
            CoreXT.baseURL = """ + BaseURL + @""";
            CoreXT.controllerName = """ + ControllerName + @""";
            CoreXT.actionName = """ + ActionName + @""";
            return CoreXT;
        }
        (CoreXT || {});
    </script>
");
        }
    }

    // ########################################################################################################################
}
