/// !example
/// ## Sending events from a worker thread
/// 
/// This 7th example demonstrates how we can clear context of thread and load it again.
/// 
/// 
/// Like before, we create a thread and we define the fibonacci function:
var Threads = require('webworker-threads');
var t = Threads.create();
 

function fibo(n) {
	return n > 1 ? fibo(n - 1) + fibo(n - 2) : 1;
}
/// Instead of running a single fibonacci computation in the worker thread, we are going to execute a function
/// that computes all fibonacci numbers and emits a `data` event for every number it generates.
/// 
/// This function runs inside the worker thread so it does not see the `t` variable which belongs to the 
/// main thread. But **webworker-threads** sets up a global `thread` variable that the worker thread can use to 
/// send events to the main thread.
/// 
/// Here is our fibonacci generator:
function generateFibos(max) {
	for (var i = 1; i <= max; i++) {
//        console.log(fibo(i));
		thread.emit("data", i, fibo(i));
	}
}
/// Note: this is obviously a very inefficient algorithm to generate the sequence of fibonacci numbers.
/// 
/// Inside the main thread, we set up an event listener for the `data` events emitted by the 
/// worker thread:
t.on('data', function(n, result) {
	console.log('fibo(' + n + ') = ' + result);
})
/// Now, we are ready to go. We load the two functions into the worker thread
t.eval(fibo);
t.eval(generateFibos);
t.clear();

/// Define a callback
var cb = function(err, result) {
    if (err)
        console.log(err);
    else {
        console.log("generator is done!");
        t.destroy();
    }
};

var code = "if (typeof generateFibos == 'function') { console.log('generateFibos defined'); } else { console.log('generateFibos undefined.'); } generateFibos(40);";

/// And we run the generator with a callback that will execute when the generator returns from its loop:
/// Because we clear the context of the thread, the generator is undefined now.
t.eval(code, cb);

/// load the two functions again
t.eval(fibo);
t.eval(generateFibos);
 
/// And we run the generator with a callback that will execute when the generator returns from its loop:
t.eval(code, cb);


/// ### Output
/// 
/// ```
/// generateFibos undefined.
/// generateFibos defined
/// [Error: ReferenceError: generateFibos is not defined]
/// fibo(1) = 1
/// fibo(2) = 2
/// fibo(3) = 3
/// fibo(4) = 5
/// generator is done!
/// ```
