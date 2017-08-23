using System.Web.Mvc;

namespace CoreXT.Toolkit.Controls
{
    public class Password : TextBox
    {
        public Password(ViewContext viewContext, string name)
            : base(viewContext, name)
        {
            Type = InputTypes.Password;
        }
    }
}
