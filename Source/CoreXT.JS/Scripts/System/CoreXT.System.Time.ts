// ###########################################################################################################################
// Types for time management.
// ###########################################################################################################################

namespace CoreXT.System {
    namespace(() => CoreXT.System);
    // =======================================================================================================================

    /** 
     * Represents a span of time (not a date). Calculation of dates usually relies on calendar rules.  A time-span object
     * doesn't care about months and day of the month - JavaScript already has a date object for that.
     * TimeSpan does, however, base the start of time on the epoch year of 1970 (same as the 'Date' object), and takes leap years into account.
     * 
     * Note: TimeSpan exposes the results as properties for fast access (rather than getters/setters), but changing individual properties does not
     * cause the other values to update.  Use the supplied functions for manipulating the values.
     */
    export class TimeSpan extends FactoryBase(Object) {
        static 'new': {
            (timeInMS: number): ITimeSpan;
            (year: number, dayOfYear?: number, hours?: number, minutes?: number, seconds?: number, milliseconds?: number): ITimeSpan;
            (year?: number, dayOfYear?: number, hours?: number, minutes?: number, seconds?: number, milliseconds?: number): ITimeSpan;
        };

        static init: {
            (o: ITimeSpan, isnew: boolean, timeInMS: number): void;
            (o: ITimeSpan, isnew: boolean, year: number, dayOfYear?: number, hours?: number, minutes?: number, seconds?: number, milliseconds?: number): void;
            (o: ITimeSpan, isnew: boolean, year?: number, dayOfYear?: number, hours?: number, minutes?: number, seconds?: number, milliseconds?: number): void;
        };

        //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .

        /** Returns the time zone offset in milliseconds ({Date}.getTimezoneOffset() returns it in minutes). */
        static getTimeZoneOffset() { return Time.__localTimeZoneOffset; }

        /** Creates a TimeSpan object from the current value returned by calling 'Date.now()', or 'new Date().getTime()' if 'now()' is not supported. */
        static now(): ITimeSpan { return Date.now ? System.TimeSpan.new(Date.now()) : TimeSpan.fromDate(new Date()); }

        //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .

        static utcTimeToLocalYear(timeInMs: number): number {
            return Time.__EpochYear + Math.floor(((timeInMs || 0) - Time.__localTimeZoneOffset) / (Time.__actualDaysPerYear * Time.__millisecondsPerDay));
        }

        static utcTimeToLocalDayOfYear(timeInMs: number): number {
            timeInMs = (timeInMs || 0) - Time.__localTimeZoneOffset;
            var days = TimeSpan.daysSinceEpoch(Time.__EpochYear + Math.floor(timeInMs / (Time.__actualDaysPerYear * Time.__millisecondsPerDay)));
            var timeInMs = timeInMs - days * Time.__millisecondsPerDay;
            return 1 + Math.floor(timeInMs / Time.__millisecondsPerDay);
        }

        static utcTimeToLocalHours(timeInMs: number): number {
            return Math.floor(((timeInMs || 0) - Time.__localTimeZoneOffset) / Time.__millisecondsPerDay % 1 * Time.__hoursPerDay);
        }

        static utcTimeToLocalMinutes(timeInMs: number): number {
            return Math.floor(((timeInMs || 0) - Time.__localTimeZoneOffset) / Time.__millisecondsPerHour % 1 * Time.__minsPerHour);
        }

        static utcTimeToLocalSeconds(timeInMs: number): number {
            return Math.floor(((timeInMs || 0) - Time.__localTimeZoneOffset) / Time.__millisecondsPerMinute % 1 * Time.__secondsPerMinute);
        }

        static utcTimeToLocalMilliseconds(timeInMs: number): number {
            return Math.floor(((timeInMs || 0) - Time.__localTimeZoneOffset) / Time.__millisecondsPerSecond % 1 * Time.__millisecondsPerSecond);
        }

        static utcTimeToLocalTime(timeInMs: number): ITimeSpan {
            return System.TimeSpan.new((timeInMs || 0) - Time.__localTimeZoneOffset);
        }

