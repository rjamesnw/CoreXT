using CoreXT.MVC.ResourceManagement;
using CoreXT.MVC.Views;
using CoreXT.MVC.Views.Razor;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Razor.TagHelpers;
using System.Threading.Tasks;

namespace CoreXT.MVC.Components
{
    public interface ITagComponent : ITagHelper, IHtmlContent, IActionResult
    {
        TagHelperAttributeList Attributes { get; }
        string Class { get; set; }
        string ID { get; set; }
        string Name { get; set; }
        IViewPage Page { get; set; }
        IResourceList RequiredResources { get; }
        string Style { get; set; }
        string HelpTip { get; set; }
        ViewContext ViewContext { get; set; }

        /// <summary> Contains information related to the execution the current TagHelpers instance. </summary>
        /// <value> The TagHelper context. </value>
        TagHelperContext TagContext { get; }

        /// <summary> Class used to represent the output of an ITagHelper. </summary>
        /// <value> The TagHelper output. </value>
        TagHelperOutput TagOutput { get; }

        RenderModes RenderMode { get; set; }

        void ApplyResourcesToRequestContext();
        /// <summary> Gets an attribute entry on this component by name. </summary>
        /// <param name="name"> The attribute name. </param>
        /// <param name="valueIfNullOrEmpty"> (Optional) A default value if null or empty. </param>
        /// <returns> The attribute entry. </returns>
        TagHelperAttribute GetAttribute(string name, TagHelperAttribute valueIfNullOrEmpty = null);

        /// <summary> Gets an attribute as a string value on this component by name. </summary>
        /// <param name="name"> The attribute name. </param>
        /// <param name="valueIfNullOrEmpty"> A default value if null or empty. </param>
        /// <returns> The attribute value. </returns>
        string GetAttribute(string name, string valueIfNullOrEmpty);

        string[] GetClassNames();
        bool HasClass(params string[] classNames);

        /// <summary>
        ///     Initializes the WebComponent with the given context. Additions to
        ///     <see cref="P:Microsoft.AspNetCore.Razor.TagHelpers.TagHelperContext.Items" /> should be done within this method to
        ///     ensure they're added prior to executing the children.
        /// </summary>
        /// <remarks>
        ///     When more than one <see cref="T:Microsoft.AspNetCore.Razor.TagHelpers.ITagHelper" /> runs on the same element,
        ///     <see cref="M:TagHelperOutput.GetChildContentAsync" /> may be invoked prior to
        ///     <see cref="M:Microsoft.AspNetCore.Razor.TagHelpers.TagHelper.ProcessAsync(Microsoft.AspNetCore.Razor.TagHelpers.TagHelperContext,Microsoft.AspNetCore.Razor.TagHelpers.TagHelperOutput)" />.
        /// </remarks>
        /// <seealso cref="M:Microsoft.AspNetCore.Razor.TagHelpers.TagHelper.Init(TagHelperContext)"/>
        void Initialize();

        /// <summary>
        ///     Allows for setup and configuration prior to processing.
        ///     <para>This is handy to allow derived base-type classes to implement common logic shared by child classes. </para>
        /// </summary>
        void PreProcess();

        /// <summary>
        ///     Allows for setup and configuration prior to processing.
        ///     <para>This is handy to allow derived base-type classes to implement common logic shared by child classes. </para>
        /// </summary>
        Task PreProcessAsync();

        /// <summary> Synchronously processes the tag and renders output. </summary>
        void Process();

        /// <summary> Asynchronously processes the tag and renders output. </summary>
        Task ProcessAsync();

        /// <summary>
        ///     Allows for any final post processing.
        ///     <para>This is handy to allow derived base-type classes to implement common logic shared by child classes. </para>
        /// </summary>
        void PostProcess();

        /// <summary>
        ///     Allows for any final post processing.
        ///     <para>This is handy to allow derived base-type classes to implement common logic shared by child classes. </para>
        /// </summary>
        /// <returns> An asynchronous result. </returns>
        Task PostProcessAsync();
    }
}