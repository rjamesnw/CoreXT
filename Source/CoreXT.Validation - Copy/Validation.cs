using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Mvc.ViewFeatures.Internal;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace CoreXT.Validation
{
    public static class ValidationExtensions
    {
        /// <summary>
        /// Checks the ModelState for an error, and returns the given error string if there is one, or null if there is no error
        /// Used to set class="error" on elements to present the error to the user
        /// </summary>
        /// <typeparam name="TModel"></typeparam>
        /// <typeparam name="TProperty"></typeparam>
        /// <param name="htmlHelper"></param>
        /// <param name="expression"></param>
        /// <param name="error"></param>
        /// <returns></returns>
        public static IHtmlContent ValidationErrorFor<TModel, TProperty>(this HtmlHelper<TModel> htmlHelper, Expression<Func<TModel, TProperty>> expression, string error)
        {
            if (htmlHelper.HasError(ExpressionMetadataProvider.FromLambdaExpression(expression, htmlHelper.ViewData, htmlHelper.MetadataProvider)))
                return new HtmlString(error);
            else
                return null;
        }


        private static bool HasError(this HtmlHelper htmlHelper, ModelExplorer modelExplorer)
        {
            string modelName = htmlHelper.ViewContext.ViewData.TemplateInfo.GetFullHtmlFieldName(modelExplorer.Metadata.PropertyName);
            FormContext formContext = htmlHelper.ViewContext.FormContext;
            if (formContext == null)
                return false;

            if (!htmlHelper.ViewData.ModelState.ContainsKey(modelName))
                return false;

            ModelStateEntry modelState = htmlHelper.ViewData.ModelState[modelName];
            if (modelState == null)
                return false;

            ModelErrorCollection modelErrors = modelState.Errors;
            if (modelErrors == null)
                return false;

            return (modelErrors.Count > 0);
        }
    }
}
