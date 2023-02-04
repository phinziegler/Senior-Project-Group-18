# File Structure

```
├───builds          // compiled .js files
│   ├───client              // compiled client .js files
│   └───server              // compiled server .js files
├───node_modules    // all the downloaded dependencies/modules
│   ├───...
│   └───...
├───public          // files that need to be sent to the client on load
├───src             // source code
│   ├───client              // client code (.ts and .tsx)
│   │   ├───components              // normal react components
│   │   ├───routes                  // route-managed react components
│   │   └───styles                  // css files       
│   ├───server              // server code (.ts)
│   │   ├───controllers             // classes that handle server requests
│   │   ├───services                // classes which handle database functionality
│   │   ├───routes.ts               // captures HTTP requests and send them to controllers
│   │   └───server.ts               // server start code
│   ├───shared              // files that are shared by both the server and the client (.ts)
│   └───index.tsx           /* A react component which the program starts running from.
│                             * Crucially, index.tsx contains the logic for front-end routing */
├───.env            // environment variables
└───package.json    // defines all dependencies, custom npm scripts, project metadata, etc...
```

NOTE: `src/server/services` does not yet exist because IDK how to set up the database yet, but it will be present later. 