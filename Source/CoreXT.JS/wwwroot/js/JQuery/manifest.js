var CoreXT;
(function (CoreXT) {
    var Scripts;
    (function (Scripts) {
        var Modules;
        (function (Modules) {
            var JQuery;
            (function (JQuery) {
                JQuery.V2_2_0 = Scripts.module([], 'jquery_2_2_0{min:.min}', '~JQuery/').ready(function (mod) {
                    jQuery.holdReady(true);
                    CoreXT.onReady.attach(function () {
                        setTimeout(function () { jQuery.holdReady(false); }, 0);
                    });
                    return true;
                });
                JQuery.Latest = JQuery.V2_2_0;
            })(JQuery = Modules.JQuery || (Modules.JQuery = {}));
        })(Modules = Scripts.Modules || (Scripts.Modules = {}));
    })(Scripts = CoreXT.Scripts || (CoreXT.Scripts = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=manifest.js.map