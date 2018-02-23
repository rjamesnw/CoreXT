using CoreXT.ASPNet;
using CoreXT.Entities;
using CoreXT.Toolkit.Components;
using Microsoft.AspNetCore.Html;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace CoreXT.Toolkit.Web
{
    // ########################################################################################################################

    public abstract partial class ViewPage<TModel>
    {
        // --------------------------------------------------------------------------------------------------------------------

        public T GetControl<T>() where T : class, IWebComponent { return Context?.GetService<T>().SetPage(this); }

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

        /// <summary>
        /// Returns a link element with the given text and URL (href).
        /// </summary>
        /// <param name="text">The text for the link.</param>
        /// <param name="href">The URL for the link.</param>
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
        /// Returns a modal component to construct modal window elements.
        /// Razor template delegates can be used for the title, header, and footer parameters (typically in the form
        /// '<see cref="item=>&lt;text>&lt;/text>"/>').
        /// </summary>
        public Modal Modal(RazorTemplateDelegate<object> title, bool allowClose, RazorTemplateDelegate<object> header,
            RazorTemplateDelegate<object> body, RazorTemplateDelegate<object> footer = null)
        {
            return GetControl<Modal>().Configure(title, allowClose, header, body, footer);
        }

        /// <summary>
        /// Returns a modal component to construct modal window elements.
        /// Razor template delegates can be used for the header and footer parameters.
        /// </summary>
        public Modal Modal(string title, bool allowClose, RazorTemplateDelegate<object> header,
            RazorTemplateDelegate<object> body, RazorTemplateDelegate<object> footer = null)
        {
            return GetControl<Modal>().Configure(title, allowClose, header, body, footer);
        }

        /// <summary>
        /// Returns a modal component to construct modal window elements.
        /// Razor template delegates can be used for the header and footer parameters.
        /// </summary>
        public Modal Modal(string title, string header,
            RazorTemplateDelegate<object> body, RazorTemplateDelegate<object> footer = null, bool allowClose = true)
        {
            return GetControl<Modal>().Configure(title, header, body, footer, allowClose);
        }

        /// <summary>
        /// Returns a modal component to construct modal window elements.
        /// </summary>
        public Modal Modal(string title, string header, string body, string footer = null, bool allowClose = true)
        {
            return GetControl<Modal>().Configure(title, header, body, footer, allowClose);
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

        /// <summary> Creates a panel component for rendering on a web view page. </summary>
        /// <param name="title">      The panel title. </param>
        /// <param name="header">     The header content. </param>
        /// <param name="body">       The body content. </param>
        /// <param name="footer">     (Optional) The footer content. </param>
        /// <param name="panelStyle"> (Optional) Style of the panel. </param>
        /// <returns> The panel instance. </returns>
        public Panel Panel(RazorTemplateDelegate<object> title,
            RazorTemplateDelegate<object> header, RazorTemplateDelegate<object> body, RazorTemplateDelegate<object> footer = null,
            PanelStyles panelStyle = PanelStyles.Default)
        {
            return GetControl<Panel>().Configure(title, header, body, footer, panelStyle);
        }

        /// <summary> Creates a panel component for rendering on a web view page. </summary>
        /// <param name="title">      The panel title. </param>
        /// <param name="header">     The header content. </param>
        /// <param name="body">       The body content. </param>
        /// <param name="footer">     (Optional) The footer content. </param>
        /// <param name="panelStyle"> (Optional) Style of the panel. </param>
        /// <returns> The panel instance. </returns>
        public Panel Panel(string title,
            RazorTemplateDelegate<object> header, RazorTemplateDelegate<object> body, RazorTemplateDelegate<object> footer = null,
            PanelStyles panelStyle = PanelStyles.Default)
        {
            return GetControl<Panel>().Configure(title, header, body, footer, panelStyle);
        }

        /// <summary> Creates a panel component for rendering on a web view page. </summary>
        /// <param name="title">      The panel title. </param>
        /// <param name="header">     The header content. </param>
        /// <param name="body">       The body content. </param>
        /// <param name="footer">     (Optional) The footer content. </param>
        /// <param name="panelStyle"> (Optional) Style of the panel. </param>
        /// <returns> The panel instance. </returns>
        public Panel Panel(string title, string header, RazorTemplateDelegate<object> body,
            RazorTemplateDelegate<object> footer = null, PanelStyles panelStyle = PanelStyles.Default)
        {
            return GetControl<Panel>().Configure(title, header, body, footer, panelStyle);
        }

        /// <summary> Creates a panel component for rendering on a web view page. </summary>
        /// <param name="title">      The panel title. </param>
        /// <param name="header">     The header content. </param>
        /// <param name="body">       The body content. </param>
        /// <param name="footer">     (Optional) The footer content. </param>
        /// <param name="panelStyle"> (Optional) Style of the panel. </param>
        /// <returns> The panel instance. </returns>
        public Panel Panel(string title, string header, string body, string footer = null, PanelStyles panelStyle = PanelStyles.Default)
        {
            return GetControl<Panel>().Configure(title, header, body, footer, panelStyle);
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
        public Table Table<TEntity>(string id, ITable<TEntity> table) where TEntity : class, new()
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
