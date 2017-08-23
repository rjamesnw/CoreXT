using System;
using System.Web.Mvc;

namespace CoreXT.Toolkit.Controls
{
	public class RadioButton : Input
	{
		public bool Checked
		{
			set
			{
				if (value)
				{
					Attributes["checked"] = "checked";
				}
				else
				{
					Attributes.Remove("checked");
				}
			}
		}

		public object Value
		{
			set { Attributes.MergeString("value", value); }
		}

		public RadioButton(ViewContext viewContext, string name, object value)
			: base(viewContext, InputTypes.RadioButton, name)
		{
			if (value == null)
			{
				throw new ArgumentNullException("value");
			}

			Value = value;
		}
	}
}
