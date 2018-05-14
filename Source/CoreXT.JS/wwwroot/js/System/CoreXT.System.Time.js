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
        CoreXT.registerNamespace("CoreXT", "System");
        System.TimeSpan = CoreXT.ClassFactory(System, System.Object, function (base) {
            var TimeSpan = (function (_super) {
                __extends(TimeSpan, _super);
                function TimeSpan() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                TimeSpan.getTimeZoneOffset = function () { return CoreXT.Time.__localTimeZoneOffset; };
                TimeSpan.prototype.setTime = function (timeInMs) {
                    if (!isNaN(timeInMs)) {
                        var ms = this.__ms = timeInMs || 0;
                        this.__date = null;
                        var daysToYear = TimeSpan.daysSinceEpoch(this.year = TimeSpan.yearsSinceEpoch(ms));
                        var msRemaining = ms - daysToYear * CoreXT.Time.__millisecondsPerDay;
                        this.dayOfYear = 1 + Math.floor(msRemaining / CoreXT.Time.__millisecondsPerDay);
                        msRemaining -= (this.dayOfYear - 1) * CoreXT.Time.__millisecondsPerDay;
                        this.hours = Math.floor(msRemaining / CoreXT.Time.__millisecondsPerHour);
                        msRemaining -= this.hours * CoreXT.Time.__millisecondsPerHour;
                        this.minutes = Math.floor(msRemaining / CoreXT.Time.__millisecondsPerMinute);
                        msRemaining -= this.minutes * CoreXT.Time.__millisecondsPerMinute;
                        this.seconds = Math.floor(msRemaining / CoreXT.Time.__millisecondsPerSecond);
                        msRemaining -= this.seconds * CoreXT.Time.__millisecondsPerSecond;
                        this.milliseconds = msRemaining;
                    }
                    return this;
                };
                TimeSpan.prototype.getTime = function () { return this.__ms; };
                TimeSpan.now = function () { return Date.now ? System.TimeSpan.new(Date.now()) : TimeSpan.fromDate(new Date()); };
                TimeSpan.prototype.add = function (yearOrTimeInMS, dayOfYearOffset, hoursOffset, minutesOffset, secondsOffset, msOffset) {
                    if (yearOrTimeInMS === void 0) { yearOrTimeInMS = 0; }
                    if (dayOfYearOffset === void 0) { dayOfYearOffset = 0; }
                    if (hoursOffset === void 0) { hoursOffset = 0; }
                    if (minutesOffset === void 0) { minutesOffset = 0; }
                    if (secondsOffset === void 0) { secondsOffset = 0; }
                    if (msOffset === void 0) { msOffset = 0; }
                    if (arguments.length == 1)
                        this.setTime(this.__ms += (yearOrTimeInMS || 0));
                    else
                        this.setTime(this.__ms += TimeSpan.msFromTime(CoreXT.Time.__EpochYear + yearOrTimeInMS, 1 + dayOfYearOffset, hoursOffset, minutesOffset, secondsOffset, msOffset));
                    return this;
                };
                TimeSpan.prototype.subtract = function (yearOrTimeInMS, dayOfYearOffset, hoursOffset, minutesOffset, secondsOffset, msOffset) {
                    if (yearOrTimeInMS === void 0) { yearOrTimeInMS = 0; }
                    if (dayOfYearOffset === void 0) { dayOfYearOffset = 0; }
                    if (hoursOffset === void 0) { hoursOffset = 0; }
                    if (minutesOffset === void 0) { minutesOffset = 0; }
                    if (secondsOffset === void 0) { secondsOffset = 0; }
                    if (msOffset === void 0) { msOffset = 0; }
                    if (arguments.length == 1)
                        this.setTime(this.__ms -= (yearOrTimeInMS || 0));
                    else
                        this.setTime(this.__ms -= TimeSpan.msFromTime(CoreXT.Time.__EpochYear + yearOrTimeInMS, 1 + dayOfYearOffset, hoursOffset, minutesOffset, secondsOffset, msOffset));
                    return this;
                };
                TimeSpan.utcTimeToLocalYear = function (timeInMs) {
                    return CoreXT.Time.__EpochYear + Math.floor(((timeInMs || 0) - CoreXT.Time.__localTimeZoneOffset) / (CoreXT.Time.__actualDaysPerYear * CoreXT.Time.__millisecondsPerDay));
                };
                TimeSpan.utcTimeToLocalDayOfYear = function (timeInMs) {
                    timeInMs = (timeInMs || 0) - CoreXT.Time.__localTimeZoneOffset;
                    var days = TimeSpan.daysSinceEpoch(CoreXT.Time.__EpochYear + Math.floor(timeInMs / (CoreXT.Time.__actualDaysPerYear * CoreXT.Time.__millisecondsPerDay)));
                    var timeInMs = timeInMs - days * CoreXT.Time.__millisecondsPerDay;
                    return 1 + Math.floor(timeInMs / CoreXT.Time.__millisecondsPerDay);
                };
                TimeSpan.utcTimeToLocalHours = function (timeInMs) {
                    return Math.floor(((timeInMs || 0) - CoreXT.Time.__localTimeZoneOffset) / CoreXT.Time.__millisecondsPerDay % 1 * CoreXT.Time.__hoursPerDay);
                };
                TimeSpan.utcTimeToLocalMinutes = function (timeInMs) {
                    return Math.floor(((timeInMs || 0) - CoreXT.Time.__localTimeZoneOffset) / CoreXT.Time.__millisecondsPerHour % 1 * CoreXT.Time.__minsPerHour);
                };
                TimeSpan.utcTimeToLocalSeconds = function (timeInMs) {
                    return Math.floor(((timeInMs || 0) - CoreXT.Time.__localTimeZoneOffset) / CoreXT.Time.__millisecondsPerMinute % 1 * CoreXT.Time.__secondsPerMinute);
                };
                TimeSpan.utcTimeToLocalMilliseconds = function (timeInMs) {
                    return Math.floor(((timeInMs || 0) - CoreXT.Time.__localTimeZoneOffset) / CoreXT.Time.__millisecondsPerSecond % 1 * CoreXT.Time.__millisecondsPerSecond);
                };
                TimeSpan.utcTimeToLocalTime = function (timeInMs) {
                    return System.TimeSpan.new((timeInMs || 0) - CoreXT.Time.__localTimeZoneOffset);
                };
                TimeSpan.fromDate = function (date) {
                    if (!date.valueOf || isNaN(date.valueOf()))
                        return null;
                    return System.TimeSpan.new(date.getTime());
                };
                TimeSpan.fromLocalDateAsUTC = function (date) {
                    if (!date.valueOf || isNaN(date.valueOf()))
                        return null;
                    return TimeSpan.utcTimeToLocalTime(date.getTime());
                };
                TimeSpan.__parseSQLDateTime = function (dateString) {
                    dateString = dateString.replace(' ', 'T');
                    var ms = Date.parse(dateString);
                    ms += CoreXT.Time.__localTimeZoneOffset;
                    return System.TimeSpan.new(ms);
                };
                TimeSpan.parse = function (dateString) {
                    if (TimeSpan.isSQLDateTime(dateString, true))
                        return TimeSpan.__parseSQLDateTime(dateString);
                    var ms = Date.parse(dateString);
                    if (isNaN(ms))
                        return null;
                    return System.TimeSpan.new(ms);
                };
                TimeSpan.parseAsUTC = function (dateString) {
                    var ms = Date.parse(dateString);
                    if (isNaN(ms))
                        return null;
                    return TimeSpan.utcTimeToLocalTime(ms);
                };
                TimeSpan.isISO8601 = function (dateStr) {
                    return CoreXT.Time.__ISO8601RegEx.test(dateStr);
                };
                TimeSpan.isSQLDateTime = function (dateStr, requireTimeMatch) {
                    if (requireTimeMatch === void 0) { requireTimeMatch = false; }
                    return requireTimeMatch ?
                        CoreXT.Time.__SQLDateTimeStrictRegEx.test(dateStr)
                        : CoreXT.Time.__SQLDateTimeRegEx.test(dateStr);
                };
                TimeSpan.daysSinceEpoch = function (year) {
                    if (year < CoreXT.Time.__EpochYear)
                        throw System.Exception.from("Invalid year: Must be <= " + CoreXT.Time.__EpochYear);
                    year = Math.floor(year - CoreXT.Time.__EpochYear);
                    return 365 * year
                        + Math.floor((year + 1) / 4)
                        - Math.floor((year + 69) / 100)
                        + Math.floor((year + 369) / 400);
                };
                TimeSpan.yearsSinceEpoch = function (ms) {
                    var mpy = CoreXT.Time.__millisecondsPerYear, mpd = CoreXT.Time.__millisecondsPerDay;
                    return CoreXT.Time.__EpochYear + Math.floor((ms - Math.floor((ms + mpy) / (4 * mpy)) * mpd
                        - Math.floor((ms + 69 * mpy) / (100 * mpy)) * mpd
                        + Math.floor((ms + 369 * mpy) / (400 * mpy)) * mpd) / mpy);
                };
                TimeSpan.isLeapYear = function (year) {
                    return (((year % 4 == 0) && (year % 100 != 0)) || year % 400 == 0);
                };
                TimeSpan.msFromTime = function (year, dayOfYear, hours, minutes, seconds, milliseconds) {
                    if (year === void 0) { year = CoreXT.Time.__EpochYear; }
                    if (dayOfYear === void 0) { dayOfYear = 1; }
                    if (hours === void 0) { hours = 0; }
                    if (minutes === void 0) { minutes = 0; }
                    if (seconds === void 0) { seconds = 0; }
                    if (milliseconds === void 0) { milliseconds = 0; }
                    return TimeSpan.daysSinceEpoch(year) * CoreXT.Time.__millisecondsPerDay
                        + (dayOfYear - 1) * CoreXT.Time.__millisecondsPerDay
                        + hours * CoreXT.Time.__millisecondsPerHour
                        + minutes * CoreXT.Time.__millisecondsPerMinute
                        + seconds * CoreXT.Time.__millisecondsPerSecond
                        + milliseconds;
                };
                TimeSpan.getTimeZoneSuffix = function (timezoneOffsetInMs) {
                    if (timezoneOffsetInMs === void 0) { timezoneOffsetInMs = CoreXT.Time.__localTimeZoneOffset; }
                    var tzInHours = -(timezoneOffsetInMs / CoreXT.Time.__millisecondsPerHour);
                    var hours = Math.abs(tzInHours);
                    return "UTC" + (tzInHours >= 0 ? "+" : "-")
                        + System.String.pad(Math.floor(hours), 2, '0')
                        + System.String.pad(Math.floor(hours % 1 * CoreXT.Time.__minsPerHour), 2, '0');
                };
                TimeSpan.getISOTimeZoneSuffix = function (timezoneOffsetInMs) {
                    if (timezoneOffsetInMs === void 0) { timezoneOffsetInMs = CoreXT.Time.__localTimeZoneOffset; }
                    var tzInHours = -(timezoneOffsetInMs / CoreXT.Time.__millisecondsPerHour);
                    var hours = Math.abs(tzInHours);
                    var minutes = Math.abs(hours % 1 * CoreXT.Time.__minsPerHour);
                    var seconds = minutes % 1 * CoreXT.Time.__secondsPerMinute;
                    return (tzInHours >= 0 ? "+" : "-")
                        + System.String.pad(hours, 2, '0') + ":"
                        + System.String.pad(minutes, 2, '0') + ":"
                        + System.String.pad(Math.floor(seconds), 2, '0') + "."
                        + System.String.pad(Math.floor(seconds % 1 * 1000), 3, null, '0')
                        + "Z";
                };
                TimeSpan.prototype.toString = function (includeTime, includeMilliseconds, includeTimezone) {
                    if (includeTime === void 0) { includeTime = true; }
                    if (includeMilliseconds === void 0) { includeMilliseconds = true; }
                    if (includeTimezone === void 0) { includeTimezone = true; }
                    if (!this.__localTS)
                        this.__localTS = System.TimeSpan.new(this.toValue() - CoreXT.Time.__localTimeZoneOffset);
                    var localTS = this.__localTS;
                    return "Year " + System.String.pad(localTS.year, 4, '0') + ", Day " + System.String.pad(localTS.dayOfYear, 3, '0')
                        + (includeTime ? " " + System.String.pad(localTS.hours, 2, '0') + ":" + System.String.pad(localTS.minutes, 2, '0') + ":" + System.String.pad(localTS.seconds, 2, '0')
                            + (includeMilliseconds && localTS.milliseconds ? ":" + localTS.milliseconds : "")
                            + (includeTimezone ? " " + TimeSpan.getTimeZoneSuffix() : "")
                            : "");
                };
                TimeSpan.prototype.toUTCString = function (includeTime, includeMilliseconds) {
                    if (includeTime === void 0) { includeTime = true; }
                    if (includeMilliseconds === void 0) { includeMilliseconds = true; }
                    return "Year " + System.String.pad(this.year, 4, '0') + ", Day " + System.String.pad(this.dayOfYear, 3, '0')
                        + (includeTime ? " " + System.String.pad(this.hours, 2, '0') + ":" + System.String.pad(this.minutes, 2, '0') + ":" + System.String.pad(this.seconds, 2, '0')
                            + (includeMilliseconds && this.milliseconds ? ":" + this.milliseconds : "")
                            : "");
                };
                TimeSpan.prototype.toISODateString = function (includeTime, includeMilliseconds, includeTimezone) {
                    if (includeTime === void 0) { includeTime = true; }
                    if (includeMilliseconds === void 0) { includeMilliseconds = true; }
                    if (includeTimezone === void 0) { includeTimezone = true; }
                    if (!this.__date)
                        this.__date = new Date(this.toValue());
                    return System.String.pad(this.__date.getFullYear(), 4, '0') + "-" + System.String.pad(1 + this.__date.getMonth(), 2, '0') + "-" + System.String.pad(this.__date.getDate(), 2, '0')
                        + (includeTime ? "T" + System.String.pad(this.__date.getHours(), 2, '0') + ":" + System.String.pad(this.__date.getMinutes(), 2, '0') + ":" + System.String.pad(this.__date.getSeconds(), 2, '0')
                            + (includeMilliseconds && this.__date.getMilliseconds() ? "." + this.__date.getMilliseconds() : "")
                            + (includeTimezone ? TimeSpan.getISOTimeZoneSuffix() : "")
                            : "");
                };
                TimeSpan.prototype.toUTCISODateString = function (includeTime, includeMilliseconds, includeTimezone) {
                    if (includeTime === void 0) { includeTime = true; }
                    if (includeMilliseconds === void 0) { includeMilliseconds = true; }
                    if (includeTimezone === void 0) { includeTimezone = true; }
                    if (!this.__date)
                        this.__date = new Date(this.toValue());
                    return System.String.pad(this.year, 4, '0') + "-" + System.String.pad(1 + this.__date.getUTCMonth(), 2, '0') + "-" + System.String.pad(this.__date.getUTCDate(), 2, '0')
                        + (includeTime ? "T" + System.String.pad(this.hours, 2, '0') + ":" + System.String.pad(this.minutes, 2, '0') + ":" + System.String.pad(this.seconds, 2, '0')
                            + (includeMilliseconds && this.milliseconds ? "." + this.milliseconds : "")
                            + (includeTimezone ? TimeSpan.getISOTimeZoneSuffix(0) : "")
                            : "");
                };
                TimeSpan.prototype.toValue = function () {
                    return this.__ms;
                };
                TimeSpan['TimeSpanFactory'] = (function (_super) {
                    __extends(Factory, _super);
                    function Factory() {
                        return _super !== null && _super.apply(this, arguments) || this;
                    }
                    Factory['new'] = function (year, dayOfYear, hours, minutes, seconds, milliseconds) { return null; };
                    Factory.init = function (o, isnew, year, dayOfYear, hours, minutes, seconds, milliseconds) {
                        this.super.init(o, isnew);
                        if (arguments.length <= 3)
                            o.setTime(year);
                        else
                            o.setTime(TimeSpan.msFromTime(year, dayOfYear, hours, minutes, seconds, milliseconds));
                    };
                    return Factory;
                }(CoreXT.FactoryBase(TimeSpan, base['ObjectFactory'])));
                return TimeSpan;
            }(base));
            return [TimeSpan, TimeSpan["TimeSpanFactory"]];
        }, "TimeSpan");
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
//# sourceMappingURL=CoreXT.System.Time.js.map