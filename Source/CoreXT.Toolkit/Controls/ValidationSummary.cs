using System;
using System.IO;
using System.Text;
using System.Web.Mvc;

namespace CoreXT.Toolkit.Controls
{
    public class ValidationSummary : ControlBase
    {
        void _Initialize(ViewContext viewContext)
        {
            if (viewContext == null)
            {
                throw new ArgumentNullException("viewContext");
            }

            ViewDataDictionary viewData = viewContext.ViewData;

            if (viewData == null)
            {
                throw new ArgumentNullException("viewData");
            }

            if (viewData.ModelState.IsValid)
            {
                return;
            }

            StringBuilder listItems = new StringBuilder();

            foreach (var modelStateKvp in viewData.ModelState)
            {
                foreach (var modelError in modelStateKvp.Value.Errors)
                {
                    TagBuilder listItem = new TagBuilder("li");
                    listItem.SetInnerText(modelError.ErrorMessage);

                    listItems.AppendLine(listItem.ToString());
                }
            }

            InnerHtml = listItems.ToString();
        }

        public ValidationSummary(ViewContext viewContext)
            : base("ul", viewContext)
        {
            _Initialize(viewContext);

            // Set a default CSS class.
            Class = "summary-validation-errors";
        }
    }
}
