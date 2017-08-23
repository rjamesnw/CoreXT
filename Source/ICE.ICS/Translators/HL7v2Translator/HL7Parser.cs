/********************************************************************
	created:	2009/04/02
	created:	2:4:2009   20:46
	filename: 	D:\Documents\Advent Sun\HL7_ICE\ICS\HL7Parser.cs
	file path:	D:\Documents\Advent Sun\HL7_ICE\ICS
	file base:	HL7Parser
	file ext:	cs
	author:		Shahriyar Nasir
	
	purpose:	HL7 Message Parsing between Delimited and XML
*********************************************************************/

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Xml;
using System.Text.RegularExpressions;

namespace ICS {
    /// This class takes an HL7 message
    /// and transforms it into an XML representation.
    public class HL7Parser {
		#region Fields (7) 

        private char _escapeCharacter;
        // Document containing the current HL7 definitions and mappings to use
        private HL7Mappings _HL7Mappings;
        private XmlDocument _HL7MessageXML;
        private char _seperatorComponent;
        // Encoding characters
        private char _seperatorField;
        private char _seperatorRepetition;
        private char _seperatorSubcomponent;

		#endregion Fields 

		#region Constructors (1) 

        /// <summary>
        /// Initializes a new instance of the <see cref="HL7Parser"/> class.
        /// </summary>
        /// <param name="pathToHL7Mappings">The path to HL7 mappings.</param>
        public HL7Parser() {
            _HL7Mappings = new HL7Mappings();
        }

		#endregion Constructors 

		#region Methods (8) 

		// Public Methods (2) 

        /// <summary>
        /// Converts an HL7 message into an XML representation of the same message.
        /// </summary>
        /// <param name="sHL7Messages">The HL7 messages.</param>
        /// <returns>Returns the HL7 messages as an XMLDocument.</returns>
        public XmlDocument ConvertDelimitedToXML(string sHL7DelimitedMessage) {
            _HL7MessageXML = new XmlDocument();

            // Clean up any unnecessary whitespace and carriage returns in the message
            while (sHL7DelimitedMessage.Contains("\r\n\r\n")) {
                sHL7DelimitedMessage = sHL7DelimitedMessage.Replace("\r\n\r\n", "\r\n");
            }

            // HL7 message segments are terminated by carriage returns,
            // so to get an array of the message segments, split on carriage return
            string[] segments = sHL7DelimitedMessage.Trim(' ', '\r', '\n').Split('\r');

            #region Detect Encoding Characters
            // Get all the encoding characters so that the message can be divided 
            // appropriately into fields and segments
            _seperatorField = char.Parse(segments[0].Substring(3, 1));
            _seperatorComponent = char.Parse(segments[0].Substring(4, 1));
            _seperatorRepetition = char.Parse(segments[0].Substring(5, 1));
            _escapeCharacter = char.Parse(segments[0].Substring(6, 1));
            _seperatorSubcomponent = char.Parse(segments[0].Substring(7, 1));
            #endregion

            #region Cleaning Unprintable Controls and Touch Up

            // Now we want to replace any other unprintable control
            // characters with whitespace otherwise they'll break the XML (especially new line: \n)
            for (int i = 0; i < segments.Length; i++) {
                segments[i] = Regex.Replace(segments[i], @"[^ -~]", "");
            }

            // Add 'MSH' to the beginning of the document to handle parsing the field seperator
            segments[0] = "MSH" + _seperatorField + "MSH" + _seperatorField + "MSH" + _seperatorField + segments[0].Remove(0, 9);
            #endregion

            #region Create Message Type Element Root Node (eg. ADT_A01)
            // Find out what message type it is to create the first element
            string[] messageHeaderFields = segments[0].Split(_seperatorField);
            string currentMessageType = messageHeaderFields[9].Substring(0, 3);
            string currentTriggerEvent = messageHeaderFields[9].Substring(4, 3);
            XmlElement rootNode = _HL7MessageXML.CreateElement(currentMessageType + "_" + currentTriggerEvent);
            rootNode.SetAttribute("Description", _HL7Mappings.GetMessageDescription(currentMessageType, currentTriggerEvent));
            _HL7MessageXML.AppendChild(rootNode);
            #endregion

            #region Parse Segments
            foreach (string segment in segments) {
                // Create a new element in the XML for the segment
                XmlElement segmentElement = _HL7MessageXML.CreateElement(segment.Substring(0, 3));
                ParseDelimitedFields(ref segmentElement, segment.Substring(0, 3), segment.Remove(0, 4));
                rootNode.AppendChild(segmentElement);
            }
            #endregion

            // Replace the string MSH from the Field Seperator tag with the field seperator character
            rootNode.FirstChild.ChildNodes[0].InnerText = _seperatorField.ToString();
            // Replace the string MSH from the Encoding Characters tag with the encoding characters
            rootNode.FirstChild.ChildNodes[1].InnerText = _seperatorComponent.ToString() + _seperatorRepetition.ToString() + _escapeCharacter.ToString() + _seperatorSubcomponent.ToString();

            return _HL7MessageXML;
        }

