// Application level constants can be kept here
export interface AppConfig {
   getMockDataUrl: any;

   pluginName: string;
   bundleName: string;
   packageName: string;
   version: string;

   hostProperties: string[];
   chassisProperties: string[]; // [removable-chassis-line]
}

export const APP_CONFIG: AppConfig = {
   // Mock data URL used by data services and i18n.service
   // => json-server url in dev mode and httpproxy to redirect to json-server in plugin mode
   getMockDataUrl: function(pluginMode: boolean) {
      return pluginMode ?  "https://localhost:9443/httpproxy" :
                           "http://localhost:3000";
   },

   // Names used during the plugin generation:
   // - You can change these values at a later time and they will be used by all .ts and .html code.
   // - However a manual update will be required for webapp/plugin.xml, locales/*.properties and MANIFEST.MF
   pluginName: "蜗牛旅行",
   bundleName: "snails_travel",
   packageName: "snails_travel",

   // Version number displayed in the top right corner of the app-header component.
   // Initially it is the version of plugin-seed itself, you may change it to your own plugin version.
   version: "1.0",

   // List of properties for the Host monitor view
   hostProperties: ["name", "overallStatus", "hardware.systemInfo.model", "vm"],

   // Chassis properties used in various views   [removable-chassis-code]
   chassisProperties: ["name", "dimensions", "serverType"]
   // [end-chassis-code]
};
