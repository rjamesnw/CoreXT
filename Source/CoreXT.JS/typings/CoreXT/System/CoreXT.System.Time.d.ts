declare namespace CoreXT.System {
    const TimeSpan_base: {
        new (...args: any[]): {
            $__disposing?: boolean;
            $__disposed?: boolean;
        };
        $__type: IType<object>;
        readonly super: typeof Object;
        'new'?(...args: any[]): any;
        init?(o: object, isnew: boolean, ...args: any[]): void;
        $__register<TClass extends IType<object>, TFactory extends IFactory<IType<object>, NewDelegate<object>, InitDelegate<object>> & IType<object>>(this: TFactory & ITypeInfo & {
            $__type: TClass;
        }, namespace: object, addMemberTypeInfo?: boolean): TFactory;
    } & ObjectConstructor;
    /**
     * Represents a span of time (not a date). Calculation of dates usually relies on calendar rules.  A time-span object
     * doesn't care about months and day of the month - JavaScript already has a date object for that.
     * TimeSpan does, however, base the start of time on the epoch year of 1970 (same as the 'Date' object), and takes leap years into account.
     *
     * Note: TimeSpan exposes the results as properties for fast access (rather than getters/setters), but changing individual properties does not
     * cause the other values to update.  Use the supplied functions for manipulating the values.
     */
    class TimeSpan extends TimeSpan_base {
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
        /** Returns the time zone offset in milliseconds ({Date}.getTimezoneOffset() returns it in minutes). */
        static getTimeZoneOffset(): number;
        /** Creates a TimeSpan object from the current value returned by calling 'Date.now()', or 'new Date().getTime()' if 'now()' is not supported. */
        static now(): ITimeSpan;
        static utcTimeToLocalYear(timeInMs: number): number;
        static utcTimeToLocalDayOfYear(timeInMs: number): number;
        static utcTimeToLocalHours(timeInMs: number): number;
        static utcTimeToLocalMinutes(timeInMs: number): number;
        static utcTimeToLocalSeconds(timeInMs: number): number;
        static utcTimeToLocalMilliseconds(timeInMs: number): number;
        static utcTimeToLocalTime(timeInMs: number): ITimeSpan;
        /** Creates and returns a TimeSpan that represents the date object.
           * This relates to the 'date.getTime()' function, which returns the internal date span in milliseconds (from Epoch) with the time zone added.
           * See also: fromLocalDateAsUTC().
           */
        static fromDate(date: Date): ITimeSpan;
        /**
           * Creates and returns a TimeSpan that represents the date object's localized time as Coordinated Universal Time (UTC).
           * Note: This removes the time zone added to 'date.getTime()' to make a TimeSpan with localized values, but remember that values in a TimeSpan
           * instance always represent UTC time by default.
           * See also: fromDate().
           */
        static fromLocalDateAsUTC(date: Date): ITimeSpan;
        private static __parseSQLDateTime;
        /** Creates and returns a TimeSpan that represents the specified date string as the local time.
            * Note: The 'Date.parse()' function is used to parse the text, so any ISO-8601 formatted dates (YYYY-MM-DDTHH:mm:ss.sssZ) will be treated as UTC
            * based (no time zone applied). You can detect such cases using 'isISO8601()', or call 'parseLocal()' instead.
            * This function also supports the SQL standard Date/Time format (see 'isSQLDateTime()'), which is not supported in IE (yet).
            */
        static parse(dateString: string): ITimeSpan;
        /** Creates and returns a TimeSpan that represents the specified date string as Coordinated Universal Time (UTC). */
        static parseAsUTC(dateString: string): ITimeSpan;
        /** Returns true if the specified date is in the ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).
             * Since JavaScript 'Date' objects parse ISO strings as UTC based (not localized), this function help detect such cases.
             * Note: This returns true if the date string matches at least the first parts of the format (i.e. date, or date+time, or date+time+timezone).
             */
        static isISO8601(dateStr: string): boolean;
        /** Returns true if the specified date is in the standard SQL based Date/Time format (YYYY-MM-DD HH:mm:ss.sss+ZZ).
            * Note: This returns true if the date string matches at least the first parts of the format (i.e. date, or date+time).
            * @param (boolean) requireTimeMatch If true, the space delimiter and time part MUST exist for the match, otherwise the date portion is only
            * required.  It's important to note that the date part of the ISO 8601 format is the same as the standard SQL Date/Time, and browsers will
            * treat the date portion of the SQL date as an ISO 8601 date at UTC+0.
            */
        static isSQLDateTime(dateStr: string, requireTimeMatch?: boolean): boolean;
        /** Calculates the number of leap days since Epoch up to a given year (note: cannot be less than the Epoch year [1970]). */
        static daysSinceEpoch(year: number): number;
        /** Calculates the number of years from the specified milliseconds, taking leap years into account. */
        static yearsSinceEpoch(ms: number): number;
        static isLeapYear(year: number): boolean;
        static msFromTime(year?: number, dayOfYear?: number, hours?: number, minutes?: number, seconds?: number, milliseconds?: number): number;
        /** Returns the time zone as a string in the format "UTC[+/-]####".
            * @param {number} timezoneOffsetInMs The number of milliseconds to offset from local time to UTC time (eg. UTC-05:00 would be -(-5*60*60*1000), or 18000000).
            */
        static getTimeZoneSuffix(timezoneOffsetInMs?: number): string;
        /** Returns the ISO-8601 time zone as a string in the format "[+/-]hh:mm:ss.sssZ".
            * @param {number} timezoneOffsetInMs The number of milliseconds to offset from local time to UTC time (eg. UTC-05:00 would be -(-5*60*60*1000), or 18000000).
            */
        static getISOTimeZoneSuffix(timezoneOffsetInMs?: number): string;
    }
    namespace TimeSpan {
        const $__type_base: typeof Object.$__type;
        class $__type extends $__type_base {
            year: number;
            dayOfYear: number;
            hours: number;
            minutes: number;
            seconds: number;
            milliseconds: number;
            private __ms;
            private __date;
            private __localTS;
            /** Set the time of this TimeSpan, in milliseconds.
                * Note: This function assumes that milliseconds representing leap year days are included (same as the JavaScript 'Date' object).
                */
            setTime(timeInMs: number): ITimeSpan;
            /** Returns the internal millisecond total for this TimeSpan.
                * Note:
                */
            getTime(): number;
            add(timeInMS: number): ITimeSpan;
            add(yearOffset: number, dayOfYearOffset: number, hoursOffset?: number, minutesOffset?: number, secondsOffset?: number, msOffset?: number): ITimeSpan;
            subtract(timeInMS: number): ITimeSpan;
            subtract(yearOffset: number, dayOfYearOffset: number, hoursOffset?: number, minutesOffset?: number, secondsOffset?: number, msOffset?: number): ITimeSpan;
            /** Returns the time span as a string (note: this is NOT a date string).
                * To exclude milliseconds, set 'includeMilliseconds' false.
                * @param {boolean} includeTime If true (default), the time part is included, otherwise only the date part is returned.
                * @param {boolean} includeMilliseconds If true (default), the millisecond part is included, otherwise only the date and time parts are returned.
                * Note: This is ignored if 'includeTime' is false.
                * @param {boolean} includeTimezone If true (default), the time zone part is included.
                * Note: This is ignored if 'includeTime' is false.
                */
            toString(includeTime?: boolean, includeMilliseconds?: boolean, includeTimezone?: boolean): string;
            /** Returns the time span as a string (note: this is NOT a date string).
                * To exclude milliseconds, set 'includeMilliseconds' false.
                * @param {boolean} includeTime If true (default), the time part is included, otherwise only the date part is returned.
                * @param {boolean} includeMilliseconds If true (default), the millisecond part is included, otherwise only the date and time parts are returned.
                * Note: This is ignored if 'includeTime' is false.
                */
            toUTCString(includeTime?: boolean, includeMilliseconds?: boolean): string;
            /** Returns the time span as a local string in the standard international ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).
                * To exclude milliseconds, set 'includeMilliseconds' false.
                * @param {boolean} includeTime If true (default), the time part is included, otherwise only the date part is returned.
                * @param {boolean} includeMilliseconds If true (default), the millisecond part is included, otherwise only the date and time parts are returned.
                * Note: This is ignored if 'includeTime' is false.
                * @param {boolean} includeTimezone If true (default), the time zone part is included.
                * Note: This is ignored if 'includeTime' is false.
                */
            toISODateString(includeTime?: boolean, includeMilliseconds?: boolean, includeTimezone?: boolean): string;
            /** Returns the time span as a Coordinated Universal Time (UTC) string in the standard international ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).
                * To exclude milliseconds, set 'includeMilliseconds' false.
                * @param {boolean} includeTime If true (default), the time part is included, otherwise only the date part is returned.
                * @param {boolean} includeMilliseconds If true (default), the millisecond part is included, otherwise only the date and time parts are returned.
                * Note: This is ignored if 'includeTime' is false.
                * @param {boolean} includeTimezone If true (default), the time zone part is included.
                * Note: This is ignored if 'includeTime' is false.
                */
            toUTCISODateString(includeTime?: boolean, includeMilliseconds?: boolean, includeTimezone?: boolean): string;
            toValue(): number;
        }
    }
    interface ITimeSpan extends TimeSpan.$__type {
    }
}
