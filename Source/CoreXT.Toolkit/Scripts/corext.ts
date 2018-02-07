declare var HoldOn: {
    open: (options: { message: string, theme?: string, content?: string, backgroundColor?: string, textColor?: string }) => void,
    close: () => void
};

namespace CoreXT {
    //-------------------------------------------------------------------------------------------------------------------------

    export var baseURL: string;
    export var controllerName: string;
    export var actionName: string;

    //-------------------------------------------------------------------------------------------------------------------------

    var waitRequestCounter = 0; // (calls to 'HoldOn.open()' do not stack)

    function wait(msg = "Please wait ...") {
        if (!HoldOn && !HoldOn.open) throw new Error("'HoldOn.js' or 'HoldOn.min.js' is required.");
        HoldOn.open({ message: msg, backgroundColor: "#FFFFFF", textColor: "#000000" });
        waitRequestCounter++;
    }

    function closeWait() { if (waitRequestCounter > 0 && !--waitRequestCounter) HoldOn.close(); }

    //-------------------------------------------------------------------------------------------------------------------------

    export interface IDataClientOptions { [name: string]: any }

    /**
     * Provides low level communication to the web server.
     */
    export class DataClient {
        /** If true (default) uses the included HoldOn.js to block the user while data is being sent. */
        static enableAutoUserBlockOnDataSend = true;
        data: string;
        /** Set a callback to be notified when a result is ready. */
        onready: { (d: DataClient, data: any): void };
        /** Set a callback to be notified if an error occurs. If the callback handler returns false (anything else is ignored), the default error message will be triggered as normal. */
        onerror: { (d: DataClient): boolean | void };
        /** Set a callback to be notified when the data is about to be sent. */
        onsending: { (d: DataClient): void };
        /** Set a callback to be notified when the data is sent. */
        onsent: { (d: DataClient): void };
        /** Set a callback to be notified when ANY type of response is received (success, error, or otherwise). */
        onresponse: { (d: DataClient): void };
        constructor(public readonly url: string, public readonly options?: IDataClientOptions) { }
        /**
         * Send data as configured.
         * @param blockUI If true (default) the browser will be blocked during communication to prevent user input.
         * This is typically false for server pings or other background tasks that communicate with the server!
         */
        send(blockUI = true) {
            if (DataClient.enableAutoUserBlockOnDataSend && blockUI) wait();
            if (this.onsending)
                this.onsending(this);
            $.ajax({
                url: this.url,
                type: 'POST',
                data: this.options,
                dataType: 'html',
                contentType: 'application/x-www-form-urlencoded',
                success: (data) => {
                    if (DataClient.enableAutoUserBlockOnDataSend && blockUI) closeWait();
                    if (this.onresponse)
                        this.onresponse(this);
                    this.onready(this, data);
                },
                error: (xhr: XMLHttpRequest, status: string, error: string) => {
                    if (DataClient.enableAutoUserBlockOnDataSend && blockUI) closeWait();
                    if (this.onresponse)
                        this.onresponse(this);
                    var handled = false;
                    if (typeof this.onerror == "function")
                        handled = this.onerror(this) !== false;
                    if (!handled)
                        window.alert("Error while retrieving data from URL '" + this.url + "':\r\n Status: " + status + "\r\n Message: " + (error || xhr.response))
                }
            });
            if (this.onsent)
                this.onsent(this);
        }
    }

    export class ActionDataClient extends DataClient {
        constructor(public controllerName: string,
            public actionName: string, options?: IDataClientOptions, area?: string) {
            super((area && area + "/" || "") + controllerName + "/" + actionName, options);
        }
    }

    //-------------------------------------------------------------------------------------------------------------------------

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
        export function logError(sender: string, eventOrMessage: any, source?: string, sourceLineNumber?: number) {
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
            logError("window.onerror", eventOrMessage, source, fileno);
        };
    }
}

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

function isPage(action: string, controller = "home") {
    return new RegExp("\/" + controller + "\/" + action + "(?:\/?[?&#]|$)", "gi").test(location.pathname);
}

// ===================================================================================================================