        /// <summary>
        /// Converts an HL7 message into a pipe delimited representation of the same message.
        /// </summary>
        /// <param name="sHL7XML">The HL7 messages.</param>
        /// <returns>Returns the HL7 messages as pipe delimited text.</returns>
        public string ConvertXMLtoDelimited(string sHL7XMLMessage) {
            // Declare HL7 string object to return
            string HL7MessageDelimited = string.Empty;

            XmlDocument HL7MessageXML = new XmlDocument();
            HL7MessageXML.InnerXml = sHL7XMLMessage;

            #region Detect Encoding Characters
            _seperatorField = char.Parse(HL7MessageXML.DocumentElement.FirstChild.ChildNodes[0].InnerText);
            _seperatorComponent = char.Parse(HL7MessageXML.DocumentElement.FirstChild.ChildNodes[1].InnerText.Substring(0, 1));
            _seperatorRepetition = char.Parse(HL7MessageXML.DocumentElement.FirstChild.ChildNodes[1].InnerText.Substring(1, 1));
            _escapeCharacter = char.Parse(HL7MessageXML.DocumentElement.FirstChild.ChildNodes[1].InnerText.Substring(2, 1));
            _seperatorSubcomponent = char.Parse(HL7MessageXML.DocumentElement.FirstChild.ChildNodes[1].InnerText.Substring(3, 1));
            #endregion

            foreach (XmlNode currentSegment in HL7MessageXML.DocumentElement.ChildNodes) {
                HL7MessageDelimited += currentSegment.Name;

                int maxNumberOfFields = GetLastNumberFromDotDelimitedTagName(currentSegment.LastChild.Name);
                for (int f = 0, n = 0; f < currentSegment.ChildNodes.Count & n < maxNumberOfFields; f++, n++) {
                    #region Field Parsing Loop
                    if (GetLastNumberFromDotDelimitedTagName(currentSegment.ChildNodes[f].Name) == n + 1) {
                        XmlNode currentField = currentSegment.ChildNodes[f];
                        HL7MessageDelimited += _seperatorField;
                        if (currentField.ChildNodes.Count > 1 | currentField.FirstChild.Name != "#text") {
                            // There are components, but first check for repetition of field if child name is == parent name
                            if (currentField.FirstChild.Name == currentField.Name) {
                                // There were repetitions of this currentField
                                foreach (XmlNode repeatedField in currentField.ChildNodes) {
                                    if (repeatedField.ChildNodes.Count > 1 | repeatedField.FirstChild.Name != "#text") {
                                        // There were components within this repeated field
                                        ParseXMLComponents(ref HL7MessageDelimited, repeatedField);
                                    }
                                    else {
                                        // There were no components within this repeated field, just add the InnerText to the field
                                        HL7MessageDelimited += repeatedField.InnerText;
                                    }
                                    HL7MessageDelimited +=
                                            (repeatedField == currentField.ChildNodes[currentField.ChildNodes.Count - 1] ? "" : _seperatorRepetition.ToString());
                                }
                            }
                            else {
                                // There were no repetitions, parse the components
                                ParseXMLComponents(ref HL7MessageDelimited, currentField);
                            }
                        }
                        else {
                            // There were no components, just add the InnerText to the field
                            HL7MessageDelimited += currentField.InnerText;
                        }
                    }
                    else {
                        // It is an empty field
                        HL7MessageDelimited += _seperatorField;
                        f--;
                    }
                    #endregion
                }

                HL7MessageDelimited += "\r\n";
            }

            return HL7MessageDelimited.Replace("MSH" + _seperatorField + _seperatorField, "MSH");
        }
		// Private Methods (6) 

        /// <summary>
        /// Gets the last number of dot delimited tag name from the tag name.
        /// </summary>
        /// <param name="nameOfLastTag">The name of the last tag.</param>
        /// <returns></returns>
        private int GetLastNumberFromDotDelimitedTagName(string nameOfLastTag) {
            string[] stringArray = nameOfLastTag.Split('.');
            return Convert.ToInt16(stringArray[stringArray.Length - 1]);
        }

