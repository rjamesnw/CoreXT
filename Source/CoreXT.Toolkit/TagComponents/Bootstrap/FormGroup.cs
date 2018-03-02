using CoreXT.Services.DI;
using CoreXT.Toolkit.TagComponents;
using CoreXT.Toolkit.Web;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.Razor.TagHelpers;
using System;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.TagComponents.Bootstrap
{
    public enum ValidationStates
    {
        Normal,
        Success,
        Warning,
        Error
    }

    [HtmlTargetElement(ToolkitComponentPrefix + "form-group")]
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
                this.AddClass("has-" + PascalNameToAttributeName(ValidationState.ToString()));
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
