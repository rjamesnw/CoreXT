using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ICS;

namespace ICS.FieldTypes
{
    public class DateTimeField : DataField<DateTime>
    {
        #region Fields (1)

        public static string DefaultFormat = "yyyyMMddhhmmss";

        #endregion Fields

        #region Constructors (2)

        public DateTimeField(DateTime value, bool isUndefined)
            : this(value)
        {
            IsUndefined = isUndefined;
        }
        public DateTimeField(string value, bool isUndefined)
            : this(DateTime.ParseExact(value, DefaultFormat, null))
        {
            IsUndefined = isUndefined;
        }
        public DateTimeField(string value)
            : this(DateTime.ParseExact(value, DefaultFormat, null)) { }

        // (standard ISO time format)
        /* Override the IDataField interface property, which just returns FieldValue as a formatted string (using DefaultFormat), and sets FieldValue by converting the string to a DateTime object (allow a conversion exception to be thrown). */
        public DateTimeField(DateTime value) : base(value) { }

        #endregion Constructors

        #region Properties (1)

        public override string Text
        {
            get
            {
                return base.FieldValue.ToString(DefaultFormat);
            }
            set
            {
                base.FieldValue = DateTime.Parse(value);
            }
        }

        #endregion Properties
    }
}
