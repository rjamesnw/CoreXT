declare namespace CoreXT.System {
    /** Web storage utilities. */
    namespace Storage {
        /** Set to true if local storage is available. */
        var hasLocalStorage: boolean;
        /** Set to true if session storage is available. */
        var hasSessionStorage: boolean;
        enum StorageType {
            /** Use the local storage. This is a permanent store, until data is removed, or it gets cleared by the user. */
            Local = 0,
            /** Use the session storage. This is a temporary store, and only lasts for as long as the current browser session is open. */
            Session = 1,
        }
        function getStorage(type: StorageType): Storage;
        /** The delimiter used to separate key name parts and data values in storage. This should be a Unicode character that is usually never used in most cases. */
        var delimiter: string;
        var storagePrefix: string;
        function makeKeyName(appName: string, dataName: string): string;
        /** Set a value for the target storage.  For any optional parameter, pass in 'void 0' (without the quotes) to skip/ignore it.
        * If 'appVersion' and/or 'dataVersion' is given, the versions are stored with the data.  If the versions don't match
        * when retrieving the data, then 'null' is returned.
        * Warning: If the storage is full, then 'false' is returned.
        * @param {StorageType} type The type of storage to use.
        * @param {string} name The name of the item to store.
        * @param {string} value The value of the item to store. If this is undefined (void 0) then any existing value is removed instead.
        * @param {string} appName An optional application name to provision the data storage under.
        * @param {string} appVersion An optional application version name to apply to the stored data.  If the given application
        * version is different from the stored data, the data is reloaded.
        * Note: This is NOT the data version, but the version of the application itself.
        * @param {string} dataVersion An optional version for the stored data.  If the given version is different from that of
        * the stored data, the data is reloaded.
        */
        function set(type: StorageType, name: string, value: string, appName?: string, appVersion?: string, dataVersion?: string): boolean;
        /** Get a value from the target storage.  For any optional parameter, pass in 'void 0' (without the quotes) to skip/ignore it.
          * If 'appVersion' and/or 'dataVersion' is given, the versions are checked against the data.  If the versions don't
          * match, then 'null' is returned.
          * @param {StorageType} type The type of storage to use.
          * @param {string} name The name of the item to store.
          * @param {string} value The value of the item to store.
          * @param {string} appName An optional application name to provision the data storage under.
          * @param {string} appVersion An optional application version name to apply to the stored data.  If the given application
          * version is different from the stored data, the data is reloaded.
          * Note: This is NOT the data version, but the version of the application itself.
          * @param {string} dataVersion An optional version for the stored data.  If the given version is different from that of
          * the stored data, the data is reloaded.
          */
        function get(type: StorageType, name: string, appName?: string, appVersion?: string, dataVersion?: string): string;
        /** Clear all FlowScript data from the specified storage (except save project data). */
        function clear(type: StorageType): void;
    }
}
