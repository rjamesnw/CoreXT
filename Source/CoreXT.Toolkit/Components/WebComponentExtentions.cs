using Microsoft.AspNetCore.Html;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.Components
{

    /// <summary> Represents components that contain title content than can be set. </summary>
    public interface IComponentTitle
    {
        /// <summary> The component title. </summary>
        /// <value> The component title. </value>
        RazorTemplateDelegate<object> Title { get; set; }

        /// <summary>
        /// Returns the title content for rendering in the component's view.
        /// </summary>
        Task<IHtmlContent> TitleContent { get; }
    }

    /// <summary> Represents components that contain headers than can be set. </summary>
    public interface IComponentHeader
    {
        /// <summary> A razor template delegate used to render the header of the component. </summary>
        RazorTemplateDelegate<object> Header { get; set; }

        /// <summary>
        /// Returns the header content for rendering in the component's view.
        /// </summary>
        Task<IHtmlContent> HeaderContent { get; }
    }

    /// <summary> Represents components that support body content than can be set. </summary>
    public interface IComponentContent
    {
        /// <summary>
        /// This delegate is used to set the 'InnerHtml' property when 'Update()' is called (usually just before rendering).
        /// The delegate is usually set by derived controls that accept razor template delegates.
        /// </summary>
        RazorTemplateDelegate<object> ContentTemplate { get; set; }
    }

    /// <summary> Represents components that contain headers than can be set. </summary>
    public interface IComponentBody
    {
        /// <summary> A razor template delegate used to render the footer of the component. </summary>
        RazorTemplateDelegate<object> Footer { get; set; }

        /// <summary>
        /// Returns the footer content for rendering in the component's view.
        /// </summary>
        Task<IHtmlContent> FooterContent { get; }
    }

    public static class WebComponentExtentions
    {
        /// <summary> Sets the 'id' attribute. </summary>
        /// <param name="id"> The identifier name to set. </param>
        /// <returns> This WebComponent instance. </returns>
        public static T SetID<T>(this T comp, string id) where T: WebComponent { comp.ID = id; return comp; }

        /// <summary>
        ///     Generates an identifier for this component, which should be set on the root element that the component renders.
        ///     <para>Note: This is called automatically when 'Update()' is called, which is also before the view renders. </para>
        /// </summary>
        /// <returns> This web component instance. </returns>
        public static T GenerateID<T>(this T comp) where T : WebComponent { comp.ID = Guid.NewGuid().ToString("N"); return comp; }

        /// <summary>
        /// Sets the given attributes on this component.
        /// </summary>
        /// <param name="attributes">A dictionary list of attributes to set.</param>
        /// <returns>this component instance.</returns>
        public static T SetAttributes<T>(this T comp, object attributes) where T : WebComponent
        {
            if (attributes != null)
            {
                foreach (var prop in attributes.GetType().GetProperties(BindingFlags.Instance | BindingFlags.Public))
                    comp.Attributes[_ObjectMemberNameToAttributeName(prop.Name)] = prop.GetValue(attributes).ND();

                foreach (var field in attributes.GetType().GetFields(BindingFlags.Instance | BindingFlags.Public))
                    comp.Attributes[_ObjectMemberNameToAttributeName(field.Name)] = field.GetValue(attributes).ND();
            }
            return comp;
        }

        /// <summary>
        /// Sets the given attributes on this component.
        /// </summary>
        /// <param name="attributes">A dictionary list of attributes to set.</param>
        /// <returns>this component instance.</returns>
        public static T SetAttributes<T>(this T comp, IDictionary<string, object> attributes) where T : WebComponent
        {
            if (attributes != null)
                foreach (var item in attributes)
                    comp.Attributes[item.Key] = item.Value.ND();
            return comp;
        }

        /// <summary>
        /// Sets the given attribute on this component.
        /// </summary>
        /// <param name="name">The attribute name.</param>
        /// <param name="value">A value for this attribute.</param>
        /// <param name="replace">If true (default) adds a new entry or replaces an existing entry, otherwise the request is ignored.
        /// If this is false, nothing is removed, and any merge requests with existing keys will be ignored.</param>
        public static T SetAttribute<T>(this T comp, string name, object value, bool replace = true) where T : WebComponent
        {
            comp.Attributes.MergeString(name, value, replace);
            return comp;
        }

        /// <summary>
        /// Adds one or more CSS class names to the component.  You can specify multiple class names delimited by spaces.
        /// If any class name already exists, it is not added twice.
        /// </summary>
        /// <param name="classNames"></param>
        /// <returns></returns>
        public static T AddClass<T>(this T comp, params string[] classNames) where T : WebComponent
        {
            if (classNames.Length > 0)
            {
                // (note: individual string items may already be space delimited, and will be parsed later using {string}.Split())
                var classNamesStr = string.Join(" ", _TrimNames(classNames));

                if (!string.IsNullOrEmpty(classNamesStr))
                {
                    var currentClasses = comp.GetClassNames();

                    if (currentClasses.Length > 0)
                    {
                        // ... need to merge with existing values ...

                        var itemsToAdd = classNamesStr.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Select(c => c.ToLower());

                        comp.Attributes["class"] = string.Join(" ", currentClasses.Union(itemsToAdd));
                    }
                    else
                    {
                        comp.Attributes["class"] = classNamesStr; // (there is no existing class to merge with, so just set the values now)
                    }
                }
            }
            return comp;
        }

        /// <summary>
        /// Removes one or more CSS class names to the component.
        /// </summary>
        /// <param name="classNames"></param>
        /// <returns></returns>
        public static WebComponent RemoveClass<T>(this T comp, params string[] classNames) where T : WebComponent
        {
            if (classNames.Length > 0)
            {
                // (note: individual string items may already be space delimited, and will be parsed later using {string}.Split())
                var classNamesStr = string.Join(" ", _TrimNames(classNames));

                if (!string.IsNullOrEmpty(classNamesStr))
                {
                    var currentClasses = comp.GetClassNames();

                    if (currentClasses.Length > 0)
                    {
                        // ... need to merge with existing values ...

                        var itemsToRemove = classNamesStr.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Select(c => c.ToLower());

                        comp.Attributes["class"] = string.Join(" ", currentClasses.Where(c => !itemsToRemove.Contains(c)));
                    }
                }
            }
            return comp;
        }

    }
}
