"use strict";

/*
 *  Gulp script with a 'watch' task to detect file changes and deploy UI code directly in Virgo
 *  Usage: 'gulp watch'
 *
 *  The target war directory is where the plugin war bundle was expanded under server/work/...
 *  It relies on these 2 env variables:
 *  - VSPHERE_SDK_HOME - as described in the SDK setup documentation
 *  - VIRGO_BASE_DIR - if the virgo server is different than the one from the VSPHERE_SDK_HOME
 */

var spawn = require('child_process').spawn;
var fs = require('fs');
var path = require('path');
var _ = require("underscore");
var walk = require('walkdir');
var gulp = require('gulp');

const PLUGIN_NAME = "__pluginName__";
const UI_BUNDLE_NAME = "__projectName-ui__";

var getVirgoWorkDeployerDir = _.memoize(_.partial(getDevServerPath, 'server/work/deployer/s/global'));
var getVirgoPickupDir = _.memoize(_.partial(getDevServerPath, 'server/pickup'));
var getServerPluginPackagesDir = _.memoize(_.partial(getDevServerPath, 'plugin-packages'));
var getServerPluginPackagesPluginsDir = _.memoize(_.partial(getDevServerPath, `plugin-packages/${PLUGIN_NAME}/plugins`));


gulp.task('watch', function() {
   const uiWarFolder = getDeployedArtifactPath(UI_BUNDLE_NAME);
   if (!uiWarFolder) {
      console.log("*** " + UI_BUNDLE_NAME + " is not deployed under " + getDevServerPath() + "! Or the server is not running");
      console.log("*** Deploy the plugin package first, then use 'gulp watch' to update UI files");
      return;
   }
   console.log("Watching for UI changes and copying files directly to folder = " + uiWarFolder);
   console.log("*** This may need to be restarted if the Virgo server is restarted ***");

   const ng = spawn('ng', ['build', '--watch', '--output-path', uiWarFolder ]);
   ng.stdout.on('data', (data) => {
      console.log(`UI build updated on ${new Date()}: \n${data}`);
   });

   gulp.watch('src/assets/**/*', function(event) {
      console.log('Detected assets changes in: ', event.path);
      gulp.src(event.path, { base: 'src'})
            .pipe(gulp.dest(uiWarFolder));
   });

   gulp.watch('src/webapp/**/*', function(event) {
      console.log('Detected webapp changes in: ', event.path);
      gulp.src(event.path, { base: 'src/webapp'})
            .pipe(gulp.dest(uiWarFolder));
   });

   gulp.watch('src/index.html', function(event) {
      console.log('Detected changes in: ', event.path);
      gulp.src(event.path, { base: 'src'})
            .pipe(gulp.dest(uiWarFolder));
   });
});


function getDevServerPath(subPath) {
   let serverPath = getDevServerPath.devServerPath;
   if (!serverPath) {
      if (process.env.VIRGO_BASE_DIR) {
         serverPath = process.env.VIRGO_BASE_DIR;
      } else if (process.env.VSPHERE_SDK_HOME) {
         serverPath = path.join(process.env.VSPHERE_SDK_HOME, 'vsphere-ui');
      }

      if (!serverPath) {
         throw `Environment variable VSPHERE_SDK_HOME is not set.
                Alternatively you may set VIRGO_BASE_DIR if the Virgo server is different than the one provided in the SDK`
      }

      if (!fs.existsSync(serverPath)) {
         throw `No path to server! '${serverPath}' does not exist`;
      }
      getDevServerPath.devServerPath = serverPath;
   }
   serverPath = path.join(serverPath, subPath || '');
   return serverPath;
}

/**
 * This function traverses the virgo deploy dir in order to find the
 * folder corresponding to the specified bundle (artifact)
 * @param artifact
 * @returns {String|null} the folder where the artifact has been deployed
 */
function getDeployedArtifactPath(artifact) {
   var result = null;
   try {
      walk.sync(getVirgoWorkDeployerDir(), { max_depth: 3 }, function(dir) {
         var warName = path.basename(dir).replace(/\.[wj]ar$/, '');
         if (artifact === warName) {
            result = dir;
         }
      });
   } catch(e) {
      console.log("*** Check that the server is running at " + getVirgoWorkDeployerDir());
   }

   return result;
}

