interface IHostBridge {
    /** Returns the current working directory for the host app. */
    getCurrentDir(): string;
    /**
    * Returns true if 'host' in the global scope represents the CoreXT Server .NET environment (JavaScript only - no UI).
    * If true, the host bridge can provide direct access to certain methods on the hosting server, such as access to the file system, environment, registry settings, and more.
    */
    isServer(): boolean;
    /** Returns true if 'host' in the global scope represents a basic web navigator/browser application (no CoreXT specific host bridge is available). */
    isClient(): boolean;
    /** Returns true if this script is running in the CoreXT Studio host. */
    isStudio(): boolean;
    /** Sets the host window title, if applicable. */
    setTitle(title: string): void;
    /** Gets the host window title, if applicable. */
    getTitle(): string;
    /** Returns true if the host is running in debug mode. */
    isDebugMode(): boolean;
}
declare var host: IHostBridge;
