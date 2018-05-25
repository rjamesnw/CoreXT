declare namespace CoreXT {
    /** Contains information on the user agent (browser) being used.
      * Note: While it's always better to check objects for supported functions, sometimes an existing function may take different
      * parameters based on the browser (such as 'Worker.postMessage()' using transferable objects with IE vs All Others [as usual]).
      */
    namespace Browser {
        /** A list of browsers that can be currently detected. */
        enum BrowserTypes {
            /** Browser is not yet detected, or detection failed. */
            Unknown = 0,
            /** Represents a non-browser environment. Any value > 1 represents a valid DOM environment (and not in a web worker). */
            None = -1,
            IE = 1,
            Chrome = 2,
            FireFox = 3,
            Safari = 4,
            Opera = 5,
            Netscape = 6,
            OmniWeb = 7,
            iCab = 8,
            Konqueror = 9,
            Camino = 10,
        }
        /** A list of operating systems that can be currently detected. */
        enum OperatingSystems {
            /** OS is not yet detected, or detection failed. */
            Unknown = 0,
            Windows = 1,
            Mac = 2,
            Linux = 3,
            iOS = 4,
        }
        /** Holds detection parameters for a single browser agent string version.
        * Note: This is agent string related, as the version number itself is pulled dynamically based on 'versionPrefix'.
        */
        interface BrowserAgentVersionInfo {
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
        interface BrowserInfo {
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
        interface OSInfo {
            name: string;
            identity: OperatingSystems;
        }
        /** Holds a reference to the agent data detected regarding browser name and versions. */
        var browserVersionInfo: BrowserAgentVersionInfo;
        /** Holds a reference to the agent data detected regarding the host operating system. */
        var osInfo: OSInfo;
        /** The name of the detected browser. */
        var name: string;
        /** The browser's vendor. */
        var vendor: string;
        /** The operating system detected. */
        var os: OperatingSystems;
        /** The browser version detected. */
        var version: number;
        /** Set to true if ES2015 (aka ES6) is supported ('class', 'new.target', etc.). */
        const ES6: boolean;
        /** The type of browser detected. */
        var type: BrowserTypes;
        /** Uses cross-browser methods to return the browser window's viewport size. */
        function getViewportSize(): {
            width: number;
            height: number;
        };
    }
}
declare namespace CoreXT.DOM {
    /** True when the HTML has completed loading and was parsed. */
    var onDOMLoaded: any;
    /** True when the DOM has completed loading. */
    function isDOMReady(): boolean;
    var onPageLoaded: any;
}
