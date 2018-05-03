var CoreXT;
(function (CoreXT) {
    var Scripts;
    (function (Scripts) {
        var Modules;
        (function (Modules) {
            var System;
            (function (System) {
                System.Collections_IndexedObjectCollection = Scripts.module([], '.Collections.IndexedObjectCollection{min:.min}');
                System.Collections_ObservableCollection = Scripts.module([], '.Collections.ObservableCollection{min:.min}');
                System.Collections = Scripts.module([], '.Collections{min:.min}');
                System.Core = Scripts.module([System.Collections_IndexedObjectCollection], '.System{min:.min}', null);
                System.AppDomain = Scripts.module([System.Core], '.System.AppDomain{min:.min}', null);
                System.Events = Scripts.module([System.Core], '.Events{min:.min}', null);
                System.IO = Scripts.module([System.Core], '.System.IO{min:.min}', null);
                System.Markup = Scripts.module([], '.System.Markup{min:.min}');
                System.Platform = Scripts.module([System.Collections, System.Markup], '.System.Platform{min:.min}', null);
                System.UI = Scripts.module([System.Platform], '.System.Platform.UI{min:.min}.js', null);
                System.UI_HTML = Scripts.module([System.UI], '.System.UI.HTML{min:.min}', null);
                System.Net = Scripts.module([System.Collections], '.System.Net{min:.min}', null);
                System.ICE = Scripts.module([System.Platform], '.System.ICE{min:.min}', null);
                System.Data = Scripts.module([], '.System.Data{min:.min}', null);
            })(System = Modules.System || (Modules.System = {}));
        })(Modules = Scripts.Modules || (Scripts.Modules = {}));
    })(Scripts = CoreXT.Scripts || (CoreXT.Scripts = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=manifest.js.map