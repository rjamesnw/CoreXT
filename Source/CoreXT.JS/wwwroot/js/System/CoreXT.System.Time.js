// ###########################################################################################################################
// Types for time management.
// ###########################################################################################################################
var CoreXT;
(function (CoreXT) {
    var System;
    (function (System) {
        CoreXT.namespace(function () { return CoreXT.System; });
        // =======================================================================================================================
        /**
         * Represents a span of time (not a date). Calculation of dates usually relies on calendar rules.  A time-span object
         * doesn't care about months and day of the month - JavaScript already has a date object for that.
         * TimeSpan does, however, base the start of time on the epoch year of 1970 (same as the 'Date' object), and takes leap years into account.
         *
         * Note: TimeSpan exposes the results as properties for fast access (rather than getters/setters), but changing individual properties does not
         * cause the other values to update.  Use the supplied functions for manipulating the values.
         */
        var TimeSpan = /** @class */ (function (_super) {
            __extends(TimeSpan, _super);
            function TimeSpan() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
            /** Returns the time zone offset in milliseconds ({Date}.getTimezoneOffset() returns it in minutes). */
            TimeSpan.getTimeZoneOffset = function () { return CoreXT.Time.__localTimeZoneOffset; };
            /** Creates a TimeSpan object from the current value returned by calling 'Date.now()', or 'new Date().getTime()' if 'now()' is not supported. */
            TimeSpan.now = function () { return Date.now ? System.TimeSpan.new(Date.now()) : TimeSpan.fromDate(new Date()); };
            //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
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
            /** Creates and returns a TimeSpan that represents the date object.
               * This relates to the 'date.getTime()' function, which returns the internal date span in milliseconds (from Epoch) with the time zone added.
               * See also: fromLocalDateAsUTC().
               */
            TimeSpan.fromDate = function (date) {
                if (!date.valueOf || isNaN(date.valueOf()))
                    return null; // (date is invalid)
                return System.TimeSpan.new(date.getTime()); // (note: 'getTime()' returns the UTC time)
            };
            /**
               * Creates and returns a TimeSpan that represents the date object's localized time as Coordinated Universal Time (UTC).
               * Note: This removes the time zone added to 'date.getTime()' to make a TimeSpan with localized values, but remember that values in a TimeSpan
               * instance always represent UTC time by default.
               * See also: fromDate().
               */
            TimeSpan.fromLocalDateAsUTC = function (date) {
                if (!date.valueOf || isNaN(date.valueOf()))
                    return null; // (date is invalid)
                return TimeSpan.utcTimeToLocalTime(date.getTime()); // (note: 'getTime()' returns the UTC time)
            };
            TimeSpan.__parseSQLDateTime = function (dateString) {
                dateString = dateString.replace(' ', 'T'); // TODO: Make more compliant.
                var ms = Date.parse(dateString);
                ms += CoreXT.Time.__localTimeZoneOffset;
                return System.TimeSpan.new(ms); // (the parsed date will have the time zone added)
            };
            /** Creates and returns a TimeSpan that represents the specified date string as the local time.
                * Note: The 'Date.parse()' function is used to parse the text, so any ISO-8601 formatted dates (YYYY-MM-DDTHH:mm:ss.sssZ) will be treated as UTC
                * based (no time zone applied). You can detect such cases using 'isISO8601()', or call 'parseLocal()' instead.
                * This function also supports the SQL standard Date/Time format (see 'isSQLDateTime()'), which is not supported in IE (yet).
                */
            TimeSpan.parse = function (dateString) {
                if (TimeSpan.isSQLDateTime(dateString, true))
                    return TimeSpan.__parseSQLDateTime(dateString);
                var ms = Date.parse(dateString);
                if (isNaN(ms))
                    return null; // (date is invalid)
                return System.TimeSpan.new(ms); // (the parsed date will have the time zone added)
            };
            ///** Creates and returns a TimeSpan that represents the specified date string as the local time, regardless if an ISO based date is given or not.
            //* This function also supports the SQL standard Date/Time format (see 'isSQLDateTime()'), which is not supported in IE.
            //*/
            //??static parseLocal(dateString: string): TimeSpan {
            //    var ms = Date.parse(dateString);
            //    if (isNaN(ms)) return null; // (date is invalid)
            //    if (TimeSpan.isISO8601(dateString))
            //        ms += TimeSpan.__localTimeZoneOffset;
            //    return new TimeSpan(ms); // (the parsed date will have the time zone added)
            //}
            /** Creates and returns a TimeSpan that represents the specified date string as Coordinated Universal Time (UTC). */
            TimeSpan.parseAsUTC = function (dateString) {
                var ms = Date.parse(dateString);
                if (isNaN(ms))
                    return null; // (date is invalid)
                return TimeSpan.utcTimeToLocalTime(ms);
            };
            /** Returns true if the specified date is in the ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).
                 * Since JavaScript 'Date' objects parse ISO strings as UTC based (not localized), this function help detect such cases.
                 * Note: This returns true if the date string matches at least the first parts of the format (i.e. date, or date+time, or date+time+timezone).
                 */
            TimeSpan.isISO8601 = function (dateStr) {
                return CoreXT.Time.__ISO8601RegEx.test(dateStr);
            };
            /** Returns true if the specified date is in the standard SQL based Date/Time format (YYYY-MM-DD HH:mm:ss.sss+ZZ).
                * Note: This returns true if the date string matches at least the first parts of the format (i.e. date, or date+time).
                * @param (boolean) requireTimeMatch If true, the space delimiter and time part MUST exist for the match, otherwise the date portion is only
                * required.  It's important to note that the date part of the ISO 8601 format is the same as the standard SQL Date/Time, and browsers will
                * treat the date portion of the SQL date as an ISO 8601 date at UTC+0.
                */
            TimeSpan.isSQLDateTime = function (dateStr, requireTimeMatch) {
                if (requireTimeMatch === void 0) { requireTimeMatch = false; }
                return requireTimeMatch ?
                    CoreXT.Time.__SQLDateTimeStrictRegEx.test(dateStr)
                    : CoreXT.Time.__SQLDateTimeRegEx.test(dateStr);
            };
            /** Calculates the number of leap days since Epoch up to a given year (note: cannot be less than the Epoch year [1970]). */
            TimeSpan.daysSinceEpoch = function (year) {
                if (year < CoreXT.Time.__EpochYear)
                    throw System.Exception.from("Invalid year: Must be <= " + CoreXT.Time.__EpochYear);
                year = Math.floor(year - CoreXT.Time.__EpochYear); // (NOTE: 'year' is a DIFFERENCE after this, NOT the actual year)
                return 365 * year
                    + Math.floor((year + 1) / 4)
                    - Math.floor((year + 69) / 100)
                    + Math.floor((year + 369) / 400); // (+1, +69, and +369 because the year is delta from Epoch)
            };
            /** Calculates the number of years from the specified milliseconds, taking leap years into account. */
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
            //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
            /** Returns the time zone as a string in the format "UTC[+/-]####".
                * @param {number} timezoneOffsetInMs The number of milliseconds to offset from local time to UTC time (eg. UTC-05:00 would be -(-5*60*60*1000), or 18000000).
                */
            TimeSpan.getTimeZoneSuffix = function (timezoneOffsetInMs) {
                if (timezoneOffsetInMs === void 0) { timezoneOffsetInMs = CoreXT.Time.__localTimeZoneOffset; }
                var tzInHours = -(timezoneOffsetInMs / CoreXT.Time.__millisecondsPerHour);
                var hours = Math.abs(tzInHours);
                return "UTC" + (tzInHours >= 0 ? "+" : "-")
                    + System.String.pad(Math.floor(hours), 2, '0')
                    + System.String.pad(Math.floor(hours % 1 * CoreXT.Time.__minsPerHour), 2, '0');
            };
            /** Returns the ISO-8601 time zone as a string in the format "[+/-]hh:mm:ss.sssZ".
                * @param {number} timezoneOffsetInMs The number of milliseconds to offset from local time to UTC time (eg. UTC-05:00 would be -(-5*60*60*1000), or 18000000).
                */
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
                    + System.String.pad(Math.floor(seconds % 1 * 1000), 3, null, '0') // (1000th decimal precision)
                    + "Z";
            };
            return TimeSpan;
        }(CoreXT.FactoryBase(System.Object)));
        System.TimeSpan = TimeSpan;
        (function (TimeSpan) {
            var $__type = /** @class */ (function (_super) {
                __extends($__type, _super);
                function $__type() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
                /** Set the time of this TimeSpan, in milliseconds.
                    * Note: This function assumes that milliseconds representing leap year days are included (same as the JavaScript 'Date' object).
                    */
                $__type.prototype.setTime = function (timeInMs) {
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
                /** Returns the internal millisecond total for this TimeSpan.
                    * Note:
                    */
                $__type.prototype.getTime = function () { return this.__ms; };
                $__type.prototype.add = function (yearOrTimeInMS, dayOfYearOffset, hoursOffset, minutesOffset, secondsOffset, msOffset) {
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
                $__type.prototype.subtract = function (yearOrTimeInMS, dayOfYearOffset, hoursOffset, minutesOffset, secondsOffset, msOffset) {
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
                /** Returns the time span as a string (note: this is NOT a date string).
                    * To exclude milliseconds, set 'includeMilliseconds' false.
                    * @param {boolean} includeTime If true (default), the time part is included, otherwise only the date part is returned.
                    * @param {boolean} includeMilliseconds If true (default), the millisecond part is included, otherwise only the date and time parts are returned.
                    * Note: This is ignored if 'includeTime' is false.
                    * @param {boolean} includeTimezone If true (default), the time zone part is included.
                    * Note: This is ignored if 'includeTime' is false.
                    */
                $__type.prototype.toString = function (includeTime, includeMilliseconds, includeTimezone) {
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
                /** Returns the time span as a string (note: this is NOT a date string).
                    * To exclude milliseconds, set 'includeMilliseconds' false.
                    * @param {boolean} includeTime If true (default), the time part is included, otherwise only the date part is returned.
                    * @param {boolean} includeMilliseconds If true (default), the millisecond part is included, otherwise only the date and time parts are returned.
                    * Note: This is ignored if 'includeTime' is false.
                    */
                $__type.prototype.toUTCString = function (includeTime, includeMilliseconds) {
                    if (includeTime === void 0) { includeTime = true; }
                    if (includeMilliseconds === void 0) { includeMilliseconds = true; }
                    return "Year " + System.String.pad(this.year, 4, '0') + ", Day " + System.String.pad(this.dayOfYear, 3, '0')
                        + (includeTime ? " " + System.String.pad(this.hours, 2, '0') + ":" + System.String.pad(this.minutes, 2, '0') + ":" + System.String.pad(this.seconds, 2, '0')
                            + (includeMilliseconds && this.milliseconds ? ":" + this.milliseconds : "")
                            : "");
                };
                /** Returns the time span as a local string in the standard international ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).
                    * To exclude milliseconds, set 'includeMilliseconds' false.
                    * @param {boolean} includeTime If true (default), the time part is included, otherwise only the date part is returned.
                    * @param {boolean} includeMilliseconds If true (default), the millisecond part is included, otherwise only the date and time parts are returned.
                    * Note: This is ignored if 'includeTime' is false.
                    * @param {boolean} includeTimezone If true (default), the time zone part is included.
                    * Note: This is ignored if 'includeTime' is false.
                    */
                $__type.prototype.toISODateString = function (includeTime, includeMilliseconds, includeTimezone) {
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
                /** Returns the time span as a Coordinated Universal Time (UTC) string in the standard international ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).
                    * To exclude milliseconds, set 'includeMilliseconds' false.
                    * @param {boolean} includeTime If true (default), the time part is included, otherwise only the date part is returned.
                    * @param {boolean} includeMilliseconds If true (default), the millisecond part is included, otherwise only the date and time parts are returned.
                    * Note: This is ignored if 'includeTime' is false.
                    * @param {boolean} includeTimezone If true (default), the time zone part is included.
                    * Note: This is ignored if 'includeTime' is false.
                    */
                $__type.prototype.toUTCISODateString = function (includeTime, includeMilliseconds, includeTimezone) {
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
                $__type.prototype.toValue = function () {
                    return this.__ms;
                };
                //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
                $__type[CoreXT.constructor] = function (factory) {
                    factory.init = function (o, isnew, year, dayOfYear, hours, minutes, seconds, milliseconds) {
                        factory.super.init(o, isnew);
                        if (arguments.length <= 3)
                            o.setTime(year);
                        else
                            o.setTime(TimeSpan.msFromTime(year, dayOfYear, hours, minutes, seconds, milliseconds));
                    };
                };
                return $__type;
            }(CoreXT.FactoryType(System.Object)));
            TimeSpan.$__type = $__type;
            TimeSpan.$__register(System);
        })(TimeSpan = System.TimeSpan || (System.TimeSpan = {}));
        // =======================================================================================================================
    })(System = CoreXT.System || (CoreXT.System = {}));
})(CoreXT || (CoreXT = {}));
// ###########################################################################################################################
// Notes:
//   * https://stackoverflow.com/questions/20028945/calculation-of-leap-years-doesnt-seem-to-match-javascript-date
//# sourceMappingURL=CoreXT.System.Time.js.map