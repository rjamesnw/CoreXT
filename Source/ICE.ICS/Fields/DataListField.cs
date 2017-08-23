using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml;
using ICS;

namespace ICS.FieldTypes
{
    public class DataListField<T> : DataField<List<T>>
        where T: class, IValueType
    {
		#region Fields (1) 

        // Customize this for future
        public string Delimiter = ",";

		#endregion Fields 

		#region Constructors (2) 

        public DataListField(List<T> value, bool isUndefined)
            : this(value)
        {
            IsUndefined = isUndefined;
        }

        public DataListField(List<T> value) : base(value) { }

		#endregion Constructors 

		#region Properties (1) 

        public override string Text
        {
            get
            {
                return GetDelimitedText(Delimiter);
            }
            set
            {
                SetDelimitedText(value, Delimiter);
            }
        }

		#endregion Properties 

		#region Methods (2) 

		// Public Methods (2) 

        public string GetDelimitedText(string delimiter)
        {
            string value = string.Empty;
            foreach (IValueType item in FieldValue)
            {
                if (value != string.Empty) { value += delimiter; }
                value += (item != null) ? item.ToString() : "";
            }
            return value;
        }

        public void SetDelimitedText(string value, string delimiter)
        {
            string[] values = value.Split(new string[] { delimiter }, StringSplitOptions.None);
            base.FieldValue = new List<T>(values.Length);
            foreach (string item in values)
            {
                base.FieldValue.Add((T)(object)(new StringField(item)));
            }
        }

		#endregion Methods 
    }
}
