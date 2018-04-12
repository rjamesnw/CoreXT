/// <reference path="../../manifest.ts" />
// #######################################################################################

namespace CoreXT.Scripts.Modules {
    /**
     * Plugins by Stefan Petre (http://www.eyecon.ro/bootstrap-datepicker/).
     */
    export namespace Eyecon_ro {

        // ===================================================================================

        /**
         * A date picker.
         */
        export var Datepicker = module([JQuery], 'bootstrap-datepicker', '~Helpers/Eyecon/js/')
            .require(Loader.get("~eyecon.ro/css/datepicker.css"));

        // ===================================================================================
    }
}
// #######################################################################################
