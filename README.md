# JavaScript Promise Pool
## _A helper for running a large number of promises in a pool mode (Not just batch mode)_
## Installation

Add the poolPromise.js file to your web project, node project and etc.

It has been tested against the latest Chrome, Edge and Node V8 engine.

## Release Notes
- Added stop flag
- Converted to class structure

## Samples

Running promises in a pool mode with three runners max

```sh
async function myPromiseFunct(mymsg, mynum) {
    return new Promise((resolve, reject) => {
        setTimeout(function () {
            console.log(`${new Date().getTime()}`);
            resolve(mymsg);
        }, 500);
    });
};

myparams = [['apple', 1], ['pear', 2], ['orange', 3],
    ['banana', 4], ['melon', 5], ['lemon', 6],
    ['lime', 7], ['peach', 8], ['grape', 9]];

let myrunner = new PromisePool(3, myparams, myPromiseFunct);

myrunner.onProgress(function (currentPosition, totalLength, currentResult) {
    console.log(`POS: ${currentPosition}; LEN ${totalLength}`);
    console.log(currentResult);
	
    // Uncomment the section below, if you want to see how stop flag working
    /*
    if (currentPosition === 1) {
        myrunner.stop();
    }
    */
});

myrunner.runPool().then((result) => {
    console.log(JSON.stringify(result));
}, (reason) => {
    console.log(JSON.stringify(reason));
});

```

## Some Explanations

Most things are straight-forward and self-explanatory, you just compose the class with the following parameters
- limit of parallel runners
- an array of parameters for the promise function
- promise function, which handles actual work
- optional callback for progress

Also you can setup a progress callback after the class is initialized
When runners are still in progress, you can set up stop flag to terminate the execution 

The single result has the following elements
- element[0] input parameters
- element[1] status -- success or fail
- element[2] reult (if status is success) or error (if status is error) 

The final / accumulated results is an array of single results

## License

Free software, absolutely no warranty, use at your own risk!
