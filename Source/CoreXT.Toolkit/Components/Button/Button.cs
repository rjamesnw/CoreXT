using CoreXT.Services.DI;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.Components
{

    /// <summary> Selects the style of a button component. </summary>
    public enum ButtonStyles
    {
        /// <summary> Standard outline button. </summary>
        Default,
        /// <summary> Provides extra visual weight and identifies the primary action in a set of buttons. </summary>
        Primary,
        /// <summary> Indicates a successful or positive action. </summary>
        Success,
        /// <summary> Contextual button for informational alert messages. </summary>
        Info,
        /// <summary> Indicates caution should be taken with this action. </summary>
        Warning,
        /// <summary> Indicates a dangerous or potentially negative action. </summary>
        Danger,
        /// <summary> Deemphasize a button by making it look like a link while maintaining button behavior. </summary>
        Link
    }


    /// <summary> A button component behavior type. </summary>
    public enum ButtonTypes
    {
        /// <summary> A simple button with no default behavior. </summary>
        Button,
        /// <summary> A button with a default behavior of submitting a form. </summary>
        Submit,
        /// <summary> A button with a default behavior of resetting a form. </summary>
        Reset
    }

    /// <summary> A button component. </summary>
    /// <seealso cref="T:CoreXT.Toolkit.Components.WebComponent"/>
    public class Button : WebComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Selects the style of this button. </summary>
        public ButtonStyles ButtonStyle { get; set; }

        /// <summary> The button behavior type. </summary>
        public ButtonTypes ButtonType { get; set; }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Creates a button component. </summary>
        /// <param name="services"> Application services. </param>
        public Button(ICoreXTServiceProvider services) : base(services)
        {
        }

        public override Task<IViewComponentResult> InvokeAsync() => base.InvokeAsync();

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Configures a button control for rendering on a web view page. </summary>
        /// <param name="content">    The button content. </param>
        /// <param name="buttonStyle"> (Optional) Style of the button. </param>
        /// <param name="buttonType"> (Optional) Type of the button. </param>
        /// <returns> The button instance. </returns>
        public Button Configure(RazorTemplateDelegate<object> content, ButtonStyles buttonStyle = ButtonStyles.Primary, ButtonTypes buttonType = ButtonTypes.Button)
        {
            ContentTemplate = content;
            ButtonStyle = buttonStyle;
            ButtonType = buttonType;
            return this;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Configures a button control for rendering on a web view page. </summary>
        /// <param name="content">    The button content. </param>
        /// <param name="buttonStyle"> (Optional) Style of the button. </param>
        /// <param name="buttonType"> (Optional) Type of the button. </param>
        /// <returns> The button instance. </returns>
        public Button Configure(string content, ButtonStyles buttonStyle = ButtonStyles.Primary, ButtonTypes buttonType = ButtonTypes.Button)
        {
            return Configure(item => content, buttonStyle, buttonType); // (NOTICE: This is a RAZOR template delegate pattern to return content, which is a string in this case)
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
