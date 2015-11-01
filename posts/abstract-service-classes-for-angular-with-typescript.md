{{{
  "title": "Harnessing your superpowers: Creating abstract service classes for angular with TypeScript",
  "tags": ["JavaScript", "TypeScript", "Angular","JS","frontend", "tutorial","abstract","service","services"],
  "category":"tech",
  "date": "Sun, 01 Nov 2015 14:31:35 GMT",
  "color":"blue",
  "picture":"/media/pictures/thor.jpg",
  "picturecapt":"Harness your powers!"
}}}

You have already proven that you and your powers can withstand the harsh tests of a productive build system. The next step on your way to the most renown hero
it to learn how to harness your powers and be more effective. In this guide I will show you how to use abstract classes of typescript and create awesome service classes
for your angular application.
<!--more-->
##Next step in your hero education
In my last [post](/blog/get-your-metal-tested-test-angularjs-and-typescript-with-karma-and-jasmine) I showed you how to set up a productive test environment to ensure
the kind of quality you want your enterprise web applications to have. We at [appointmed](http://www.appointmed.com/) put a lot of effort in making our code easily
maintainable and that involves next to using TypeScript and a comprehensive coding style guide also the notion to reuse code as much as possible. This is why we use
abstract TypeScript classes for our AngularJS services.

##Getting started
The best starting point for abstract service classes is a well designed REST-API, that will provide you with the basic functionality for all your entities on their respective path.

For example:

        PATH: /patient
                GET     /patient/<id>: fetch a single patient
                GET     /patient: fetch all patients
                PUT     /patient/<id>: save a patient
                POST    /patient: create a patient
                DELETE  /patient/<id>: remove a patient
                
All your other entities should have the same scheme, only the path should differ.


###Avbstract service
Let's look at a typical abstract service implementation

        
        module tutorial {
            'use strict';
            
            export class Rest {
                public static API_BASE_PATH : string = '/api/v1';
            }
            
            export class Entity {
                id : number;
            }
        
            export class AbstractService<T extends Entity> {
        
                constructor(public $http : ng.IHttpService) {
                }
        
                public getEntityPath() : string {
                    throw  'YOU SHOULD NOT USE THE ABSTRACT SERVICE DIRECTLY';
                    return 'NOT IMPLEMENTED';
                }
                
                private getUrl() : string {
                    return Rest.API_BASE_PATH + this.getEntityPath();
                }
        
                public get(id : number) : ng.IPromise<T> {
                    return this.$http.get(this.getUrl() + '/' + id);
                }
        
                public getList() : ng.IPromise<Array<T>> {
                     return this.$http.get(this.getUrl());
                }
        
                public create(item : T) : ng.IPromise<T> {
                    return this.$http.post(this.getUrl(), item);
                }
        
                public save(item : T) : ng.IPromise<T> {
                    if (!angular.isDefined(item.id)) {
                        return this.create(item);
                    } else {
                        return this.$http.put(this.getUrl() + '/' + item.id, item);
                    }
                }
        
                public delete(item : T) : ng.IPromise<string> {
                    return this.$http.delete(this.getUrl() + '/' + item.id, item)
                        .then((response : any)=>{
                            return response.message ? response.message : item.id;
                        });
                }
            }
        }


This is how a basic implementation of an abstract service could look like. This provides you with a single point of contact where you can implement methods to use in all your services.

###Using the abstract class

Lets look at how to use this abstract class to create our patient service:


        module tutorial {
                    'use strict';
                    
                    export class Patient extends Entity {
                        firstName : string;
                        lastName : string;
                        ssn : number;
                    }
                
                    export class PatientSerivce extends AbstractService<Patient> {
                
                        public static $inject = [
                            '$http'
                        ];
                
                        constructor(public $http : ng.IHttpService) {
                            super($http);
                        }
                
                        public getEntityPath() : string {
                            return '/patient';
                        }
                    }
                }
                
Be sure to inject the $http service into your service and pass it on to the constructor of the abstract class. You then can go ahead and override the method to specify the entity path.

If you have any questions on how to use or implement abstract classes, let me know in the comments below.
