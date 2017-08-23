using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ICS.FieldTypes;

namespace ICS.Enumerators
{
    // (this base class is implemented by different readers)
    // (IValueType is simple “attached” to acceptable value classes)
    public abstract class EnumeratorBase : IValueType
    {
        // --------------------------------------------------------------------------------------------------------------------

        private ITranslator _Translator = null;

        public int Count
        {
            get
            {
                return ValueIsList ? ((IList)PrimitiveValue).Count : 1;
                // (1, because the local "Value" is 1 item by default)
            }
        }

        public abstract string DerivedName { get; }

        public string NamePath
        { get { return Parent != null ? Parent.NamePath + "." + DerivedName : DerivedName; } }

        public EnumeratorBase Parent { get; set; }

        /// <summary>
        /// Gets or sets the primitive value of "Value" (i.e. String, DateTime, Double, XmlNode, etc.).
        /// </summary>
        public object PrimitiveValue
        {
            get { return Value != null ? Value.PrimitiveValue : null; }
            set { if (Value != null) Value.PrimitiveValue = value; else throw new InvalidOperationException("SourceEnumeratorBase.Value is null, cannot set SourceEnumeratorBase.Value.Value."); }
        }

        public Type PrimitiveValueType
        {
            get { return Value != null ? Value.PrimitiveValueType : null; }
        }

        // Changes to "ITranslator Translator" - will traverse parents to get his now.
        public ITranslator Translator
        {
            get { return _Translator != null ? _Translator : (Parent != null ? Parent.Translator : null); }
            set { _Translator = value; }
        }

        private IValueType _Value = null;
        public IValueType Value // FIXED
        {
            get
            {
                if (_Value == null)
                    TranslatorGetValue();
                return _Value;
            }
            set { _Value = value; }
        }

        public int ValueIndex { get; set; }

        // SourceEnumeratorBase.ValueIndex: (defaults to 0 - check 'ValueIsList' to see if the value is a list)
        public bool ValueIsList { get { return PrimitiveValue is IList; } }

        // --------------------------------------------------------------------------------------------------------------------

        // Added "index" to select a value (for list types - defaults to 0).
        public EnumeratorBase(EnumeratorBase parent, ITranslator trans, int index)
        { Parent = parent; Translator = trans; Value = null; ValueIndex = index; }

        // Used for non-SourceEnumerator objects.
        public EnumeratorBase(EnumeratorBase parent)
            : this(parent, null, 0) { }

        // Used with SourceEnumerator only.
        public EnumeratorBase(ITranslator trans)
            : this(null, trans, 0) { }

        // Allow creation of object with a parameterless constructor.
        public EnumeratorBase()
            : this(null, null, 0) { }

        // --------------------------------------------------------------------------------------------------------------------

        /* An export method, that accepts an exporter to move data to other destinations (i.e. databases, files, emails, etc.). */
        public bool Export(IExporter exporter)
        {
            if (!exporter.IsInitialized)
            {
                exporter.Initialize(this);
            }

            exporter.Reset();

            //try
            //{
            exporter.Export();
            //}
            //catch (Exception)
            //{

            //    throw; 
            //}

            // TODO: Exceptions go to the log "export_log"

            return true;
        }

        // (for IValueType)
        public override string ToString()
        { return Value != null ? Value.ToString() : ""; }

        // New: Added implicit conversion to strings for enumerators.
        public static implicit operator string(EnumeratorBase enumBase) { return enumBase.ToString(); }

        // -------------------------------------------------------------------------------------------
        // Translator Methods
        /* Turns out is was a bad idea to get "Value" by default via constructor. Instead, the
         * value should only be pulled from the translator when need comes.
         * This recursive call traverses the parents once the LAST enumerator is ready to read a value.
         * 
         * FIXED: Made some fixes to the method (_Value was not being updated).
         */
        public IValueType TranslatorGetValue()
        {
            if (Parent != null)
            {
                Parent.TranslatorGetValue(); // (recursively get dependent XML nodes first)

                if (Translator == null)
                    throw new InvalidOperationException("No translator specified.");

                _Value = Translator.GetValue(Parent, NamePath.Split('.'), ValueIndex);
                // Note: The translator will expect Parent.Value to contain the XmlNodeField or DataListField<XmlNodeField> data it needs to read from.

                return _Value;
            }

            if (_Value == null) // Note: This shouldn't happen, but just in case...
                _Value = new XmlNodeField(null, true);

            return _Value; // Note: top level source enumerator simply returns the root XML document (as XmlNodeField).
        }

        /* Note: The following static methods are used at the end points, where the data values are
         * retrieved from. This is to prevent the unnecessary need to create an object just to read
         * a value from the translator.
         */
        public static IValueType TranslatorGetValue(EnumeratorBase parent, string valueName, int index)
        { return parent.Translator.GetValue(parent, (parent.NamePath + "." + valueName).Split('.'), index); }

        public void TranslatorSetValue(IValueType value)
        { Translator.SetValue(Parent, NamePath.Split('.'), value, ValueIndex); }

        public static void TranslatorSetValue(EnumeratorBase parent, string valueName, IValueType value, int index)
        { parent.Translator.SetValue(parent, (parent.NamePath + "." + valueName).Split('.'), value, index); }

        // --------------------------------------------------------------------------------------------------------------------

        // GetListValue (not used yet)
        public IValueType GetListValue(int index)
        {
            if (ValueIsList)
                return ((IList)PrimitiveValue)[index] as IValueType;
            else if (index == 0)
                return Value; // (assume at least "Value" if index is 0)
            else
                throw new IndexOutOfRangeException();
        }
        // GetListValue (not used yet)
        public void GetListValue(int index, IValueType value)
        {
            if (ValueIsList)
                ((IList)PrimitiveValue)[index] = value;
            else if (index == 0)
                Value = value; // (assume at least "Value" if index is 0)
            else
                throw new IndexOutOfRangeException();
        }

        /* Export() will handle all the error trapping and logging (see 3.2). */

        // --------------------------------------------------------------------------------------------------------------------
    }
}
