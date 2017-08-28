#if (NETSTANDARD1_6 || NETSTANDARD2_0 || NETCOREAPP1_0 || NETCOREAPP2_0 || DNXCORE50 || NETCORE45  || NETCORE451 || NETCORE50)
#define DOTNETCORE
#endif

using System;
using System.Text.RegularExpressions;

namespace CoreXT.Data
{
    /// <summary>
    /// Contains information about the failed validation.
    /// </summary>
    public class ValidationResult
    {
        public bool Pass { get; private set; }
        public string ErrorMessage { get; private set; }
        public int ErrorNumber { get; private set; }
        public object[] ErroneousObjects { get; protected set; }

        public ValidationResult(bool pass, string errorMessage, int errorNumber)
        {
            Pass = pass;
            ErrorMessage = errorMessage;
            ErrorNumber = errorNumber;
        }
        public ValidationResult(bool pass, string errorMessage) : this(pass, errorMessage, -1) { }
        public ValidationResult(bool pass) : this(pass, null, -1) { }

        /// <summary>
        /// Supplied as a shortcut for executing a call-back, such as a simple lambda expression, when validation fails.
        /// </summary>
        public bool IsValid(Action<ValidationResult> failureAction)
        { if (!Pass && failureAction != null) failureAction(this); return Pass; }

        public static implicit operator bool(ValidationResult vr) { return vr != null ? vr.Pass : false; }
    }
}