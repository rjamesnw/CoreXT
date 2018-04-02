using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.ChangeTracking.Internal;
using System;
using System.Collections.Generic;
using System.Linq;

namespace CoreXT.Validation
{

    /// <summary>
    ///     Represents validation results for single entity.
    /// </summary>
    [Serializable]
    public class TableRowValidationResult
    {
        /// <summary>
        ///     Entity entry the results applies to. Never null.
        /// </summary>
        [NonSerialized]
        private readonly EntityEntry _entry;

        /// <summary>
        ///     List of <see cref="ModelValidationError" /> instances. Never null. Can be empty meaning the entity is valid.
        /// </summary>
        private readonly List<ModelValidationError> _validationErrors;

        /// <summary>
        ///     Creates an instance of <see cref="TableRowValidationResult" /> class.
        /// </summary>
        /// <param name="entry"> Entity entry the results applies to. Never null. </param>
        /// <param name="validationErrors">
        ///     List of <see cref="ModelValidationError" /> instances. Never null. Can be empty meaning the entity is valid.
        /// </param>
        public TableRowValidationResult(EntityEntry entry, IEnumerable<ModelValidationError> validationErrors)
        {
            _entry = entry ?? throw new ArgumentNullException(nameof(entry));
            _validationErrors = (validationErrors ?? throw new ArgumentNullException(nameof(validationErrors))).ToList();
        }

        /// <summary>
        /// Gets an instance of <see cref="EntityEntry" /> the results applies to.
        /// </summary>
        public EntityEntry Entry
        {
            get
            {
                return _entry;
            }
        }

        /// <summary>
        ///     Gets validation errors. Never null.
        /// </summary>
        public ICollection<ModelValidationError> ValidationErrors
        {
            get { return _validationErrors; }
        }

        /// <summary>
        ///     Gets an indicator if the entity is valid.
        /// </summary>
        public bool IsValid
        {
            get { return !_validationErrors.Any(); }
        }
    }
}
