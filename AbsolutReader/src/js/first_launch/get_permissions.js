import {PermissionsAndroid} from 'react-native';

export async function requestStoragePermission () {

    console.log("Asking for permissions.")

    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE, {
                title: "Read storage permission",
                message: "AbsolutReader needs to have acess  " +
                    "to your storage to load the e-books" + "The app won´t work if you don´t"
                    + "allow the loading of your files.",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
            }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            return true;
        }
        else {
            return false;
        }
    }
    catch (err) {
        console.warn(err);
    }
};