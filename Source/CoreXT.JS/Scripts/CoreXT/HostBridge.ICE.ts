// (JSDoc Quick Reference: http://en.wikipedia.org/wiki/JSDoc)

declare module ICE {
    interface Channel {
    }
}

// ... extend the base host bridge with ICE related functions, then also extend the base class that implements it as well ...
// (note: the extended ICE class is what will be used in 'CoreXT.Common.ts')

interface IHostBridge_ICE extends IHostBridge {
    /** Loads all detectable plugin library assemblies and returns the assembly names.
    * The assemblies are loaded for type reflection only, and are only properly loaded when a plugin instance is required.
    */
    loadLibraries(): string[];

    /** Returns a list of all libraries that have been loaded by calling 'loadLibraries()'. */
    getLibraryNames(): string[];

    /** Creates a new interface channel and returns its globally unique identifier (GUID) for use . */
    createChannel(name: string): ICE.Channel;
}

//??class __NonCoreXTHost_ICE__ extends __NonCoreXTHost__ implements IHostBridge_ICE {

//    constructor() { super(); }

//    private static _NoICEErrorMsg = "ICE is not available in this host environment.";
//    loadLibraries(): string[] { throw __NonCoreXTHost_ICE__._NoICEErrorMsg; }
//    getLibraryNames(): string[] { throw __NonCoreXTHost_ICE__._NoICEErrorMsg; }
//    createChannel(name: string): ICE.Channel { throw __NonCoreXTHost_ICE__._NoICEErrorMsg; }
//}
