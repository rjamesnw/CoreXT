using System;
using System.Web.Mvc;
using System.Globalization;
using System.Text;
using System.IO;
using Common;

namespace CoreXT.Toolkit.Controls
{
    public class TextArea : ControlBase
    {
        protected override void RenderHtml(StringWriter writer, ViewContext viewContext)
        {
            if (writer == null)
            {
                throw new ArgumentNullException("writer");
            }

            if (viewContext == null)
            {
                throw new ArgumentNullException("viewContext");
            }

            ControlBaseHelper.RenderWatermarkScript(writer, viewContext, ID, Name, WatermarkedCssClass, WatermarkText);
        }

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

            string attemptedValue = viewData.GetModelAttemptedValue(Name);

            Value = attemptedValue ?? viewData.EvalString(Name);

            ModelState modelState;

            if (viewData.ModelState.TryGetValue(Name, out modelState))
            {
                if (modelState.Errors.Count > 0)
                {
                    AddClass(InvalidCssClass);
                }
            }
        }

        private int Columns
        {
            set { Attributes.MergeString("cols", value); }
        }

        public string InvalidCssClass { get; set; }

        public bool IsDisabled
        {
            set
            {
                if (value)
                {
                    Attributes.MergeString("disabled", "disabled");
                }
                else
                {
                    Attributes.Remove("disabled");
                }
            }
        }

        public bool IsReadOnly
        {
            set
            {
                if (value)
                {
                    Attributes.MergeString("readonly", "readonly");
                }
                else
                {
                    Attributes.Remove("readonly");
                }
            }
        }

        protected string Name
        {
            get { return Attributes.Value("name"); }
            private set { Attributes.MergeString("name", value); }
        }

        private int Rows
        {
            set { Attributes.MergeString("rows", value); }
        }

        public string WatermarkedCssClass { get; set; }

        public string WatermarkText { get; set; }

        public object Value
        {
            set { SetInnerText(value); }
        }

        public TextArea(ViewContext viewContext, string name, int rows, int columns)
            : base("textarea", viewContext)
        {
            _Initialize(viewContext);

            Columns = columns;
            ID = name;
            InvalidCssClass = "input-validation-error";
            Name = name;
            Rows = rows;
            WatermarkedCssClass = "input-watermarked";
        }
    }
}
