var CoreXT;
(function (CoreXT) {
    var Scripts;
    (function (Scripts) {
        var Modules;
        (function (Modules) {
            var Google;
            (function (Google) {
                var gmapsCallbackStr = manifest.registerGlobal("onGMapsReady", null);
                Google.Maps = Scripts.module([], 'google.maps', "https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=" + gmapsCallbackStr)
                    .then(function (mod) {
                    manifest.setGlobalValue("onGMapsReady", function () {
                        mod.continue();
                    });
                    return mod;
                }).ready(function (res) { res.pause(); });
            })(Google = Modules.Google || (Modules.Google = {}));
        })(Modules = Scripts.Modules || (Scripts.Modules = {}));
    })(Scripts = CoreXT.Scripts || (CoreXT.Scripts = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=manifest.js.map