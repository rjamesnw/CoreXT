var CoreXT;
(function (CoreXT) {
    var Browser;
    (function (Browser) {
        var BrowserTypes;
        (function (BrowserTypes) {
            BrowserTypes[BrowserTypes["Unknown"] = 0] = "Unknown";
            BrowserTypes[BrowserTypes["None"] = -1] = "None";
            BrowserTypes[BrowserTypes["IE"] = 1] = "IE";
            BrowserTypes[BrowserTypes["Chrome"] = 2] = "Chrome";
            BrowserTypes[BrowserTypes["FireFox"] = 3] = "FireFox";
            BrowserTypes[BrowserTypes["Safari"] = 4] = "Safari";
            BrowserTypes[BrowserTypes["Opera"] = 5] = "Opera";
            BrowserTypes[BrowserTypes["Netscape"] = 6] = "Netscape";
            BrowserTypes[BrowserTypes["OmniWeb"] = 7] = "OmniWeb";
            BrowserTypes[BrowserTypes["iCab"] = 8] = "iCab";
            BrowserTypes[BrowserTypes["Konqueror"] = 9] = "Konqueror";
            BrowserTypes[BrowserTypes["Camino"] = 10] = "Camino";
        })(BrowserTypes = Browser.BrowserTypes || (Browser.BrowserTypes = {}));
        var OperatingSystems;
        (function (OperatingSystems) {
            OperatingSystems[OperatingSystems["Unknown"] = 0] = "Unknown";
            OperatingSystems[OperatingSystems["Windows"] = 1] = "Windows";
            OperatingSystems[OperatingSystems["Mac"] = 2] = "Mac";
            OperatingSystems[OperatingSystems["Linux"] = 3] = "Linux";
            OperatingSystems[OperatingSystems["iOS"] = 4] = "iOS";
        })(OperatingSystems = Browser.OperatingSystems || (Browser.OperatingSystems = {}));
        var __browserList = (function () {
            var list = [];
            list[BrowserTypes.Chrome] =
                {
                    name: "Chrome", vendor: "Google", identity: BrowserTypes.Chrome,
                    versions: [{ nameTag: null, versionPrefix: null }]
                };
            list[BrowserTypes.OmniWeb] =
                {
                    name: "OmniWeb", vendor: "The Omni Group", identity: BrowserTypes.OmniWeb,
                    versions: [{ nameTag: null, versionPrefix: null }]
                };
            list[BrowserTypes.Safari] =
                {
                    name: "Safari", vendor: "Apple", identity: BrowserTypes.Safari,
                    versions: [{ nameTag: null, versionPrefix: "Version" }]
                };
            list[BrowserTypes.Opera] =
                {
                    name: "Opera", vendor: "Opera Mediaworks", identity: BrowserTypes.Opera,
                    versions: [{ nameTag: null, versionPrefix: "Version" }]
                };
            if (window.opera)
                Browser.browserVersionInfo = __browserList[BrowserTypes.Opera].versions[0];
            list[BrowserTypes.iCab] =
                {
                    name: "iCab", vendor: "Alexander Clauss", identity: BrowserTypes.iCab,
                    versions: [{ nameTag: null, versionPrefix: null }]
                };
            list[BrowserTypes.Konqueror] =
                {
                    name: "Konqueror", vendor: "KDE e.V.", identity: BrowserTypes.Konqueror,
                    versions: [{ nameTag: "KDE", versionPrefix: "Konqueror" }]
                };
            list[BrowserTypes.FireFox] =
                {
                    name: "Firefox", vendor: "Mozilla Foundation", identity: BrowserTypes.FireFox,
                    versions: [{ nameTag: null, versionPrefix: null }]
                };
            list[BrowserTypes.Camino] =
                {
                    name: "Camino", vendor: "", identity: BrowserTypes.Camino,
                    versions: [{ nameTag: null, versionPrefix: null }]
                };
            list[BrowserTypes.Netscape] =
                {
                    name: "Netscape", vendor: "AOL", identity: BrowserTypes.Netscape,
                    versions: [
                        { nameTag: null, versionPrefix: null },
                        { nameTag: "Mozilla", versionPrefix: "Mozilla", vendor: "Netscape Communications (now AOL)" }
                    ]
                };
            list[BrowserTypes.IE] =
                {
                    name: "Internet Explorer", vendor: "Microsoft", identity: BrowserTypes.IE,
                    versions: [{ nameTag: "MSIE", versionPrefix: "MSIE " }]
                };
            for (var i = list.length - 1; i >= 0; --i)
                if (list[i] && list[i].versions)
                    for (var i2 = list[i].versions.length - 1; i2 >= 0; --i2)
                        if (list[i].versions[i2])
                            list[i].versions[i2].parent = list[i];
            return list;
        })();
        var __osList = [
            {
                name: "iPhone",
                identity: OperatingSystems.iOS
            },
            {
                name: "Linux",
                identity: OperatingSystems.Linux
            },
            {
                name: "Win",
                identity: OperatingSystems.Windows
            },
            {
                name: "Mac",
                identity: OperatingSystems.Mac
            }
        ];
        Browser.browserVersionInfo = null;
        Browser.osInfo = null;
        var __findBrowser = function () {
            var agent = navigator.vendor + "," + navigator.userAgent, bInfo, version, versionPrefix;
            for (var i = 0, n = __browserList.length; i < n; ++i) {
                bInfo = __browserList[i];
                if (bInfo)
                    for (var i2 = 0, n2 = bInfo.versions.length; i2 < n2; ++i2) {
                        version = bInfo.versions[i2];
                        versionPrefix = version.versionPrefix || (bInfo.name + '/');
                        if (version && agent.indexOf(version.nameTag || bInfo.name) != -1 && agent.indexOf(versionPrefix) != -1)
                            return version;
                    }
            }
            return null;
        };
        var __findOS = function () {
            var osStrData = navigator.platform || navigator.userAgent;
            for (var i = 0, n = __osList.length; i < n; ++i)
                if (osStrData.indexOf(__osList[i].name) != -1)
                    return __osList[i];
        };
        var __detectVersion = function (versionInfo) {
            var versionStr = navigator.userAgent + " / " + navigator.appVersion;
            var versionPrefix = versionInfo.versionPrefix || (versionInfo.parent.name + "/");
            var index = versionStr.indexOf(versionPrefix);
            if (index == -1)
                return -1;
            return parseFloat(versionStr.substring(index + versionPrefix.length));
        };
        Browser.name = "";
        Browser.vendor = "";
        Browser.os = OperatingSystems.Unknown;
        Browser.version = -1;
        Browser.ES6 = CoreXT.ES6;
        Browser.type = (function () {
            var browserType = BrowserTypes.Unknown, browserInfo;
            if (CoreXT.Environment == CoreXT.Environments.Browser) {
                if (!Browser.browserVersionInfo)
                    Browser.browserVersionInfo = __findBrowser();
                browserInfo = Browser.browserVersionInfo.parent;
                Browser.osInfo = __findOS();
                browserType = browserInfo.identity;
                Browser.name = browserInfo.name;
                Browser.vendor = Browser.browserVersionInfo.vendor || Browser.browserVersionInfo.parent.vendor;
                browserType = browserInfo != null ? browserInfo.identity : BrowserTypes.Unknown;
                Browser.version = __detectVersion(Browser.browserVersionInfo);
                Browser.os = Browser.osInfo != null ? Browser.osInfo.identity : OperatingSystems.Unknown;
            }
            else
                browserType = BrowserTypes.None;
            return browserType;
        })();
        function getViewportSize() {
            var w = window, d = document, e = d.documentElement, g = d.getElementsByTagName('body')[0], x = w.innerWidth || e.clientWidth || g.clientWidth, y = w.innerHeight || e.clientHeight || g.clientHeight;
            return { width: x, height: y };
        }
        Browser.getViewportSize = getViewportSize;
        function testSpeed(init, code, trialCount, count) {
            if (trialCount === void 0) { trialCount = 100; }
            if (count === void 0) { count = 100000000; }
            count = +count || 0;
            trialCount = +trialCount || 0;
            if (code && count && trialCount) {
                var func = new Function(init + ";\r\n"
                    + "var $__fs_t0 = performance.now();\r\n"
                    + "for (var $__fs_i = 0; $__fs_i < " + count + "; $__fs_i++) {\r\n" + code + ";\r\n}\r\n"
                    + "var $__fs_t1 = performance.now();\r\n"
                    + " return $__fs_t1 - $__fs_t0;\r\n");
                console.log(func);
                var totalTime = 0;
                for (var i = 0; i < trialCount; ++i)
                    totalTime += func();
                var elapsed = totalTime / trialCount;
                console.log("Took: " + elapsed + "ms");
            }
            return elapsed || 0;
        }
    })(Browser = CoreXT.Browser || (CoreXT.Browser = {}));
})(CoreXT || (CoreXT = {}));
(function (CoreXT) {
    var DOM;
    (function (DOM) {
        DOM.onDOMLoaded = CoreXT.System.Events.EventDispatcher.new(CoreXT.Loader, "onDOMLoaded", true);
        var _domLoaded = false;
        function isDOMReady() { return _domLoaded; }
        DOM.isDOMReady = isDOMReady;
        var _domReady = false;
        var _pageLoaded = false;
        DOM.onPageLoaded = CoreXT.System.Events.EventDispatcher.new(CoreXT.Loader, "onPageLoaded", true);
        function onReady() {
            var log = CoreXT.System.Diagnostics.log("DOM Loading", "Page loading completed; DOM is ready.").beginCapture();
            log.write("Dispatching DOM 'onReady event ...", CoreXT.LogTypes.Info);
            CoreXT.Browser.onReady.autoTrigger = true;
            CoreXT.Browser.onReady.dispatchEvent();
            log.write("'CoreXT.DOM.Loader' completed.", CoreXT.LogTypes.Success);
            log.endCapture();
            return true;
        }
        ;
        function _doReady() {
            var log = CoreXT.System.Diagnostics.log("DOM Loading", "Checking if ready...").beginCapture();
            if (_domLoaded && _pageLoaded)
                onReady();
            log.endCapture();
        }
        ;
        function _doOnDOMLoaded() {
            if (!_domLoaded) {
                _domLoaded = true;
                var log = CoreXT.System.Diagnostics.log("DOM Loading", "HTML document was loaded and parsed. Loading any sub-resources next (CSS, JS, etc.)...", CoreXT.LogTypes.Success).beginCapture();
                DOM.onDOMLoaded.autoTrigger = true;
                DOM.onDOMLoaded.dispatchEvent();
                log.endCapture();
            }
        }
        ;
        function _doOnPageLoaded() {
            if (!_pageLoaded) {
                _doOnDOMLoaded();
                _pageLoaded = true;
                var log = CoreXT.System.Diagnostics.log("DOM Loading", "The document and all sub-resources have finished loading.", CoreXT.LogTypes.Success).beginCapture();
                DOM.onPageLoaded.autoTrigger = true;
                DOM.onPageLoaded.dispatchEvent();
                _doReady();
                log.endCapture();
            }
        }
        ;
        if (CoreXT.Environment == CoreXT.Environments.Browser)
            (function () {
                var readyStateTimer;
                if (document.addEventListener) {
                    document.addEventListener("DOMContentLoaded", function () {
                        if (!_domLoaded)
                            _doOnDOMLoaded();
                    });
                }
                else if (document.attachEvent && document.all && !window.opera) {
                    document.write('<script type="text/javascript" id="domloadedtag" defer="defer" src="javascript:void(0)"><\/script>');
                    document.getElementById("domloadedtag").onreadystatechange = function () {
                        if (this.readyState == "complete" && !_domLoaded)
                            _doOnDOMLoaded();
                    };
                }
                else if (document.readyState) {
                    var checkReadyState = function () {
                        if (document.body)
                            if (!_domLoaded && (document.readyState == 'loaded' || document.readyState == 'interactive')) {
                                _doOnDOMLoaded();
                            }
                            else if (!_pageLoaded && document.readyState == 'complete') {
                                _doOnPageLoaded();
                            }
                        if (!_pageLoaded && !readyStateTimer)
                            readyStateTimer = setInterval(checkReadyState, 10);
                    };
                    checkReadyState();
                }
                if (window.addEventListener)
                    window.addEventListener("load", function () { _doOnPageLoaded(); });
                else if (window.attachEvent)
                    window.attachEvent('onload', function () { _doOnPageLoaded(); });
                else {
                    var oldOnload = window.onload;
                    window.onload = function (ev) {
                        oldOnload && oldOnload.call(window, ev);
                        _doOnPageLoaded();
                    };
                }
            })();
        else {
            _doOnPageLoaded();
        }
    })(DOM = CoreXT.DOM || (CoreXT.DOM = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.Browser.js.map