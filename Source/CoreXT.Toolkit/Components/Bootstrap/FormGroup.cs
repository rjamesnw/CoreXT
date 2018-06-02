using CoreXT.MVC.Components;
using CoreXT.Services.DI;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace CoreXT.Toolkit.Components.Bootstrap
{
    public enum ValidationStates
    {
        Normal,
        Success,
        Warning,
        Error
    }

    [HtmlTargetElement(ComponentPrefix + "form-group")]
    public class FormGroup : WebComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Gets or sets the state of the validation style. </summary>
        /// <value> The validation state. </value>
        public ValidationStates ValidationState { get; set; }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Renders a bootstrap form group.
        /// </summary>
        public FormGroup(ICoreXTServiceProvider services) : base(services)
        {
        }

        public override void Process()
        {
            TagName = "div";
            this.AddClass("form-group");
            if (ValidationState != ValidationStates.Normal)
                this.AddClass("has-" + PascalNameToAttributeName(ValidationState));
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