        /** Creates and returns a TimeSpan that represents the date object.
           * This relates to the 'date.getTime()' function, which returns the internal date span in milliseconds (from Epoch) with the time zone added.
           * See also: fromLocalDateAsUTC().
           */
        static fromDate(date: Date): ITimeSpan {
            if (!date.valueOf || isNaN(date.valueOf())) return null; // (date is invalid)
            return System.TimeSpan.new(date.getTime()); // (note: 'getTime()' returns the UTC time)
        }

        /** 
           * Creates and returns a TimeSpan that represents the date object's localized time as Coordinated Universal Time (UTC).
           * Note: This removes the time zone added to 'date.getTime()' to make a TimeSpan with localized values, but remember that values in a TimeSpan
           * instance always represent UTC time by default.
           * See also: fromDate().
           */
        static fromLocalDateAsUTC(date: Date): ITimeSpan {
            if (!date.valueOf || isNaN(date.valueOf())) return null; // (date is invalid)
            return TimeSpan.utcTimeToLocalTime(date.getTime()); // (note: 'getTime()' returns the UTC time)
        }

        private static __parseSQLDateTime(dateString: string): ITimeSpan {
            dateString = dateString.replace(' ', 'T'); // TODO: Make more compliant.
            var ms = Date.parse(dateString);
            ms += Time.__localTimeZoneOffset;
            return System.TimeSpan.new(ms); // (the parsed date will have the time zone added)
        }

        /** Creates and returns a TimeSpan that represents the specified date string as the local time.
            * Note: The 'Date.parse()' function is used to parse the text, so any ISO-8601 formatted dates (YYYY-MM-DDTHH:mm:ss.sssZ) will be treated as UTC
            * based (no time zone applied). You can detect such cases using 'isISO8601()', or call 'parseLocal()' instead.
            * This function also supports the SQL standard Date/Time format (see 'isSQLDateTime()'), which is not supported in IE (yet).
            */
        static parse(dateString: string): ITimeSpan {
            if (TimeSpan.isSQLDateTime(dateString, true))
                return TimeSpan.__parseSQLDateTime(dateString);
            var ms = Date.parse(dateString);
            if (isNaN(ms)) return null; // (date is invalid)
            return System.TimeSpan.new(ms); // (the parsed date will have the time zone added)
        }

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
        static parseAsUTC(dateString: string): ITimeSpan {
            var ms = Date.parse(dateString);
            if (isNaN(ms)) return null; // (date is invalid)
            return TimeSpan.utcTimeToLocalTime(ms);
        }

        /** Returns true if the specified date is in the ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).
             * Since JavaScript 'Date' objects parse ISO strings as UTC based (not localized), this function help detect such cases.
             * Note: This returns true if the date string matches at least the first parts of the format (i.e. date, or date+time, or date+time+timezone).
             */
        static isISO8601(dateStr: string) {
            return Time.__ISO8601RegEx.test(dateStr);
        }

        /** Returns true if the specified date is in the standard SQL based Date/Time format (YYYY-MM-DD HH:mm:ss.sss+ZZ).
            * Note: This returns true if the date string matches at least the first parts of the format (i.e. date, or date+time).
            * @param (boolean) requireTimeMatch If true, the space delimiter and time part MUST exist for the match, otherwise the date portion is only
            * required.  It's important to note that the date part of the ISO 8601 format is the same as the standard SQL Date/Time, and browsers will
            * treat the date portion of the SQL date as an ISO 8601 date at UTC+0.
            */
        static isSQLDateTime(dateStr: string, requireTimeMatch: boolean = false) {
            return requireTimeMatch ?
                Time.__SQLDateTimeStrictRegEx.test(dateStr)
                : Time.__SQLDateTimeRegEx.test(dateStr);
        }

        /** Calculates the number of leap days since Epoch up to a given year (note: cannot be less than the Epoch year [1970]). */
        static daysSinceEpoch(year: number): number {
            if (year < Time.__EpochYear) throw Exception.from("Invalid year: Must be <= " + Time.__EpochYear);
            year = Math.floor(year - Time.__EpochYear); // (NOTE: 'year' is a DIFFERENCE after this, NOT the actual year)
            return 365 * year
                + Math.floor((year + 1) / 4)
                - Math.floor((year + 69) / 100)
                + Math.floor((year + 369) / 400); // (+1, +69, and +369 because the year is delta from Epoch)
        }

