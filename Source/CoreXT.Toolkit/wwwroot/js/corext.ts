﻿module CoreXT {
    declare var baseURL: string;

    export module Errors {
        var errorCounter = 0;
        var errors: string[] = [];
        var errorDisplayTimeoutHandle = -1;

        export function getErrors(): string { return errors.join("\r\n"); }

        function _ShowErrors(): void {
            errorDisplayTimeoutHandle = -1;

            var errorMsg = errors.join("\r\n");

            // ... make sure the body is visible ...

            //? document.body.style.display = ""; // (show the body in case it's hidden)

            var msgElement = document.createElement("div");
            msgElement.className = "alert alert-danger";
            msgElement.innerHTML = "<button type='button' class='close' data-dismiss='alert'>&times;</button><strong>"
                + "An error has occurred, please check that your internet connection is still active.<br/>"
                + "The error message has been written to the console (accessible usually by pressing F12, or <i onclick='alert($CDS.Errors.getErrors())' style='cursor:pointer'>click here to see it now</i>).<br/>"
                + "<a id='sendError" + errorCounter + "' href=\"#\" onclick='return false;'>Please click here to send us an error report.</a><br>"
                + "<br/><button class='btn btn-primary' onclick='location.reload()'>Reload Page</button>";

            document.body.appendChild(msgElement);

            var mailLink = <HTMLAnchorElement>document.getElementById("sendError" + errorCounter);

            mailLink.onclick = () => { // TODO: Change to proper email. //?
                location.href = "mailto:support@catmedis.com?subject=Error%20Report&body=" + encodeURI(errorMsg);
                return false;
            };

            errorCounter++;
        }

        /**
         * Logs an error to display on the page.
         * @param sender A string that identifies the caller.
         * @param eventOrMessage An event object or message string.
         * @param source Source code file, if available.
         * @param sourceLineNumber Source code line number, if available.
         */
        export function LogError(sender: string, eventOrMessage: any, source?: string, sourceLineNumber?: number) {
            // ... format the error ...

            var msg = "";

            if (typeof eventOrMessage !== 'string') {
                if (eventOrMessage instanceof jQuery.Event) {
                    var event: JQueryEventObject = eventOrMessage;
                    msg = "jQuery Error in namespace '" + event.namespace + "', target: " + event.target.tagName + " (id='" + event.target.id + "').";
                }
                else if (!eventOrMessage) {
                    msg = "" + eventOrMessage;
                }
                else {
                    var winevent: ErrorEvent = eventOrMessage;
                    msg = winevent.message ? winevent.message : "" + winevent;
                }
            } else msg = eventOrMessage;

            if (source || sourceLineNumber)
                msg += "\r\nError source: '" + source + "' on line " + sourceLineNumber + "\r\n\r\n";

            if (sender)
                msg = sender + ": " + msg;

            msg = msg.replace(/\\r\\n|\\r|\\n/g, "\r\n");

            // ... write to console and add to errors list ...

            console.log(msg);

            errors.push(msg);

            // ... since this function can be called many times, we don't want to display the error prompt many times,
            // so don't do anything until the current js execution has completed ...

            if (errorDisplayTimeoutHandle > -1)
                clearTimeout(errorDisplayTimeoutHandle); // ('LogError' was called before, so clear and start again)

            errorDisplayTimeoutHandle = setTimeout(_ShowErrors, 100);
        }

        window.onerror = function (eventOrMessage: any, source: string, fileno: number): any {
            LogError("window.onerror", eventOrMessage, source, fileno);
        };
    }
}

var $CDS = CDS;

// ===================================================================================================================
// (prevent links from clicking into mobile safari if launching from a home screen shortcut [native full-screen mode])

if (window.navigator && ("standalone" in window.navigator) && window.navigator["standalone"]) {

    var noddy, remotes = false;

    document.addEventListener('click', function (event) {

        noddy = event.target;

        // ... locate an anchor parent ...

        while (noddy.nodeName !== "A" && noddy.nodeName !== "HTML") {
            noddy = noddy.parentNode;
        }

        if ('href' in noddy && noddy.href == '#') { // ('#' is a special link used for bootstrap buttons)
            event.preventDefault();
        }

    }, false);
}

// ===================================================================================================================

function IsPage(action: string, controller = "home") {
    return new RegExp("\/" + controller + "\/" + action + "(?:\/?[?&#]|$)", "gi").test(location.pathname);
}

// ===================================================================================================================
