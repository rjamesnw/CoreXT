using CoreXT.ASPNet;
using CoreXT.Toolkit.Web;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Razor.TagHelpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace CoreXT.Toolkit.TagComponents
{

    /// <summary> Represents components that contain title content than can be set. </summary>
    public interface IComponentTitle
    {
        /// <summary> The component title. </summary>
        /// <value> The component title. </value>
        object Title { get; set; }
    }

    /// <summary> Represents components that contain headers than can be set. </summary>
    public interface IComponentHeader
    {
        /// <summary> A razor template delegate used to render the header of the component. </summary>
        object Header { get; set; }
    }

    /// <summary> Represents components that contain headers than can be set. </summary>
    public interface IComponentFooter
    {
        /// <summary> A razor template delegate used to render the footer of the component. </summary>
        object Footer { get; set; }
    }

    public static class TagComponentExtentions
    {
        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        ///     A TagHelperAttributeList extension method that returns an attribute by name, or a default value or null if not found.
        /// </summary>
        /// <param name="list"> The list to act on. </param>
        /// <param name="name"> The name. </param>
        /// <param name="defaultIfEmpty"> (Optional) The default if empty. </param>
        /// <returns> A TagHelperAttribute. </returns>
        public static TagHelperAttribute Value(this TagHelperAttributeList list, string name, TagHelperAttribute defaultIfEmpty = null)
        {
            return list.TryGetAttribute(name, out var value) ? value : defaultIfEmpty;
        }

        /// <summary>
        ///     A TagHelperAttributeList extension method that returns an attribute by name, or a default value or null if not found.
        /// </summary>
        /// <param name="list"> The list to act on. </param>
        /// <param name="name"> The name. </param>
        /// <param name="defaultIfEmpty"> The default if empty. </param>
        /// <returns> A string. </returns>
        public static string Value(this TagHelperAttributeList list, string name, string defaultIfEmpty)
        {
            return list.TryGetAttribute(name, out var value) ? value.Render() : defaultIfEmpty;
        }

        /// <summary>
        ///     Sets an attribute value by name to 'value.ToString()'. If 'replace' is false, the attribute is only set if not
        ///     already set. If 'value' is null, the entry is removed from the list instead.
        /// </summary>
        /// <exception cref="ArgumentException"> Thrown if 'name' is null or empty. </exception>
        /// <param name="list"> The TagHelperAttributeList to merge an attribute value with. </param>
        /// <param name="name"> The key to set a value for. </param>
        /// <param name="value">
        ///     The value to set for the specified key, which will be converted to a string first. If null, any existing entry is
        ///     removed instead (if 'replace' is true).
        /// </param>
        /// <param name="replace">
        ///     (Optional) If true (the default) adds a new entry or replaces an existing entry, otherwise the request is ignored.
        ///     If this is false, nothing is removed, and any merge requests with existing keys will be ignored.
        /// </param>
        /// <param name="removeOnEmptyOrWhitespace">
        ///     (Optional) If true (default) any empty or whitespace-only values will remove the attribute. This is in addition to
        ///     'null', which always removes values.
        /// </param>
        /// <param name="replaceIfValueNotEmpty">
        ///     (Optional) If true, any existing entry is only replaced if the given value is not empty or whitespace only. Default
        ///     is false. This setting has no affect if the 'replace' parameter is false.
        /// </param>
        public static void MergeAttribute(this TagHelperAttributeList list, string name, object value, bool replace = true, bool removeOnEmptyOrWhitespace = true, bool replaceIfValueNotEmpty = false)
        {
            if (name == null)
                throw new ArgumentException("Value cannot be null.", nameof(name));
            else if (name is string && string.IsNullOrEmpty((string)(object)name))
                throw new ArgumentException("Value cannot be null or empty.", nameof(name));

            if (replace || value != null && !list.ContainsName(name))
            {
                var valueStr = value?.ToString().Trim();
                var isEmpty = string.IsNullOrWhiteSpace(valueStr);
                if (valueStr == null || removeOnEmptyOrWhitespace && isEmpty)
                    list.RemoveAll(name);
                else if (!replaceIfValueNotEmpty || !isEmpty)
                    list.Add(name, valueStr);
            }
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Sets the 'id' attribute on a web component. </summary>
        /// <typeparam name="T"> A component type. </typeparam>
        /// <param name="comp"> The comp to act on. </param>
        /// <param name="id"> The identifier name to set. </param>
        /// <returns> This WebComponent instance. </returns>
        public static T SetID<T>(this T comp, string id) where T : class, ITagComponent { comp.ID = id; return comp; }

        /// <summary>
        ///     Generates a GUID for this component's 'id' attribute.  This is implementation dependent, and requires component
        ///     designers to support setting this on the rendered component view.
        ///     <para>Note: If a component has 'EnableAutomaticID' enabled, then this is called automatically when 'Update()' is
        ///     called, which is also just before the view renders. </para>
        /// </summary>
        /// <typeparam name="T"> A component type. </typeparam>
        /// <param name="comp"> The comp to act on. </param>
        /// <returns> Returns the type 'T' instance passed in as '<paramref name="comp"/>'. </returns>
        public static T GenerateID<T>(this T comp) where T : class, ITagComponent { comp.ID = Guid.NewGuid().ToString("N"); return comp; }

        /// <summary> Sets the given attributes on this component. </summary>
        /// <typeparam name="T"> A component type. </typeparam>
        /// <param name="comp"> The comp to act on. </param>
        /// <param name="attributes"> A dictionary list of attributes to set. </param>
        /// <returns> Returns the type 'T' instance passed in as '<paramref name="comp"/>'. </returns>
        public static T SetAttributes<T>(this T comp, IDictionary<string, object> attributes) where T : class, ITagComponent
        {
            if (attributes != null)
                foreach (var item in attributes)
                    comp.Attributes.SetAttribute(item.Key, item.Value.ND());
            return comp;
        }

        /// <summary>
        ///     Sets the given attributes on this component by pulling all public fields and properties on the supplied object.
        /// </summary>
        /// <typeparam name="T"> A component type. </typeparam>
        /// <param name="comp"> The component to act on. </param>
        /// <param name="attributes"> A dictionary list of attributes to set. </param>
        /// <returns> Returns the type 'T' instance passed in as '<paramref name="comp"/>'. </returns>        
        public static T SetAttributes<T>(this T comp, object attributes) where T : class, ITagComponent
        {
            if (attributes != null)
            {
                foreach (var prop in attributes.GetType().GetProperties(BindingFlags.Instance | BindingFlags.Public))
                    comp.Attributes.SetAttribute(WebComponent.PascalNameToAttributeName(prop.Name), prop.GetValue(attributes).ND());

                foreach (var field in attributes.GetType().GetFields(BindingFlags.Instance | BindingFlags.Public))
                    comp.Attributes.SetAttribute(WebComponent.PascalNameToAttributeName(field.Name), field.GetValue(attributes).ND());
            }
            return comp;
        }

        /// <summary> Sets the given attribute on this component. </summary>
        /// <typeparam name="T"> A component type. </typeparam>
        /// <param name="comp"> The comp to act on. </param>
        /// <param name="name"> The attribute name. </param>
        /// <param name="value"> A value for this attribute. </param>
        /// <param name="replace">
        ///     (Optional) If true (default) adds a new entry or replaces an existing entry, otherwise the request is ignored. If
        ///     this is false, nothing is removed, and any merge requests with existing keys will be ignored.
        /// </param>
        /// <param name="removeOnEmptyOrWhitespace">
        ///     (Optional) If true (default) any empty or whitespace-only values will remove the attribute. This is in addition to
        ///     'null', which always removes values.
        /// </param>
        /// <param name="replaceIfValueNotEmpty">
        ///     (Optional) If true, any existing entry is only replaced if the given value is not empty or whitespace only. Default
        ///     is false. This setting has no affect if the 'replace' parameter is false.
        /// </param>
        /// <returns> Returns the type 'T' instance passed in as '<paramref name="comp"/>'. </returns>
        public static T SetAttribute<T>(this T comp, string name, object value, bool replace = true, bool removeOnEmptyOrWhitespace = true, bool replaceIfValueNotEmpty = false) where T : class, ITagComponent
        {
            comp.Attributes.MergeAttribute(name, value, replace, removeOnEmptyOrWhitespace, replaceIfValueNotEmpty);
            return comp;
        }

        /// <summary>
        ///     Adds one or more CSS class names to the component.  You can specify multiple class names delimited by spaces. If any
        ///     class name already exists, it is not added twice.
        /// </summary>
        /// <typeparam name="T"> A component type. </typeparam>
        /// <param name="comp"> The comp to act on. </param>
        /// <param name="classNames"> . </param>
        /// <returns> Returns the type 'T' instance passed in as '<paramref name="comp"/>'. </returns>
        public static T AddClass<T>(this T comp, params string[] classNames) where T : class, ITagComponent
        {
            if (classNames.Length > 0)
            {
                // (note: individual string items may already be space delimited, and will be parsed later using {string}.Split())
                var classNamesStr = string.Join(" ", TagComponent.TrimClassNames(classNames));

                if (!string.IsNullOrEmpty(classNamesStr))
                {
                    var currentClasses = comp.GetClassNames();

                    if (currentClasses.Length > 0)
                    {
                        // ... need to merge with existing values ...

                        var itemsToAdd = classNamesStr.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Select(c => c.ToLower());

                        comp.Attributes.SetAttribute("class", string.Join(" ", currentClasses.Union(itemsToAdd)));
                    }
                    else
                    {
                        comp.Attributes.SetAttribute("class", classNamesStr); // (there is no existing class to merge with, so just set the values now)
                    }
                }
            }
            return comp;
        }

        /// <summary> Removes one or more CSS class names to the component. </summary>
        /// <typeparam name="T"> Generic type parameter. </typeparam>
        /// <param name="comp"> The comp to act on. </param>
        /// <param name="classNames"> . </param>
        /// <returns> Returns the type 'T' instance passed in as '<paramref name="comp"/>'. </returns>        
        public static T RemoveClass<T>(this T comp, params string[] classNames) where T : class, ITagComponent
        {
            if (classNames.Length > 0)
            {
                // (note: individual string items may already be space delimited, and will be parsed later using {string}.Split())
                var classNamesStr = string.Join(" ", TagComponent.TrimClassNames(classNames));

                if (!string.IsNullOrEmpty(classNamesStr))
                {
                    var currentClasses = comp.GetClassNames();

                    if (currentClasses.Length > 0)
                    {
                        // ... need to merge with existing values ...

                        var itemsToRemove = classNamesStr.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Select(c => c.ToLower());

                        comp.Attributes.SetAttribute("class", string.Join(" ", currentClasses.Where(c => !itemsToRemove.Contains(c))));
                    }
                }
            }
            return comp;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Sets the component title. </summary>
        /// <typeparam name="T"> Generic type parameter. </typeparam>
        /// <param name="comp"> The comp to act on. </param>
        /// <param name="title"> A razor template delegate used to render the title of the component. </param>
        /// <returns> Returns the type 'T' instance passed in as '<paramref name="comp"/>'. </returns>
        public static T SetTitle<T>(this T comp, RazorTemplateDelegate<object> title) where T : IComponentTitle
        {
            comp.Title = title;
            return comp;
        }

        /// <summary> Sets the component's title. </summary>
        /// <typeparam name="T"> Generic type parameter. </typeparam>
        /// <param name="comp"> The comp to act on. </param>
        /// <param name="title"> A razor template delegate used to render the title of the component. </param>
        /// <returns> Returns the type 'T' instance passed in as '<paramref name="comp"/>'. </returns>
        public static T SetTitle<T>(this T comp, string title) where T : IComponentTitle
        {
            // (NOTICE: 'm => ???' are RAZOR template delegate signatures that will return content, which is a string in this case)
            return comp.SetTitle(m => title);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Sets the component's header. </summary>
        /// <typeparam name="T"> Generic type parameter. </typeparam>
        /// <param name="comp"> The comp to act on. </param>
        /// <param name="header"> A razor template delegate used to render the header of the component. </param>
        /// <returns> Returns the type 'T' instance passed in as '<paramref name="comp"/>'. </returns>
        public static T SetHeader<T>(this T comp, RazorTemplateDelegate<object> header) where T : IComponentHeader
        {
            comp.Header = header;
            return comp;
        }

        /// <summary> Sets the component's header. </summary>
        /// <typeparam name="T"> Generic type parameter. </typeparam>
        /// <param name="comp"> The comp to act on. </param>
        /// <param name="header"> A razor template delegate used to render the header of the component. </param>
        /// <returns> Returns the type 'T' instance passed in as '<paramref name="comp"/>'. </returns>
        public static T SetHeader<T>(this T comp, string header) where T : IComponentHeader
        {
            // (NOTICE: 'm => ???' are RAZOR template delegate signatures that will return content, which is a string in this case)
            return comp.SetHeader(m => header);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Sets the component's body. </summary>
        /// <typeparam name="T"> Generic type parameter. </typeparam>
        /// <param name="comp"> The comp to act on. </param>
        /// <param name="content"> A razor template delegate used to render the body of the component. </param>
        /// <returns> Returns the type 'T' instance passed in as '<paramref name="comp"/>'. </returns>
        public static T SetContent<T>(this T comp, RazorTemplateDelegate<object> content) where T : class, IWebComponent
        {
            if (content != null && content != null)
                System.Diagnostics.Debug.WriteLine(typeof(T).Name + ".SetContent(): The component's 'InnerHtml' property has a non-empty value which will never render while 'ContentTemplate' is set.", "WARNING");
            comp.ContentTemplate = content;
            return comp;
        }

        /// <summary> Sets the component's body. </summary>
        /// <typeparam name="T"> Generic type parameter. </typeparam>
        /// <param name="comp"> The comp to act on. </param>
        /// <param name="content"> A razor template delegate used to render the body of the component. </param>
        /// <returns> Returns the type 'T' instance passed in as '<paramref name="comp"/>'. </returns>
        public static T SetContent<T>(this T comp, object content) where T : class, IWebComponent
        {
            if (comp.ContentTemplate != null && content != null)
                System.Diagnostics.Debug.WriteLine(typeof(T).Name + ".SetContent(): The component's 'ContentTemplate' property references a template delegate which will override the 'InnerHtml' content string value that is being set.", "WARNING");
            comp.Content = content;
            return comp;
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary> Sets the component's footer. </summary>
        /// <typeparam name="T"> Generic type parameter. </typeparam>
        /// <param name="comp"> The comp to act on. </param>
        /// <param name="footer"> A razor template delegate used to render the footer of the component. </param>
        /// <returns> Returns the type 'T' instance passed in as '<paramref name="comp"/>'. </returns>
        public static T SetFooter<T>(this T comp, RazorTemplateDelegate<object> footer) where T : IComponentFooter
        {
            comp.Footer = footer;
            return comp;
        }

        /// <summary> Sets the component's footer. </summary>
        /// <typeparam name="T"> Generic type parameter. </typeparam>
        /// <param name="comp"> The comp to act on. </param>
        /// <param name="footer"> A razor template delegate used to render the footer of the component. </param>
        /// <returns> Returns the type 'T' instance passed in as '<paramref name="comp"/>'. </returns>
        public static T SetFooter<T>(this T comp, object footer) where T : IComponentFooter
        {
            // (NOTICE: 'm => ???' are RAZOR template delegate signatures that will return content, which is a string in this case)
            return comp.SetFooter(m => footer);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        ///     Adds a resource that is required for this component. If the resource is already added then the request is ignored.
        /// </summary>
        /// <exception cref="InvalidOperationException"> Thrown when the requested operation is invalid. </exception>
        /// <typeparam name="T"> Generic type parameter. </typeparam>
        /// <param name="comp"> The comp to act on. </param>
        /// <param name="resourcePath"> A URI to the script to add to the page. </param>
        /// <param name="resourceType"> The type of the resource returned from the given resource path. </param>
        /// <param name="renderTarget"> (Optional) Where to render the resource. </param>
        /// <param name="sequence"> (Optional) The sequence. </param>
        /// <param name="environmentName"> (Optional) Name of the environment. </param>
        /// <returns> Returns the type 'T' instance passed in as '<paramref name="comp"/>'. </returns>        
        public static T RequireResource<T>(this T comp, string resourcePath, ResourceTypes resourceType, RenderTargets renderTarget = RenderTargets.Header, int sequence = 0, string environmentName = null)
            where T : class, ITagComponent
        {
            if (comp.RequiredResources == null)
                throw new InvalidOperationException("No view page was supplied for this component.");

            comp.RequiredResources.Add(resourcePath, ResourceTypes.Script, renderTarget, sequence, environmentName);

            return comp;
        }

        /// <summary>
        ///     Adds a resource that is required for this component. If the resource is already added then the request is ignored.
        /// </summary>
        /// <exception cref="InvalidOperationException"> Thrown when the requested operation is invalid. </exception>
        /// <typeparam name="T"> Generic type parameter. </typeparam>
        /// <param name="comp"> The comp to act on. </param>
        /// <param name="resourcePath"> A URI to the script to add to the page. </param>
        /// <param name="resourceType"> The type of the resource returned from the given resource path. </param>
        /// <param name="renderTarget"> Where to render the resource. </param>
        /// <param name="sequence"> The sequence. </param>
        /// <param name="environment"> The environment. </param>
        /// <returns> Returns the type 'T' instance passed in as '<paramref name="comp"/>'. </returns>        
        public static T RequireResource<T>(this T comp, string resourcePath, ResourceTypes resourceType, RenderTargets renderTarget, int sequence, Environments environment)
            where T : class, ITagComponent
        {
            if (comp.RequiredResources == null)
                throw new InvalidOperationException("No view page was supplied for this component.");

            comp.RequiredResources.Add(resourcePath, ResourceTypes.Script, renderTarget, sequence, environment);

            return comp;
        }

        /// <summary> Adds a required script (usually JavaScript) to this component, if it has not been added already. </summary>
        /// <typeparam name="T"> Generic type parameter. </typeparam>
        /// <param name="comp"> The comp to act on. </param>
        /// <param name="scriptPath"> A URI to the script to associated with this component. </param>
        /// <param name="renderTarget"> (Optional) Where to render the script on a page when 'Render()' is called. </param>
        /// <param name="environmentName"> (Optional) Name of the environment. </param>
        /// <returns> Returns the type 'T' instance passed in as '<paramref name="comp"/>'. </returns>        
        public static T RequireScript<T>(this T comp, string scriptPath, RenderTargets renderTarget = RenderTargets.Header, string environmentName = null)
            where T : class, ITagComponent
        {
            return comp.RequireResource(scriptPath, ResourceTypes.Script, renderTarget, 0, environmentName);
        }

        /// <summary> Adds a required script (usually JavaScript) to this component, if it has not been added already. </summary>
        /// <typeparam name="T"> Generic type parameter. </typeparam>
        /// <param name="comp"> The comp to act on. </param>
        /// <param name="scriptPath"> A URI to the script to associated with this component. </param>
        /// <param name="renderTarget"> Where to render the script on a page when 'Render()' is called. </param>
        /// <param name="environment"> The environment. </param>
        /// <returns> Returns the type 'T' instance passed in as '<paramref name="comp"/>'. </returns>        
        public static T RequireScript<T>(this T comp, string scriptPath, RenderTargets renderTarget, Environments environment)
            where T : class, ITagComponent
        {
            return comp.RequireResource(scriptPath, ResourceTypes.Script, renderTarget, 0, environment);
        }

        /// <summary> Adds a required CSS reference to this component, if it has not been added already. </summary>
        /// <typeparam name="T"> Generic type parameter. </typeparam>
        /// <param name="comp"> The comp to act on. </param>
        /// <param name="cssPath"> A URI to the script to associated with this component. </param>
        /// <param name="renderTarget"> (Optional) Where to render the CSS on a page when 'Render()' is called. </param>
        /// <param name="environmentName"> (Optional) Name of the environment. </param>
        /// <returns> Returns the type 'T' instance passed in as '<paramref name="comp"/>'. </returns>        
        public static T RequireCSS<T>(this T comp, string cssPath, RenderTargets renderTarget = RenderTargets.Header, string environmentName = null)
            where T : class, ITagComponent
        {
            return comp.RequireResource(cssPath, ResourceTypes.Script, renderTarget, 0, environmentName);
        }

        /// <summary> Adds a required CSS reference to this component, if it has not been added already. </summary>
        /// <typeparam name="T"> Generic type parameter. </typeparam>
        /// <param name="comp"> The comp to act on. </param>
        /// <param name="cssPath"> A URI to the script to associated with this component. </param>
        /// <param name="renderTarget"> Where to render the CSS on a page when 'Render()' is called. </param>
        /// <param name="environment"> The environment. </param>
        /// <returns> Returns the type 'T' instance passed in as '<paramref name="comp"/>'. </returns>        
        public static T RequireCSS<T>(this T comp, string cssPath, RenderTargets renderTarget, Environments environment)
            where T : class, ITagComponent
        {
            return comp.RequireResource(cssPath, ResourceTypes.Script, renderTarget, 0, environment);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        ///     Inserts an inline script into a given event attribute for this component (i.e. "onclick"). If one or more scripts
        ///     already exists for the event, this new script is appended.
        /// </summary>
        /// <typeparam name="T"> Generic type parameter. </typeparam>
        /// <param name="comp"> The comp to act on. </param>
        /// <param name="eventAttributeName"> The attribute event name for an event on this component. </param>
        /// <param name="script"> The inline script to set.  If a script is already set. </param>
        /// <returns> Returns the type 'T' instance passed in as '<paramref name="comp"/>'. </returns>        
        public static T AddEventScript<T>(this T comp, string eventAttributeName, string script)
            where T : class, ITagComponent
        {
            if (string.IsNullOrEmpty(script))
                return comp;

            script = script.Trim();

            if (!script.EndsWith("}") && !script.EndsWith(";"))
                script += ";"; // (make sure the script is terminated correctly)

            string currentScript = comp.Attributes.Value(eventAttributeName).Render();

            if (!string.IsNullOrWhiteSpace(currentScript))
            {
                currentScript = currentScript.Trim();

                if (!currentScript.EndsWith("}") && !currentScript.EndsWith(";"))
                    currentScript += ";"; // (make sure the script is terminated correctly)

                comp.Attributes.SetAttribute(eventAttributeName, currentScript + " " + script);
            }
            else comp.Attributes.SetAttribute(eventAttributeName, script);

            return comp;
        }

        // --------------------------------------------------------------------------------------------------------------------
    }
}
