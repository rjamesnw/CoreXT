using System;

namespace CoreXT.ASPNet
{
    // ########################################################################################################################

    /// <summary>
    /// A enumeration of some common development environments
    /// </summary>
    [Flags]
    public enum Environments
    {
        /// <summary>
        /// The 'Any' value is simply '0'.  When no flag is set, any environment is assumed.
        /// </summary>
        Any = 0,

        /// <summary>
        /// Development environment mode.
        /// </summary>
        Sandbox = 1,

        /// <summary>
        /// Development environment mode.
        /// </summary>
        Development = 2,

        /// <summary>
        /// Testing environment mode, typically after development for UAT.
        /// </summary>
        Testing = 4,

        /// <summary>
        /// Quality assurance environment mode, typically used by QA teams to make sure there's no impact on existing functionality.
        /// </summary>
        QA = 8,


        /// <summary>
        /// Secondary QA environment mode, typically used in SAP Q2 (UAT) style environment naming.
        /// </summary>
        Q2 = 16,

        /// <summary>
        /// Staging environment mode (pre-production trial release before production deployment).
        /// </summary>
        Staging = 32,

        /// <summary>
        /// Production environment mode.
        /// </summary>
        Production = 64
    }

    // ########################################################################################################################
}
