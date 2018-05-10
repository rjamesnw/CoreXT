//? // <reference path="..\_references.ts" />
// =======================================================================================================================
// *** CREATING YOUR OWN MODULES? ***
//
// If you create your own modules, you can register them in two ways (via TypeScript or JavaScript):
//
// 1. a) Custom application modules: 
//       Include a 'manifest.ts' file with your 'app.ts' file and simply create a "module CoreXT.Scripts.Modules.??? { }" block in the manifest with your own
//       registered modules; where "???" is your namespace (grouping) name. The namespace name must be unique (such as a domain name) for shared modules.  If using
//       a domain name as the namespace name, the popular '.com' domains can leave out the TLD name ('.com') as a shortcut.  If you don't have a domain, then at
//       least use a unique alias name, or some other unique name (as unique as possible).  This helps to prevent clashing of same named modules from
//       different developers.  See the modules below for formatting examples.  The root 'manifest.ts' application manifest file is loaded automatically by the
//       bootstrapper after all requested modules have completed loading.
//
//    b) 3rd-Party Modules:
//       Using module namespaces for grouping is required for 3rd-parties wishing to release their own modules.  As best practice, all 3rd-party modules
//       should be placed in a sub folder under the 3rd-party namespace name, along with a 'manifest.ts/js' file.  End users only have to reference this ONE
//       manifest file in their TS projects (and of course add the script tag to load "CoreXT.js").  The manifest simply contains your own "Modules" list.
//
// 2. In a JavaScript file ('.js', i.e. outside TypeScript), simply add your domain/alias namespace name to the "CoreXT.Scripts.Modules" object
//    (ex: "CoreXT.Scripts.Modules.MyDomain = {};"), then register the module's type name (such as
//    "CoreXT.Scripts.Modules.MyDomain.MyModuleName = CoreXT.Scripts.Modules.registerModule(...);").
//
// In all cases, you have two options to load a module:
// 1. By calling "CoreXT.Scripts.Modules.using(CoreXT.Modules.$_Namespace.Module_Name)" (dynamic loading/load on demand).
// 2. Manually by adding an HTML "<script src='moduleFileName.js'></script>" tag (fixed, and always loaded).
//
// Note: Once a module is loaded (in either case), the type will become registered, so future calls to 'CoreXT.System.Modules.using()' will be ignored
// (except any callbacks passed in will be called immediately).
//
// Note: Manifests dependent on others 
//
// TIP: In TypeScript, place "import using = CoreXT.System.Modules.using;" before your code for convenience if desired (or
// "var using = CoreXT.System.Modules.using;" in JavaScript).
// =======================================================================================================================

declare var manifest: CoreXT.Scripts.IManifest;

namespace CoreXT.Scripts.Modules.System {
    // -------------------------------------------------------------------------------------------------------------------
    // System Plugins 

    /** A special collection for indexing objects. */
    export var Collections_IndexedObjectCollection = module([], '.Collections.IndexedObjectCollection{min:.min}');

    /** A special collection that allows observing changes (such as add/remove operations). */
    export var Collections_ObservableCollection = module([], '.Collections.ObservableCollection{min:.min}');

    /** References all collections. */
    export var Collections = module([], '.Collections{min:.min}');

    /** The core CoreXT system. */
    export var Core = module([Collections_IndexedObjectCollection], '.System{min:.min}', null);

    /** The core CoreXT system. */
    export var AppDomain = module([Core], '.System.AppDomain{min:.min}', null);

    /** The core CoreXT system. */
    export var Events = module([Core], '.Events{min:.min}', null);

    /** System functions and types to help manage the IO process (page and data loading). */

    export var IO = module([Core], '.System.IO{min:.min}', null);

    /** Contains specialized classes and functions for dealing with mark-up type code (i.e. HTML, XML, etc.). */
    export var Markup = module([], '.System.Markup{min:.min}');

    /** This module contains classes for building CoreXT applications using a 'Graph' element layout system.
    * Note: This is only the logical application layer, and does not contain any UI classes.  For UI based applications,
    * include System.UI and a UI implementation of your choice (such as System.UI.HTML or Twitter.Bootstrap).
    */
    export var Platform = module([Collections, Markup], '.System.Platform{min:.min}', null);

    /** The main CoreXT system core.  This module is already included by default, and is here only for consistency. */
    export var UI = module([Platform], '.System.Platform.UI{min:.min}.js', null);

    /** The CoreXT UI module contains HTML related objects for UI designed.
    * Note: As with most CoreXT graph objects, the objects are "logical" elements, and thus, a visual layout environment is (eg. browser) is not required.
    */
    export var UI_HTML = module([UI], '.System.UI.HTML{min:.min}', null); // ('.' will cause 'CoreXT' to be prefixed automatically)

    /** This module contains types and functions for common communication tasks. */
    export var Net = module([Collections], '.System.Net{min:.min}', null);

    /** CoreXT Studio and Server contains a plugin system called 'ICE' (Interface Communications Engine).
    * ICE only works in desktop app or server mode, and as such, this module is only valid in those contexts.
    */
    export var ICE = module([Platform], '.System.ICE{min:.min}', null);

    /** This module contains types and functions for common data manipulation tasks. */
    export var Data = module([], '.System.Data{min:.min}', null); // JSON stuff

    // -------------------------------------------------------------------------------------------------------------------
}
