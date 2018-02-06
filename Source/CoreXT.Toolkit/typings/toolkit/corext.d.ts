declare var HoldOn: {
    open: (options: {
        message: string;
        theme?: string;
        content?: string;
        backgroundColor?: string;
        textColor?: string;
    }) => void;
    close: () => void;
};
declare module CoreXT {
    interface IDataClientOptions {
        [name: string]: any;
    }
    /**
     * Provides low level communication to the web server.
     */
    class DataClient {
        readonly url: string;
        readonly options: IDataClientOptions;
        /** If true (default) uses the included HoldOn.js to block the user while data is being sent. */
        static enableAutoUserBlockOnDataSend: boolean;
        data: string;
        /** Set a callback to be notified when a result is ready. */
        onready: {
            (d: DataClient, data: any): void;
        };
        /** Set a callback to be notified if an error occurs. If the callback handler returns false (anything else is ignored), the default error message will be triggered as normal. */
        onerror: {
            (d: DataClient): boolean | void;
        };
        /** Set a callback to be notified when the data is about to be sent. */
        onsending: {
            (d: DataClient): void;
        };
        /** Set a callback to be notified when the data is sent. */
        onsent: {
            (d: DataClient): void;
        };
        /** Set a callback to be notified when ANY type of response is received (success, error, or otherwise). */
        onresponse: {
            (d: DataClient): void;
        };
        constructor(url: string, options?: IDataClientOptions);
        /**
         * Send data as configured.
         * @param blockUI If true (default) the browser will be blocked during communication to prevent user input.
         * This is typically false for server pings or other background tasks that communicate with the server!
         */
        send(blockUI?: boolean): void;
    }
    class ActionDataClient extends DataClient {
        controllerName: string;
        actionName: string;
        constructor(controllerName: string, actionName: string, options?: IDataClientOptions, area?: string);
    }
    module Errors {
        function getErrors(): string;
        /**
         * Logs an error to display on the page.
         * @param sender A string that identifies the caller.
         * @param eventOrMessage An event object or message string.
         * @param source Source code file, if available.
         * @param sourceLineNumber Source code line number, if available.
         */
        function logError(sender: string, eventOrMessage: any, source?: string, sourceLineNumber?: number): void;
    }
}
declare function isPage(action: string, controller?: string): boolean;
