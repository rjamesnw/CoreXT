using System;
using System.Web.Mvc;

namespace CoreXT.Toolkit.Controls
{
	public class CDSJScript : ControlBase
	{
		protected ScriptTypes Type
		{
			set { Attributes.MergeString("type", ControlBaseHelper.GetScriptTypeString(value)); }
		}

		public CDSJScript(ScriptTypes type, string innerHtml)
			: base("script")
		{
			InnerHtml = innerHtml;
			Type = type;
		}
	}
}
