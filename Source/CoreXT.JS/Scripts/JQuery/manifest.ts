/// <reference path="../manifest.ts" />
/// <reference path="../../typings/globals/jquery/index.d.ts" />

// #######################################################################################

namespace CoreXT.Scripts.Modules {
    // ===================================================================================

    /** jQuery (see http://jquery.com/). */
    export namespace JQuery {

        /** Selects jQuery version 2.2.0. */
        export var V2_2_0 = module([], 'jquery_2_2_0{min:.min}', '~JQuery/').ready((mod) => {
            jQuery.holdReady(true); // (hold events until WE say go. note: doesn't require the system.)
            // ... run the script once all other modules have loaded ...
            CoreXT.onReady.attach(() => {
                setTimeout(() => { jQuery.holdReady(false) }, 0); // (trigger jquery after all 'onready' events have fired, and execution has stopped)
            });
            return true;
        });

        /** Selects any latest version of jQuery (currently version 2.2.0). */
        export var Latest = V2_2_0;

    }

    // ===================================================================================
}

// #######################################################################################
