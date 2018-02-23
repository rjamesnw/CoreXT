using CoreXT.Services.DI;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.Components
{

    /// <summary> Selects the style of a button component. </summary>
    public enum PanelStyles
    {
        Default,
        Primary,
        Success,
        Info,
        Warning,
        Danger,
        Link
    }

    /// <summary> A button component. </summary>
    /// <seealso cref="T:CoreXT.Toolkit.Components.WebComponent"/>
    public class Panel : WebComponent, IComponentTitle,  IComponentHeader, IComponentBody
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Selects the style of this panel. </summary>
        public PanelStyles PanelStyle { get; set; }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> A razor template delegate used to render the header of the panel. </summary>
        public RazorTemplateDelegate<object> Header { get; set; }

        /// <summary>
        /// Returns the header content for rendering in the component's view.
        /// </summary>
        public Task<IHtmlContent> HeaderContent
        {
            get { return GetContentFromTemplateDelegate(Header); }
        }

        /// <summary> A razor template delegate used to render the footer of the panel. </summary>
        public RazorTemplateDelegate<object> Footer { get; set; }

        /// <summary>
        /// Returns the footer content for rendering in the component's view.
        /// </summary>
        public Task<IHtmlContent> FooterContent
        {
            get { return GetContentFromTemplateDelegate(Footer); }
        }

        /// <summary> The panel title. </summary>
        /// <value> The panel title. </value>
        new public RazorTemplateDelegate<object> Title { get; set; }

        /// <summary>
        /// Returns the title content for rendering in the component's view.
        /// </summary>
        public Task<IHtmlContent> TitleContent
        {
            get { return GetContentFromTemplateDelegate(Title); }
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Creates a button component. </summary>
        /// <param name="services"> Application services. </param>
        public Panel(ICoreXTServiceProvider services) : base(services)
        {
        }

        public override Task<IViewComponentResult> InvokeAsync() => base.InvokeAsync();

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Configures a panel component for rendering on a web view page. </summary>
        /// <param name="title">      The panel title. </param>
        /// <param name="header">     The header content. </param>
        /// <param name="body">       The body content. </param>
        /// <param name="footer">     (Optional) The footer content. </param>
        /// <param name="panelStyle"> (Optional) Style of the panel. </param>
        /// <returns> The panel instance. </returns>
        public Panel Configure(RazorTemplateDelegate<object> title,
            RazorTemplateDelegate<object> header, RazorTemplateDelegate<object> body, RazorTemplateDelegate<object> footer = null,
            PanelStyles panelStyle = PanelStyles.Default)
        {
            EnableAutomaticID = true;
            Title = title;
            Header = header;
            ContentTemplate = body;
            Footer = footer;
            PanelStyle = panelStyle;
            return this;
        }

        /// <summary> Configures a panel component for rendering on a web view page. </summary>
        /// <param name="title">      The panel title. </param>
        /// <param name="header">     The header content. </param>
        /// <param name="body">       The body content. </param>
        /// <param name="footer">     (Optional) The footer content. </param>
        /// <param name="panelStyle"> (Optional) Style of the panel. </param>
        /// <returns> The panel instance. </returns>
        public Panel Configure(string title,
            RazorTemplateDelegate<object> header, RazorTemplateDelegate<object> body, RazorTemplateDelegate<object> footer = null,
            PanelStyles panelStyle = PanelStyles.Default)
        {
            // (NOTICE: 'item => ???' are RAZOR template delegates that will return content, which is a string in this case)
            return Configure(item => title, header, body, footer);
        }

        /// <summary> Configures a panel component for rendering on a web view page. </summary>
        /// <param name="title">      The panel title. </param>
        /// <param name="header">     The header content. </param>
        /// <param name="body">       The body content. </param>
        /// <param name="footer">     (Optional) The footer content. </param>
        /// <param name="panelStyle"> (Optional) Style of the panel. </param>
        /// <returns> The panel instance. </returns>
        public Panel Configure(string title, string header, RazorTemplateDelegate<object> body,
            RazorTemplateDelegate<object> footer = null, PanelStyles panelStyle = PanelStyles.Default)
        {
            // (NOTICE: 'item => ???' are RAZOR template delegates that will return content, which are strings in this case)
            return Configure(item => title, item => header, body, footer, panelStyle);
        }

        /// <summary> Configures a panel component for rendering on a web view page. </summary>
        /// <param name="title">      The panel title. </param>
        /// <param name="header">     The header content. </param>
        /// <param name="body">       The body content. </param>
        /// <param name="footer">     (Optional) The footer content. </param>
        /// <param name="panelStyle"> (Optional) Style of the panel. </param>
        /// <returns> The panel instance. </returns>
        public Panel Configure(string title, string header, string body, string footer = null, PanelStyles panelStyle = PanelStyles.Default)
        {
            // (NOTICE: 'item => ???' are RAZOR template delegates that will return content, which are strings in this case)
            return Configure(item => title, item => header, item => body, item => footer, panelStyle);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Sets the panel title. </summary>
        /// <param name="title"> A razor template delegate used to render the title of the panel. </param>
        /// <returns> A Panel. </returns>
        public Panel SetTitle(RazorTemplateDelegate<object> title)
        {
            Title = title;
            return this;
        }

        /// <summary> Sets the panel header. </summary>
        /// <param name="header"> A razor template delegate used to render the header of the panel. </param>
        /// <returns> A Panel. </returns>
        public Panel SetHeader(RazorTemplateDelegate<object> header)
        {
            Header = header;
            return this;
        }

        /// <summary> Sets the panel body. </summary>
        /// <param name="body"> A razor template delegate used to render the body of the panel. </param>
        /// <returns> A Panel. </returns>
        public Panel SetBody(RazorTemplateDelegate<object> body)
        {
            ContentTemplate = body;
            return this;
        }

        /// <summary> Sets the panel footer. </summary>
        /// <param name="footer"> A razor template delegate used to render the footer of the panel. </param>
        /// <returns> A Panel. </returns>
        public Panel SetFooter(RazorTemplateDelegate<object> footer)
        {
            Footer = footer;
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        ///     This method is called just before rendering the component to make sure all properties are up to date. End users
        ///     (developers) may also call this method before hand to refresh the component properties. This allows controls to be
        ///     more efficient by only making updates when needed during a render request.
        ///     <para>Example: The ActionLink component has properties that configure the HREF URL. Calling
        ///     Update() resets the HREF value to match the currently configured path values.</para>
        /// </summary>
        /// <returns> An asynchronous result that yields a WebComponent. </returns>
        /// <seealso cref="M:CoreXT.Toolkit.Components.WebComponent.Update()"/>
        public override Task<WebComponent> Update()
        {
            /*(do stuff here just before the view gets rendered)*/
            return base.Update();
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
