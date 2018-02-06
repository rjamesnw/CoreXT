var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var CoreXT;
(function (CoreXT) {
    //-------------------------------------------------------------------------------------------------------------------------
    //-------------------------------------------------------------------------------------------------------------------------
    var waitRequestCounter = 0; // (calls to 'HoldOn.open()' do not stack)
    function wait(msg) {
        if (msg === void 0) { msg = "Please wait ..."; }
        if (!HoldOn && !HoldOn.open)
            throw new Error("'HoldOn.js' or 'HoldOn.min.js' is required.");
        HoldOn.open({ message: msg, backgroundColor: "#FFFFFF", textColor: "#000000" });
        waitRequestCounter++;
    }
    function closeWait() { if (waitRequestCounter > 0 && !--waitRequestCounter)
        HoldOn.close(); }
    /**
     * Provides low level communication to the web server.
     */
    var DataClient = /** @class */ (function () {
        function DataClient(url, options) {
            this.url = url;
            this.options = options;
        }
        /**
         * Send data as configured.
         * @param blockUI If true (default) the browser will be blocked during communication to prevent user input.
         * This is typically false for server pings or other background tasks that communicate with the server!
         */
        DataClient.prototype.send = function (blockUI) {
            var _this = this;
            if (blockUI === void 0) { blockUI = true; }
            if (DataClient.enableAutoUserBlockOnDataSend && blockUI)
                wait();
            if (this.onsending)
                this.onsending(this);
            $.ajax({
                url: this.url,
                type: 'POST',
                data: this.options,
                dataType: 'html',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data) {
                    if (DataClient.enableAutoUserBlockOnDataSend && blockUI)
                        closeWait();
                    if (_this.onresponse)
                        _this.onresponse(_this);
                    _this.onready(_this, data);
                },
                error: function (xhr, status, error) {
                    if (DataClient.enableAutoUserBlockOnDataSend && blockUI)
                        closeWait();
                    if (_this.onresponse)
                        _this.onresponse(_this);
                    var handled = false;
                    if (typeof _this.onerror == "function")
                        handled = _this.onerror(_this) !== false;
                    if (!handled)
                        window.alert("Error while retrieving data from URL '" + _this.url + "':\r\n Status: " + status + "\r\n Message: " + (error || xhr.response));
                }
            });
            if (this.onsent)
                this.onsent(this);
        };
        /** If true (default) uses the included HoldOn.js to block the user while data is being sent. */
        DataClient.enableAutoUserBlockOnDataSend = true;
        return DataClient;
    }());
    CoreXT.DataClient = DataClient;
    var ActionDataClient = /** @class */ (function (_super) {
        __extends(ActionDataClient, _super);
        function ActionDataClient(controllerName, actionName, options, area) {
            var _this = _super.call(this, (area && area + "/" || "") + controllerName + "/" + actionName, options) || this;
            _this.controllerName = controllerName;
            _this.actionName = actionName;
            return _this;
        }
        return ActionDataClient;
    }(DataClient));
    CoreXT.ActionDataClient = ActionDataClient;
    //-------------------------------------------------------------------------------------------------------------------------
    var Errors;
    (function (Errors) {
        var errorCounter = 0;
        var errors = [];
        var errorDisplayTimeoutHandle = -1;
        function getErrors() { return errors.join("\r\n"); }
        Errors.getErrors = getErrors;
        function _ShowErrors() {
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
            var mailLink = document.getElementById("sendError" + errorCounter);
            mailLink.onclick = function () {
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
        function logError(sender, eventOrMessage, source, sourceLineNumber) {
            // ... format the error ...
            var msg = "";
            if (typeof eventOrMessage !== 'string') {
                if (eventOrMessage instanceof jQuery.Event) {
                    var event = eventOrMessage;
                    msg = "jQuery Error in namespace '" + event.namespace + "', target: " + event.target.tagName + " (id='" + event.target.id + "').";
                }
                else if (!eventOrMessage) {
                    msg = "" + eventOrMessage;
                }
                else {
                    var winevent = eventOrMessage;
                    msg = winevent.message ? winevent.message : "" + winevent;
                }
            }
            else
                msg = eventOrMessage;
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
        Errors.logError = logError;
        window.onerror = function (eventOrMessage, source, fileno) {
            logError("window.onerror", eventOrMessage, source, fileno);
        };
    })(Errors = CoreXT.Errors || (CoreXT.Errors = {}));
})(CoreXT || (CoreXT = {}));
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
        if ('href' in noddy && noddy.href == '#') {
            event.preventDefault();
        }
    }, false);
}
// ===================================================================================================================
function isPage(action, controller) {
    if (controller === void 0) { controller = "home"; }
    return new RegExp("\/" + controller + "\/" + action + "(?:\/?[?&#]|$)", "gi").test(location.pathname);
}
// ===================================================================================================================
//# sourceMappingURL=corext.js.map