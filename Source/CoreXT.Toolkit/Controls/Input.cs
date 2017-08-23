using Common;
using System;
using System.Globalization;
using System.Web.Mvc;

namespace CoreXT.Toolkit.Controls
{
    public abstract class Input : EventAttributes
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

            string attemptedValue = viewData.GetModelAttemptedValue(Name);

            if (Type == InputTypes.CheckBox)
            {
                if (!string.IsNullOrEmpty(attemptedValue))
                {
                    bool isChecked;

                    // The attempted value will be "true,false" or "false" - split to be on the safe side.
                    string[] attemptedValues = attemptedValue.Split(',');

                    if (bool.TryParse(attemptedValues[0], out isChecked))
                    {
                        if (isChecked)
                        {
                            Attributes["checked"] = "checked";
                        }
                        else
                        {
                            Attributes.Remove("checked");
                        }
                    }
                }
            }
            else if (Type == InputTypes.RadioButton)
            {
                if (!string.IsNullOrEmpty(attemptedValue))
                {
                    string value = Attributes.Value("value");

                    if (value.Equals(attemptedValue, StringComparison.InvariantCultureIgnoreCase))
                    {
                        Attributes["checked"] = "checked";
                    }
                    else
                    {
                        Attributes.Remove("checked");
                    }
                }
            }
            else if (Type != InputTypes.File)
            {
                if (attemptedValue != null)
                {
                    Attributes["value"] = attemptedValue;
                }
                else if (viewData[Name] != null)
                {
                    Attributes["value"] = viewData.EvalString(Name);
                }
            }

            ModelState modelState;

            if (viewData.ModelState.TryGetValue(Name, out modelState))
            {
                if (modelState.Errors.Count > 0)
                {
                    AddClass(InvalidCssClass);
                }
            }
        }

        protected string Name
        {
            get { return Attributes.Value("name"); }
            private set { Attributes.MergeString("name", value); }
        }

        public string InvalidCssClass { get; set; }

        protected virtual bool IsIDRequired
        {
            get { return Type != InputTypes.RadioButton; }
        }

        protected InputTypes Type
        {
            get { return ControlBaseHelper.GetInputTypeEnum(Attributes.Value("type")); }
            set { Attributes["type"] = ControlBaseHelper.GetInputTypeString(value); }
        }

        public Input(ViewContext viewContext, InputTypes type, string name)
            : base("input", TagRenderMode.SelfClosing, viewContext)
        {
            _Initialize(viewContext);

            if (string.IsNullOrEmpty(name))
            {
                throw new ArgumentException("Value cannot be null or empty.", "name");
            }

            Type = type;

            // Don't set the "id" attribute for certain controls because 2 or more could share the same name (e.g. radio buttons).
            if (IsIDRequired)
            {
                ID = name;
            }

            InvalidCssClass = "input-validation-error";
            Name = name;
        }
    }
}