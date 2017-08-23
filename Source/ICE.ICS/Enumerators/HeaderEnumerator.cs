using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ICS.Enumerators
{
    /* Another translator, just to show how they “chain” together. */
    public class HeaderEnumerator : EnumeratorBase
    {

        public const string Name = "Header";


        public HeaderEnumerator(EnumeratorBase parent) : base(parent) { }

        public HeaderEnumerator() { }


        override public string DerivedName { get { return Name; } }

        public CreationDateEnumerator CreationDate
        {
            get { return new CreationDateEnumerator(this); }
            set { EnumeratorBase.TranslatorSetValue(this, CreationDateEnumerator.Name, value, 0); }
        }

        /* Example implementation */
        /* (pulls a “header”, whatever that may mean, based on the translator) */
        /* ... and other readers for header data ... */
    }

    public class CreationDateEnumerator : SourceEnumeratorCommon<CreationDateEnumerator>
    {
        public const string Name = "CreationDate";
        public CreationDateEnumerator(EnumeratorBase parent) : base(parent) { }
        public CreationDateEnumerator() { }
        override public string DerivedName { get { return Name; } }
    }
}
