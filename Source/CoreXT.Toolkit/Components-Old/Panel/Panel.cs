using CoreXT.MVC.Components.Old;
using CoreXT.Services.DI;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.Components.Old
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
    public class Panel : WebViewComponent, IComponentTitle, IComponentHeader, IComponentFooter
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Selects the style of this panel. </summary>
        public PanelStyles PanelStyle { get; set; }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> A razor template delegate used to render the header of the panel. </summary>
        public object Header { get; set; }

        /// <summary>
        /// Returns the header content for rendering in the component's view.
        /// </summary>
        public Task<IHtmlContent> HeaderContent
        {
            get { return RenderContent(Header); }
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> A razor template delegate used to render the footer of the panel. </summary>
        public object Footer { get; set; }

        /// <summary>
        /// Returns the footer content for rendering in the component's view.
        /// </summary>
        public Task<IHtmlContent> FooterContent
        {
            get { return RenderContent(Footer); }
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> The panel title. </summary>
        /// <value> The panel title. </value>
        new public object Title { get; set; }

        /// <summary>
        /// Returns the title content for rendering in the component's view.
        /// </summary>
        public Task<IHtmlContent> TitleContent
        {
            get { return RenderContent(Title); }
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
        /// <param name="panelStyle"> (Optional) Style of the panel. </param>
        /// <returns> The panel instance. </returns>
        public Panel Configure(PanelStyles panelStyle = PanelStyles.Default)
        {
            EnableAutomaticID = true;
            PanelStyle = panelStyle;
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
        public override Task<WebViewComponent> Update()
        {
            /*(do stuff here just before the view gets rendered)*/
            return base.Update();
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
