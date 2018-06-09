/// <reference path="../manifest.ts" />
/// <reference path="../../typings/globals/jquery/index.d.ts" />
// #######################################################################################
var CoreXT;
(function (CoreXT) {
    var Scripts;
    (function (Scripts) {
        var Modules;
        (function (Modules) {
            // ===================================================================================
            /** jQuery (see http://jquery.com/). */
            var JQuery;
            (function (JQuery) {
                /** Selects jQuery version 2.2.0. */
                JQuery.V2_2_0 = Scripts.module([], 'jquery_2_2_0{min:.min}', '~JQuery/').ready(function (mod) {
                    jQuery.holdReady(true); // (hold events until WE say go. note: doesn't require the system.)
                    // ... run the script once all other modules have loaded ...
                    CoreXT.onReady.attach(function () {
                        setTimeout(function () { jQuery.holdReady(false); }, 0); // (trigger jquery after all 'onready' events have fired, and execution has stopped)
                    });
                    return true;
                });
                /** Selects any latest version of jQuery (currently version 2.2.0). */
                JQuery.Latest = JQuery.V2_2_0;
            })(JQuery = Modules.JQuery || (Modules.JQuery = {}));
            // ===================================================================================
        })(Modules = Scripts.Modules || (Scripts.Modules = {}));
    })(Scripts = CoreXT.Scripts || (CoreXT.Scripts = {}));
})(CoreXT || (CoreXT = {}));
// #######################################################################################
//# sourceMappingURL=manifest.js.map