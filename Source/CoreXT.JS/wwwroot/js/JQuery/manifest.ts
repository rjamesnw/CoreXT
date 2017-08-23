/// <reference path="../manifest.ts" />
/// <reference path="../../../typings/globals/jquery/index.d.ts" />

// #######################################################################################

namespace CoreXT.Scripts.Modules {
    // ===================================================================================

    /** JQuery (see http://jquery.com/). */
    export var JQuery = module([], 'jquery{min:.min}', '~JQuery/').ready((mod) => {
        jQuery.holdReady(true); // (hold events until WE say go. note: doesn't require the system.)
        // ... run the script once all other modules have loaded ...
        CoreXT.onReady.attach(() => {
            setTimeout(() => { jQuery.holdReady(false) }, 0); // (trigger jquery after all 'onready' events have fired, and execution has stopped)
        });
        return true;
    });

    // ===================================================================================
}

// #######################################################################################
