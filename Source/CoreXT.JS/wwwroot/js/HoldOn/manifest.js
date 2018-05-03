var CoreXT;
(function (CoreXT) {
    var Scripts;
    (function (Scripts) {
        var Modules;
        (function (Modules) {
            var IO;
            (function (IO) {
                IO.HoldOn = Scripts.module(null, 'HoldOn.min', '~HoldOn/')
                    .require(CoreXT.Loader.get("~HoldOn/HoldOn.min.css"))
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
            })(IO = Modules.IO || (Modules.IO = {}));
        })(Modules = Scripts.Modules || (Scripts.Modules = {}));
    })(Scripts = CoreXT.Scripts || (CoreXT.Scripts = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=manifest.js.map