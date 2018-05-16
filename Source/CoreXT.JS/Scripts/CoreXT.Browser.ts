// #######################################################################################
// Browser detection (for special cases).
// #######################################################################################

// #######################################################################################

namespace CoreXT {
    // ========================================================================================================================

    /** Contains information on the user agent (browser) being used.
      * Note: While it's always better to check objects for supported functions, sometimes an existing function may take different
      * parameters based on the browser (such as 'Worker.postMessage()' using transferable objects with IE vs All Others [as usual]).
      */
    export namespace Browser {
        registerNamespace("CoreXT", "Browser");
        // (Browser detection is a highly modified version of "http://www.quirksmode.org/js/detect.html".)
        // (Note: This is only required for quirk detection in special circumstances [such as IE's native JSON whitespace parsing issue], and not for object feature support)

        /** A list of browsers that can be currently detected. */
        export enum BrowserTypes {
            /** Browser is not yet detected, or detection failed. */
            Unknown = 0,
            /** Represents a non-browser environment. Any value > 1 represents a valid DOM environment (and not in a web worker). */
            None = -1,
            IE = 1,
            Chrome,
            FireFox,
            Safari,
            Opera,
            Netscape,
            OmniWeb,
            iCab,
            Konqueror,
            Camino
        }

        /** A list of operating systems that can be currently detected. */
        export enum OperatingSystems {
            /** OS is not yet detected, or detection failed. */
            Unknown = 0,
            Windows,
            Mac,
            Linux,
            iOS
        }

        /** Holds detection parameters for a single browser agent string version.
        * Note: This is agent string related, as the version number itself is pulled dynamically based on 'versionPrefix'.
        */
        export interface BrowserAgentVersionInfo {
            /** The parent 'BrowserInfo' details that owns this object. */
            parent?: BrowserInfo;
            /** The text to search for to select this version entry. If null, use the browser name string. */
            nameTag: string;
            /** The text to search for that immediately precedes the browser version.
            * If null, use the browser name string, appended with '/'. */
            versionPrefix: string;
            /** Used only to override a browser vendor name if a different vendor owned a browser in the past. */
            vendor?: string;
        }

        /** Holds detection parameters for a single browser type, and supported versions. */
        export interface BrowserInfo {
            /** The name of the browser. */
            name: string;
            /** The browser's vendor. */
            vendor: string;
            /** The browser's enum value (see 'Browser.BrowserTypes'). */
            identity: BrowserTypes;
            /** The browser's AGENT STRING versions (see 'Browser.BrowserVersionInfo').
            * Note: This is the most important part, as browser is detected based on it's version details.
            */
            versions: BrowserAgentVersionInfo[];
        }

        /** Holds detection parameters for the host operating system. */
        export interface OSInfo {
            name: string;
            identity: OperatingSystems;
        }

