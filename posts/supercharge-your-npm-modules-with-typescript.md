{{{
  "title": "Supercharge your npm packages: Creating NPM packages with TypeScript",
  "tags": ["JavaScript", "TypeScript", "NPM","JS","node", "tutorial","node.js"],
  "category":"tech",
  "date": "Mon, 15 Feb 2016 20:31:35 GMT",
  "color":"blue",
  "picture":"/media/pictures/npmnodejs.jpg",
  "picturecapt":"Supercharge your npm packages!"
}}}

Since you already proved that you are an awesome developer, let's see how you can make the world a better place by shipping your npm modules with TypeScript
definitions. This will help your users and developers to write bautiful and maintainable code without worrying about the correct typings.
<!--more-->
##Making the world a better place
[DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) is an awesome repository, but it needs to die! I know this sounds harsh but bare with me,
I am not here to bash the awesome work by these guys. I just believe that in a perfect world, we should not rely on external typings but rather have the definition
files shipped in the packages we love so much and as of TypeScript 1.6 we are finally able to achieve that. This version of TypeScript introduced a new way
of resolving module names that mimics the Node.js module resolution algorithm.

This means that the compiler will try to discover typings for the module "foo" using the following set of rules:

1. Try to load the package.json from the modules folder `node_modules/foo/package.json` and if present read the path to the typings file described in
 the `"typings"` field.
    
2. Try to load a file named `index.d.ts` from the package folder.


Your typings should

* be a .d.ts file
* be an external module
* not have triple-slash references

##Using this in your module
The other day I wrote an npm package that extends Express to work as a frontend for [Mesh](http://getmesh.io). Since I wanted our customers
to write awesome and maintainable code, I decided to ship the definition files with the module. You can find the module [here](https://www.npmjs.com/package/express-mesh).

Since my module is organized in multiple files, I used an index-File to make the functionality of my module accessible by simply exporting the things
that should be publicly available.

    'use strict';
    
    export * from './lib/mesh';
    export * from './lib/meshRenderer';
    export * from './lib/meshUtil';
    export * from './lib/config';


I am then using a gulp build to compile my .ts files into javascript and place the `index.js` and `index.d.ts` files in the root of the module.

    var gulp = require('gulp');
    var ts = require('gulp-typescript');
    
    var tsProject = ts.createProject({
        declaration: true,
        noExternalResolve: true,
        module:'commonjs'
    });
    
    gulp.task('build', function() {
        var tsResult = gulp.src(['./src/**/*.ts', './devtypes/**/*.ts'])
            .pipe(ts(tsProject));
        tsResult.dts.pipe(gulp.dest('./'));
        return tsResult.js.pipe(gulp.dest('./'));
    });

##Consuming your npm module
In order to consume your npm module with typings in your application, you simply need to install it using npm `npm install express-mesh`. If you have
TypeScript 1.6 and above, your IDE should automatically pick up the typings of the installed module.

Now you can simple use the module in your application:

    import * as mesh from 'express-mesh';
    
Make sure that you use `gulp-typescript` 2.9.0 and above and enable the node module resolution in your compiler options to make use of the new module name resolution in your gulp build.

    {
      "compilerOptions": {
        "module": "commonjs",
        "target": "es5",
        "sourceMap": false,
        "moduleResolution": "node",
        "declaration": true
      }
    }

If you have any questions or suggestions, let me know in the comments below.
