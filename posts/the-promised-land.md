{{{
  "title": "The promised land: Promises in angular",
  "tags": ["JavaScript", "TypeScript", "Angular","JS","frontend", "tutorial","abstract","service","services"],
  "category":"tech",
  "date": "Thu, 27 Oct 2016 20:31:35 GMT",
  "color":"blue",
  "picture":"/media/pictures/futurepromise.jpg",
  "picturecapt":"The promised land!"
}}}

In my work in web development, especially when helping out in projects where javascript is heavily involved, I often encountered strange async patterns. This is why I created
this little article. It should give you an insight on promises in angularjs and how to use them properly.
<!--more-->
## The story
Close your eyes and imagine that every morning before work you are heading first to the bakery to fetch your favourite sandwich, then to the fruit truck to get your beloved smoothie
and finally you head to the kiosk to get your newspaper. The baker tells you, that your sandwich is out of stock but because you have been a faithful customer, he will make one
especially for you. You take a quick look at your watch and agree. 20 minutes later you are on the way to the fruit truck with your sandwich. You like it fresh and that is why you spend
another 30 minutes before you hold the tasty beverage in your hand. After your stop at the kiosk, you are 50 minutes late to your work. Would it not be cool to make things a bit
more convenient?

Let me introduce you to the promised land, where we have magic shopping bags. On the next morning you go to the bakery and the backer hands you a little bag and tells you: "Be on your way now,
I will make your sandwich and when you will open the bag, the sandwich will be inside." You head to the fruit truck, where again, you are handed a little bag with almost the same speech.
Interested you head to your work after you picked up your newspaper. This morning the whole process took only took 30 minutes and really: You are at your work place, open the bags and everything
is there.

And this is what lies behind those magic bags, called promises:

### Concepts

    A promise represents the eventual result of an asynchronous operation.
    
#### Why Promises?
Using callback functions to achieve asynchronicity in code becomes just way too complicated when you have to compose multiple asynchronous calls and make decisions depending upon the outcome of this composition. While handling the normal case is still somewhat feasible it starts to become very ugly when you have to provide rock solid exception handling.

#### Callback vs. Promise

    // callback
    fs.readFile('somefile.txt', function(err , contents) {
        if (err) {
            return handleError(err);
        }
        handleFile(contents);
    }
    
    // promises
    fs.readFileAsync('somefile.txt')
        .then(handleFile)
        .catch(handleError);
        
The difference becomes even more aware if you have to handle multiple async calls that depend on each other.
        
    doSomething(function(err) {
        if (err) {
            return handleError(err);
        }
        doSomethingElse(function(err) {
            if (err) {
                return handleError(err);
            }
            doOneMoreThing(function(err) {
                if (err) {
                    return handleError(err);
                }
                // handle success
             });
        });
    });
        
    function handleError(err) {
        // handle error
    }
    
This is jokingly called the pyramid of doom. Because you will soon end up on the right end of your screen
and the code will not be readable anymore. 

The same thing with chained promises:
    
    doSomething().then(function () {
        return doSomethingElse();
    }).then(function () {
        return doOneMoreThing();
    }).catch(function () {
        // handle error
    });

### The contract

#### There is one resolution or rejection
A promise is resolved one time. It will never be fulfilled if it has been rejected or rejected if it has been fulfilled.

#### Listeners are executed once
A callback or errback will be executed one time and only one time.

#### Promises remember their state
A promise that is resolved with a value remembers the fulfillment. If a callback is attached in the future to this promise, it will be executed with the previously resolved value. The same is true of errbacks. If a promise is rejected and an errback is attached after the rejection, it will be executed with the rejected value. Promises behave the same way regardless of whether they are already resolved or resolved in the future.
    
    var promise = $q.defer();
    promise.then(function () {
        console.log("yeey");
    });
    promise.resolve();
    promise.then(function () {
        console.log("yuuhuuu");
    });

### Mistakes using Promises

1. Promise pyramid of doom

    It can be very tempting to fall back into the same scheme of layering promise calls as we used to do it with common callback
    functions. Just don't do it!
2. Forgetting to catch

    Forgetting to catch will swallow errors. This can result in a long hunt for bugs, once strange behaviour in your app occurs.
3. Forgetting to return

    Forgetting to return can result in two unwanted behaviours. An outer promise can finish early and errors of the not returned function
    call can be swallowed.
    
### Awesome facts about Promises
1. Returning a value inside a promise callback will result in another Promise
    
        doSomething().then(function() {
            return "myvalue";
        }).then(function (data) {
            if (data === "myvalue") { // true
                // yeeey!
            }
        });
        
2. Throwing an error inside a promise callback will result in the promise being rejected      
        
        doSomething().then(function() {
               
              throw "My custom error";
          }).then(function (data) {
              // will not be called
          }).catch(function () {
                // Yeeey!
          });


If you are interested in experimenting with promises, go to the following github repo and check out the tasks there: [vhttps://github.com/csupnig/the-promised-land](https://github.com/csupnig/the-promised-land)