        /// <summary>
        /// Parses each component found inside the supplied fieldString.
        /// </summary>
        /// <param name="fieldElement">The field element.</param>
        /// <param name="segmentHeader">The segment header.</param>
        /// <param name="fieldString">The field string.</param>
        /// <param name="fieldNumber">The field number.</param>
        private void ParseDelimitedComponents(ref XmlElement fieldElement, string segmentHeader, string fieldString, string fieldNumber) {
            string[] components = fieldString.Split(_seperatorComponent);
            for (int c = 0; c < components.Length; c++) {
                if (components[c] != string.Empty) {
                    XmlElement componentElement = _HL7MessageXML.CreateElement(segmentHeader +
                                           "." + fieldNumber +
                                           "." + (c + 1).ToString());
                    // Add the name of the component from the HL7 specifications
                    componentElement.SetAttribute("Name", _HL7Mappings.GetComponentName(segmentHeader, fieldNumber, (c + 1).ToString()));

                    if (!components[c].Contains(_seperatorSubcomponent)) {
                        componentElement.InnerText = components[c];
                    }
                    else if (components[c].Contains(_seperatorSubcomponent)) {
                        ParseDelimitedSubcomponents(ref componentElement, segmentHeader, components[c], (c + 1).ToString(), fieldNumber);
                    }
                    else {
                        // [TEMPORARY] Need proper error handling
                        fieldElement.InnerText = "ERROR: Cannot parse -> " + components[c];
                    }

                    fieldElement.AppendChild(componentElement);
                }
            }
        }

        /// <summary>
        /// Parses each field found inside the supplied segmentString.
        /// </summary>
        /// <param name="segmentElement">The segment element.</param>
        /// <param name="segmentHeader">The segment header.</param>
        /// <param name="segmentString">The segment string.</param>
        private void ParseDelimitedFields(ref XmlElement segmentElement, string segmentHeader, string segmentString) {
            string[] fields = segmentString.Split(_seperatorField);
            for (int f = 0; f < fields.Length; f++) {
                if (fields[f] != string.Empty) {
                    // Create a new field element
                    XmlElement fieldElement = _HL7MessageXML.CreateElement(segmentHeader + "." + (f + 1).ToString());
                    // Add the name of the field from the HL7 specifications
                    fieldElement.SetAttribute("Name", _HL7Mappings.GetFieldName(segmentHeader, (f + 1).ToString()));

                    // Check for field repetitions
                    if (fields[f].Contains(_seperatorRepetition)) {
                        foreach (string repeatedField in fields[f].Split(_seperatorRepetition)) {
                            // Create a new field element
                            XmlElement repeatedFieldElement = _HL7MessageXML.CreateElement(segmentHeader + "." + (f + 1).ToString());
                            // Add the name of the field from the HL7 specifications
                            repeatedFieldElement.SetAttribute("Name", _HL7Mappings.GetFieldName(segmentHeader, (f + 1).ToString()));

                            if (repeatedField.Contains(_seperatorSubcomponent)) {
                                if (repeatedField.Contains(_seperatorComponent)) {
                                    ParseDelimitedComponents(ref repeatedFieldElement, segmentHeader, repeatedField, (f + 1).ToString());
                                }
                                else {
                                    // There is only 1 component and that component has subcomponents

                                    // Create a new component element
                                    XmlElement componentElement = _HL7MessageXML.CreateElement(segmentHeader + ".1");
                                    // Add the name of the field from the HL7 specifications
                                    componentElement.SetAttribute("Name", _HL7Mappings.GetComponentName(segmentHeader, (f + 1).ToString(), "1"));

                                    ParseDelimitedSubcomponents(ref componentElement, segmentHeader, repeatedField, "1", (f + 1).ToString());

                                    repeatedFieldElement.AppendChild(componentElement);
                                }
                            }
                            else if (repeatedField.Contains(_seperatorComponent)) {
                                ParseDelimitedComponents(ref repeatedFieldElement, segmentHeader, repeatedField, (f + 1).ToString());
                            }
                            else {
                                repeatedFieldElement.InnerText = repeatedField;
                            }

                            fieldElement.AppendChild(repeatedFieldElement);
                        }
                    }
                    else {
                        // There are no field repetitions
                        if (fields[f].Contains(_seperatorSubcomponent)) {
                            if (fields[f].Contains(_seperatorComponent)) {
                                ParseDelimitedComponents(ref fieldElement, segmentHeader, fields[f], (f + 1).ToString());
                            }
                            else {
                                // There is only 1 component and that component has subcomponents

                                // Create a new component element
                                XmlElement componentElement = _HL7MessageXML.CreateElement(segmentHeader + ".1");
                                // Add the name of the field from the HL7 specifications
                                componentElement.SetAttribute("Name", _HL7Mappings.GetComponentName(segmentHeader, (f + 1).ToString(), "1"));

                                ParseDelimitedSubcomponents(ref componentElement, segmentHeader, fields[f], "1", (f + 1).ToString());

                                fieldElement.AppendChild(componentElement);
                            }
                        }
                        else if (fields[f].Contains(_seperatorComponent)) {
                            ParseDelimitedComponents(ref fieldElement, segmentHeader, fields[f], (f + 1).ToString());
                        }
                        else {
                            fieldElement.InnerText = fields[f];
                        }
                    }

                    segmentElement.AppendChild(fieldElement);
                }
            }
        }

