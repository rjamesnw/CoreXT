/// <reference path="../../manifest.ts" />
// #######################################################################################
var CoreXT;
(function (CoreXT) {
    var Scripts;
    (function (Scripts) {
        var Modules;
        (function (Modules) {
            /**
             * Google related modules.
             */
            var Google;
            (function (Google) {
                // ===================================================================================
                var gmapsCallbackStr = manifest.registerGlobal("onGMapsReady", null);
                /**References the Google Maps API.
                  */
                Google.Maps = Scripts.module([], 'google.maps', "https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=" + gmapsCallbackStr)
                    .then(function (mod) {
                    manifest.setGlobalValue("onGMapsReady", function () {
                        mod.continue(); // (dependent script now loaded and initialized, so continue calling the rest of the promise handlers ...)
                    });
                    return mod;
                }).ready(function (res) { res.pause(); }); // (this is the FIRST 'onready' handler in the list, so it is always called first, and will pause all following handlers)
                // ===================================================================================
            })(Google = Modules.Google || (Modules.Google = {}));
        })(Modules = Scripts.Modules || (Scripts.Modules = {}));
    })(Scripts = CoreXT.Scripts || (CoreXT.Scripts = {}));
})(CoreXT || (CoreXT = {}));
// #######################################################################################
//# sourceMappingURL=manifest.js.map