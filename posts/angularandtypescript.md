{{{
  "title": "Meet the frontend superhero: AngularJS with TypeScript",
  "tags": ["JavaScript", "TypeScript", "Angular","JS","frontend", "tutorial"],
  "category":"tech",
  "date": "Fri, 5 June 2015 17:31:35 GMT",
  "color":"blue",
  "picture":"/media/pictures/angularandtypescript.jpg",
  "picturecapt":"Meet the frontend superhero!"
}}}

When we at appointmed started out designing our application we were evaluating a few options for our technology stack.
Find out why we stuck with a combination of Angular and TypeScript and got to love it.
<!--more-->
Supercharge your frontend
---------------
When we at [appointmed](http://www.appointmed.com/) started out designing our application it pretty soon became clear that we would be using
AngularJS as our frontend framework. Since I am a rather lazy programmer, I like structure and maintainability wherever possible and
I want to take advantage of tools that help me to produce clean and understandable code.

I've had a look at TypeScript before when it was still very beta and still had lots of problems. But when we started out one of our team
members reintroduced me to TypeScript when it was at version 0.9.1.0. The idea of writing structured, object oriented code as I was used
to it from other languages gave me goose bumps of excitement.

Getting started
--------------
If you come from a Java or .NET background, getting into TypeScript is pretty simple as it provides all the sugar candy you are used to.
You can created classes, interfaces and even use generics. It basically is ES6 with a modern type system.

    interface User {
        firstName: string;
        lastName: string;
    }

    // interfaces match any object with the fields that were defined in the interface

    var john : User = {firstName:"John", lastName:"User"}
    var leo  : User = {name:"Leo"} // error

    function getName(user:User) : string {
        return user.firstName + " " + user.lastName;
    }

IDEs such as WebStorm, Sublime and many others provide you with autocomplete and warn you about all the small coding mistakes you might
be making without typed variables. I recommend you to play around a bit on [http://www.typescriptlang.org/Playground/](http://www.typescriptlang.org/Playground/).

You can simply compile TypeScript to JavaScript using the tsc compiler.

    ##install typescript
    > npm install -g typescript

    > tsc test.ts

Since this would be quite complicated for larger applications, we want to include this process into our build script. I have been using Gulp
to build my frontend applications for some time now, but you can also include it in any other build system.

Now we want to start out with our angular application. You can clone the example code from my [GitHub repository](https://github.com/csupnig/angularjs-tutorial-code)
and start playing. You will find a little example application as well as the gulp build file in there. You can install the dependencies and
start the build with the following commands.

    ##install gulp
    npm install -g gulp
    npm install -g bower

    ##install the dependencies
    npm install
    bower install

    ##build the project and start the watcher
    gulp watch

The result will be a directory called "build" containing the compiled files. You just have to make this one the root directory of a local
http server and then you can access the app in your browser. The simples way to do that is to use the http-server npm package.

    ##install http-server
    npm install -g http-server
    cd build
    http-server

First we want to create a simple controller and register it in an angular module.

    module at{
        'use strict';

        //Interface to describe the scope
        export interface IArticleScope extends ng.IScope {
            vm:ArticlesCtrl;
        }

        export class ArticlesCtrl {

            public articles : Array<IArticle>;

            //Use the $inject property to ensure proper functionality after minification
            public static $inject = [
                '$scope', 'Article', 'Cart'
            ];
            constructor(private $scope:IArticleScope, public article : IArticleResource, public cart : CartService) {
                this.$scope.vm = this;
                this.articles = article.query();
            }

        }

    }

Registering the controller:


    module at{
        'use strict';

        angular.module('atControllers', ['atServices'])
            .controller('ArticlesCtrl', ArticlesCtrl);

    }

Services
---------------
In angular, services are used to share objects across your app to hold or provide information. They are wired into your
components using dependency injection. In our example we have a cart service, that will hold an array of the selected items.
In a real world example you obviously would like to persist the cart somehow but for this playground app we are just going
to hold the information locally.


    module at {
        'use strict';


        export class CartService{

            private items : Array<IArticle> = [];

            constructor(){}

            getItems() : Array<IArticle> {
                return this.items;
            }

            addArticle(item:IArticle) {
                this.items.push(item);
            }
        }

    }

Then we have to register the service in our application.


    module at {
        'use strict';

        angular.module('atServices', [])
            .factory('Cart',[ () : CartService => {
                return new CartService();
            }]);

    }

Directives
---------------
Directives provide a way of attaching specific behaviour to a DOM object in angular. This is great to create reusable
components within your app.

We want to create a directive, that displays a price and if the price is not present or zero, we want to display the word "free".


    module at {
        'use strict';

        export interface IPriceScope extends ng.IScope {
            value : number;
        }

        export class PriceDirective {

            public static $inject: Array<string> = [];

            constructor() {
                var directive: ng.IDirective = {};
                directive.priority = 0;
                directive.restrict = "EA";
                directive.scope = {
                    value:"="
                };
                directive.template= '<span ng-show="value == 0||!value">free</span>' +
                '<span ng-show="value > 0">{{value | currency}}</span>';

                return directive;
            }
        }
    }

Registering the directive makes it available in our app.


    module at{
        'use strict';

        angular.module('atDirectives', [])
            .directive('price', PriceDirective);

    }

Filters
---------------
Filters are used to modify the way something is displayed. This could be something like reordering an array, rounding
prices or simply using a certain date format to display a date object.

We want to create a filter that adds up the price of all items in the cart and displays it.


    module at {
        'use strict';

        export class SumFilter {

            public static $inject:Array<string> = [];

            constructor() {
            }

            filter(items:Array<IArticle>):number {
                var result = 0;
                if (!angular.isUndefined(items)) {
                    return items.reduce(function(total : number, article:IArticle) {
                        return total + article.price;
                    }, 0);
                }
                return result;
            }
        }

    }

Then we have to register the filter to be able to use it.


    module at{
        'use strict';

        angular.module('atFilters', [])
            .filter('sumfilter', function(){
                return (new SumFilter()).filter;
            });
    }

Putting everything together
---------------
Finally we have to set up the routing in our app and register all our separate modules in order for them to be loaded.


    module at{
        'use strict';

        angular.module('tutorialApp', ['atControllers', 'atDirectives', 'atFilters','ngResource', 'ngAnimate', 'ngRoute'])
            .config(['$routeProvider', function($routeProvider) {
                $routeProvider
                    .when('/', { templateUrl: 'articles.html' })
                    .when('/about', { template: 'Über unsere Pizzeria.' })
                    .otherwise({ redirectTo: '/'});
            }]);

    }

As you can see, this is all pretty straight forward. If you have any further questions, don't hesitate to ask in the comments
below.
