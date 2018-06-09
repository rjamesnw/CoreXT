/// <reference path="../../manifest.ts" />
// #######################################################################################
var CoreXT;
(function (CoreXT) {
    var Scripts;
    (function (Scripts) {
        var Modules;
        (function (Modules) {
            /**
             * Modules by Sergey Ilinsky (https://github.com/ilinsky/xmlhttprequest).
             */
            var Github;
            (function (Github) {
                var Ilinsky;
                (function (Ilinsky) {
                    // ===================================================================================
                    /**
                     * 'XMLHttpRequest' cross-browser wrapper.
                     */
                    Ilinsky.XMLHttpRequest = Scripts.module([], 'XMLHttpRequest', '~github/ilinsky/XMLHttpRequest-20130624.js');
                    // ===================================================================================
                })(Ilinsky = Github.Ilinsky || (Github.Ilinsky = {}));
            })(Github = Modules.Github || (Modules.Github = {}));
        })(Modules = Scripts.Modules || (Scripts.Modules = {}));
    })(Scripts = CoreXT.Scripts || (CoreXT.Scripts = {}));
})(CoreXT || (CoreXT = {}));
// #######################################################################################
//# sourceMappingURL=manifest.js.map