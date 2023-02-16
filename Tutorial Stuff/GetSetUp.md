# Getting Set Up

## MySQL
1. Install MySQL using the [MySQL Installer](https://dev.mysql.com/downloads/installer/). That link will work for windwos, but tbh I couldn't find an easy way to install it on Mac, so good luck Aracelli :)
2. Run the installer, and make sure it installs MySQL Workbench.
3. When everything is installed and configured, open MySQL workbench.
4. Go to `File > New Model`
5. Double click the thing that says "myDb" and rename it to "tricksOfTheTrade"
6. `File > Save Model`
7. `Database > Forward Engineer` this will create a new schema from the model.
8. At the bottom of the `Navigator` pane, click on `Schemas`. 
9. Double click tricksOfTheTrade. You should see the information page at the bottom left update to say "Schema: tricksofthetrade"
10. `File > Open SQL Script` and open `createTables.sql` and `insertTestData.sql` from `/SQL`

## Project
1. create a file called `.env` and store it in the root directory. This file will be used to assign environment variables.
2. in `.env` add the following
   ```js
    NODE_ENV='production'
    DATABASE_NAME='tricksOfTheTrade'
    DATABASE_HOST='localhost'
    DATABASE_USERNAME='root'
    DATABASE_PASSWORD='yourRootPassword'
   ```
   Where `'yourRootPassword'` is replaced by the password you created when setting up
3. `npm run start-local`. This will install all dependencies, create a build, and then open it in the browser. The installation process can take several minutes to complete.
4. If you get an error `Client does not support authentication protocol requested by server; consider upgrading MySQL client` then [use this simple fix.](https://stackoverflow.com/a/50131831)
5. When you want to shut down the server you must type `ctrl + c` then `y` then `enter` in the terminal to confirm you want to shut it down.
6. I recommend looking at `FileStructure.md`, followed by `TypeScript.md`, then finally `ReactTutorial.md`
7. You should also do some digging around in the code. Noteworthy files include `src/server/server.ts` to see how the server starts, `package.json` to see what scripts you have access to in the command line, `src/server/routes.ts` to see how requests are handled. If you know anything about react, then `client/routes/other` should illustrate how you can make an http request to gather data from the server.