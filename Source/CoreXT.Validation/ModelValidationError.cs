using Microsoft.AspNetCore.Mvc.ModelBinding;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CoreXT.Validation
{
    /// <summary>
    ///     Validation error. Can be either entity or property level validation error.
    /// </summary>
    [Serializable]
    public class ModelValidationError
    {
        /// <summary>
        ///     Name of the invalid property. Can be null (e.g. for entity level validations).
        /// </summary>
        private readonly string _PropertyName;

        /// <summary>
        ///     Validation error message.
        /// </summary>
        private readonly ModelError[] _Errors;

        /// <summary>
        ///     Creates an instance of <see cref="ModelValidationError" />.
        /// </summary>
        /// <param name="propertyName"> Name of the invalid property. Can be null. </param>
        /// <param name="errors"> Validation error message. Can be null. </param>
        public ModelValidationError(string propertyName, IEnumerable<ModelError> errors)
        {
            _PropertyName = propertyName;
            _Errors = errors.ToArray();
        }

        /// <summary>
        ///     Gets name of the invalid property.
        /// </summary>
        public string PropertyName
        {
            get { return _PropertyName; }
        }

        /// <summary>
        ///     Gets validation error message.
        /// </summary>
        public ModelError[] Errors
        {
            get { return _Errors; }
        }
    }
}
