using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml;
using ICS.Enumerators;
using ICS.FieldTypes;

namespace ICS.Translators
{
    public class HL7v2Translator : ITranslator
    {
        #region Methods (2)

        // Public Methods (2) 

        /// <summary>
        /// Called by each enumerator along the chain of enumerators.
        /// Example: Source.Person.FirstName would call this method twice:
        /// Once for "Source.Person", and again for "Source.Person.FirstName".
        /// </summary>
        public IValueType GetValue(EnumeratorBase xmlSourceEnum, string[] path, int index)
        {
            XmlNodeField nodeField = xmlSourceEnum.Value as XmlNodeField; // FIXED: changed type from XmlNode to XmlNodeField

            /* Note: 'xmlSourceEnum' is the parent enumerator, and "path" is what to get from it.
             * In best practice, each enumerator should have 'Value' set to the node location for
             * that specified enumerator only.
             */

            // ... validate the parameters ...
            if (nodeField == null || nodeField.IsUndefined || path.Length == 0 || path[0] != SourceEnumerator.Name)
            { return null; }

            XmlNode node = nodeField.FieldValue;

            if (path.Length > 1)
                switch (path[1])
                {
                    case HeaderEnumerator.Name:
                        if (path.Length > 2)
                            switch (path[2])
                            {
                                case CreationDateEnumerator.Name:
                                    return new DateTimeField(node.SelectSingleNode("MSH.7").InnerText);
                            }
                        else
                            return new XmlNodeField(node.FirstChild.SelectSingleNode("MSH"));
                        break;

                    case PatientEnumerator.Name:
                        if (path.Length > 2)
                            switch (path[2])
                            {
                                case FirstNameEnumerator.Name:
                                    return new StringField(node.SelectSingleNode("PID.5/PID.5.2").InnerText);
                                case MiddleNameEnumerator.Name:
                                    return new StringField(node.SelectSingleNode("PID.5/PID.5.3").InnerText);
                                case LastNameEnumerator.Name:
                                    return new StringField(node.SelectSingleNode("PID.5/PID.5.1").InnerText);
                                case DoBEnumerator.Name:
                                    return new DateTimeField(node.SelectSingleNode("PID.7").InnerText);
                                case GenderEnumerator.Name:
                                    switch (node.SelectSingleNode("PID.8").InnerText)
                                    {
                                        case "F":
                                            return new StringField("Female");
                                        case "M":
                                            return new StringField("Male");
                                        case "O":
                                            return new StringField("Other");
                                        case "U":
                                        default:
                                            return new StringField("Unknown");
                                    }
                                case AccountNumberEnumerator.Name:
                                    return new StringField(node.SelectSingleNode("PID.18").InnerText);

                                case PatientIDEnumerator.Name:
                                    return new StringField(node.SelectSingleNode("PID.2").InnerText);
                                case OHIPEnumerator.Name:
                                    return new StringField(node.SelectSingleNode("PID.19").InnerText);
                            }
                        else
                            return new XmlNodeField(node.FirstChild.SelectSingleNode("PID"));
                        break;

                    case VisitEnumerator.Name:
                        if (path.Length > 2)
                            switch (path[2])
                            {
                                case AdmittingPhysicianIDEnumerator.Name:
                                    return new NumericField(node.SelectSingleNode("PV1.17.1").InnerText);
                                case AttendingPhysicianIDEnumerator.Name:
                                    return new NumericField(node.SelectSingleNode("PV1.7.1").InnerText);
                                case FacilityEnumerator.Name:
                                    return new StringField(node.SelectSingleNode("PV1.3.4").InnerText);
                                case PointOfCareEnumerator.Name:
                                    return new StringField(node.SelectSingleNode("PV1.3.1").InnerText);
                                case RoomEnumerator.Name:
                                    return new StringField(node.SelectSingleNode("PV1.3.2").InnerText);
                                case BedEnumerator.Name:
                                    return new StringField(node.SelectSingleNode("PV1.3.3").InnerText);
                            }
                        else
                            return new XmlNodeField(node.FirstChild.SelectSingleNode("PV1"));
                        break;

                    // The PersonEnumerator is not going to be used, its inherited enumerators will be used instead
                    #region PersonEnumerator Translation
                    case PersonEnumerator.Name:
                        if (path.Length > 2) // any more in the path?
                            switch (path[2]) // yes, this is a request for one of the name parts ...
                            {
                                case FirstNameEnumerator.Name: // Note: "ORU_R01/PID/" is not used here.
                                    return new StringField(node.SelectSingleNode("PID.5/PID.5.2").InnerText);
                                case MiddleNameEnumerator.Name:
                                    return new StringField(node.SelectSingleNode("PID.5/PID.5.3").InnerText);
                                case LastNameEnumerator.Name:
                                    return new StringField(node.SelectSingleNode("PID.5/PID.5.1").InnerText);
                                case DoBEnumerator.Name:
                                    return new DateTimeField(node.SelectSingleNode("PID.7").InnerText);
                                case GenderEnumerator.Name:
                                    return new StringField(node.SelectSingleNode("PID.8").InnerText);
                                case AccountNumberEnumerator.Name:
                                    return new StringField(node.SelectSingleNode("PID.18").InnerText);
                                // TODO: Could this be a NumericField instead? Is it safe?
                            }
                        else // nope, this is a request for the node only ...
                            return new XmlNodeField(node.FirstChild.SelectSingleNode("PID"));
                        break;
                    #endregion
                    ///////////////////////////////////////////////////////////////////////////////////////////////
                }

            // Note: This return is reached only of only the source path name is specified.

            return new XmlNodeField(null, true);
        }

        public void SetValue(EnumeratorBase xmlSourceEnum, string[] path, IValueType value, int index)
        {
        }

        #endregion Methods

        /* The implementation for this should be obvious (similar to GetValue). The only difference is that the “path” should be created if missing, before the value is set. This method should never fail. If value is DataListField, and “Count > 0”, then an array of node siblings will be created, and not just one. */
    }
}
