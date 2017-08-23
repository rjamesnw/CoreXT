using System.IO;
using System.Web.Mvc;

namespace CoreXT.Toolkit.Controls
{
	public class CheckBox : Input
	{
		#region MvcControl Members

		protected override void RenderHtml(StringWriter writer, ViewContext viewContext)
		{
			// When a checkbox is unchecked, it doesn't get included in the post data or query string.
			// Render a hidden element with the same name as the checkbox but set the "value" attribute to "false".
			// A value of "true" or "true,false" will be included in the form data (checked or unchecked respectively).
			TagBuilder hiddenCheckBox = new TagBuilder("input");
			hiddenCheckBox.Attributes["name"] = Name;
			hiddenCheckBox.Attributes["type"] = "hidden";
			hiddenCheckBox.Attributes["value"] = "false";

			writer.Write(hiddenCheckBox.ToString(TagRenderMode.SelfClosing));
		}

		#endregion

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

		public CheckBox(ViewContext viewContext, string name)
			: base(viewContext, InputTypes.CheckBox, name)
		{
			// The value SHOULD always be set to true, even when it isn't checked.
			// Use caution when overriding Value.
			Value = "true";
		}
	}
}
