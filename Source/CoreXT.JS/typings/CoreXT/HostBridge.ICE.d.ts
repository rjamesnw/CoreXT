declare module ICE {
    interface Channel {
    }
}
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
