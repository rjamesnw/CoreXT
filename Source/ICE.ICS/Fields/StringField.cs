using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ICS;

namespace ICS.FieldTypes {
    public class StringField : DataField<string> {
		#region Constructors (2) 

        public StringField(string value, bool isUndefined) : this(value){
            IsUndefined = isUndefined;
        }

        /* Override the IDataField interface property, which just returns FieldValue, and sets FieldValue. */
        public StringField(string value) : base(value) {}

		#endregion Constructors 

		#region Properties (1) 

        public override string Text
        {
            get
            {
                return base.Text;
            }
            set
            {
                base.FieldValue = value;
            }
        }

		#endregion Properties 
    }
}
