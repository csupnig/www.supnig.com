{{{
  "title": "Angular best practices: How do you create a snappy user experience?",
  "tags": ["JavaScript", "TypeScript", "Angular","JS","frontend", "question","snappy","ux","fast"],
  "category":"tech",
  "date": "Wed, 02 Dec 2015 16:31:35 GMT",
  "color":"blue",
  "picture":"/media/pictures/snappyangularapps.jpg",
  "picturecapt":"How to create a snappy user experience?"
}}}

The other day I was working on an angular application that has a big emphasis on user experience and needs to deliver a
snappy feeling for its users. When I set up my routes, I started to wonder about how one should set up resources, that need
to be loaded for the page to be displayed.
<!--more-->
##The Problem
The other day I was working on an angular application that has a big emphasis on user experience and needs to deliver a
snappy feeling for its users. As many other developers, I am relying on the [UI Router](https://github.com/angular-ui/ui-router) when it comes to 
routing in the application. When I set up my routes, I started to wonder about how one should set up resources, that need
to be loaded for the page to be displayed.

##Two obvious solutions
There are two obvious solutions, that each have their own benefits and drawbacks.

###Resolving all needed resources before initializing the controller
Setting up your routes to load all needed resources before you initialize the controller is technically the most clean
solution in my opinion. You set up resolves in your route definition, that will load the resources and inject them into
the loaded controller.

        .state('app.userlist', {
            url: '/users',
            views: {
                'content@app.userlist': {
                    controller: 'UserListController',
                    controllerAs: 'vm',
                    templateUrl: 'app/users/userlist.tpl.html',
                    resolve: {
                        'users': ['UserService', (userService : UserService) => {
                            return userService.getList();
                        }],
                        'countries': ['ParameterService', (parameterService : ParameterService) => {
                            return parameterService.getSupportedCountries();
                        }]
                    }
                }
            }
        })
        
This will result in the UserService loading the users and returning a promise for this request, same as the ParameterService,
that will load the supported countries. After the requests returned and the promises are resolved, the controller is being loaded
and the resources can be injected there. Since AJAX requests to our server might take some time, this will result in the user
seeing a loading indicator or a blank page in the worst case until all our resources are loaded.

Pros:

 - All needed resources are being loaded before the page is displayed
 - There are no components that will not work because of missing resources

Cons:

 - Loading might take some time
 - The user experience is not snappy, because we need to wait for the resources to be loaded

###Loading all needed resources when initializing the controller
Loading the resources in the constructor of our controller is not so beautiful, but we have the possibility to show the user
some things before all resources have been loaded.

        export class UserListController {
        
                public users : Array<User>;
                public countries : Array<Country>;
        
                public static $inject = [
                    'UserService',
                    'ParameterService',
                    'LoadingIndicatorService'
                ];
        
                constructor(private userSerivce : UserService,
                            private parameterService : ParameterService) {
                            
                     this.userService.getList().then((users : Array<User>) => {
                        this.users = users;
                     });
                     
                     this.parameterService.getSupportedCountries().then((countries : Array<Country>) => {
                        this.countries = countries;
                     });
                }
        }
        
This will result in the controller and the "userlist"-page being loaded before all resources are available. The user will already see
the template and the list will populate as soon as the requests for loading the users will complete. This results in a slightly more 
snappy user experience, since the user will already see something and usually the first page of users loads sufficiently fast, to display
them right after the page got rendered in the browser.

There is a slight problem though: On our page we have an inline form to create new users and as a property for new users, a country has to
be chosen. Since the supported countries are also being loaded when initializing the controller, the select-element might not be populated
when the users whats to interact with it.

Pros:

 - We can already show the user something before all resources have been loaded
 - We can load more important things first and load the rest later

Cons:

 - Some element might not be operational without the needed resources
 - The user might run into problems, when interacting with the incomplete page

###Your solution?
At this point I want your opinion on the matter! Tell us how you implement your applications and what you do, to provide a snappy user experience.



Main picture by [John Fowler](https://www.flickr.com/photos/snowpeak/).
