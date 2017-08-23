using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using ICS;
using System.Xml;

namespace ICS.FieldTypes
{
    public class XmlNodeField : DataField<XmlNode>
    {
		#region Constructors (2) 

        public XmlNodeField(XmlNode value, bool isUndefined)
            : this(value)
        {
            IsUndefined = isUndefined;
        }

        public XmlNodeField(XmlNode value) : base(value) { }

		#endregion Constructors 

		#region Properties (1) 

        public override string Text
        {
            get
            {
                return base.FieldValue != null ? base.FieldValue.InnerXml : "";
            }
            set
            {                
                XmlDocument doc = new XmlDocument();
                doc.LoadXml(value);
                base.FieldValue = doc;
            }
        }

		#endregion Properties 
    }
}
