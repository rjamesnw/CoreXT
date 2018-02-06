using CoreXT.ASPNet;
using CoreXT.Entities;
using CoreXT.MVC;
using CoreXT.Toolkit.Components;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq.Expressions;

namespace CoreXT.Toolkit.Web
{
    // ########################################################################################################################

    public abstract partial class ViewPage<TModel>
    {
        // --------------------------------------------------------------------------------------------------------------------

        public T GetControl<T>() where T : class, IWebComponent { return Context?.GetService<T>().SetPage(this); }

        /// <summary>
        /// Returns a link element with the given text and URL (href).
        /// </summary>
        /// <param name="text">The text for the link.</param>
        /// <param name="href">The URL for the link.</param>
        public Link Link(string text, string href)
        {
            //return new Link(text, href);
            return GetControl<Link>().Configure(text, href);
        }

        /// <summary>
        /// Returns a element with the given text and URL (href).
        /// </summary>
        /// <param name="expression">Provides a value for the link's 'href' attribute.</param>
        /// <param name="text">The text for the link.</param>
        public IHtmlContent Link<TValue>(Expression<Func<TModel, TValue>> expression, string text = null)
        {
            return GetControl<Link>().Configure(text, null).RenderFor(expression);
            // (uses a special renderer in order to invoke the strongly typed 'Render()' method to support model property expressions)
        }

        /// <summary>
        /// Returns a link element with the given text and URL (href).
        /// </summary>
        /// <param name="text">The text for the link.</param>
        /// <param name="href">The URL for the link.</param>
        public ActionLink ActionLink(string text, string actionName, string controllerName = null, string areaName = null,
            string fragment = null, string routeName = null)
        {
            return GetControl<ActionLink>().Configure(text, actionName, controllerName, areaName, fragment, routeName);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns a menu control to construct menu elements.
        /// </summary>
        public Menu Menu(string caption, string actionName = null, string controllerName = null, string areaName = null)
        {
            return GetControl<Menu>().Configure(caption, actionName, controllerName, areaName);
        }

        // --------------------------------------------------------------------------------------------------------------------

        /// <summary>
        /// Returns a modal control to construct modal window elements.
        /// Razor template delegates can be used for the title, header, and footer parameters (typically in the form
        /// '<see cref="item=>@{text}{/text}"/>').
        /// </summary>
        public Modal Modal(RazorTemplateDelegate<object> title, bool allowClose, RazorTemplateDelegate<object> header,
            RazorTemplateDelegate<object> body, RazorTemplateDelegate<object> footer = null)
        {
            return GetControl<Modal>().Configure(title, allowClose, header, body, footer);
        }

        /// <summary>
        /// Returns a modal control to construct modal window elements.
        /// Razor template delegates can be used for the header and footer parameters.
        /// </summary>
        public Modal Modal(string title, bool allowClose, RazorTemplateDelegate<object> header,
            RazorTemplateDelegate<object> body, RazorTemplateDelegate<object> footer = null)
        {
            return GetControl<Modal>().Configure(title, allowClose, header, body, footer);
        }

        /// <summary>
        /// Returns a modal control to construct modal window elements.
        /// Razor template delegates can be used for the header and footer parameters.
        /// </summary>
        public Modal Modal(string title, string header,
            RazorTemplateDelegate<object> body, RazorTemplateDelegate<object> footer = null, bool allowClose = true)
        {
            return GetControl<Modal>().Configure(title, header, body, footer, allowClose);
        }

        /// <summary>
        /// Returns a modal control to construct modal window elements.
        /// </summary>
        public Modal Modal(string title, string header, string body, string footer = null, bool allowClose = true)
        {
            return GetControl<Modal>().Configure(title, header, body, footer, allowClose);
        }

        // --------------------------------------------------------------------------------------------------------------------
     
            /// <summary>
        /// Returns a modal control to construct modal window elements.
        /// </summary>
        public Table Table(ITable<object> items)
        {
            return GetControl<Table>().Configure(items);
        }

        // --------------------------------------------------------------------------------------------------------------------
    }

    // ########################################################################################################################
}