        var __browserList: BrowserInfo[] = (() => {
            var list: BrowserInfo[] = [];
            list[BrowserTypes.Chrome] =
                {
                    name: "Chrome", vendor: "Google", identity: BrowserTypes.Chrome, // (browser details)
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
            if ((<any>window).opera) browserVersionInfo = __browserList[BrowserTypes.Opera].versions[0];
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
                        { nameTag: null, versionPrefix: null }, // for newer Netscapes (6+)
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

        var __osList: OSInfo[] = [
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
        export var browserVersionInfo: BrowserAgentVersionInfo = null;

        /** Holds a reference to the agent data detected regarding the host operating system. */
        export var osInfo: OSInfo = null;

        var __findBrowser = (): BrowserAgentVersionInfo => {
            var agent = navigator.vendor + "," + navigator.userAgent, bInfo: BrowserInfo, version: BrowserAgentVersionInfo, versionPrefix: string;
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
        }

        var __findOS = (): OSInfo => {
            var osStrData = navigator.platform || navigator.userAgent;
            for (var i = 0, n = __osList.length; i < n; ++i)
                if (osStrData.indexOf(__osList[i].name) != -1)
                    return __osList[i];
        }

        var __detectVersion = (versionInfo: BrowserAgentVersionInfo): number => {
            var versionStr = navigator.userAgent + " / " + navigator.appVersion;
            var versionPrefix = versionInfo.versionPrefix || (versionInfo.parent.name + "/");
            var index = versionStr.indexOf(versionPrefix);
            if (index == -1) return -1;
            return parseFloat(versionStr.substring(index + versionPrefix.length));
        }

        /** The name of the detected browser. */
        export var name: string = "";

        /** The browser's vendor. */
        export var vendor: string = "";

        /** The operating system detected. */
        export var os: OperatingSystems = OperatingSystems.Unknown;

        /** The browser version detected. */
        export var version: number = -1;

        /** Set to true if ES2015 (aka ES6) is supported ('class', 'new.target', etc.). */
        export const ES6 = CoreXT.ES6;
        // (Note: For extension of native types, the CoreXT behavior changes depending on ES6 support due to the new 'new.target' feature changing how called native constructors behave)

        /** The type of browser detected. */
        export var type: BrowserTypes = ((): BrowserTypes => {
            var browserType: BrowserTypes = BrowserTypes.Unknown, browserInfo: BrowserInfo;
            if (Environment == Environments.Browser) {
                if (!browserVersionInfo) browserVersionInfo = __findBrowser();
                browserInfo = browserVersionInfo.parent;
                osInfo = __findOS();
                browserType = browserInfo.identity;
                name = browserInfo.name;
                vendor = browserVersionInfo.vendor || browserVersionInfo.parent.vendor;
                browserType = browserInfo != null ? browserInfo.identity : BrowserTypes.Unknown;
                version = __detectVersion(browserVersionInfo);
                os = osInfo != null ? osInfo.identity : OperatingSystems.Unknown;
            }
            else browserType = BrowserTypes.None;
            return browserType;
        })();

        // ------------------------------------------------------------------------------------------------------------------

        /** Uses cross-browser methods to return the browser window's viewport size. */
        export function getViewportSize() {
            var w = window,
                d = document,
                e = d.documentElement,
                g = d.getElementsByTagName('body')[0],
                x = w.innerWidth || e.clientWidth || g.clientWidth,
                y = w.innerHeight || e.clientHeight || g.clientHeight;
            return { width: x, height: y };
        }

        // ------------------------------------------------------------------------------------------------------------------

        /**
         * Browser benchmarking for various speed tests. The test uses the high-performance clock system, which exists in most modern browsers.
         * The result is returned in milliseconds.
         * @param init The "setup" code, which is only run once.
         * @param code The code to run a test on.
         * @param trialCount The number of times to run the whole test ('init' together with 'code' loops).  The default is 100. The average time of all tests are returned.
         * @param count The number of loops to run the test code in (test 'code' only, and not the 'init' code). The default is 100,000,000.
         */
        function testSpeed(init: string, code: string, trialCount = 100, count = 100000000): number { // (http://www.simetric.co.uk/si_time.htm, http://slideplayer.com/slide/5712283/)
            count = +count || 0;
            trialCount = +trialCount || 0;
            if (code && count && trialCount) {
                var func = new Function(init + ";\r\n"
                    + "var $__fs_t0 = performance.now();\r\n"
                    + "for (var $__fs_i = 0; $__fs_i < " + count + "; $__fs_i++) {\r\n" + code + ";\r\n}\r\n"
                    + "var $__fs_t1 = performance.now();\r\n"
                    + " return $__fs_t1 - $__fs_t0;\r\n");
                console.log(func);
                var totalTime: number = 0;
                for (var i = 0; i < trialCount; ++i)
                    totalTime += func();
                var elapsed = totalTime / trialCount;
                console.log("Took: " + elapsed + "ms");
            }
            return elapsed || 0;
        }

        // ------------------------------------------------------------------------------------------------------------------
    }

    // =======================================================================================================================
}

// #######################################################################################

namespace CoreXT.DOM {
    //?var __id: number = null;
    //?var __appDomain: {} = null;

    /** True when the HTML has completed loading and was parsed. */
    export var onDOMLoaded = CoreXT.System.Events.EventDispatcher.new(Loader, "onDOMLoaded", true);
    var _domLoaded = false;

    /** True when the DOM has completed loading. */
    export function isDOMReady(): boolean { return _domLoaded; }
    var _domReady = false;

    var _pageLoaded = false;
    export var onPageLoaded = CoreXT.System.Events.EventDispatcher.new(Loader, "onPageLoaded", true);

    /** Explicit user request to queue to run when ready, regardless of debug mode.
      * Returns true if running upon return, or already running, and false if not ready and queued to run later. */
    function onReady(): boolean { // (this is only available via the console or when forcibly executed and will not show in intellisense)
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
    };

    /** Implicit request to run only if ready, and not in debug mode. If not ready, or debug mode is set, ignore the request. (used internally) */
    function _doReady(): void {
        var log = CoreXT.System.Diagnostics.log("DOM Loading", "Checking if ready...").beginCapture();
        if (_domLoaded && _pageLoaded) onReady();
        log.endCapture();
    };

    /** Called first when HTML loading completes and is parsed. */
    function _doOnDOMLoaded(): void { // (note: executed immediately on the server before this script ends)
        if (!_domLoaded) {
            _domLoaded = true;
            var log = CoreXT.System.Diagnostics.log("DOM Loading", "HTML document was loaded and parsed. Loading any sub-resources next (CSS, JS, etc.)...", CoreXT.LogTypes.Success).beginCapture();
            onDOMLoaded.autoTrigger = true;
            onDOMLoaded.dispatchEvent();
            log.endCapture();
        }
    };

    /** Called last when page completes (all sub-resources, such as CSS, JS, etc., have finished loading). */
    function _doOnPageLoaded(): void { // (note: executed immediately on the server before this script ends)
        if (!_pageLoaded) {
            _doOnDOMLoaded(); // (just in case - the DOM load must precede the page load!)
            _pageLoaded = true;
            var log = CoreXT.System.Diagnostics.log("DOM Loading", "The document and all sub-resources have finished loading.", CoreXT.LogTypes.Success).beginCapture();
            onPageLoaded.autoTrigger = true;
            onPageLoaded.dispatchEvent();
            _doReady();
            log.endCapture();
        }
    };

    // Note: $XT is initially created with limited functionality until the system is ready!
    // If on the client side, detect when the document is ready for script downloads - this will allow the UI to show quickly, and download script while the user reads the screen.
    // (note: this is a two phased approach - DOM ready, then PAGE ready.
    
    if (CoreXT.Environment == CoreXT.Environments.Browser) (function () {

        var readyStateTimer: number;

        // ... check document ready events first in case we can get more granular feedback...

        if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", () => {
                if (!_domLoaded) _doOnDOMLoaded();
            }); // (Firefox - wait until document loads)
            // (this event is fired after document and inline script loading, but before everything else loads [css, images, etc.])
        }
        else if ((<any>document).attachEvent && document.all && !(<any>window).opera) {
            // (DOM loading trick for IE8-, inspired by this article: http://www.javascriptkit.com/dhtmltutors/domready.shtml)
            document.write('<script type="text/javascript" id="domloadedtag" defer="defer" src="javascript:void(0)"><\/script>');
            (<any>document.getElementById("domloadedtag")).onreadystatechange = function () {
                if (this.readyState == "complete" && !_domLoaded)
                    _doOnDOMLoaded(); // (deferred script loading completes when DOM is finally read)
            }; // (WARNING: The 'complete' state callback may occur AFTER the page load event if done at the same time [has happened during a debug session])
        }
        else if (document.readyState) {

            // ... fallback to timer based polling ...
            var checkReadyState = () => {
                if (document.body) // (readyState states: 0 uninitialized, 1 loading, 2 loaded, 3 interactive, 4 complete)
                    if (!_domLoaded && (document.readyState == <any>'loaded' || document.readyState == 'interactive')) { // (this event is fired after document and inline script loading, but before everything else loads [css, images, etc.])
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
            window.addEventListener("load", () => { _doOnPageLoaded(); }); // (wait until whole page has loaded)
        else if ((<any>window).attachEvent)
            (<any>window).attachEvent('onload', () => { _doOnPageLoaded(); });
        else { // (for much older browsers)
            var oldOnload = window.onload; // (backup any existing event)
            window.onload = (ev) => { // (perform a hook)
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
}

// #######################################################################################
