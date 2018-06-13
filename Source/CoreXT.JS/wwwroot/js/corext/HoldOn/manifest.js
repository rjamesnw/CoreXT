/// <reference path="../manifest.ts" />
// #######################################################################################
var CoreXT;
(function (CoreXT) {
    var Scripts;
    (function (Scripts) {
        var Modules;
        (function (Modules) {
            var IO;
            (function (IO) {
                // ===================================================================================
                // ===================================================================================
                /**
                 * HoldOn.js is a useful plugin that allows you to block user interactions using an overlay over the page.
                 * Source: https://sdkcarlos.github.io/sites/holdon.html
                 */
                IO.HoldOn = Scripts.module(null, 'HoldOn.min', '~HoldOn/')
                    .require(CoreXT.System.IO.get("~HoldOn/HoldOn.min.css")) // TODO: Support match patterns here also for 'min'.
                    .ready(function (r) {
                    var holdOn = IO.HoldOn.module.getVar("HoldOn");
                    function wait(msg) {
                        if (msg === void 0) { msg = "Please wait ..."; }
                        holdOn.open({ message: msg, backgroundColor: "#FFFFFF", textColor: "#000000" });
                    }
                    function closeWait() { holdOn.close(); }
                    CoreXT.System.IO.onBeginWait.attach(function (m) { return wait(m); });
                    CoreXT.System.IO.onEndWait.attach(function () { return closeWait(); });
                });
                // ===================================================================================
            })(IO = Modules.IO || (Modules.IO = {}));
        })(Modules = Scripts.Modules || (Scripts.Modules = {}));
    })(Scripts = CoreXT.Scripts || (CoreXT.Scripts = {}));
})(CoreXT || (CoreXT = {}));
// #######################################################################################
//# sourceMappingURL=manifest.js.map