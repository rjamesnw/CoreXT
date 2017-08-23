using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ICS;

namespace ICS.FieldTypes
{
    public class NumericField : DataField<double>
    {
        #region Constructors (2)

        public NumericField(double value, bool isUndefined)
            : this(value)
        {
            IsUndefined = isUndefined;
        }

        /* Override the IDataField interface property, which just returns FieldValue as a string, and sets FieldValue with the string converted to a double value (allow a conversion exception to be thrown). */
        public NumericField(double value) : base(value) { }

        public NumericField(string value, bool isUndefined)
            : this(Convert.ToDouble(value))
        {
            IsUndefined = isUndefined;
        }

        public NumericField(string value) : this(Convert.ToDouble(value)) { }

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
                base.FieldValue = Convert.ToDouble(value);
            }
        }

        #endregion Properties
    }
}
