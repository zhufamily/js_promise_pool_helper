# JavaScript Promise Pool
## _A helper for running a large number of promises in a pool mode (Not just batch mode)_
## Installation

Add the poolPromise.js file to your web project, node project and etc.

It has been tested against the latest Chrome, Edge and Node V8 engine.

## Samples

Running promises in a pool mode with three runners max

```sh
async function myPromiseFunct(mymsg, mynum) {
    return new Promise((resolve, reject) => {
        setTimeout(function() {
            console.log(mymsg);
            resolve(mymsg);
        }, 500);
    });
};

function mycallback(currentPosition, totalLength, currentResult) {
    console.log(`POS: ${currentPosition}; LEN ${totalLength}`);
    console.log(currentResult);
};

myparams = [['apple', 1], ['pear', 2], ['orange', 3],
    ['banana', 4], ['melon', 5], ['lemon', 6]];

poolPromise(3, myparams, myPromiseFunct, mycallback).then((result) => {
    console.log(result);
}, (reason) => {
    console.log(reason);
});
```

## Some Explanations

Most things are straight-forward and self-explanatory, you just start the function with the following parameters
- limit of parallel runners
- an array of parameters for the promise function
- promise function, which handles actual work
- callback for progress

The single result has the following elements
- element[0] input parameters
- element[1] status -- success or fail
- element[2] reult (if status is success) or error (if status is error) 

The final / accumulated results is an array of single results

## License

Free software, absolutely no warranty, use at your own risk!
