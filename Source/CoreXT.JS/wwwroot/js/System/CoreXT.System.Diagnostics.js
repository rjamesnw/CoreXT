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
    var System;
    (function (System) {
        var Diagnostics;
        (function (Diagnostics) {
            CoreXT.registerNamespace("CoreXT", "System", "Diagnostics");
            Diagnostics.__logItems = [];
            var __logItemsSequenceCounter = 0;
            var __logCaptureStack = [];
            Diagnostics.LogItem = CoreXT.ClassFactory(Diagnostics, void 0, function (base) {
                var LogItem = (function () {
                    function LogItem() {
                        this.parent = null;
                        this.sequence = __logItemsSequenceCounter++;
                        this.marginIndex = void 0;
                    }
                    LogItem.prototype.write = function (message, type, outputToConsole) {
                        if (type === void 0) { type = CoreXT.LogTypes.Normal; }
                        if (outputToConsole === void 0) { outputToConsole = true; }
                        var logItem = Diagnostics.LogItem.new(this, null, message, type);
                        if (!this.subItems)
                            this.subItems = [];
                        this.subItems.push(logItem);
                        return this;
                    };
                    LogItem.prototype.log = function (title, message, type, outputToConsole) {
                        if (type === void 0) { type = CoreXT.LogTypes.Normal; }
                        if (outputToConsole === void 0) { outputToConsole = true; }
                        var logItem = Diagnostics.LogItem.new(this, title, message, type, outputToConsole);
                        if (!this.subItems)
                            this.subItems = [];
                        this.subItems.push(logItem);
                        return logItem;
                    };
                    LogItem.prototype.beginCapture = function () {
                        __logCaptureStack.push(this);
                        return this;
                    };
                    LogItem.prototype.endCapture = function () {
                        var item = __logCaptureStack.pop();
                        if (item != null)
                            throw System.Exception.from("Your calls to begin/end log capture do not match up. Make sure the calls to 'endCapture()' match up to your calls to 'beginCapture()'.", this);
                    };
                    LogItem.prototype.toString = function () {
                        var time = System.TimeSpan && System.TimeSpan.utcTimeToLocalTime(this.time) || null;
                        var timeStr = time && (time.hours + ":" + (time.minutes < 10 ? "0" + time.minutes : "" + time.minutes) + ":" + (time.seconds < 10 ? "0" + time.seconds : "" + time.seconds)) || "" + new Date(this.time).toLocaleTimeString();
                        var txt = "[" + this.sequence + "] (" + timeStr + ") " + this.title + ": " + this.message;
                        return txt;
                    };
                    LogItem['LogItemFactory'] = (function (_super) {
                        __extends(Factory, _super);
                        function Factory() {
                            return _super !== null && _super.apply(this, arguments) || this;
                        }
                        Factory['new'] = function (parent, title, message, type, outputToConsole) {
                            if (type === void 0) { type = CoreXT.LogTypes.Normal; }
                            if (outputToConsole === void 0) { outputToConsole = true; }
                            return null;
                        };
                        Factory.init = function (o, isnew, parent, title, message, type, outputToConsole) {
                            if (type === void 0) { type = CoreXT.LogTypes.Normal; }
                            if (outputToConsole === void 0) { outputToConsole = true; }
                            if (title === void 0 || title === null) {
                                if (CoreXT.isEmpty(message))
                                    CoreXT.error("LogItem()", "A message is required if no title is given.", o);
                                title = "";
                            }
                            else if (typeof title != 'string')
                                if (title.$__fullname)
                                    title = title.$__fullname;
                                else
                                    title = title.toString && title.toString() || title.toValue && title.toValue() || "" + title;
                            if (message === void 0 || message === null)
                                message = "";
                            else
                                message = message.toString && message.toString() || message.toValue && message.toValue() || "" + message;
                            o.parent = parent;
                            o.title = title;
                            o.message = message;
                            o.time = Date.now();
                            o.type = type;
                            if (console && outputToConsole) {
                                var _title = title, margin = "";
                                if (_title.charAt(title.length - 1) != ":")
                                    _title += ": ";
                                else
                                    _title += " ";
                                while (parent) {
                                    parent = parent.parent;
                                    margin += "  ";
                                }
                                if (System.TimeSpan) {
                                    var time = System.TimeSpan.utcTimeToLocalTime(o.time);
                                    var consoleText = time.hours + ":" + (time.minutes < 10 ? "0" + time.minutes : "" + time.minutes) + ":" + (time.seconds < 10 ? "0" + time.seconds : "" + time.seconds)
                                        + " " + margin + _title + o.message;
                                }
                                else
                                    consoleText = (new Date()).toLocaleTimeString() + " " + margin + _title + o.message;
                                CoreXT.log(null, consoleText, type, void 0, false, false);
                            }
                        };
                        return Factory;
                    }(CoreXT.FactoryBase(LogItem, null)));
                    return LogItem;
                }());
                return [LogItem, LogItem["LogItemFactory"]];
            });
            function log(title, message, type, outputToConsole) {
                if (type === void 0) { type = CoreXT.LogTypes.Normal; }
                if (outputToConsole === void 0) { outputToConsole = true; }
                if (__logCaptureStack.length) {
                    var capturedLogItem = __logCaptureStack[__logCaptureStack.length - 1];
                    var lastLogEntry = capturedLogItem.subItems && capturedLogItem.subItems.length && capturedLogItem.subItems[capturedLogItem.subItems.length - 1];
                    if (lastLogEntry)
                        return lastLogEntry.log(title, message, type, outputToConsole);
                    else
                        return capturedLogItem.log(title, message, type, outputToConsole);
                }
                var logItem = Diagnostics.LogItem.new(null, title, message, type, outputToConsole);
                Diagnostics.__logItems.push(logItem);
                return logItem;
            }
            Diagnostics.log = log;
            function getLogAsHTML() {
                var i, n;
                var orderedLogItems = [];
                var item;
                var logHTML = "<div>\r\n", cssClass = "", title, icon, rowHTML, titleHTML, messageHTML, marginHTML = "";
                var logItem, lookAheadLogItem;
                var time;
                var cssAndIcon;
                var margins = [""];
                var currentMarginIndex = 0;
                function cssAndIconFromLogType_text(type) {
                    var cssClass, icon;
                    switch (type) {
                        case CoreXT.LogTypes.Success:
                            cssClass = "text-success";
                            icon = "&#x221A;";
                            break;
                        case CoreXT.LogTypes.Info:
                            cssClass = "text-info";
                            icon = "&#x263C;";
                            break;
                        case CoreXT.LogTypes.Warning:
                            cssClass = "text-warning";
                            icon = "&#x25B2;";
                            break;
                        case CoreXT.LogTypes.Error:
                            cssClass = "text-danger";
                            icon = "<b>(!)</b>";
                            break;
                        default:
                            cssClass = "";
                            icon = "";
                    }
                    return { cssClass: cssClass, icon: icon };
                }
                function reorganizeEventsBySequence(logItems) {
                    var i, n;
                    for (i = 0, n = logItems.length; i < n; ++i) {
                        logItem = logItems[i];
                        logItem.marginIndex = void 0;
                        orderedLogItems[logItem.sequence] = logItem;
                        if (logItem.subItems && logItem.subItems.length)
                            reorganizeEventsBySequence(logItem.subItems);
                    }
                }
                function setMarginIndexes(logItem, marginIndex) {
                    if (marginIndex === void 0) { marginIndex = 0; }
                    var i, n;
                    if (marginIndex && !margins[marginIndex])
                        margins[marginIndex] = margins[marginIndex - 1] + "&nbsp;&nbsp;&nbsp;&nbsp;";
                    logItem.marginIndex = marginIndex;
                    if (logItem.subItems && logItem.subItems.length) {
                        for (i = 0, n = logItem.subItems.length; i < n; ++i)
                            setMarginIndexes(logItem.subItems[i], marginIndex + 1);
                    }
                }
                reorganizeEventsBySequence(Diagnostics.__logItems);
                for (i = 0, n = orderedLogItems.length; i < n; ++i) {
                    logItem = orderedLogItems[i];
                    if (!logItem)
                        continue;
                    rowHTML = "";
                    if (logItem.marginIndex === void 0)
                        setMarginIndexes(logItem);
                    marginHTML = margins[logItem.marginIndex];
                    cssAndIcon = cssAndIconFromLogType_text(logItem.type);
                    if (cssAndIcon.icon)
                        cssAndIcon.icon += "&nbsp;";
                    if (cssAndIcon.cssClass)
                        messageHTML = cssAndIcon.icon + "<strong>" + System.String.replace(logItem.message, "\r\n", "<br />\r\n") + "</strong>";
                    else
                        messageHTML = cssAndIcon.icon + logItem.message;
                    if (logItem.title)
                        titleHTML = logItem.title + ": ";
                    else
                        titleHTML = "";
                    time = System.TimeSpan.utcTimeToLocalTime(logItem.time);
                    rowHTML = "<div class='" + cssAndIcon.cssClass + "'>"
                        + time.hours + ":" + (time.minutes < 10 ? "0" + time.minutes : "" + time.minutes) + ":" + (time.seconds < 10 ? "0" + time.seconds : "" + time.seconds) + "&nbsp;"
                        + marginHTML + titleHTML + messageHTML + "</div>" + rowHTML + "\r\n";
                    logHTML += rowHTML + "</ br>\r\n";
                }
                logHTML += "</div>\r\n";
                return logHTML;
            }
            Diagnostics.getLogAsHTML = getLogAsHTML;
            function getLogAsText() {
                return System.String.replaceTags(System.String.replace(getLogAsHTML(), "&nbsp;", " "));
            }
            Diagnostics.getLogAsText = getLogAsText;
        })(Diagnostics = System.Diagnostics || (System.Diagnostics = {}));
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
if (typeof window !== 'undefined') {
    window.onerror = function (eventOrMessage, source, fileno) {
        CoreXT.System.Diagnostics.log("window.onerror", eventOrMessage + " in '" + source + "' on line " + fileno + ".", CoreXT.LogTypes.Error);
        document.body.style.display = "";
        if (typeof eventOrMessage !== 'string')
            eventOrMessage = "" + eventOrMessage;
        var msgElement = document.createElement("div");
        msgElement.innerHTML = "<button type='button' class='close' data-dismiss='alert'>&times;</button><strong>"
            + eventOrMessage.replace(/\r\n/g, "<br/>\r\n") + "<br/>\r\nError source: '" + source + "' on line " + fileno + "<br/>\r\n</strong>\r\n";
        msgElement.className = "alert alert-danger";
        document.body.appendChild(msgElement);
    };
    document.onkeypress = document.onkeydown = function (e) {
        var keyCode;
        var evt = e ? e : window.event;
        if (evt.type == "keydown") {
            keyCode = evt.keyCode;
        }
        else {
            keyCode = evt.charCode ? evt.charCode : evt.keyCode;
        }
        if (keyCode == 192 && evt.ctrlKey && CoreXT.debugMode) {
            var body = document.getElementById("main");
            if (body)
                body.style.display = "";
            var headerDiv = document.createElement("h1");
            headerDiv.innerHTML = "<h1><a name='__dslog__' id='__dslog__'>CoreXT Log:</a></h1>\r\n";
            var div = document.createElement("div");
            div.innerHTML = CoreXT.System.Diagnostics.getLogAsHTML();
            document.body.appendChild(headerDiv);
            document.body.appendChild(div);
            headerDiv.onclick = function () { alert("CoreXT Log: \r\n" + CoreXT.System.Diagnostics.getLogAsText()); };
            location.hash = "#__dslog__";
        }
    };
}
//# sourceMappingURL=CoreXT.System.Diagnostics.js.map