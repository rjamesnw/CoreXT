using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ICS.Enumerators;

namespace ICS
{
    // (this interface is implemented by different source translators)
    // ITranslator comments added for method signatures.
    public interface ITranslator
    {
        /// <summary>
        /// Get a value specified by "Path".
        /// </summary>
        /// <param name="xmlSourceEnum">"xmlSourceEnum.Value" will hold the XmlNodeField, or DataListField with XmlNodeField items.</param>
        /// <param name="path">"Path" is the desired value to return from the XML.</param>
        /// <param name="index">For DataListField types, this is the index of the node to pull a value for. Defaults to 0.</param>
        /// <returns></returns>
        IValueType GetValue(EnumeratorBase xmlSourceEnum, string[] path, int index);

        /// <summary>
        /// Performs the opposite of GetValue() - which is, to simply convert the specified value, or list 
        /// of values, to an XML node(s) for the specified "Path".
        /// See GetValue() for parameter descriptions.
        /// </summary>
        void SetValue(EnumeratorBase xmlSourceEnum, string[] path, IValueType value, int index);
    }

}
