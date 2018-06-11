// #######################################################################################
// Types for time management.
// #######################################################################################

namespace CoreXT.System {
    // =============================================================================================

    /** Contains diagnostic based functions, such as those needed for logging purposes. */
    export namespace Diagnostics {
        namespace(() => CoreXT.System.Diagnostics);
        // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 

        export var __logItems: ILogItem[] = [];
        var __logItemsSequenceCounter = 0;
        var __logCaptureStack: ILogItem[] = [];

        // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 

        export class LogItem extends FactoryBase() {
            static 'new'(parent: ILogItem, title: string, message: string, type?: LogTypes, outputToConsole?: boolean): ILogItem;
            static 'new'(parent: ILogItem, title: any, message: any, type: LogTypes = LogTypes.Normal, outputToConsole = true): ILogItem { return null; }

            static init(o: ILogItem, isnew: boolean, parent: ILogItem, title: string, message: string, type?: LogTypes, outputToConsole?: boolean): void;
            static init(o: ILogItem, isnew: boolean, parent: ILogItem, title: any, message: any, type: LogTypes = LogTypes.Normal, outputToConsole = true) {
                if (title === void 0 || title === null) {
                    if (isEmpty(message))
                        error("LogItem()", "A message is required if no title is given.", o);
                    title = "";
                }
                else if (typeof title != 'string')
                    if ((<ITypeInfo>title).$__fullname)
                        title = (<ITypeInfo>title).$__fullname;
                    else
                        title = title.toString && title.toString() || title.toValue && title.toValue() || "" + title;

                if (message === void 0 || message === null)
                    message = "";
                else
                    message = message.toString && message.toString() || message.toValue && message.toValue() || "" + message;

                o.parent = parent;
                o.title = title;
                o.message = message;
                o.time = Date.now(); /*ms*/
                o.type = type;

                if (console && outputToConsole) { // (if the console object is supported, and the user allows it for this item, then send this log message to it now)
                    var _title = title, margin = ""; // (modify a copy so we can continue to pass along the unaltered title text)
                    if (_title.charAt(title.length - 1) != ":") _title += ": "; else _title += " ";
                    while (parent) { parent = parent.parent; margin += "  "; }
                    if (TimeSpan) {
                        var time = TimeSpan.utcTimeToLocalTime(o.time);
                        var consoleText = time.hours + ":" + (time.minutes < 10 ? "0" + time.minutes : "" + time.minutes) + ":" + (time.seconds < 10 ? "0" + time.seconds : "" + time.seconds)
                            + " " + margin + _title + o.message;
                    }
                    else consoleText = (new Date()).toLocaleTimeString() + " " + margin + _title + o.message; // TODO: Make a utility function to format Date() similar to hh:mm:ss
                    CoreXT.log(null, consoleText, type, void 0, false, false);
                }
            }
        }
        export namespace LogItem {
            export class $__type extends Disposable {
                // --------------------------------------------------------------------------------------------------------------------------

                /** The parent log item. */
                parent: ILogItem = null;
                /** The sequence count of this log item. */
                sequence: number = __logItemsSequenceCounter++; // (to maintain correct ordering, as time is not reliable if log items are added too fast)
                /** The title of this log item. */
                title: string;
                /** The message of this log item. */
                message: string;
                /** The time of this log item. */
                time: number;
                /** The type of this log item. */
                type: LogTypes;
                /** The source of the reason for this log item, if any. */
                source: {};

                subItems: ILogItem[];

                marginIndex: number = void 0;

                /** Write a message to the log without using a title and return the current log item instance. */
                write(message: string, type?: LogTypes, outputToConsole?: boolean): ILogItem;
                /** Write a message to the log. */
                write(message: any, type?: LogTypes, outputToConsole?: boolean): ILogItem;
                write(message: any, type: LogTypes = LogTypes.Normal, outputToConsole = true): ILogItem {
                    var logItem = Diagnostics.LogItem.new(this, null, message, type);
                    if (!this.subItems)
                        this.subItems = [];
                    this.subItems.push(logItem);
                    return this;
                }

                /** Write a message to the log without using a title and return the new log item instance, which can be used to start a related sub-log. */
                log(title: string, message: string, type?: LogTypes, outputToConsole?: boolean): ILogItem;
                /** Write a message to the log without using a title and return the new log item instance, which can be used to start a related sub-log. */
                log(title: any, message: any, type?: LogTypes, outputToConsole?: boolean): ILogItem;
                log(title: any, message: any, type: LogTypes = LogTypes.Normal, outputToConsole = true): ILogItem {
                    var logItem = Diagnostics.LogItem.new(this, title, message, type, outputToConsole);
                    if (!this.subItems)
                        this.subItems = [];
                    this.subItems.push(logItem);
                    return logItem;
                }

