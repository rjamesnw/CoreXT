using System.Text;
using System.Web.Mvc;
using System;
using System.IO;
namespace CoreXT.Toolkit.Controls
{
public class TextBox : Input
{
	#region MvcControlBuilder Members

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

	#endregion

	public int Columns
	{
		set { Attributes.MergeString("size", value.ToString()); }
	}
	public string MaximumLength
	{
		set { Attributes.MergeString("maxlength", value); }
	}

	public string WatermarkedCssClass { get; set; }

	public string WatermarkText { get; set; }

	public object Value
	{
		set { Attributes.MergeString("value", value); }
	}

	public TextBox(ViewContext viewContext, string name)
		: base(viewContext, InputTypes.Text, name)
	{
		WatermarkedCssClass = "input-watermarked";
	}
}
}
