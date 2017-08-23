using System;
using System.IO;

namespace CDS.Web.Controls
{
	public static class ControlHelper
	{
		public static InputTypes GetInputTypeEnum(object type)
		{
			if (type == null)
			{
				throw new ArgumentNullException("type");
			}

			return GetInputTypeEnum(type.ToString());
		}

		public static InputTypes GetInputTypeEnum(string type)
		{
			if (string.IsNullOrEmpty(type))
			{
				throw new ArgumentException("Value cannot be null or empty.", "type");
			}

			InputTypes inputType;

			if (type.Equals("checkbox", StringComparison.InvariantCultureIgnoreCase))
			{
				inputType = InputTypes.CheckBox;
			}
			else if (type.Equals("hidden", StringComparison.InvariantCultureIgnoreCase))
			{
				inputType = InputTypes.Hidden;
			}
			else if (type.Equals("password", StringComparison.InvariantCultureIgnoreCase))
			{
				inputType = InputTypes.Password;
			}
			else if (type.Equals("radio", StringComparison.InvariantCultureIgnoreCase))
			{
				inputType = InputTypes.RadioButton;
			}
			else if (type.Equals("submit", StringComparison.InvariantCultureIgnoreCase))
			{
				inputType = InputTypes.Submit;
			}
			else if (type.Equals("text", StringComparison.InvariantCultureIgnoreCase))
			{
				inputType = InputTypes.Text;
			}
			else
			{
				throw new CDSInvalidInputTypeException();
			}

			return inputType;
		}

		public static string GetInputTypeString(InputTypes type)
		{
			string inputType;

			switch (type)
			{
				case InputTypes.CheckBox:
					{
						inputType = "checkbox";

						break;
					}
				case InputTypes.Hidden:
					{
						inputType = "hidden";

						break;
					}
				case InputTypes.Password:
					{
						inputType = "password";

						break;
					}
				case InputTypes.RadioButton:
					{
						inputType = "radio";

						break;
					}
				case InputTypes.Submit:
					{
						inputType = "submit";

						break;
					}
				case InputTypes.Text:
					{
						inputType = "text";

						break;
					}
				default:
					{
						throw new NotImplementedException();
					}
			}

			return inputType;
		}

		public static string GetScriptTypeString(ScriptTypes type)
		{
			string scriptType;

			switch (type)
			{
				case ScriptTypes.JavaScript:
					{
						scriptType = "text/javascript";

						break;
					}
				default:
					{
						throw new NotImplementedException();
					}
			}

			return scriptType;
		}

		//?public static void RenderWatermarkScript(StringWriter writer, ViewContext viewContext, string controlID, string modelName, string watermarkCssClass, string watermarkText)
		//{
		//	if (writer == null)
		//	{
		//		throw new ArgumentNullException("writer");
		//	}

		//	if (viewContext == null)
		//	{
		//		throw new ArgumentNullException("viewContext");
		//	}

		//	ViewDataDictionary viewData = viewContext.ViewData;

		//	if (viewData == null)
		//	{
		//		throw new ArgumentNullException("viewData");
		//	}

		//	if (!string.IsNullOrEmpty(controlID)
		//		&& !string.IsNullOrEmpty(watermarkCssClass)
		//		&& !string.IsNullOrEmpty(watermarkText))
		//	{
		//		ModelErrorCollection modelErrors = viewData.ModelState.GetErrors(modelName);

		//		if ((modelErrors == null || modelErrors.Count == 0))
		//		{
		//			string innerHtml = "$(function(){$('#" + controlID + "').addWatermark('" + watermarkCssClass + "', '" + watermarkText + "');});";

		//			CDSJScript watermarkScript = new CDSJScript(ScriptTypes.JavaScript, innerHtml);

		//			writer.Write(watermarkScript.Html(viewContext));
		//		}
		//	}
		//}
	}
}