                /** Causes all future log writes to be nested under this log entry.
                * This is usually called at the start of a block of code, where following function calls may trigger nested log writes. Don't forget to call 'endCapture()' when done.
                * The current instance is returned to allow chaining function calls.
                * Note: The number of calls to 'endCapture()' must match the number of calls to 'beginCapture()', or an error will occur.
                */
                beginCapture(): ILogItem {
                    //? if (__logCaptureStack.indexOf(this) < 0)
                    __logCaptureStack.push(this);
                    return this;
                }

                /** Undoes the call to 'beginCapture()', activating any previous log item that called 'beginCapture()' before this instance.
                * See 'beginCapture()' for more details.
                * Note: The number of calls to 'endCapture()' must match the number of calls to 'beginCapture()', or an error will occur.
                */
                endCapture() {
                    //var i = __logCaptureStack.lastIndexOf(this);
                    //if (i >= 0) __logCaptureStack.splice(i, 1);
                    var item = __logCaptureStack.pop();
                    if (item != null) throw Exception.from("Your calls to begin/end log capture do not match up. Make sure the calls to 'endCapture()' match up to your calls to 'beginCapture()'.", this);
                }

                toString(): string {
                    var time = TimeSpan && TimeSpan.utcTimeToLocalTime(this.time) || null;
                    var timeStr = time && (time.hours + ":" + (time.minutes < 10 ? "0" + time.minutes : "" + time.minutes) + ":" + (time.seconds < 10 ? "0" + time.seconds : "" + time.seconds)) || "" + new Date(this.time).toLocaleTimeString();
                    var txt = "[" + this.sequence + "] (" + timeStr + ") " + this.title + ": " + this.message;
                    return txt;
                }

                // --------------------------------------------------------------------------------------------------------------------------

                private static [constructor](factory: typeof LogItem) {
                    //factory.init = (o, isnew) => { // not dealing with private properties, so this is not needed!
                    //};
                }
            }
            LogItem.$__register(Diagnostics);
        }

        export interface ILogItem extends LogItem.$__type { }

        // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 

        /** Starts a new diagnostics-based log entry. */
        export function log(title: string, message: string, type?: LogTypes, outputToConsole?: boolean): ILogItem;
        /** Starts a new diagnostics-based log entry. */
        export function log(title: any, message: any, type?: LogTypes, outputToConsole?: boolean): ILogItem;
        export function log(title: any, message: any, type: LogTypes = LogTypes.Normal, outputToConsole = true): ILogItem {
            if (__logCaptureStack.length) {
                var capturedLogItem = __logCaptureStack[__logCaptureStack.length - 1];
                var lastLogEntry = capturedLogItem.subItems && capturedLogItem.subItems.length && capturedLogItem.subItems[capturedLogItem.subItems.length - 1];
                if (lastLogEntry)
                    return lastLogEntry.log(title, message, type, outputToConsole);
                else
                    return capturedLogItem.log(title, message, type, outputToConsole); //capturedLogItem.log("", "");
            }
            var logItem = LogItem.new(null, title, message, type, outputToConsole);
            __logItems.push(logItem);
            return logItem;
        }

