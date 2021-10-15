var RNFS = require('react-native-fs');
import {showMessage} from "react-native-flash-message";
import { requestStoragePermission } from "./get_permissions";
import {BackHandler} from 'react-native'

//TODO #16

export async function load_first_time (path) {
    //path being the one from this.path

    //Function to load when the user makes the 1st lauch of the app
    //Checks if app already ran and, if not, creates the needed files.
    //Can also be used to create new files after an update

    //Checking if library file exists:
    var run = await RNFS.exists(path + '/library.json');

    if (run == false) {
        //First run
        
        //Showing tip:
        showMessage(

              {
                  message: "TIP: Slash your finger to the right to access the menu.",
                  type: "warning",
                  durantion: 20000,
                  floating: true,
                  icon: "auto",


              }
          )

        //Creating the chaimager dir

        console.log('1st run. Creating necessary files.');

        //Permissions
        const storage_acess = await requestStoragePermission();

        if (!storage_acess) {
            //User denied storage acess, so app will close

            BackHandler.exitApp();

            return 0;
        }

        //Chaimager
        await RNFS.mkdir(path + '/chaimager_files/');

        //Chaimager edited pdfs
        await RNFS.mkdir(path + '/edited_pdfs/');

        //Library:
        await RNFS.writeFile(path + '/library.json', '{"books": []}', 'utf8');

        //Info file:
        await RNFS.writeFile(path + 'info.json', '');

        return 0;

    }

    else {

        //Does nothing, since app already is working.

        return 0;

    }

}