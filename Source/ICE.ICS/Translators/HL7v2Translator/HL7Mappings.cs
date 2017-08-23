using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml;

namespace ICS {
    public class HL7Mappings {
		#region Fields (3) 

        /// <summary>
        /// The mappings file to use for the current instance of parsing
        /// </summary>
        private XmlDocument _HL7MappingsXMLFile = new XmlDocument();
        private XmlDocument _HL7MessageTypesXMLFile = new XmlDocument();
        private string _undefinedName = "Undefined";

		#endregion Fields 

		#region Constructors (1) 

        /// <summary>
        /// Initializes a new instance of the <see cref="HL7Mappings"/> class.
        /// </summary>
        /// <param name="pathToHL7Mappings">The path to HL7 mappings.</param>
        public HL7Mappings() {
            // [TEMPORARY] Must be configured via configuration file or settings file
            _HL7MappingsXMLFile.Load("Mappings.xml");
            _HL7MessageTypesXMLFile.Load("MessageTypes.xml");
        }

		#endregion Constructors 

		#region Methods (4) 

		// Public Methods (4) 

        /// <summary>
        /// Gets the name of the component.
        /// </summary>
        /// <param name="segmentName">Name of the segment.</param>
        /// <param name="fieldNumber">The field number.</param>
        /// <param name="componentNumber">The component number.</param>
        /// <returns>Returns the name of the component.</returns>
        public string GetComponentName(string segmentName, string fieldNumber, string componentNumber) {
            try {
                return _HL7MappingsXMLFile.SelectSingleNode(String.Format("/Segments/Segment[@Name='{0}']/Field-{1}/Component-{2}", segmentName, fieldNumber, componentNumber)).Attributes["Name"].InnerText;
            }
            catch (NullReferenceException) {
                return _undefinedName;
            }
            catch (Exception ex) {
                return "ERROR: " + ex.Message;
            }
        }

        /// <summary>
        /// Gets the name of the field.
        /// </summary>
        /// <param name="segmentName">Name of the segment.</param>
        /// <param name="fieldNumber">The field number.</param>
        /// <returns>Returns the name of the field.</returns>
        public string GetFieldName(string segmentName, string fieldNumber) {
            try {
                return _HL7MappingsXMLFile.SelectSingleNode(String.Format("/Segments/Segment[@Name='{0}']/Field-{1}", segmentName, fieldNumber)).Attributes["Name"].InnerText;
            }
            catch (NullReferenceException) {
                return _undefinedName;
            }
            catch (Exception ex) {
                return "ERROR: " + ex.Message;
            }
        }

        /// <summary>
        /// Gets the message description.
        /// </summary>
        /// <param name="messageType">Type of message (Field 9.1).</param>
        /// <param name="triggerEvent">The trigger event (Field 9.2).</param>
        /// <returns>String containing description of the particular message structure.</returns>
        public string GetMessageDescription(string messageType, string triggerEvent) {
            try {
                return _HL7MessageTypesXMLFile.SelectSingleNode(String.Format("/MessageTypes/Message/Type[text()='{0}']", messageType)).ParentNode
                .SelectSingleNode(String.Format("TriggerEvents/{0}", triggerEvent)).Attributes["Description"].Value;
            }
            catch (NullReferenceException) {
                return _undefinedName;
            }
            catch (Exception ex) {
                return "ERROR: " + ex.Message;
            }
        }

        public string GetSubcomponentName(string segmentName, string fieldNumber, string componentNumber, string subcomponentNumber) {
            try {
                return _HL7MappingsXMLFile.SelectSingleNode(String.Format("/Segments/Segment[@Name='{0}']/Field-{1}/Component-{2}/Subcomponent-{3}", segmentName, fieldNumber, componentNumber, subcomponentNumber)).Attributes["Name"].InnerText;
            }
            catch (NullReferenceException) {
                return _undefinedName;
            }
            catch (Exception ex) {
                return "ERROR: " + ex.Message;
            }
        }

		#endregion Methods 
    }
}
