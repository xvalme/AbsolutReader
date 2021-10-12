
var RNFS = require('react-native-fs');
import {
    showMessage}
  from "react-native-flash-message";
  import FlashMessage from "react-native-flash-message";


export function load_first_time () {

    //Function to load when the user makes the 1st lauch of the app
    //Function checks if app already ran and, if not, creates the needed files.
    //Can also be used to create new files after an update

    //Checking if library file exists:
    var run = await RNFS.exists(this.path + '/library.json');

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
        await this.requestStoragePermission();

        //Chaimager
        await RNFS.mkdir(this.path + '/chaimager_files/');

        //Chaimager edited pdfs
        await RNFS.mkdir(this.path + '/edited_pdfs/');

        //Library:
        await RNFS.writeFile(this.path + '/library.json', '{"books": []}', 'utf8');

        //Info file:
        await RNFS.writeFile(this.path + 'info.json', '');

    }

    else {

        //Does nothing, since app already is working.

        return 0;

    }

}