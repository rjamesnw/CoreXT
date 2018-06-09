declare var manifest: CoreXT.Scripts.IManifest;
declare namespace CoreXT.Scripts.Modules.System {
    /** A special collection for indexing objects. */
    var Collections_IndexedObjectCollection: IUsingModule;
    /** A special collection that allows observing changes (such as add/remove operations). */
    var Collections_ObservableCollection: IUsingModule;
    /** References all collections. */
    var Collections: IUsingModule;
    /** The core CoreXT system. */
    var Core: IUsingModule;
    /** The core CoreXT system. */
    var AppDomain: IUsingModule;
    /** The core CoreXT system. */
    var Events: IUsingModule;
    /** System functions and types to help manage the IO process (page and data loading). */
    var IO: IUsingModule;
    /** Contains specialized classes and functions for dealing with mark-up type code (i.e. HTML, XML, etc.). */
    var Markup: IUsingModule;
    /** This module contains classes for building CoreXT applications using a 'Graph' element layout system.
    * Note: This is only the logical application layer, and does not contain any UI classes.  For UI based applications,
    * include System.UI and a UI implementation of your choice (such as System.UI.HTML or Twitter.Bootstrap).
    */
    var Platform: IUsingModule;
    /** The main CoreXT system core.  This module is already included by default, and is here only for consistency. */
    var UI: IUsingModule;
    /** The CoreXT UI module contains HTML related objects for UI designed.
    * Note: As with most CoreXT graph objects, the objects are "logical" elements, and thus, a visual layout environment is (eg. browser) is not required.
    */
    var UI_HTML: IUsingModule;
    /** This module contains types and functions for common communication tasks. */
    var Net: IUsingModule;
    /** CoreXT Studio and Server contains a plugin system called 'ICE' (Interface Communications Engine).
    * ICE only works in desktop app or server mode, and as such, this module is only valid in those contexts.
    */
    var ICE: IUsingModule;
    /** This module contains types and functions for common data manipulation tasks. */
    var Data: IUsingModule;
}