        export function getLogAsHTML(): string {
            var i: number, n: number;
            var orderedLogItems: ILogItem[] = [];
            var item: ILogItem;
            var logHTML = "<div>\r\n", cssClass = "", title: string, icon: string,
                rowHTML: string, titleHTML: string, messageHTML: string, marginHTML: string = "";
            var logItem: ILogItem, lookAheadLogItem: ILogItem;
            var time: ITimeSpan;
            var cssAndIcon: { cssClass: string; icon: string; };
            var margins: string[] = [""];
            var currentMarginIndex: number = 0;

            function cssAndIconFromLogType_text(type: LogTypes): { cssClass: string; icon: string; } {
                var cssClass, icon;
                switch (type) {
                    case LogTypes.Success: cssClass = "text-success"; icon = "&#x221A;"; break;
                    case LogTypes.Info: cssClass = "text-info"; icon = "&#x263C;"; break;
                    case LogTypes.Warning: cssClass = "text-warning"; icon = "&#x25B2;"; break;
                    case LogTypes.Error: cssClass = "text-danger"; icon = "<b>(!)</b>"; break;
                    default: cssClass = ""; icon = "";
                }
                return { cssClass: cssClass, icon: icon };
            }
            function reorganizeEventsBySequence(logItems: ILogItem[]) {
                var i: number, n: number;
                for (i = 0, n = logItems.length; i < n; ++i) {
                    logItem = logItems[i];
                    logItem.marginIndex = void 0;
                    orderedLogItems[logItem.sequence] = logItem;
                    if (logItem.subItems && logItem.subItems.length)
                        reorganizeEventsBySequence(logItem.subItems);
                }
            }
            function setMarginIndexes(logItem: ILogItem, marginIndex: number = 0) {
                var i: number, n: number;

                if (marginIndex && !margins[marginIndex])
                    margins[marginIndex] = margins[marginIndex - 1] + "&nbsp;&nbsp;&nbsp;&nbsp;";

                logItem.marginIndex = marginIndex;

                // ... reserve the margins needed for the child items ...
                if (logItem.subItems && logItem.subItems.length) {
                    for (i = 0, n = logItem.subItems.length; i < n; ++i)
                        setMarginIndexes(logItem.subItems[i], marginIndex + 1);
                }
            }

            // ... reorganize the events by sequence ...

            reorganizeEventsBySequence(__logItems);

            // ... format the log ...

            for (i = 0, n = orderedLogItems.length; i < n; ++i) {
                logItem = orderedLogItems[i];
                if (!logItem) continue;
                rowHTML = "";

                if (logItem.marginIndex === void 0)
                    setMarginIndexes(logItem);

                marginHTML = margins[logItem.marginIndex];

                cssAndIcon = cssAndIconFromLogType_text(logItem.type);
                if (cssAndIcon.icon) cssAndIcon.icon += "&nbsp;";
                if (cssAndIcon.cssClass)
                    messageHTML = cssAndIcon.icon + "<strong>" + String.replace(logItem.message, "\r\n", "<br />\r\n") + "</strong>";
                else
                    messageHTML = cssAndIcon.icon + logItem.message;

                if (logItem.title)
                    titleHTML = logItem.title + ": ";
                else
                    titleHTML = "";

                time = TimeSpan.utcTimeToLocalTime(logItem.time);

                rowHTML = "<div class='" + cssAndIcon.cssClass + "'>"
                    + time.hours + ":" + (time.minutes < 10 ? "0" + time.minutes : "" + time.minutes) + ":" + (time.seconds < 10 ? "0" + time.seconds : "" + time.seconds) + "&nbsp;"
                    + marginHTML + titleHTML + messageHTML + "</div>" + rowHTML + "\r\n";

                logHTML += rowHTML + "</ br>\r\n";
            }

            logHTML += "</div>\r\n";

            return logHTML;
        }

        export function getLogAsText(): string {
            //??var logText = "";
            //??for (var i = 0, n = __logItems.length; i < n; ++i)
            //??    logText += String.replaceTags(__logItems[i].title) + ": " + String.replaceTags(__logItems[i].message) + "\r\n";
            return String.replaceTags(String.replace(getLogAsHTML(), "&nbsp;", " "));
        }

        // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = 


    }

    // =============================================================================================
}

// #######################################################################################
// Basic Window hooks for client-side diagnostics (CTRL+~ to dump the log).
// TODO: Consider opening the load in either a popup or overlay (user's choice).

if (typeof window !== 'undefined') {
    // If a window error event callback is available, hook into it to provide some visual feedback in case of errors.
    // (Note: Supports the Bootstrap UI, though it may not be available if an error occurs too early)

    window.onerror = function (eventOrMessage: any, source: string, fileno: number): any {
        // ... create a log entry of this first ...
        CoreXT.System.Diagnostics.log("window.onerror", eventOrMessage + " in '" + source + "' on line " + fileno + ".", CoreXT.LogTypes.Error);
        // ... make sure the body is visible ...
        document.body.style.display = ""; // (show the body in case it's hidden)
        // ... format the error ...
        if (typeof eventOrMessage !== 'string') eventOrMessage = "" + eventOrMessage;
        var msgElement = document.createElement("div");
        msgElement.innerHTML = "<button type='button' class='close' data-dismiss='alert'>&times;</button><strong>"
            + (<string>eventOrMessage).replace(/\r\n/g, "<br/>\r\n") + "<br/>\r\nError source: '" + source + "' on line " + fileno + "<br/>\r\n</strong>\r\n";
        msgElement.className = "alert alert-danger";
        document.body.appendChild(msgElement);
    };

    // Add a simple keyboard hook to display debug information.
    document.onkeypress = document.onkeydown = function (e: Event) {
        var keyCode: number;
        var evt: any = e ? e : window.event;
        if (evt.type == "keydown") {
            keyCode = evt.keyCode;
        }
        else {
            keyCode = evt.charCode ? evt.charCode : evt.keyCode;
        }
        if (keyCode == 192 && evt.ctrlKey && CoreXT.debugMode) { // (CTRL+~) key
            var body = document.getElementById("main");
            if (body)
                body.style.display = ""; // (show the main element if hidden)
            var headerDiv = document.createElement("h1");
            headerDiv.innerHTML = "<h1><a name='__dslog__' id='__dslog__'>CoreXT Log:</a></h1>\r\n";
            var div = document.createElement("div");
            div.innerHTML = CoreXT.System.Diagnostics.getLogAsHTML();
            document.body.appendChild(headerDiv);
            document.body.appendChild(div);
            headerDiv.onclick = () => { alert("CoreXT Log: \r\n" + CoreXT.System.Diagnostics.getLogAsText()); };
            location.hash = "#__dslog__";
        }
    }
}

// #######################################################################################
