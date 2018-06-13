// ###########################################################################################################################
// Application Windows
// ###########################################################################################################################

namespace CoreXT.System {
    export namespace IO {
        // =======================================================================================================================

        /** This even is triggered when the user should wait for an action to complete. */
        export var onBeginWait = Events.EventDispatcher.new<typeof IO, { (msg: string): void }>(IO, "onBeginWait", true);

        /** This even is triggered when the user no longer needs to wait for an action to complete. */
        export var onEndWait = Events.EventDispatcher.new<typeof IO, { (): void }>(IO, "onEndWait", true);

        var __waitRequestCounter = 0; // (allows stacking calls to 'wait()')

        /**
         * Blocks user input until 'closeWait()' is called. Plugins can hook into 'onBeginWait' to receive notifications.
         * Note: Each call stacks, but the 'onBeginWait' event is triggered only once.
         * @param msg An optional message to display (default is 'Please wait...').
         */
        export function wait(msg = "Please wait ...") {
            if (__waitRequestCounter == 0) // (fire only one time)
                onBeginWait.dispatch(msg);
            __waitRequestCounter++;
        }

        /**
         * Unblocks user input if 'wait()' was previously called. The number of 'closeWait()' calls must match the number of wait calls in order to unblock the user.
         * Plugins can hook into the 'onEndWait' event to be notified.
         * @param force If true, then the number of calls to 'wait' is ignored and the block is forcibly removed (default if false).
         */
        export function closeWait(force = false) {
            if (__waitRequestCounter > 0 && (force || --__waitRequestCounter == 0)) {
                __waitRequestCounter = 0;
                onEndWait.dispatch();
            }
        }

        // =======================================================================================================================
    }
}
