using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ICS.Enumerators
{
    // Physicians fall under Persons, therefore derive from PersonEnumerator
    public class PhysicianEnumerator : PersonEnumerator
    {
        public new const string Name = "Physician";
        public PhysicianEnumerator(EnumeratorBase parent) : base(parent) { }
        public PhysicianEnumerator() { }
        override public string DerivedName { get { return Name; } }

        public PhysicianIDEnumerator PhysicianID
        {
            get { return new PhysicianIDEnumerator(this); }
            set { EnumeratorBase.TranslatorSetValue(this, PhysicianIDEnumerator.Name, value, 0); }
        }
        public CMDEnumerator CMD
        {
            get { return new CMDEnumerator(this); }
            set { EnumeratorBase.TranslatorSetValue(this, CMDEnumerator.Name, value, 0); }
        }
        public ServiceEnumerator Service
        {
            get { return new ServiceEnumerator(this); }
            set { EnumeratorBase.TranslatorSetValue(this, ServiceEnumerator.Name, value, 0); }
        }
        public PrefixEnumerator Prefix
        {
            get { return new PrefixEnumerator(this); }
            set { EnumeratorBase.TranslatorSetValue(this, PrefixEnumerator.Name, value, 0); }
        }
        public DegreeEnumerator Degree
        {
            get { return new DegreeEnumerator(this); }
            set { EnumeratorBase.TranslatorSetValue(this, DegreeEnumerator.Name, value, 0); }
        }
    }

    public class PhysicianIDEnumerator : SourceEnumeratorCommon<PhysicianIDEnumerator>
    {
        public const string Name = "InternalPhysicianID";
        public PhysicianIDEnumerator(EnumeratorBase parent) : base(parent) { }
        public PhysicianIDEnumerator() { }
        override public string DerivedName { get { return Name; } }
    }

    public class CMDEnumerator : SourceEnumeratorCommon<CMDEnumerator>
    {
        public const string Name = "CMD";
        public CMDEnumerator(EnumeratorBase parent) : base(parent) { }
        public CMDEnumerator() { }
        override public string DerivedName { get { return Name; } }
    }

    public class ServiceEnumerator : SourceEnumeratorCommon<ServiceEnumerator>
    {
        public const string Name = "Service";
        public ServiceEnumerator(EnumeratorBase parent) : base(parent) { }
        public ServiceEnumerator() { }
        override public string DerivedName { get { return Name; } }
    }

    public class PrefixEnumerator : SourceEnumeratorCommon<PrefixEnumerator>
    {
        public const string Name = "Prefix";
        public PrefixEnumerator(EnumeratorBase parent) : base(parent) { }
        public PrefixEnumerator() { }
        override public string DerivedName { get { return Name; } }
    }

    public class DegreeEnumerator : SourceEnumeratorCommon<DegreeEnumerator>
    {
        public const string Name = "Degree";
        public DegreeEnumerator(EnumeratorBase parent) : base(parent) { }
        public DegreeEnumerator() { }
        override public string DerivedName { get { return Name; } }
    }
}