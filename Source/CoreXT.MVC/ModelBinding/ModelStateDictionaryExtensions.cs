using Microsoft.AspNetCore.Mvc.ModelBinding;
using System;

namespace CoreXT.MVC.ModelBinding
{
	public static class ModelStateDictionaryExtensions
	{
		public static ModelErrorCollection GetErrors(this ModelStateDictionary modelStateDictionary, string modelName)
		{
			ModelErrorCollection modelErrors = null;

			ModelStateEntry modelState;

			if (modelStateDictionary.TryGetValue(modelName, out modelState))
			{
				modelErrors = modelState.Errors;
			}

			return modelErrors;
		}
	}
}
