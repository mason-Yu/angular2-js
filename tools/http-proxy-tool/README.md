README for http-proxy-tool
==========================

http-proxy-tool is provided for two different purposes:
1) As a development tool, you can use it to support mock data while testing your plugin in vSphere Client. 
2) As production code, you can integrate it with your plugin where it will serve as a proxy for accessing 
back-end REST APIs. Because it is a servlet running in the Virgo server it will avoid CORS problems.

http-proxy-tool is based on Mitre's proxy servlet [https://github.com/mitre/HTTP-Proxy-Servlet].
A pre-built verison of the servlet is provided for convenience in plugins/http-proxy-servlet.jar.
See the last section "Rebuilding http-proxy-servlet.jar" if you need to rebuild it.

#### Installation as a mock-data proxy (development tool)

- Copy the folder http-proxy-tool-plugin to your local $VSPHERE_SDK_HOME/vsphere-ui/plugin-packages
- Restart the Virgo server.

Once http-proxy-tool-plugin is deployed, all HTTP requests to https://localhost:9443/httpproxy 
are redirected to http://localhost:3000 where json-server is serving mock data.
You can change that configuration in web.xml inside http-proxy-tool.war.

For more details, see the plugin-seed documentation "Using mock data in plugin mode".

#### Installation as a REST API proxy (production tool)

- Copy http-proxy-servlet.jar from http-proxy-tool-plugin/plugins/ to your myplugin-ui/tools folder.
- In myplugin-ui/src/webapp/WEB-INF/web-with-proxy.xml, change http://localhost:3000 to the targetUri
  for your REST APIs (*)
- Go to myplugin-ui/tools and run build-plugin-proxy-package.[sh, bat]
  => This builds a plugin package containing 2 bundles: myplugin-ui.war and http-proxy-servlet.jar
- Restart the Virgo server.

All HTTP requests sent by the plugin UI code are now proxied to the targetUri defined in web.xml.

For instance, you can verify that the Echo Service page works in Plugin mode when using the default web.xml (*):
- Each click on the Hello button shows this request in the browser Network console:
   https://localhost:9443/ui/myplugin/rest/services/echo
- It is proxied to this URL and hits the json-server echo API:
   http://localhost:3000/services/echo

On the other hand, the Chassis and the Host data requests fail with 404 because the json-server is not configured to handle those API calls in Plugin mode.

(*) Default web-with-proxy.xml configuration where you need to change the targetUri value:
(it is renamed web.xml by the script build-plugin-proxy-package)
````
   <servlet>
      <servlet-name>httpproxyservlet</servlet-name>
      <servlet-class>org.mitre.dsmiley.httpproxy.ProxyServlet</servlet-class>
      <init-param>
         <param-name>targetUri</param-name>
         <param-value>http://localhost:3000</param-value>
      </init-param>
      ...
   </servlet>
   <servlet-mapping>
      <servlet-name>httpproxyservlet</servlet-name>
      <url-pattern>/rest/*</url-pattern>
   </servlet-mapping>
````

For more details on using http-proxy-tool in your plugin production version, 
see the plugin-seed documentation "Integrating http-proxy-servlet to access back-end REST APIs".


#### Rebuilding http-proxy-servlet.jar

If you want to rebuild http-proxy-servlet.jar yourself, follow these steps:

- Download the source from https://github.com/mitre/HTTP-Proxy-Servlet
- Follow the instructions to build the servlet
- Rename it http-proxy-servlet.jar and copy it to plugins/http-proxy-servlet.jar
- Replace MANIFEST.MF in http-proxy-servlet.jar with the one provided here





   