using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ICS.Enumerators
{
    // Patients fall under Persons, therefore derive from PersonEnumerator
    public class PatientEnumerator : PersonEnumerator
    {
        public new const string Name = "Patient";
        public PatientEnumerator(EnumeratorBase parent) : base(parent) { }
        public PatientEnumerator() { }
        override public string DerivedName { get { return Name; } }

        public PatientIDEnumerator PatientID
        {
            get { return new PatientIDEnumerator(this); }
            set { EnumeratorBase.TranslatorSetValue(this, PatientIDEnumerator.Name, value, 0); }
        }
        public OHIPEnumerator OHIP
        {
            get { return new OHIPEnumerator(this); }
            set { EnumeratorBase.TranslatorSetValue(this, OHIPEnumerator.Name, value, 0); }
        }
    }

    public class PatientIDEnumerator : SourceEnumeratorCommon<PatientIDEnumerator>
    {
        public const string Name = "InternalPatientID";
        public PatientIDEnumerator(EnumeratorBase parent) : base(parent) { }
        public PatientIDEnumerator() { }
        override public string DerivedName { get { return Name; } }
    }

    public class OHIPEnumerator : SourceEnumeratorCommon<OHIPEnumerator>
    {
        public const string Name = "OHIP";
        public OHIPEnumerator(EnumeratorBase parent) : base(parent) { }
        public OHIPEnumerator() { }
        override public string DerivedName { get { return Name; } }
    }

    //public class AEnumerator : SourceEnumeratorCommon<AEnumerator>
    //{
    //    public const string Name = "FieldName";
    //    public AEnumerator(EnumeratorBase parent) : base(parent) { }
    //    public AEnumerator() { }
    //    override public string DerivedName { get { return Name; } }
    //}
}