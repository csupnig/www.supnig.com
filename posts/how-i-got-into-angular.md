{{{
  "title": "How I got into Angular.JS",
  "tags": ["JavaScript", "Angular.JS", "Angular","Cointelligence","Bitcoin"],
  "category": "technology",
  "date": "Sat, 11 Nov 2014 17:31:35 GMT",
  "color":"lightblue",
  "slug":"how-i-got-into-angularjs"
}}}

When I had a few days off over last year’s Christmas holidays, I really
caught on to the whole Bitcoin hype that was going on during that time.
I spent hours watching the markets and trying to figure out how I could
make a few bucks on the side with this interesting thing. Now what has
that to do with AngularJS? Now that I finally hat the time to write
another blog post, I will try to fill you in.
<!--more-->
When I had a few days off over last year’s Christmas holidays, I really
caught on to the whole Bitcoin hype that was going on during that time.
I spent hours watching the markets and trying to figure out how I could
make a few bucks on the side with this interesting thing. Now what has
that to do with AngularJS? Now that I finally hat the time to write
another blog post, I will try to fill you in.

The first thing I figured out was that it seemed to be a really unstable
market and that the price could climb or drop a few percent over the
curse of an hour. So I wanted some kind of automated help to keep track
of the current price. That was when I started to play around with the
market API of btc-e.com. Everything was very straightforward and so I
quickly had a script running in Node.js that kept informing me of bigger
jumps in the price.

Now a few lines of console output accompanied by an email notification
was not really appealing so I decided to build a web application on top
of the Node.js script. I used express to build the application, which is
really easy because it basically does everything for you. You just have
to concentrate on your business logic. This enabled me to quickly put a
page together, that would display the current price and would update
that price every second using websockets.

The web developer in me was not really satisfied with a plain text page
that just displays a few lines in a browser so I wanted more and this is
where the fun with AngularJS started. I had a look at a few tutorials
and started to code away…

As many other developers I came from a jQuery background and so the
first thing I did was to write a jQuery plugin to visualize the data
received by the websocket in a canvas using a candle stick graph.

I then used the ui-router module of angular to switch between different
currency pairs like USD/BTC, USD/LTC, BTC/LTC and so on. This looked
pretty good to me and I could keep track of the current rates in a nice
graph and by that time I was absolutely hooked. New Ideas just kept
flowing in and I spent almost every night in front of the screen
figuring out how to lay out my ideas in Angular. So I wrapped the jQuery
plugin in an angular directive and used modified it a bit so I could use
angular’s data binding to feed it new/updated data from the
websocket.

When I read up more about stock markets and financial mathematics, I
came across some functions that could give some informative indicators
on currency graphs. I quickly implemented a few of these functions and
added them to my graph. The graph now looked somewhat like the final
product. ![Graph on canvas](/media/pictures/coingraph.png)

Spaking a whole new firework of ideas in my mind, these indicators
quickly led to me trying to implement a prediction algorithm. Miserably
failing at predicting such a highly fluctual market, I found that I
could still use those indicators to programmatically analyze the current
market situation and issue buy and sell commands according to their
signals.

I was so hooked by the ease of how things can be done in JavaScript that
I wanted to enable anyone visiting my portal to play around with those
indicators and write their own algorithm to issue buy and sell commands.
I thought “Who knows, maybe someone smarter than me will figure out a
way how to not only analyze but also predict the markets…”. Letting
other users upload JavaScript to my server where it would be executed
sounded like a very scary idea to me and I also did not want to analyze
and approve every piece of code that someone will write, so I figured it
would be best to just execute the algorithm in the browser.

I hooked up the famous ace online code editor and created two methods to
test one’s algorithm. One against past market data and one on the live
data the will be received by the websocket. This enables the developer
to tweak and twiddle until the algorithm works as he intended it.

Constantly astonishing me with its ease of coding and all the features
that come out of the box, AngularJS was the perfect choice for me and
created a whole new ecosystem of web development for me.

You can see the final project running on [www.cointelligence.net](http://www.cointelligence.net)