        /** Calculates the number of years from the specified milliseconds, taking leap years into account. */
        static yearsSinceEpoch(ms: number): number {
            var mpy = Time.__millisecondsPerYear, mpd = Time.__millisecondsPerDay;
            return Time.__EpochYear + Math.floor((ms - Math.floor((ms + mpy) / (4 * mpy)) * mpd
                - Math.floor((ms + 69 * mpy) / (100 * mpy)) * mpd
                + Math.floor((ms + 369 * mpy) / (400 * mpy)) * mpd) / mpy);
        }

        static isLeapYear(year: number): boolean {
            return (((year % 4 == 0) && (year % 100 != 0)) || year % 400 == 0);
        }

        static msFromTime(year: number = Time.__EpochYear, dayOfYear: number = 1, hours: number = 0, minutes: number = 0, seconds: number = 0, milliseconds: number = 0) {
            return TimeSpan.daysSinceEpoch(year) * Time.__millisecondsPerDay
                + (dayOfYear - 1) * Time.__millisecondsPerDay
                + hours * Time.__millisecondsPerHour
                + minutes * Time.__millisecondsPerMinute
                + seconds * Time.__millisecondsPerSecond
                + milliseconds;
        }

        //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .

        /** Returns the time zone as a string in the format "UTC[+/-]####".
            * @param {number} timezoneOffsetInMs The number of milliseconds to offset from local time to UTC time (eg. UTC-05:00 would be -(-5*60*60*1000), or 18000000).
            */
        static getTimeZoneSuffix(timezoneOffsetInMs: number = Time.__localTimeZoneOffset): string {
            var tzInHours = -(timezoneOffsetInMs / Time.__millisecondsPerHour);
            var hours = Math.abs(tzInHours);
            return "UTC" + (tzInHours >= 0 ? "+" : "-")
                + String.pad(Math.floor(hours), 2, '0')
                + String.pad(Math.floor(hours % 1 * Time.__minsPerHour), 2, '0');
        }

        /** Returns the ISO-8601 time zone as a string in the format "[+/-]hh:mm:ss.sssZ".
            * @param {number} timezoneOffsetInMs The number of milliseconds to offset from local time to UTC time (eg. UTC-05:00 would be -(-5*60*60*1000), or 18000000).
            */
        static getISOTimeZoneSuffix(timezoneOffsetInMs: number = Time.__localTimeZoneOffset): string {
            var tzInHours = -(timezoneOffsetInMs / Time.__millisecondsPerHour);
            var hours = Math.abs(tzInHours);
            var minutes = Math.abs(hours % 1 * Time.__minsPerHour);
            var seconds = minutes % 1 * Time.__secondsPerMinute;
            return (tzInHours >= 0 ? "+" : "-")
                + String.pad(hours, 2, '0') + ":"
                + String.pad(minutes, 2, '0') + ":"
                + String.pad(Math.floor(seconds), 2, '0') + "."
                + String.pad(Math.floor(seconds % 1 * 1000), 3, null, '0') // (1000th decimal precision)
                + "Z";
        }
    }
    export namespace TimeSpan {
        export class $__type extends FactoryType(Object) {

            //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .

            year: number;
            dayOfYear: number;
            hours: number;
            minutes: number;
            seconds: number;
            milliseconds: number;

            //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .

            private __ms: number;
            private __date: Date; // (this is only used if needed - such as when creating the date string; it caches the result for future reuse)
            private __localTS: ITimeSpan; // (this is only used if needed - such as when creating the local TimeSpan string; it caches the result for future reuse)

            //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .

