/*
 * A helper function to run large number of promises in a pool with limited parallel running slots
 * As soon as one slot is available, another promise waiting in the queue will start automatically
 * Everytime a promise run completed there will be an optional callback function to notify progress
 * When all runners are completed the function will always return success with all results for the promises
 * Result is in array format element[0] is input parameters, element[1] is status -- success or fail, 
 * and elemnt[2] is result (if status is success) or error (if result is fail) from your promise function
 *
 * @function poolPromise
 * @param {number} poolLimit Limit for concurrect runners
 * @param {array} paramArray Param array to pass to the promiseFunction
 * @param {function} promiseFunction Function promise pool running against
 * @param {function} progressCallback Optional function for callback on current progress
 */
async function poolPromise(poolLimit, paramArray, promiseFunction, progressCallback) {
    return new Promise((resolve, reject) => {
        // Check poolLimit and round to upper integer if not whole number
        if(!typeof poolLimit === 'number')
            reject('poolLimit is not a number');
        poolLimit = Math.ceil(poolLimit);    
        if(poolLimit <= 1)
            reject('poolLimit must be at least 2');
        // Check paramArray is valid input -- not empty array
        if(!Array.isArray(paramArray))    
            reject('paramArray is not an array');
        if(paramArray.length === 0)
            reject('paramArray has no elements');
        // Check promise function is valid -- function with promise return
        if (!typeof promiseFunction === 'function')
            reject('promiseFunction is not function');
        if (!typeof promiseFunction === 'object' || !typeof promiseFunction.then === 'function')
            reject('promiseFunction is not returning promising');
        // Check progressCallback is either not present, or a valid function
        if (!typeof progressCallback === 'undefined' && !typeof progressCallback === 'function')
            reject('progressCallback is not function');
           
        // Zero based for total length of promise runners
        let len = paramArray.length - 1;
        // Zero based for current positive of promise processed
        let pos = poolLimit - 1;
        // Accumulated final results
        let results = [];
        // Is promise function taking single input or multiple inputs
        let isparamArray = Array.isArray(paramArray[0]) ? true : false;
        // Is progress callback existing
        let hasCallback = typeof progressCallback === 'function' ? true : false;
       
        /*
        * Hanlde the current completed promise
        * Fire progress callback function if presents
        * Push the result into accumulated final results
        * If all promise runners are completed, resolve the whole thing and return the accumulated results
        * If NOT all promise runners are completed, start the next runner for the free slot
        *
        * @function handlePromise
        * @param {any} paramLocal Params for the completed promise
        * @param {string} resultStatus Either success or fail
        * @param {any} resultValue Result or error from the current promise
        */
        function handlePromise(paramLocal, resultStatus, resultValue) {
            let localResults = [];
            localResults.push(paramLocal);
            localResults.push(resultStatus);
            localResults.push(resultValue);
            results.push(localResults);
            pos++;
            if(hasCallback) {
                progressCallback(pos - poolLimit, len, localResults);
            }
            if(pos <= len) {
                wrapPromiseFunction(paramArray[pos]);
            } else if (pos === len + poolLimit) {
                resolve(results);
            }
        }
       
        /*
        * A wrapper function for the input promise
        *
        * @function wrapPromiseFunction
        * @param {any} paramLocal Params for promise runner
        */
        function wrapPromiseFunction(paramLocal) {
			// multiple or single arguments for promise runner
            if(isparamArray) {
				promiseFunction(...paramLocal).then((result) => {
                    handlePromise(paramLocal, 'success', result);
                }, (reason) => {
                    handlePromise(paramLocal, 'fail', reason);
                });
			} else {
				promiseFunction(paramLocal).then((result) => {
                    handlePromise(paramLocal, 'success', result);
                }, (reason) => {
                    handlePromise(paramLocal, 'fail', reason);
                });
			}
        };
       
		// start runners for the initial available slots
		// if there are more slots then runners, then all runners will be started parallel
        for(let i = 0; i <= pos && i <= len; i++) {
            wrapPromiseFunction(paramArray[i]);
        }
    });
};
