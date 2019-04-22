{{{
  "title": "Get your metal tested: Test AngularJS and TypeScript with Karma and Jasmine",
  "tags": ["JavaScript", "TypeScript", "Angular","JS","frontend", "tutorial","unit","testing","jasmine","karma"],
  "category":"tech",
  "date": "Sat, 13 June 2015 14:31:35 GMT",
  "color":"blue",
  "picture":"/media/pictures/labtest.jpg",
  "picturecapt":"Get your metal tested!"
}}}

Now that you became a superhero yourself, I invite you to get your metal tested. We all know by now that unit tests are only a half
measure, but it is a start to provide the quality you want to ship your products with.
<!--more-->
## About heroes and their quality 
In my last [post](/blog/meet-the-frontend-superhero-angularjs-with-typescript) I introduced you to our superhero that we use at [appointmed](http://www.appointmed.com/)
and if you played around a bit I am certain that you experienced the easy with which you can write proper frontend applications using AngularJS and TypeScript. As in
any other programming environment writing pretty code does not entirely keep you from making mistakes, especially when the application grows to a certain size.

This is why automated tests are put in place to provide your clients with the quality they expect from your releases. By now we all know that unit testing alone does not
get you there but it is a step into the right direction. In order to walk the whole way, you might also want to look at end to end tests and integration tests.

In this post I will show you, how you can add the unit testing part to your application using Karma and Jasmine in your gulp build.

## UPDATE! There is a part 2 online.
Go to the [new post](/blog/get-your-metal-tested---part-2-test-angularjs-and-typescript-with-karma-and-tjangular).

## Getting started
First we want to get all our dependencies sorted and install Karma and jasmine. Therefore add the following items to your package.json and run the install command.

        "gulp-karma": "0.0.4",
        "karma": "~0.12.0",
        "karma-coverage": "~0.2.4",
        "karma-jasmine": "~0.1.0",
        "karma-phantomjs-launcher": "^0.1.4"

We will also be using the angular mocks module to create instances of the things that we want to test and mock the http backend. Therefore we have to add the dependency
to the bower.json.

        "angular-mocks"	: "~1.2.9"

Now we install the dependencies

        >npm install
        >bower install

Now we are all set and can start to set up our Karma configuration. In our example I will have a directory "test" in our project, that will contain the karma configuration
and another directory "unit" for the actual tests.

        module.exports = function(config) {
            config.set({
                // list of files / patterns to load in the browser

                // **/*.js: All files with a "js" extension in all subdirectories
                // **/!(jquery).js: Same as previous, but excludes "jquery.js"
                // **/(foo|bar).js: In all subdirectories, all "foo.js" or "bar.js" files

                files: [
                    'build/app/*.js',
                    'build/tests/*.js'
                ],

                browsers: [
                    'PhantomJS'
                ],

                // level of logging: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
                logLevel: config.LOG_WARN,

                // base path, that will be used to resolve files and exclude
                basePath: '../',

                // web server port
                port: 7676,

                // testing framework to use (jasmine/mocha/qunit/...)
                frameworks: ['jasmine'],

                // Additional reporters, such as growl, junit, teamcity or coverage
                reporters: ['progress'],

                // Enable or disable colors in the output (reporters and logs).
                colors: true
            });
        };

This configuration tells karma which files should be included in the test browser instance, that it should use the PhantomJS test runner and what test framework to use. You can also use other browser
runners to test your app across multiple browsers.

Now that we have the karma configuration in place, we need to compile and trigger the unit tests from our gulp build.

        /**
         * This task runs the test cases using karma.
         */
        gulp.task('app:test',['tests:build'], function(done) {
            // Be sure to return the stream
            return gulp.src('./idontexist')
                .pipe(karma({
                    configFile: 'test/test-unit.conf.js',
                    action: 'run'
                }))
                .on('error', function(err) {
                    // Make sure failed tests cause gulp to exit non-zero
                    throw err;
                });
        });

If you want to see the full code, I suggest you check out my [GitHub repository](https://github.com/csupnig/angularjs-tutorial-code) containing all the files that you need.

### Services
Now we want to write the actual tests using TypeScript. We create a file for each component we want to test and add our test code there. The unit test for one of our services
might look like this:


        describe("ArticleService", () => {

            var $httpBackend : ng.IHttpBackendService;
            var articleService : at.IArticleResource;

            beforeEach(module('tutorialApp'));

            beforeEach(() => {
                inject(function (_$filter_, _$httpBackend_, Article) {
                    $httpBackend = _$httpBackend_;
                    articleService = Article;
                });
            });

            afterEach(function () {
                $httpBackend.verifyNoOutstandingExpectation();
                $httpBackend.verifyNoOutstandingRequest();
            });

            it("should initialize correctly", () => {
                expect(articleService).toBeDefined();
            });

            it("should load articles", () => {
                $httpBackend.expectGET("articles.json").respond([
                    {"id": "1", "name": "Pizza Vegetaria", "price": 5 },
                    {"id": "2", "name": "Pizza Salami",    "price": 5.5 },
                    {"id": "3", "name": "Pizza Thunfisch", "price": 6 },
                    {"id": "4", "name": "Aktueller Flyer", "price": 0 }
                ]);

                var articles = articleService.query(function(){
                    expect(articles).toBeDefined();
                });
                $httpBackend.flush();
            });
        });

We use the http backend provided by the angular-mocks module to create a mock backend for our tests and tell it what requests it should expect and
what responses should be sent.

### Directives
Testing directives is quite easy, because we can simply check the resulting HTML and see if our directive rendered correctly.


        describe("PriceDirective", () => {

            var $compile : ng.ICompileService;
            var $rootScope : ng.IRootScopeService;

            beforeEach(module('tutorialApp'));

            beforeEach(() => {
                inject(function (_$compile_, _$rootScope_) {
                    $rootScope = _$rootScope_;
                    $compile = _$compile_;
                });
            });

            describe("price is set", ()=>{
                it('price is correct', function() {
                    // Compile a piece of HTML containing the directive
                    var element = $compile("<div price value=\"6\"></div>")($rootScope);
                    $rootScope.$digest();
                    expect(element.html()).toContain("6");
                });
            });

            describe("free is working", ()=>{
                it('kostenlos should be displayed', function() {
                    // Compile a piece of HTML containing the directive
                    var element = $compile("<div price value=\"0\"></div>")($rootScope);
                    $rootScope.$digest();
                    expect(element.html()).toContain("kostenlos");
                });
            });
        });

### Filters
The tests for the filters are quite similar. We feed our filter with some input and check the result.


        describe("SumFilter", () => {

            var $filter : ng.IFilterService;

            beforeEach(module('tutorialApp'));

            beforeEach(() => {
                inject(function (_$filter_) {
                    $filter = _$filter_;
                });
            });

            it("should initialize correctly", () => {
                var sumFilter = $filter('sumfilter');
                expect(sumFilter).toBeDefined();
            });

            it("should add up prices", () => {
                var sumFilter = $filter('sumfilter');
                expect(sumFilter([
                    {"id": "1", "name": "Pizza Vegetaria", "price": 5 },
                    {"id": "2", "name": "Pizza Salami",    "price": 5.5 },
                    {"id": "3", "name": "Pizza Thunfisch", "price": 6 },
                    {"id": "4", "name": "Aktueller Flyer", "price": 0 }
                ])).toBe(16.5);
            });
        });

### Controllers 
Sometimes controller tests can be a bit more complicated, because we often use other components in our controllers. In this case we also use the service that we already
tested in the unit test described above and then check if the $scope is initialized as we expect it.


        describe("ArticleCtrl", () => {

            var $httpBackend : ng.IHttpBackendService;
            var articleService : at.IArticleResource;
            var cartService : at.CartService;
            var $controller : ng.IControllerService;

            beforeEach(module('tutorialApp'));

            beforeEach(() => {
                inject(function (_$controller_, _$httpBackend_, Article, Cart) {
                    $httpBackend = _$httpBackend_;
                    $controller = _$controller_;
                    articleService = Article;
                    cartService = Cart;
                });
            });

            afterEach(function () {
                $httpBackend.verifyNoOutstandingExpectation();
                $httpBackend.verifyNoOutstandingRequest();
            });

            it("should initialize correctly", () => {
                expect(articleService).toBeDefined();
            });
            describe("$scope.vm.articles", ()=>{
                var scope, controller;
                beforeEach(()=>{
                    scope = {};
                    controller = $controller("ArticlesCtrl",{$scope:scope,Article:articleService,Cart:cartService});
                });

                it('articles has been initialized', function() {
                    $httpBackend.expectGET("articles.json").respond([
                        {"id": "1", "name": "Pizza Vegetaria", "price": 5 },
                        {"id": "2", "name": "Pizza Salami",    "price": 5.5 },
                        {"id": "3", "name": "Pizza Thunfisch", "price": 6 },
                        {"id": "4", "name": "Aktueller Flyer", "price": 0 }
                    ]);
                    expect(scope.vm.articles).toBeDefined();
                    $httpBackend.flush();
                });
            });

        });


## Putting everything together
Now that we know how to test all our components, we can simply call the gulp task to compile and execute the tests.

        > gulp app:test

Now go ahead and add this to your project and update your CI builds accordingly.

Happy testing!
