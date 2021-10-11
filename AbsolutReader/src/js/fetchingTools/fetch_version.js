export function fetch_version (current_version) {

    //Function that fetches the information from the server and
    //retrives if there is a new version.

    try{
        const response = await fetch('https://absolutreader.works/current_version.json');
  
        const data = await response.json();
  
        if (data.version == current_version) {
          //App is updated
          return 0;
        }
  
        else {
  
          return data.version;
  
        }
  
      }
      catch{
        console.log("Connection to server failed.");
        //Connection error
        return 0;
      }


}