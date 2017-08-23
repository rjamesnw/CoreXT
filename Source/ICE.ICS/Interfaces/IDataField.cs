using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ICS
{
    public interface IDataField : IValueType
    {
		#region Data Members (1) 

        string Text { get; set; }

		#endregion Data Members 
    }
}
