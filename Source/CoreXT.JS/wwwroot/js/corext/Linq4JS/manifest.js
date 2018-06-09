/// <reference path="../manifest.ts" />
// #######################################################################################
var CoreXT;
(function (CoreXT) {
    var Scripts;
    (function (Scripts) {
        var Modules;
        (function (Modules) {
            // ===================================================================================
            /**
            * Enables Linq based queries, similar to C#. (https://github.com/morrisjdev/Linq4JS).
            * This is included to allow .Net developers who are familiar with Linq to use Linq based
            * nested method calls to work on CoreXT arrays/collections.
            */
            Modules.Linq4JS = Scripts.module([], 'linq4js', '~Linq4JS/');
            // ===================================================================================
        })(Modules = Scripts.Modules || (Scripts.Modules = {}));
    })(Scripts = CoreXT.Scripts || (CoreXT.Scripts = {}));
})(CoreXT || (CoreXT = {}));
// #######################################################################################
//# sourceMappingURL=manifest.js.map