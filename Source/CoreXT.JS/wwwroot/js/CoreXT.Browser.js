// #######################################################################################
// Browser detection (for special cases).
// #######################################################################################
// #######################################################################################
var CoreXT;
(function (CoreXT) {
    // ========================================================================================================================
    /** Contains information on the user agent (browser) being used.
      * Note: While it's always better to check objects for supported functions, sometimes an existing function may take different
      * parameters based on the browser (such as 'Worker.postMessage()' using transferable objects with IE vs All Others [as usual]).
      */
    var Browser;
    (function (Browser) {
        CoreXT.registerNamespace("CoreXT", "Browser");
        // (Browser detection is a highly modified version of "http://www.quirksmode.org/js/detect.html".)
        // (Note: This is only required for quirk detection in special circumstances [such as IE's native JSON whitespace parsing issue], and not for object feature support)
        /** A list of browsers that can be currently detected. */
        var BrowserTypes;
        (function (BrowserTypes) {
            /** Browser is not yet detected, or detection failed. */
            BrowserTypes[BrowserTypes["Unknown"] = 0] = "Unknown";
            /** Represents a non-browser environment. Any value > 1 represents a valid DOM environment (and not in a web worker). */
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
        /** A list of operating systems that can be currently detected. */
        var OperatingSystems;
        (function (OperatingSystems) {
            /** OS is not yet detected, or detection failed. */
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
                    versions: [{ nameTag: null, versionPrefix: null }] // (list of browser versions; string values default to the browser name if null)
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
                        { nameTag: "Mozilla", versionPrefix: "Mozilla", vendor: "Netscape Communications (now AOL)" } // for older Netscapes (4-)
                    ]
                };
            list[BrowserTypes.IE] =
                {
                    name: "Internet Explorer", vendor: "Microsoft", identity: BrowserTypes.IE,
                    versions: [{ nameTag: "MSIE", versionPrefix: "MSIE " }]
                };
            // ... connect the parents and return the static list ...
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
        /** Holds a reference to the agent data detected regarding browser name and versions. */
        Browser.browserVersionInfo = null;
        /** Holds a reference to the agent data detected regarding the host operating system. */
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
        /** The name of the detected browser. */
        Browser.name = "";
        /** The browser's vendor. */
        Browser.vendor = "";
        /** The operating system detected. */
        Browser.os = OperatingSystems.Unknown;
        /** The browser version detected. */
        Browser.version = -1;
        /** Set to true if ES2015 (aka ES6) is supported ('class', 'new.target', etc.). */
        Browser.ES6 = CoreXT.ES6;
        // (Note: For extension of native types, the CoreXT behavior changes depending on ES6 support due to the new 'new.target' feature changing how called native constructors behave)
        /** The type of browser detected. */
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
        // ------------------------------------------------------------------------------------------------------------------
        /** Uses cross-browser methods to return the browser window's viewport size. */
        function getViewportSize() {
            var w = window, d = document, e = d.documentElement, g = d.getElementsByTagName('body')[0], x = w.innerWidth || e.clientWidth || g.clientWidth, y = w.innerHeight || e.clientHeight || g.clientHeight;
            return { width: x, height: y };
        }
        Browser.getViewportSize = getViewportSize;
        // ------------------------------------------------------------------------------------------------------------------
        /**
         * Browser benchmarking for various speed tests. The test uses the high-performance clock system, which exists in most modern browsers.
         * The result is returned in milliseconds.
         * @param init The "setup" code, which is only run once.
         * @param code The code to run a test on.
         * @param trialCount The number of times to run the whole test ('init' together with 'code' loops).  The default is 100. The average time of all tests are returned.
         * @param count The number of loops to run the test code in (test 'code' only, and not the 'init' code). The default is 100,000,000.
         */
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
        // ------------------------------------------------------------------------------------------------------------------
    })(Browser = CoreXT.Browser || (CoreXT.Browser = {}));
    // =======================================================================================================================
})(CoreXT || (CoreXT = {}));
// #######################################################################################
(function (CoreXT) {
    var DOM;
    (function (DOM) {
        //?var __id: number = null;
        //?var __appDomain: {} = null;
        /** True when the HTML has completed loading and was parsed. */
        DOM.onDOMLoaded = CoreXT.System.Events.EventDispatcher.new(CoreXT.Loader, "onDOMLoaded", true);
        var _domLoaded = false;
        /** True when the DOM has completed loading. */
        function isDOMReady() { return _domLoaded; }
        DOM.isDOMReady = isDOMReady;
        var _domReady = false;
        var _pageLoaded = false;
        DOM.onPageLoaded = CoreXT.System.Events.EventDispatcher.new(CoreXT.Loader, "onPageLoaded", true);
        /** Explicit user request to queue to run when ready, regardless of debug mode.
          * Returns true if running upon return, or already running, and false if not ready and queued to run later. */
        function onReady() {
            var log = CoreXT.System.Diagnostics.log("DOM Loading", "Page loading completed; DOM is ready.").beginCapture();
            //??if ($ICE != null) {
            //    $ICE.loadLibraries(); // (load all ICE libraries after the CoreXT system is ready, but before the ICE libraries are loaded so proper error details can be displayed if required)
            //}
            // (any errors before this point will terminate the 'onReady()' callback)
            // TODO: $ICE loads as a module, and should do this differently.
            //// ... some delay-loaded modules may be hooked into the window 'load' event, which will never fire at this point, so this has to be re-triggered ...
            //??var event = document.createEvent("Event");
            //event.initEvent('load', false, false);
            //window.dispatchEvent(event);
            // ... the system and all modules are loaded and ready ...
            log.write("Dispatching DOM 'onReady event ...", CoreXT.LogTypes.Info);
            CoreXT.Browser.onReady.autoTrigger = true;
            CoreXT.Browser.onReady.dispatchEvent();
            log.write("'CoreXT.DOM.Loader' completed.", CoreXT.LogTypes.Success);
            log.endCapture();
            return true;
        }
        ;
        /** Implicit request to run only if ready, and not in debug mode. If not ready, or debug mode is set, ignore the request. (used internally) */
        function _doReady() {
            var log = CoreXT.System.Diagnostics.log("DOM Loading", "Checking if ready...").beginCapture();
            if (_domLoaded && _pageLoaded)
                onReady();
            log.endCapture();
        }
        ;
        /** Called first when HTML loading completes and is parsed. */
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
        /** Called last when page completes (all sub-resources, such as CSS, JS, etc., have finished loading). */
        function _doOnPageLoaded() {
            if (!_pageLoaded) {
                _doOnDOMLoaded(); // (just in case - the DOM load must precede the page load!)
                _pageLoaded = true;
                var log = CoreXT.System.Diagnostics.log("DOM Loading", "The document and all sub-resources have finished loading.", CoreXT.LogTypes.Success).beginCapture();
                DOM.onPageLoaded.autoTrigger = true;
                DOM.onPageLoaded.dispatchEvent();
                _doReady();
                log.endCapture();
            }
        }
        ;
        // Note: $XT is initially created with limited functionality until the system is ready!
        // If on the client side, detect when the document is ready for script downloads - this will allow the UI to show quickly, and download script while the user reads the screen.
        // (note: this is a two phased approach - DOM ready, then PAGE ready.
        if (CoreXT.Environment == CoreXT.Environments.Browser)
            (function () {
                var readyStateTimer;
                // ... check document ready events first in case we can get more granular feedback...
                if (document.addEventListener) {
                    document.addEventListener("DOMContentLoaded", function () {
                        if (!_domLoaded)
                            _doOnDOMLoaded();
                    }); // (Firefox - wait until document loads)
                    // (this event is fired after document and inline script loading, but before everything else loads [css, images, etc.])
                }
                else if (document.attachEvent && document.all && !window.opera) {
                    // (DOM loading trick for IE8-, inspired by this article: http://www.javascriptkit.com/dhtmltutors/domready.shtml)
                    document.write('<script type="text/javascript" id="domloadedtag" defer="defer" src="javascript:void(0)"><\/script>');
                    document.getElementById("domloadedtag").onreadystatechange = function () {
                        if (this.readyState == "complete" && !_domLoaded)
                            _doOnDOMLoaded(); // (deferred script loading completes when DOM is finally read)
                    }; // (WARNING: The 'complete' state callback may occur AFTER the page load event if done at the same time [has happened during a debug session])
                }
                else if (document.readyState) {
                    // ... fallback to timer based polling ...
                    var checkReadyState = function () {
                        if (document.body) // (readyState states: 0 uninitialized, 1 loading, 2 loaded, 3 interactive, 4 complete)
                            if (!_domLoaded && (document.readyState == 'loaded' || document.readyState == 'interactive')) { // (this event is fired after document and inline script loading, but before everything else loads [css, images, etc.])
                                _doOnDOMLoaded();
                            }
                            else if (!_pageLoaded && document.readyState == 'complete') { // (this event is fired after ALL resources have loaded on the page)
                                _doOnPageLoaded();
                            }
                        if (!_pageLoaded && !readyStateTimer)
                            readyStateTimer = setInterval(checkReadyState, 10); // (fall back to timer based polling)
                    };
                    checkReadyState();
                }
                //??else throw CoreXT.exception("Unable to detect and hook into the required 'document load' events for this client browser.");
                // (NOTE: If unable to detect and hook into the required 'document load' events for this client browser, wait for the page load event instead...)
                // ... hook into window ready events next which execute when the DOM is ready (all resources have loaded, parsed, and executed))...
                if (window.addEventListener)
                    window.addEventListener("load", function () { _doOnPageLoaded(); }); // (wait until whole page has loaded)
                else if (window.attachEvent)
                    window.attachEvent('onload', function () { _doOnPageLoaded(); });
                else { // (for much older browsers)
                    var oldOnload = window.onload; // (backup any existing event)
                    window.onload = function (ev) {
                        oldOnload && oldOnload.call(window, ev);
                        _doOnPageLoaded();
                    };
                }
                // ... finally, a timeout in case things are taking too long (for example, an image is holding things up if only the 'load' event is supported ...
                // (NOTE: If the user dynamically loads this script file, then the page DOM/load events may not be triggered in time.)
            })();
        else {
            _doOnPageLoaded(); // (no UI to wait for, so do this now)
        }
    })(DOM = CoreXT.DOM || (CoreXT.DOM = {}));
})(CoreXT || (CoreXT = {}));
// #######################################################################################
//# sourceMappingURL=CoreXT.Browser.js.map