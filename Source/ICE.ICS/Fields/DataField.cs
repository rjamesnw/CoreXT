using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ICS;

namespace ICS
{
    public class DataField<T> : IDataField, IComparable
    {
        #region Constructors (2)

        public DataField(T value, bool isUndefined)
            : this(value)
        {
            IsUndefined = isUndefined;
        }

        // (‘false’ if a value was found)
        // set this to false in the default constructor.
        public DataField(T value)
        {
            FieldValue = value;
        }

        #endregion Constructors

        #region Properties (2)

        public T FieldValue { get; set; }

        // 1. FieldValue is null if two double quotes are detected (i.e. …|""|…).
        // 2. FieldValue should default to null via the constructor.
        public bool IsUndefined { get; set; }

        #endregion Properties

        #region Methods (6)

        // Public Methods (6) 

        public static bool operator !=(DataField<T> val1, string val2)
        {
            return val1.Text != val2;
        }

        public static bool operator !=(string val1, DataField<T> val2)
        {
            return val2.Text != val1;
        }

        public static bool operator ==(DataField<T> val1, string val2)
        {
            return val1.Text == val2;
        }

        public static bool operator ==(string val1, DataField<T> val2)
        {
            return val2.Text == val1;
        }

        public override bool Equals(object obj)
        {
            return CompareTo(obj) == 0;
        }

        public override int GetHashCode()
        {
            return Text.Length;
        }

        #endregion Methods

        /*object-based overrides*/
        /*(see http://msdn.microsoft.com/en-us/library/system.object_members.aspx for a list of object methods that should be overridden [“Finalize” not needed] to focus on “Value”.)*/
        /* Implement the IDataField interface property as a virtual property, which just returns this.ToString(). The set, however, should produce an exception error. */

        #region IDataField Members

        public virtual string Text
        {
            get
            {
                if (typeof(T).IsClass)
                {
                    if (FieldValue.Equals(default(T)))
                    {
                        return "";
                    }
                    else
                    {
                        return FieldValue.ToString();
                    }
                }
                else
                {
                    return FieldValue.ToString();
                }
            }
            set
            {
                throw new NotImplementedException();
            }
        }

        public override string ToString()
        {
            return Text;
        }

        public Type PrimitiveValueType
        {
            get { return typeof(T); }
        }

        public object PrimitiveValue
        {
            get { return FieldValue; }
            set { FieldValue = (T)value; } // (natively will throw invalid cast exception if this fails, which is acceptable)
        }

        #endregion

        #region IComparable Members

        public int CompareTo(object obj)
        {
            string val = obj != null ? obj.ToString() : string.Empty;
            return val.CompareTo(Text);
        }

        #endregion
    }
}
