using System.Web.Mvc;

namespace CoreXT.Toolkit.Controls
{
    public class Hidden : Input
    {
        public Hidden(ViewContext viewContext, string name) :
            base(viewContext, InputTypes.Hidden, name) { }
    }
}
