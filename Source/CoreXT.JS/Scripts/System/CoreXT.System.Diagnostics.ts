// ###########################################################################################################################
// Types for time management.
// ###########################################################################################################################

namespace CoreXT.System {
    // =======================================================================================================================

    /** Contains diagnostic based functions, such as those needed for logging purposes. */
    export module Diagnostics {
        export var __logItems: LogItem[] = [];
        var __logItemsSequenceCounter = 0;
        var __logCaptureStack: LogItem[] = [];

        export enum DebugModes { // TODO: ...
            /** Run in release mode, which loads all minified module scripts, and runs the application automatically when ready. */
            Release,
            /** Run in debug mode (default), which loads all un-minified scripts, and runs the application automatically when ready. */
            Debug_Run,
            /** Run in debug mode, which loads all un-minified scripts, but does NOT run the application automatically.
              * To start the application process, call 'CoreXT.Scripts.runApp()".
              */
            Debug_Wait
        }

        /** Sets the debug mode. A developer should set this to one of the desired 'DebugModes' values.
        */
        export var debug: DebugModes = DebugModes.Debug_Run;

        /** Returns true if CoreXT is running in debug mode. */
        export function isDebugging() { return debug != DebugModes.Release; }

        export class LogItem {
            /** The parent log item. */
            parent: LogItem = null;
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

            subItems: LogItem[];

            marginIndex: number = void 0;

            constructor(parent: LogItem, title: string, message: string, type?: LogTypes, outputToConsole?: boolean);
            constructor(parent: LogItem, title: any, message: any, type: LogTypes = LogTypes.Normal, outputToConsole = true) {
                if (title === void 0 || title === null) {
                    if (isEmpty(message))
                        throw System.Exception.from("LogItem(): A message is required if no title is given.", this);
                    title = "";
                }
                else if (typeof title != STRING)
                    if ((<ITypeInfo>title).$__fullname)
                        title = (<ITypeInfo>title).$__fullname;
                    else
                        title = title.toString && title.toString() || title.toValue && title.toValue() || "" + title;

                if (message === void 0 || message === null)
                    message = "";
                else
                    message = message.toString && message.toString() || message.toValue && message.toValue() || "" + message;

                this.parent = parent;
                this.title = title;
                this.message = message;
                this.time = Date.now(); /*ms*/
                this.type = type;

                if (console && outputToConsole) { // (if the console object is supported, and the user allows it for this item, then send this log message to it now)
                    var time = TimeSpan.utcTimeToLocalTime(this.time), margin = "";
                    while (parent) { parent = parent.parent; margin += "  "; }
                    var consoleText = time.hours + ":" + (time.minutes < 10 ? "0" + time.minutes : "" + time.minutes) + ":" + (time.seconds < 10 ? "0" + time.seconds : "" + time.seconds)
                        + " " + margin + this.title + ": " + this.message;
                    CoreXT.log(consoleText, type, false, false);
                }
            }

            /** Write a message to the log without using a title and return the current log item instance. */
            write(message: string, type?: LogTypes, outputToConsole?: boolean): LogItem;
            /** Write a message to the log. */
            write(message: any, type?: LogTypes, outputToConsole?: boolean): LogItem;
            write(message: any, type: LogTypes = LogTypes.Normal, outputToConsole = true): LogItem {
                var logItem = new LogItem(this, null, message, type);
                if (!this.subItems)
                    this.subItems = [];
                this.subItems.push(logItem);
                return this;
            }

            /** Write a message to the log without using a title and return the new log item instance, which can be used to start a related sub-log. */
            log(title: string, message: string, type?: LogTypes, outputToConsole?: boolean): LogItem;
            /** Write a message to the log without using a title and return the new log item instance, which can be used to start a related sub-log. */
            log(title: any, message: any, type?: LogTypes, outputToConsole?: boolean): LogItem;
            log(title: any, message: any, type: LogTypes = LogTypes.Normal, outputToConsole = true): LogItem {
                var logItem = new LogItem(this, title, message, type, outputToConsole);
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
            beginCapture(): LogItem {
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
        }

        /** Starts a new log entry. */
        export function log(title: string, message: string, type?: LogTypes, outputToConsole?: boolean): LogItem;
        /** Starts a new log entry. */
        export function log(title: any, message: any, type?: LogTypes, outputToConsole?: boolean): LogItem;
        export function log(title: any, message: any, type: LogTypes = LogTypes.Normal, outputToConsole = true): LogItem {
            if (__logCaptureStack.length) {
                var capturedLogItem = __logCaptureStack[__logCaptureStack.length - 1];
                var lastLogEntry = capturedLogItem.subItems && capturedLogItem.subItems.length && capturedLogItem.subItems[capturedLogItem.subItems.length - 1];
                if (lastLogEntry)
                    return lastLogEntry.log(title, message, type, outputToConsole);
                else
                    return capturedLogItem.log(title, message, type, outputToConsole); //capturedLogItem.log("", "");
            }
            var logItem = new LogItem(null, title, message, type);
            __logItems.push(logItem);
            return logItem;
        }

        export function getLogAsHTML(): string {
            var i: number, n: number;
            var orderedLogItems: LogItem[] = [];
            var item: LogItem;
            var logHTML = "<div>\r\n", cssClass = "", title: string, icon: string,
                rowHTML: string, titleHTML: string, messageHTML: string, marginHTML: string = "";
            var logItem: LogItem, lookAheadLogItem: LogItem;
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
            function reorganizeEventsBySequence(logItems: LogItem[]) {
                var i: number, n: number;
                for (i = 0, n = logItems.length; i < n; ++i) {
                    logItem = logItems[i];
                    logItem.marginIndex = void 0;
                    orderedLogItems[logItem.sequence] = logItem;
                    if (logItem.subItems && logItem.subItems.length)
                        reorganizeEventsBySequence(logItem.subItems);
                }
            }
            function setMarginIndexes(logItem: LogItem, marginIndex: number = 0) {
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

    }

    // =======================================================================================================================
}

// ###########################################################################################################################
