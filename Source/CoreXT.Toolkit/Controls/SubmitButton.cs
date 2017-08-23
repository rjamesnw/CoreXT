using System.Web.Mvc;

namespace CoreXT.Toolkit.Controls
{
	public class SubmitButton : Input
	{
		public object Value
		{
			set { Attributes.MergeString("value", value); }
		}

		public SubmitButton(ViewContext viewContext, string name)
			: base(viewContext, InputTypes.Submit, name) { }
	}
}