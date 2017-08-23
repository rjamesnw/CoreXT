using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ICS.Enumerators
{
    public class VisitEnumerator : SourceEnumeratorCommon<PersonEnumerator>
    {
        public const string Name = "Visit";
        public VisitEnumerator(EnumeratorBase parent) : base(parent) { }
        public VisitEnumerator() { }
        override public string DerivedName { get { return Name; } }

        public AdmittingPhysicianIDEnumerator AdmittingPhysicianID
        {
            get { return new AdmittingPhysicianIDEnumerator(this); }
            set { EnumeratorBase.TranslatorSetValue(this, AdmittingPhysicianIDEnumerator.Name, value, 0); }
        }
        public AttendingPhysicianIDEnumerator AttendingPhysicianID
        {
            get { return new AttendingPhysicianIDEnumerator(this); }
            set { EnumeratorBase.TranslatorSetValue(this, AttendingPhysicianIDEnumerator.Name, value, 0); }
        }
        public FacilityEnumerator Facility
        {
            get { return new FacilityEnumerator(this); }
            set { EnumeratorBase.TranslatorSetValue(this, FacilityEnumerator.Name, value, 0); }
        }
        public PointOfCareEnumerator PointOfCare
        {
            get { return new PointOfCareEnumerator(this); }
            set { EnumeratorBase.TranslatorSetValue(this, PointOfCareEnumerator.Name, value, 0); }
        }
        public RoomEnumerator Room
        {
            get { return new RoomEnumerator(this); }
            set { EnumeratorBase.TranslatorSetValue(this, PointOfCareEnumerator.Name, value, 0); }
        }
        public BedEnumerator Bed
        {
            get { return new BedEnumerator(this); }
            set { EnumeratorBase.TranslatorSetValue(this, PointOfCareEnumerator.Name, value, 0); }
        }
    }

    public class AdmittingPhysicianIDEnumerator : SourceEnumeratorCommon<AdmittingPhysicianIDEnumerator>
    {
        public const string Name = "AdmittingPhysicianID";
        public AdmittingPhysicianIDEnumerator(EnumeratorBase parent) : base(parent) { }
        public AdmittingPhysicianIDEnumerator() { }
        override public string DerivedName { get { return Name; } }
    }

    public class AttendingPhysicianIDEnumerator : SourceEnumeratorCommon<AttendingPhysicianIDEnumerator>
    {
        public const string Name = "AttendingPhysicianID";
        public AttendingPhysicianIDEnumerator(EnumeratorBase parent) : base(parent) { }
        public AttendingPhysicianIDEnumerator() { }
        override public string DerivedName { get { return Name; } }
    }

    public class FacilityEnumerator : SourceEnumeratorCommon<FacilityEnumerator>
    {
        public const string Name = "Facility";
        public FacilityEnumerator(EnumeratorBase parent) : base(parent) { }
        public FacilityEnumerator() { }
        override public string DerivedName { get { return Name; } }
    }

    public class PointOfCareEnumerator : SourceEnumeratorCommon<PointOfCareEnumerator>
    {
        public const string Name = "PointOfCare";
        public PointOfCareEnumerator(EnumeratorBase parent) : base(parent) { }
        public PointOfCareEnumerator() { }
        override public string DerivedName { get { return Name; } }
    }

    public class RoomEnumerator : SourceEnumeratorCommon<RoomEnumerator>
    {
        public const string Name = "Room";
        public RoomEnumerator(EnumeratorBase parent) : base(parent) { }
        public RoomEnumerator() { }
        override public string DerivedName { get { return Name; } }
    }

    public class BedEnumerator : SourceEnumeratorCommon<BedEnumerator>
    {
        public const string Name = "Bed";
        public BedEnumerator(EnumeratorBase parent) : base(parent) { }
        public BedEnumerator() { }
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