            /** Set the time of this TimeSpan, in milliseconds.
                * Note: This function assumes that milliseconds representing leap year days are included (same as the JavaScript 'Date' object).
                */
            setTime(timeInMs: number): ITimeSpan {
                if (!isNaN(timeInMs)) {
                    var ms = this.__ms = timeInMs || 0;
                    this.__date = null;
                    var daysToYear = TimeSpan.daysSinceEpoch(this.year = TimeSpan.yearsSinceEpoch(ms));
                    var msRemaining = ms - daysToYear * Time.__millisecondsPerDay;
                    this.dayOfYear = 1 + Math.floor(msRemaining / Time.__millisecondsPerDay);
                    msRemaining -= (this.dayOfYear - 1) * Time.__millisecondsPerDay;
                    this.hours = Math.floor(msRemaining / Time.__millisecondsPerHour);
                    msRemaining -= this.hours * Time.__millisecondsPerHour;
                    this.minutes = Math.floor(msRemaining / Time.__millisecondsPerMinute);
                    msRemaining -= this.minutes * Time.__millisecondsPerMinute;
                    this.seconds = Math.floor(msRemaining / Time.__millisecondsPerSecond);
                    msRemaining -= this.seconds * Time.__millisecondsPerSecond;
                    this.milliseconds = msRemaining;
                }
                return this;
            }

            /** Returns the internal millisecond total for this TimeSpan.
                * Note: 
                */
            getTime(): number { return this.__ms; }

            //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .

            add(timeInMS: number): ITimeSpan;
            add(yearOffset: number, dayOfYearOffset: number, hoursOffset?: number, minutesOffset?: number, secondsOffset?: number, msOffset?: number): ITimeSpan;
            add(yearOrTimeInMS: number = 0, dayOfYearOffset: number = 0, hoursOffset: number = 0, minutesOffset: number = 0, secondsOffset: number = 0, msOffset: number = 0): ITimeSpan {
                if (arguments.length == 1)
                    this.setTime(this.__ms += (yearOrTimeInMS || 0));
                else
                    this.setTime(this.__ms += TimeSpan.msFromTime(Time.__EpochYear + yearOrTimeInMS, 1 + dayOfYearOffset, hoursOffset, minutesOffset, secondsOffset, msOffset));
                return this;
            }

            subtract(timeInMS: number): ITimeSpan;
            subtract(yearOffset: number, dayOfYearOffset: number, hoursOffset?: number, minutesOffset?: number, secondsOffset?: number, msOffset?: number): ITimeSpan;
            subtract(yearOrTimeInMS: number = 0, dayOfYearOffset: number = 0, hoursOffset: number = 0, minutesOffset: number = 0, secondsOffset: number = 0, msOffset: number = 0): ITimeSpan {
                if (arguments.length == 1)
                    this.setTime(this.__ms -= (yearOrTimeInMS || 0));
                else
                    this.setTime(this.__ms -= TimeSpan.msFromTime(Time.__EpochYear + yearOrTimeInMS, 1 + dayOfYearOffset, hoursOffset, minutesOffset, secondsOffset, msOffset));
                return this;
            }

            /** Returns the time span as a string (note: this is NOT a date string).
                * To exclude milliseconds, set 'includeMilliseconds' false.
                * @param {boolean} includeTime If true (default), the time part is included, otherwise only the date part is returned.
                * @param {boolean} includeMilliseconds If true (default), the millisecond part is included, otherwise only the date and time parts are returned.
                * Note: This is ignored if 'includeTime' is false.
                * @param {boolean} includeTimezone If true (default), the time zone part is included.
                * Note: This is ignored if 'includeTime' is false.
                */
            toString(includeTime: boolean = true, includeMilliseconds: boolean = true, includeTimezone: boolean = true): string {
                if (!this.__localTS)
                    this.__localTS = System.TimeSpan.new(this.toValue() - Time.__localTimeZoneOffset);
                var localTS = this.__localTS;
                return "Year " + String.pad(localTS.year, 4, '0') + ", Day " + String.pad(localTS.dayOfYear, 3, '0')
                    + (includeTime ? " " + String.pad(localTS.hours, 2, '0') + ":" + String.pad(localTS.minutes, 2, '0') + ":" + String.pad(localTS.seconds, 2, '0')
                        + (includeMilliseconds && localTS.milliseconds ? ":" + localTS.milliseconds : "")
                        + (includeTimezone ? " " + TimeSpan.getTimeZoneSuffix() : "")
                        : "");
            }

