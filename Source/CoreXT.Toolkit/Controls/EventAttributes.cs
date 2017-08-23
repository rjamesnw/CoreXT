using System;
using System.Web.Mvc;

namespace CoreXT.Toolkit.Controls
{
	public abstract class EventAttributes : ControlBase
	{
		public string OnBlur
		{
			set { AddEventScript("onblur", value); }
		}

		public string OnClick
		{
			set { AddEventScript("onclick", value); }
		}

		public string OnDoubleClick
		{
			set { AddEventScript("ondblclick", value); }
		}

		public string OnFocus
		{
			set { AddEventScript("onfocus", value); }
		}

		public string OnKeyDown
		{
			set { AddEventScript("onkeydown", value); }
		}

		public string OnKeyPress
		{
			set { AddEventScript("onkeypress", value); }
		}

		public string OnKeyUp
		{
			set { AddEventScript("onkeyup", value); }
		}

		public string OnMouseDown
		{
			set { AddEventScript("onmousedown", value); }
		}

		public string OnMouseMove
		{
			set { AddEventScript("onmousemove", value); }
		}

		public string OnMouseOver
		{
			set { AddEventScript("onmouseover", value); }
		}

		public string OnMouseOut
		{
			set { AddEventScript("onmouseout", value); }
		}

		public string OnMouseUp
		{
			set { AddEventScript("style", value); }
		}

		public EventAttributes(string tagName, ViewContext viewContext = null)
			: base(tagName, viewContext) { }

		public EventAttributes(string tagName, TagRenderMode tagRenderMode, ViewContext viewContext = null)
			: base(tagName, tagRenderMode, viewContext) { }
	}
}
