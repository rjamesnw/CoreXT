using System.IO;
using System.Text;
using System.Xml;

namespace ICS
{
    public static class StringProcessors
    {
        /// <summary>
        /// Indents a string containing XML.
        /// </summary>
        /// <param name="XMLInput">The XML input.</param>
        /// <returns>Indented XML string.</returns>
        public static string IndentXMLString(this string XMLInput)
        {
            string outXml = string.Empty;
            MemoryStream ms = new MemoryStream();
            // Create a XMLTextWriter that will send its output to a memory stream (file)
            XmlTextWriter xtw = new XmlTextWriter(ms, Encoding.Unicode);
            XmlDocument doc = new XmlDocument();

            // Load the unformatted XML text string into an instance 
            // of the XML Document Object Model (DOM)
            doc.LoadXml(XMLInput);

            // Set the formatting property of the XML Text Writer to indented
            // the text writer is where the indenting will be performed
            xtw.Formatting = Formatting.Indented;

            // write dom xml to the xmltextwriter
            doc.WriteContentTo(xtw);
            // Flush the contents of the text writer
            // to the memory stream, which is simply a memory file
            xtw.Flush();

            // set to start of the memory stream (file)
            ms.Seek(0, SeekOrigin.Begin);
            // create a reader to read the contents of 
            // the memory stream (file)
            StreamReader sr = new StreamReader(ms);
            // return the formatted string to caller
            return sr.ReadToEnd();
        }
    }
}