            /** Returns the time span as a string (note: this is NOT a date string).
                * To exclude milliseconds, set 'includeMilliseconds' false.
                * @param {boolean} includeTime If true (default), the time part is included, otherwise only the date part is returned.
                * @param {boolean} includeMilliseconds If true (default), the millisecond part is included, otherwise only the date and time parts are returned.
                * Note: This is ignored if 'includeTime' is false.
                */
            toUTCString(includeTime: boolean = true, includeMilliseconds: boolean = true): string {
                return "Year " + String.pad(this.year, 4, '0') + ", Day " + String.pad(this.dayOfYear, 3, '0')
                    + (includeTime ? " " + String.pad(this.hours, 2, '0') + ":" + String.pad(this.minutes, 2, '0') + ":" + String.pad(this.seconds, 2, '0')
                        + (includeMilliseconds && this.milliseconds ? ":" + this.milliseconds : "")
                        : "");
            }

            /** Returns the time span as a local string in the standard international ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).
                * To exclude milliseconds, set 'includeMilliseconds' false.
                * @param {boolean} includeTime If true (default), the time part is included, otherwise only the date part is returned.
                * @param {boolean} includeMilliseconds If true (default), the millisecond part is included, otherwise only the date and time parts are returned.
                * Note: This is ignored if 'includeTime' is false.
                * @param {boolean} includeTimezone If true (default), the time zone part is included.
                * Note: This is ignored if 'includeTime' is false.
                */
            toISODateString(includeTime: boolean = true, includeMilliseconds: boolean = true, includeTimezone: boolean = true): string {
                if (!this.__date)
                    this.__date = new Date(this.toValue());
                return String.pad(this.__date.getFullYear(), 4, '0') + "-" + String.pad(1 + this.__date.getMonth(), 2, '0') + "-" + String.pad(this.__date.getDate(), 2, '0')
                    + (includeTime ? "T" + String.pad(this.__date.getHours(), 2, '0') + ":" + String.pad(this.__date.getMinutes(), 2, '0') + ":" + String.pad(this.__date.getSeconds(), 2, '0')
                        + (includeMilliseconds && this.__date.getMilliseconds() ? "." + this.__date.getMilliseconds() : "")
                        + (includeTimezone ? TimeSpan.getISOTimeZoneSuffix() : "")
                        : "");
            }

            /** Returns the time span as a Coordinated Universal Time (UTC) string in the standard international ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).
                * To exclude milliseconds, set 'includeMilliseconds' false.
                * @param {boolean} includeTime If true (default), the time part is included, otherwise only the date part is returned.
                * @param {boolean} includeMilliseconds If true (default), the millisecond part is included, otherwise only the date and time parts are returned.
                * Note: This is ignored if 'includeTime' is false.
                * @param {boolean} includeTimezone If true (default), the time zone part is included.
                * Note: This is ignored if 'includeTime' is false.
                */
            toUTCISODateString(includeTime: boolean = true, includeMilliseconds: boolean = true, includeTimezone: boolean = true): string {
                if (!this.__date)
                    this.__date = new Date(this.toValue());
                return String.pad(this.year, 4, '0') + "-" + String.pad(1 + this.__date.getUTCMonth(), 2, '0') + "-" + String.pad(this.__date.getUTCDate(), 2, '0')
                    + (includeTime ? "T" + String.pad(this.hours, 2, '0') + ":" + String.pad(this.minutes, 2, '0') + ":" + String.pad(this.seconds, 2, '0')
                        + (includeMilliseconds && this.milliseconds ? "." + this.milliseconds : "")
                        + (includeTimezone ? TimeSpan.getISOTimeZoneSuffix(0) : "")
                        : "");
            }

            toValue(): number {
                return this.__ms;
            }

            //  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .

            private static [constructor](factory: typeof TimeSpan) {
                factory.init = function (o: ITimeSpan, isnew: boolean, year?: number, dayOfYear?: number, hours?: number, minutes?: number, seconds?: number, milliseconds?: number) {
                    factory.super.init(o, isnew);
                    if (arguments.length <= 3)
                        o.setTime(year);
                    else
                        o.setTime(TimeSpan.msFromTime(year, dayOfYear, hours, minutes, seconds, milliseconds));
                };
            }
        }

        TimeSpan.$__register(System);
    }

    export interface ITimeSpan extends TimeSpan.$__type { }

    // =======================================================================================================================
}

// ###########################################################################################################################
// Notes:
//   * https://stackoverflow.com/questions/20028945/calculation-of-leap-years-doesnt-seem-to-match-javascript-date

