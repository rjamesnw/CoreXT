using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ICS.Enumerators
{
    /* Another translator, just to show how they “chain” together. */
    public class PersonEnumerator : SourceEnumeratorCommon<PersonEnumerator>
    {
        public const string Name = "Person";
        public PersonEnumerator(EnumeratorBase parent) : base(parent) { }
        public PersonEnumerator() { }
        override public string DerivedName { get { return Name; } }

        public FirstNameEnumerator FirstName
        {
            get { return new FirstNameEnumerator(this); }
            set { EnumeratorBase.TranslatorSetValue(this, FirstNameEnumerator.Name, value, 0); }
        }
        public MiddleNameEnumerator MiddleName
        {
            get { return new MiddleNameEnumerator(this); }
            set { EnumeratorBase.TranslatorSetValue(this, MiddleNameEnumerator.Name, value, 0); }
        }
        public LastNameEnumerator LastName
        {
            get { return new LastNameEnumerator(this); }
            set { EnumeratorBase.TranslatorSetValue(this, LastNameEnumerator.Name, value, 0); }
        }
        public DoBEnumerator DateOfBirth
        {
            get { return new DoBEnumerator(this); }
            set { EnumeratorBase.TranslatorSetValue(this, DoBEnumerator.Name, value, 0); }
        }
        public GenderEnumerator Gender
        {
            get { return new GenderEnumerator(this); }
            set { EnumeratorBase.TranslatorSetValue(this, GenderEnumerator.Name, value, 0); }
        }
        public AccountNumberEnumerator AccountNumber
        {
            get { return new AccountNumberEnumerator(this); }
            set { EnumeratorBase.TranslatorSetValue(this, AccountNumberEnumerator.Name, value, 0); }
        }

        /* TODO: Implement other readers for Person data */
    }

    public class FirstNameEnumerator : SourceEnumeratorCommon<FirstNameEnumerator>
    {
        public const string Name = "FirstName";
        public FirstNameEnumerator(EnumeratorBase parent) : base(parent) { }
        public FirstNameEnumerator() { }
        override public string DerivedName { get { return Name; } }
    }

    public class MiddleNameEnumerator : SourceEnumeratorCommon<MiddleNameEnumerator>
    {
        public const string Name = "MiddleName";
        public MiddleNameEnumerator(EnumeratorBase parent) : base(parent) { }
        public MiddleNameEnumerator() { }
        override public string DerivedName { get { return Name; } }
    }

    public class LastNameEnumerator : SourceEnumeratorCommon<LastNameEnumerator>
    {
        public const string Name = "LastName";
        public LastNameEnumerator(EnumeratorBase parent) : base(parent) { }
        public LastNameEnumerator() { }
        override public string DerivedName { get { return Name; } }
    }

    public class DoBEnumerator : SourceEnumeratorCommon<DoBEnumerator>
    {
        public const string Name = "DateTimeOfBirth";
        public DoBEnumerator(EnumeratorBase parent) : base(parent) { }
        public DoBEnumerator() { }
        override public string DerivedName { get { return Name; } }
    }

    public class GenderEnumerator : SourceEnumeratorCommon<GenderEnumerator>
    {
        public const string Name = "Gender";
        public GenderEnumerator(EnumeratorBase parent) : base(parent) { }
        public GenderEnumerator() { }
        override public string DerivedName { get { return Name; } }
    }

    public class AccountNumberEnumerator : SourceEnumeratorCommon<AccountNumberEnumerator>
    {
        public const string Name = "AccountNumberEnumerator";
        public AccountNumberEnumerator(EnumeratorBase parent) : base(parent) { }
        public AccountNumberEnumerator() { }
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