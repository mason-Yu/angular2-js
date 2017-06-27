Generated Plugin
================
This generated plugin uses a new tech stack and development process:
- Angular 2, see https://angular.io/
- Typescript, see https://www.typescriptlang.org/docs/tutorial.html
- VMware Clarity, see https://vmware.github.io/clarity/
- Angular-CLI, see https://github.com/angular/angular-cli


Getting started
---------------
#### Installation
*Prerequisites*: 
- Install vSphere Client SDK 6.5, or latest SDK Fling version (https://labs.vmware.com/flings/vsphere-html5-web-client)
- Install node.js version 6.9 or higher (https://nodejs.org/en/)
- Install Angular-CLI by following [these instructions](https://github.com/angular/angular-cli#installation).
- Install [json-server](https://github.com/typicode/json-server) globally with `npm install -g json-server`

```bash
# install the project's dependencies
npm install

# start json-server to get mock data and load local message bundles
npm run json-server

# run the plugin in dev mode and watches your files for live-reload
ng serve

# use `npm start` to run on port 4201 and to use the proxy server which enables Live Data mode
# Go to http://localhost:4201/main
npm start
```

#### Standalone dev mode - test and build

```bash
# running unit tests
ng test

# running unit tests with coverage => output in coverage/index.html
ng test --code-coverage

# running e2e tests
ng e2e

# dev build
ng build

# prod build
ng build --prod
```

#### Plugin mode - build and deploy
```bash
cd tools
# Build the plugin package with service .jar and UI .war bundles
./build-plugin-package.sh (or .bat)

# Copy directory target/myplugin to your local vSphere Client setup and restart Virgo
cp target/myplugin $VSPHERE_CLIENT_SDK/vsphere-ui/plugin-packages
$VSPHERE_CLIENT_SDK/vsphere-ui/server/bin/startup.[sh,bat]
```

#### Using Angular-CLI

See full doc at https://github.com/angular/angular-cli

```bash
# Linting code
ng lint

# generating a new component
ng g component my-new-component

# generating a new directive
ng g directive my-new-directive

# to learn more about Angular-CLI commands and their usages
ng help
```

#### Directory structure summary (see doc for full details)
```
.
├── coverage      <- output coverage directory, see index.html
├── dist          <- output build directory
├── e2e           <- end-to-end tests using protractor     
├── node_modules  <- node modules repository (used only in dev mode)
├── src
│   ├── app
│   │   └── services    <- services specific to the plugin (data, navigation)
│   │       └── chassis          <- chassis specific services
│   │       
│   │   └── shared               <- common utilities that are not plugin-specific
│   │       └── dev              <- common utilities used only in dev mode (see doc for details)
│   │    
│   │       └── app-alert.component.ts <- displays info and alerts at the top
│   │       └── app-config.ts          <- app level constants
│   │       └── appErrorHandler.ts     <- centralized error handling
│   │       └── globals.service.ts     <- globals to handle dev mode
│   │       └── i18n.service.ts        <- i18n support
│   │       └── refresh.service.ts     <- simple refresh service using Observable
│   │       └── util.service.ts        <- various utilities
│   │       └── vSphereClientSdkTypes.ts  <- Interface for WebPlatform API
│   │    
│   │   └── testing              <- test stubs
│   │    
│   │   └── views
│   │       └── <component> ...        <- each view is an Ng2 component
│   │          └── index.ts                        <- barrel index
│   │          └── <component>.component.html      <- UI template
│   │          └── <component>.component.sccs      <- component styles
│   │          └── <component>.component.spec.ts   <- unit tests
│   │          └── <component>.component.ts        <- Typescript code
│   │   └── app.component.html         <- top component
│   │   └── app.module.ts              <- main module
│   │   └── app-routing.component.ts   <- initial routing of plugin views
│   │   └── app-routing.module.ts      <- routing logic
│   ├── assets
│   ├── environments          <- Angular-CLI environment
│   ├── webapp
│   │   └── locales           <- .properties message files for i18n, .json equivalent
│   │   └── META-INF          <- MANIFEST.MF location
│   │   └── WEB-INF           <- webapp config: bundle-context.xml and web.xml
│   │   └── plugin.xml        <- plugin meta data
│   │  
│   ├── index.html
│   ├── main.ts               <- boostrap file for the angular app
│   └── styles.css            <- global styles
├── karma.conf.js             <- configuration of the test runner
├── target                    <- output dir for the plugin build
├── tools                     <- plugin build scripts and plugin-package.xml templates
├
├── angular-cli.json          <- Angular-CLI configuration
├── db.json                   <- Mock data used with json-server
├── karma.conf.js             <- configuration of the test runner
├── package.json              <- dependencies of the project
├── plugin-package.xml        <- plugin metadata, see SDK doc
├── protractor.config.js      <- e2e tests configuration
├── proxy.conf.json           <- Angular-CLI proxy configuration

```
