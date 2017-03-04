{{{
  "title": "Get your metal tested - Part 2: Test AngularJS and TypeScript with Karma and TJAngular",
  "tags": ["JavaScript", "TypeScript", "Angular","JS","frontend", "tutorial","unit","testing","jasmine","karma"],
  "category":"tech",
  "date": "Sat, 4 March 2017 14:31:35 GMT",
  "color":"blue",
  "picture":"/media/pictures/labtest2.png",
  "picturecapt":"Get your metal tested - Part 2!"
}}}

Maybe you remember my posts about how to become a frontend superhero and how to write resilient apps that are covered by unit tests with karma and jasmine. Some time
passed by and I learned a lot myself. This is why I want to share this update with you.
<!--more-->
## Proven in the field
In my last [post](/blog/get-your-metal-tested-test-angularjs-and-typescript-with-karma-and-jasmine) I showed you how you can start writing unit tests for your frontend application.
Since then some time passed, another version of angular came out and TypeScript got some fancy extensions. Since we still write a lot of bigger projects with angular 1.5, I also wanted
some new spices in there. In the last post we have seen that writing unit tests for angular is not rocket science, but still requires some time and boiler plate code. At [appointmed](http://www.appointmed.com/)
we write a lot of unit tests and I pretty soon got bored with all that repetition in the code. 
Initializing all the needed modules, injecting the components we want to test, preparing mocks,... the list is endless. So I started to move these steps into some
helper functions. This little library soon grew and after I found out about decorators and annotations in TypeScript I hooked it up and [TJAngular](https://www.npmjs.com/package/TJAngular) was born.

## About TJAngular
It sets out to make unit testing much easier by reducing boiler plate code you have to write when setting up your tests. It works very well with webpack and can easily be integrated in your npm scripts.


## What does it do?

Mocking out dependencies in unit tests can be a huge pain. Angular makes testing "easy", but mocking out *every* dependecy isn't so slick. If you've ever written an Angular unit test (using Jasmine/Mocha), you've probably seen a ton of `beforeEach` boilerplate that looks something like this:

```javascript
describe("DownloadCtrl", () => {
    var CTRL_ID : string = "dashboard_download_ctrl";

    var DownloadCtrl : myproj.IDownloadCtrl;
    var scope : myproj.IDownloadScope;
    var downloadService : service.IDownloadService;

    beforeEach(angular.mock.module("app"));
    beforeEach(angular.mock.module("common"));
    beforeEach(angular.mock.module("dashboard"));

    beforeEach(() => {
        inject(($controller : any,
                $httpBackend : any,
                ENV : any,
                $rootScope : any,
                $window : any,
                $log : any,
                download_service : service.IDownloadService) => {
            scope = $rootScope.$new();
            $httpBackend.expectGET(ENV.LANGUAGE_SERVICE_URL + "?lang=de").respond(200);
            downloadService = myproj_download_service;

            DownloadCtrl = $controller(CTRL_ID,
                {
                    $scope: scope,
                    $window: $window,
                    $log: $log,
                    downloadService: downloadService,
                    itemid: 123,
                    token: "b1"
                });
        });
    });

    it("should be initialized", () => {
        expect(DownloadCtrl).toBeDefined();
    });

    it("should call downloadservice with correct default parameters", () => {
        spyOn(downloadService, "getDownloadUrl").and.returnValue("someurl");

        DownloadCtrl.onDownload();

        expect(downloadService.getDownloadUrl).toHaveBeenCalledWith(123, "b1", "A4", false);
    });
});
```

In order to test a controller, we have to inject all the dependencies, set up the actual controller and then we can think about
the actual test cases.

What if it was a lot easier? What if we could hearness the power of TypeScript and make writing tests fun?

```javascript
"use strict";

import {Spec, Inject, Test, Mocks, Scope} from "TJAngular/index";

@Spec()
class DownloadCtrlSpec {

    @Scope({
        "scopemember":"1234"
    })
    @Mocks({
        "itemid": "123",
        "token": "ACBE123"
    })
    @Inject("dashboard_download_ctrl", "dashboard")
    private controller : myproj.IDownloadCtrl;

    @Test()
    public testInit() : void {
        expect(this.controller).toBeDefined();
    }

    @Test("should call downloadservice with correct default parameters")
    public testDownloadServiceCall() : void {
        spyOn((<any> this.controller).$deps.myproj_download_service, "getDownloadUrl").and.callThrough();
        this.controller.onDownload();
        expect((<any> this.controller).$deps.myproj_download_service.getDownloadUrl).toHaveBeenCalledWith("123", "ACBE123", "A4", false);
    }
}
```

## How does it work?
TJAngular does all the `beforeEach` boilerplate behind the scenes and just injects the objects that you want to test into your
test class.

## How do I use it?
Instead of writing complicated function `describe` constructs as you have known them from Jasmine, you simply write a
TypeScript class for each Test and annotate it properly.

## How do I provide mocks for Services, Providers,...
TJAngular holds an internal angular module for all the mocks. You can register mocks by simply annotating them.

```javascript
import {ProvideMockService} from "TJAngular";
"use strict";

@ProvideMockService("myproj_download_service")
class AnyDownloadService implements service.IDownloadService {

    public getDownloadUrl(itemid : string, token : string, format : string, sign : boolean) : string {
        return undefined;
    }
}    
```

TJAnuglar will always first look for a mock to inject them into your requested objects. If there is no mock available,
the original injectable will be used.

## The TJAngular API
You can find a detailed description of the API on the npm page of [TJAngular](https://www.npmjs.com/package/TJAngular).

## Using injected properties
Once you have injected a resource into your test class with `@Inject`, you can use it in your test methods.
Every injected resource has additional information attached to it, that you can use to test it.

- `$deps` - All dependencies that have been injected into the requested resource. E.g.
    ```javascript
        spyOn((<any> this.controller).$deps.download_service, "getDownloadUrl")
    ```

Happy testing!
