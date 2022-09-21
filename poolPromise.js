/**
 * A pool for parallel running Promises
 *
 * @property {Number} poolLimit - Upper limits for parallel running Promises
 * @property {Array} paramArray - Array of parameters for the Promise function
 * @property {Function} promiseFunction - Promise function from which runners are generated
 * @property {Function} progessCallback - Optional callback function for progresses
 * @property {Boolean} stopped - Boolean flag for stop
 */
class PromisePool {
    #poolLimit;
    #paramArray;
    #promiseFunction;
    #progessCallback;
    #stopped;

    /**
     * @constructor
     * @param {Number} poolLimit
     * @param {Array} paramArray
     * @param {function} promiseFunction
     * @param {function} progessCallback
     */
    constructor(poolLimit, paramArray, promiseFunction, progessCallback) {
        if (!typeof poolLimit === 'number')
            throw 'poolLimit is not a number';
        poolLimit = Math.ceil(poolLimit);
        if (poolLimit <= 1)
            throw 'poolLimit must be at least 2';
        if (!Array.isArray(paramArray))
            throw 'paramArray is not an array';
        if (paramArray.length === 0)
            throw 'paramArray has no elements';
        if (!typeof promiseFunction === 'function')
            throw 'promiseFunction is not a function';
        if (!typeof promiseFunction === 'object' || !typeof promiseFunction.then === 'function')
            throw 'promiseFunction is not returning a promising';
        if (!typeof progessCallback === 'undefined' && !typeof progessCallback === 'function')
            throw 'progessCallback is not a function';

        this.#poolLimit = poolLimit;
        this.#paramArray = paramArray;
        this.#promiseFunction = promiseFunction;

        if (typeof progessCallback === 'function') {
            this.#progessCallback = progessCallback;
        }

        this.#stopped = false;
    }

    /**
     * Set up callback function for progress
     *
     * @function onProgress
     * @param {function} progessCallback
     */
    onProgress = function (progessCallback) {
        if (!typeof progessCallback === 'function')
            throw 'progessCallback is not a function';
        this.#progessCallback = progessCallback;
    }

    /**
     * Set up stop flag
     *
     * @function stop
     */
    stop = function () {
        this.#stopped = true;
    };

    /**
     * Run the Promises in pool mode (Not batch mode)
     *
     * @function runPool
     */
    runPool = function () {
        return new Promise((resolve, reject) => {
            // Zero based all length for runners
            let len = this.#paramArray.length - 1;
            // Zero based current position for the runner
            let pos = 0;
            // One based in progress runners
            let runner = 0;
            // One based completed runners
            let completed = 0;
            // Accumuldated results
            let results = [];
	    // Whether parameters for Promise function is array
            let isparamArray = Array.isArray(this.#paramArray[0]) ? true : false;
            // Whether progress callback function present
	    let hasCallback = typeof this.#progessCallback === 'function' ? true : false;

            /**
             * Handle when one runner instance is done
             * Generate result for the completed runner instance
             * If progress callback presents, invoke callback function
             * Push result into accumulated resultStatus
             * If more runners are waiting, start next runner
             * If all runners are done, resolve the accumulated resultStatus
             * If stop flag is set, no new runner will be started, the runners in the progress will be completed
             * Per current Promise definition there is no cancellable Promise
             * When all runners in progress are done, reject the accumulated results
             *
             * @function
             * @param {Any} paramLocal - input parameters for the completed runner instance
             * @param {String} resultStatus - either succcess or fail
             * @param {Any} resultValue - result or error from the completed runner instance
             */
            let handlePromise = function (paramLocal, resultStatus, resultValue) {
                let localResults = [];
                localResults.push(paramLocal);
                localResults.push(resultStatus);
                localResults.push(resultValue);
                results.push(localResults);

                if (hasCallback) {
                    this.#progessCallback(completed , len, localResults);
                }                
                completed++;

                if (pos <= len && this.#stopped === false) {
                    wrapPromiseFunction(this.#paramArray[pos]);
                    pos++;
                } else {
                    runner--;
                    if (runner == 0 && this.#stopped === false) {
                        resolve({
                            'status': 'Completed',
                            'result': results
                        });
                    } else if (runner == 0 && this.#stopped === true) {
                        reject({
                            'status': 'stopped',
                            'result': results
                        });
                    }
                }
            }.bind(this);

            /**
             * A wrapper function for Promise allow continuing when a slot is available
             *
             * @function wrapPromiseFunction
             * @param {any} paramLocal - parameters for one runner instance of the Promise function
             */
            let wrapPromiseFunction = function (paramLocal) {
                if (isparamArray) {
                    this.#promiseFunction(...paramLocal).then((result) => {
                        handlePromise(paramLocal, 'success', result);
                    }, (reason) => {
                        handlePromise(paramLocal, 'fail', reason);
                    });
                } else {
                    this.#promiseFunction(paramLocal).then((result) => {
                        handlePromise(paramLocal, 'success', result);
                    }, (reason) => {
                        handlePromise(paramLocal, 'fail', reason);
                    });
                }
            }.bind(this);

            // Start parallel running promises with pool limits or param array length, whichever is smaller
            for (let i = 0; i < this.#poolLimit && i <= len; i++) {
                wrapPromiseFunction(this.#paramArray[i]);
                runner++;
                pos++;
            }
        });
    }.bind(this);
};
