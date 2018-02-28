using System.Collections.Generic;
using System.IO;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using CoreXT.Toolkit.Web;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace CoreXT.Toolkit.TagHelpers
{
    public interface ICoreXTTagHelper : ITagHelper, IHtmlContent, IActionResult
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
        RenderModes RenderMode { get; set; }

        void ApplyResourcesToRequestContext();
        TagHelperAttribute GetAttribute(string name);
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
        /// <param name="context"> Contains information associated with the current HTML tag. </param>
        /// <seealso cref="M:Microsoft.AspNetCore.Razor.TagHelpers.TagHelper.Init(TagHelperContext)"/>
        void Initialize(TagHelperContext context);

        /// <summary>
        ///     Allows for setup and configuration prior to processing.
        ///     <para>This is handy to allow derived base-type classes to implement common logic shared by child classes. </para>
        /// </summary>
        /// <param name="context"> The tag component context. </param>
        /// <param name="output"> The component's output. </param>
        void PreProcess(TagHelperContext context, TagHelperOutput output);

        /// <summary>
        ///     Allows for setup and configuration prior to processing.
        ///     <para>This is handy to allow derived base-type classes to implement common logic shared by child classes. </para>
        /// </summary>
        /// <param name="context"> The tag component context. </param>
        /// <param name="output"> The component's output. </param>
        Task PreProcessAsync(TagHelperContext context, TagHelperOutput output);

        /// <summary> Synchronously processes the tag and renders output. </summary>
        /// <param name="context"> The tag component context. </param>
        /// <param name="output"> The component's output. </param>
        void Process(TagHelperContext context, TagHelperOutput output);

        /// <summary> Asynchronously processes the tag and renders output. </summary>
        /// <param name="context"> The tag component context. </param>
        /// <param name="output"> The component's output. </param>
        new Task ProcessAsync(TagHelperContext context, TagHelperOutput output);

        /// <summary>
        ///     Allows for any final post processing.
        ///     <para>This is handy to allow derived base-type classes to implement common logic shared by child classes. </para>
        /// </summary>
        /// <param name="context"> The tag component context. </param>
        /// <param name="output"> The component's output. </param>
        void PostProcess(TagHelperContext context, TagHelperOutput output);

        /// <summary>
        ///     Allows for any final post processing.
        ///     <para>This is handy to allow derived base-type classes to implement common logic shared by child classes. </para>
        /// </summary>
        /// <param name="context"> The tag component context. </param>
        /// <param name="output"> The component's output. </param>
        /// <returns> An asynchronous result. </returns>
        Task PostProcessAsync(TagHelperContext context, TagHelperOutput output);
    }
}