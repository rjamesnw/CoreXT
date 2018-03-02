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
using System.Web;

namespace CoreXT.Toolkit.TagComponents.Bootstrap
{
    public enum InputTypes
    {

        /// <summary> A push button with no default behavior.</summary>
        Button,
        /// <summary> A check box allowing single values to be selected/deselected.</summary>
        Checkbox,
        /// <summary> HTML5 A control for specifying a color. A color picker's UI has no required features other than accepting simple colors as text (more info).</summary>
        Color,
        /// <summary> HTML5 A control for entering a date (year, month, and day, with no time).</summary>
        Date,
        /// <summary> HTML5 A control for entering a date and time, with no time zone.</summary>
        DatetimeLocal,
        /// <summary> HTML5 A field for editing an e-mail address.</summary>
        Email,
        /// <summary> A control that lets the user select a file. Use the accept attribute to define the types of files that the control can select.</summary>
        File,
        /// <summary> A control that is not displayed but whose value is submitted to the server.</summary>
        Hidden,
        /// <summary> A graphical submit button. You must use the src attribute to define the source of the image and the alt attribute to define alternative text. You can use the height and width attributes to define the size of the image in pixels.</summary>
        Image,
        /// <summary> HTML5 A control for entering a month and year, with no time zone.</summary>
        Month,
        /// <summary> HTML5 A control for entering a number.</summary>
        Number,
        /// <summary> A single-line text field whose value is obscured. Use the maxlength and minlength attributes to specify the maximum length of the value that can be entered.</summary>
        Password,
        /// <summary> Any forms involving sensitive information like passwords (e.g. login forms) should be served over HTTPS; Firefox now implements multiple mechanisms to warn against insecure login forms — see Insecure passwords. Other browsers are also implementing similar mechanisms.</summary>
        Note,
        /// <summary> A radio button, allowing a single value to be selected out of multiple choices.</summary>
        Radio,
        /// <summary> HTML5 A control for entering a number whose exact value is not important.</summary>
        Range,
        /// <summary> A button that resets the contents of the form to default values.</summary>
        Reset,
        /// <summary> HTML5 A single-line text field for entering search strings. Line-breaks are automatically removed from the input value.</summary>
        Search,
        /// <summary> A button that submits the form.</summary>
        Submit,
        /// <summary> HTML5 A control for entering a telephone number.</summary>
        Tel,
        /// <summary> A single-line text field. Line-breaks are automatically removed from the input value.</summary>
        Text,
        /// <summary> HTML5 A control for entering a time value with no time zone.</summary>
        Time,
        /// <summary> HTML5 A field for entering a URL.</summary>
        Url,
        /// <summary> HTML5 A control for entering a date consisting of a week-year number and a week number with no time zone.</summary>
        Week,
        /// <summary> (Depreciated - use 'DatetimeLocal', 'Date', or 'Time' instead) A control for entering a date and time (hour, minute, second, and fraction of a second) based on UTC time zone. This feature has been removed from WHATWG HTML.</summary>
        [Obsolete]
        Datetime
    }

    /// <summary> Renders an input control. Use the 'type' attribute to select the input type. </summary>
    /// <seealso cref="T:CoreXT.Toolkit.TagComponents.WebComponent"/>
    [HtmlTargetElement(ToolkitComponentPrefix + "input", ParentTag = ToolkitComponentPrefix + "input-container", TagStructure = TagStructure.WithoutEndTag)]
    public class Input : WebComponent
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> The type of input (text, date, email, etc.). </summary>
        /// <value> The type. </value>
        public InputTypes Type { get; set; }

        /// <summary> Gets or sets the label. </summary>
        /// <value> The place holder. </value>
        public string PlaceHolder { get; set; }

        /// <summary> An initial value for this input. </summary>
        /// <value> The value. </value>
        public string Value { get; set; }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Renders a bootstrap form group. </summary>
        /// <param name="services"> The services. </param>
        public Input(ICoreXTServiceProvider services) : base(services)
        {
        }

        /// <summary> Synchronously processes the tag and renders output. </summary>
        /// <seealso cref="M:CoreXT.Toolkit.TagHelpers.CoreXTTagHelper.Process(TagHelperContext,TagHelperOutput)"/>
        public override void Process()
        {
            var container = (InputContainer)TagContext.Items[typeof(InputContainer)];
            container.InputType = Type;
            TagOutput.TagName = "input";
            this.SetAttribute("id", container.InputID);
            this.SetAttribute("name", Name);
            this.SetAttribute("type", PascalNameToAttributeName(Type.ToString()));
            this.SetAttribute("aria-describedby", container.InputID + "Help");
            if (Type != InputTypes.Checkbox)
                this.SetAttribute("class", "form-control");
            this.SetAttribute("placeholder", PlaceHolder);
            this.SetAttribute("value", Value);
            TagOutput.TagMode = TagMode.SelfClosing;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