        /// <summary>
        /// Parses each subcomponent found inside the supplied componentString.
        /// </summary>
        /// <param name="componentElement">The component element.</param>
        /// <param name="segmentHeader">The segment header.</param>
        /// <param name="componentString">The component string.</param>
        /// <param name="componentNumber">The component number.</param>
        /// <param name="fieldNumber">The field number.</param>
        private void ParseDelimitedSubcomponents(ref XmlElement componentElement, string segmentHeader, string componentString, string componentNumber, string fieldNumber) {
            string[] subcomponents = componentString.Split(_seperatorSubcomponent);
            for (int s = 0; s < subcomponents.Length; s++) {
                if (subcomponents[s] != string.Empty) {
                    XmlElement subcomponentElement = _HL7MessageXML.CreateElement(segmentHeader +
                                           "." + fieldNumber +
                                           "." + componentNumber +
                                           "." + (s + 1).ToString());
                    // Add the name of the component from the HL7 specifications
                    subcomponentElement.SetAttribute("Name", _HL7Mappings.GetSubcomponentName(segmentHeader, fieldNumber, componentNumber, (s + 1).ToString()));

                    subcomponentElement.InnerText = subcomponents[s];

                    componentElement.AppendChild(subcomponentElement);
                }
            }
        }

        /// <summary>
        /// Parses the component.
        /// </summary>
        /// <param name="HL7MessageDelimited">The HL7 message delimited.</param>
        /// <param name="currentField">The current field.</param>
        private void ParseXMLComponents(ref string HL7MessageDelimited, XmlNode currentField) {
            int maxNumberOfComponents = GetLastNumberFromDotDelimitedTagName(currentField.LastChild.Name);
            for (int c = 0, n = 0; c < currentField.ChildNodes.Count & n < maxNumberOfComponents; c++, n++) {
                if (GetLastNumberFromDotDelimitedTagName(currentField.ChildNodes[c].Name) == n + 1) {
                    XmlNode currentComponent = currentField.ChildNodes[c];
                    if (currentComponent.ChildNodes.Count > 1 | currentComponent.FirstChild.Name != "#text") {
                        // There were subcomponents
                        ParseXMLSubcomponents(ref HL7MessageDelimited, currentComponent);
                    }
                    else {
                        // There were no subcomponents, just add the InnerText to the component
                        HL7MessageDelimited += currentComponent.InnerText +
                            (currentComponent == currentField.ChildNodes[currentField.ChildNodes.Count - 1] ? "" : _seperatorComponent.ToString());
                    }
                }
                else {
                    // It is an empty field
                    HL7MessageDelimited += _seperatorComponent;
                    c--;
                }
            }
        }

        /// <summary>
        /// Parses the subcomponent elements in the XML.
        /// </summary>
        /// <param name="HL7MessageDelimited">The HL7 message delimited.</param>
        /// <param name="currentComponent">The current component.</param>
        private void ParseXMLSubcomponents(ref string HL7MessageDelimited, XmlNode currentComponent) {
            int maxNumberOfSubcomponents = GetLastNumberFromDotDelimitedTagName(currentComponent.LastChild.Name);
            for (int s = 0, n = 0; s < currentComponent.ChildNodes.Count & n < maxNumberOfSubcomponents; s++, n++) {
                if (GetLastNumberFromDotDelimitedTagName(currentComponent.ChildNodes[s].Name) == n + 1) {
                    XmlNode currentSubcomponent = currentComponent.ChildNodes[s];
                    HL7MessageDelimited += currentSubcomponent.InnerText +
                            (currentSubcomponent == currentComponent.ChildNodes[currentComponent.ChildNodes.Count - 1] ? "" : _seperatorSubcomponent.ToString());
                }
                else {
                    // It is an empty subcomponent
                    HL7MessageDelimited += _seperatorSubcomponent;
                    s--;
                }
            }
        }

		#endregion Methods 
    }
}
