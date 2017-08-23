using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CoreXT.Toolkit.Controls
{
	public class ExternalScript : CDSJScript
	{
		protected string Uri
		{
			set { Attributes.MergeString("src", value); }
		}

		public ExternalScript(ScriptTypes type, string uri)
			: base(type, null)
		{
			Uri = uri;
		}
	}
}
