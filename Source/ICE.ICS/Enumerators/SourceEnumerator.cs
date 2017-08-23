using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml;
using ICS.FieldTypes;

namespace ICS.Enumerators
{
    /* The categories are synonymous with “use-cases”. A use-case in HL7 2.x is the message type and trigger (eg. ADT^A01 – Patient Admission). In HL7 3.x they are called “Artifacts” (eg. PRPA_AR00001UV00 - Patient Administration). */

    /* The “root” source query, which is really just like any other reader. */
    /* NOTE: A “partial” class allows for “specialized” additions, such as extensions for proprietary CSV files. */
    public partial class SourceEnumerator : SourceEnumeratorCommon<SourceEnumerator>
    {
		#region Fields (1)

        public const string Name = "Source";

		#endregion Fields 

		#region Constructors (2) 

        public SourceEnumerator(ITranslator trans, XmlDocument root)
            : base(trans) { Value = new XmlNodeField(root); }

        public SourceEnumerator() { }

		#endregion Constructors 

		#region Properties (2) 

        override public string DerivedName { get { return Name; } }

        public HeaderEnumerator Header
        {
            get { return new HeaderEnumerator(this); }
            set { EnumeratorBase.TranslatorSetValue(this, HeaderEnumerator.Name, value, 0); }
        }

        public PatientEnumerator Patient
        {
            get { return new PatientEnumerator(this); }
            set { EnumeratorBase.TranslatorSetValue(this, PatientEnumerator.Name, value, 0); }
        }

        public PhysicianEnumerator Physician
        {
            get { return new PhysicianEnumerator(this); }
            set { EnumeratorBase.TranslatorSetValue(this, PhysicianEnumerator.Name, value, 0); }
        }

		#endregion Properties 

        /* Example implementation */
        /* (pulls a “header”, whatever that may mean, based on the translator) */
        /* These will be implemented in a similar way as the previous example */
        // TODO: Implement these Enumerators!
        //public PatientInformationEnumerator PatientInformation { get; set; }
        //public PatientVisitEnumerator PatientVisit { get; set; }
        //public NotesOrCommentsEnumerator NotesOrComments { get; set; }
        //public DiagnosisEnumerator Diagnosis { get; set; }
        //public NextOfKinEnumerator NextOfKin { get; set; }
        //public AllergiesEnumerator Allergies { get; set; }
        /* Note: For some enumerators, there may be more than one node with the same name found.
         * In this case, this[n] will access a specific sibling node (this[0] will be assumed
         * to work in all cases). The “Count” property can be used to read the number of
         * repetitions, if any.
         * Example: Source.SubNode[n].SomeFieldValue
         */
    }
}
