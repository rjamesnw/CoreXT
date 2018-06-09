/// <reference path="../../manifest.ts" />
// #######################################################################################
var CoreXT;
(function (CoreXT) {
    var Scripts;
    (function (Scripts) {
        var Modules;
        (function (Modules) {
            /**
             * Plugins by Stefan Petre (http://www.eyecon.ro/bootstrap-datepicker/).
             */
            var Eyecon_ro;
            (function (Eyecon_ro) {
                // ===================================================================================
                /**
                 * A date picker.
                 */
                Eyecon_ro.Datepicker = Scripts.module([Modules.JQuery.V2_2_0], 'bootstrap-datepicker', '~Helpers/Eyecon/js/')
                    .require(CoreXT.Loader.get("~eyecon.ro/css/datepicker.css"));
                // ===================================================================================
            })(Eyecon_ro = Modules.Eyecon_ro || (Modules.Eyecon_ro = {}));
        })(Modules = Scripts.Modules || (Scripts.Modules = {}));
    })(Scripts = CoreXT.Scripts || (CoreXT.Scripts = {}));
})(CoreXT || (CoreXT = {}));
// #######################################################################################
//# sourceMappingURL=manifest.js.map