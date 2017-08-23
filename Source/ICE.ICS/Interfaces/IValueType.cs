using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ICS
{
    public interface IValueType
    {
        #region Data Members (2)

        // Added to get type from derived classes.
        /// <summary>
        /// Returns the underlying (primitive) value encapsulated by the derived classes.
        /// </summary>
        object PrimitiveValue { get; set; }

        // override object.ToString() when implementing this.
        /// <summary>
        /// (i.e. String, DateTime, Double, XmlNode, etc.).
        /// </summary>
        Type PrimitiveValueType { get; }

        #endregion Data Members

        #region Operations (1)

        /// <summary>
        /// Converts the primitive value to a string.
        /// </summary>
        string ToString();

        #endregion Operations
        // Added to get value from derived classes.
    }
}
