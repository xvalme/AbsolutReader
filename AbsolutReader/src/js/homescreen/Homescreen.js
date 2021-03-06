import React, {
  Component
}
from 'react';
import {
  Layout,
  Divider,
  Button,
  TopNavigation,
  Icon,
  Text,
  TopNavigationAction,
  List,
  Card,
  TabView,
  Tab,
}
from '@ui-kitten/components';
import {
  Image,
  SafeAreaView,
  Dimensions,
  View,
  PermissionsAndroid,
  Modal,
  Linking
}
from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import {
  pdf_pagenumber_getter
}
from '../pdf_tools/pdf_info_getter';
import Pdf from 'react-native-pdf'; //Rendering
import {
  showMessage}
from "react-native-flash-message";

import {
  pdfjsWorker
}
from "pdfjs-dist/legacy/build/pdf.worker.entry";
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'; //Getting coordinates of text in pdf
import {
  encodeToBase64,
  PDFDocument,
  PDFName,
  PDFString,
  PDFArray,
  rgb}
from "pdf-lib"; //Adding links
import * as Progress from 'react-native-progress';

var RNFS = require('react-native-fs');
var base64js = require('base64-js')

export default class Homescreen extends Component {

  constructor(props) {
      super(props);

      var app_package = require('../../../package.json');
      this.version = app_package["version"];

      this.path = RNFS.DocumentDirectoryPath; //Main path of app

      this.state = {
          top_index: 0,
          drawer_index: 0,
          library_forge_color: "#ffe9b3",
          library: [],
          chaimager_list: [],
          library_loaded: false,
          //Editing the library:
          edit_modal_visible: false,
          edit_modal_info: {},
          //Info about chaimager
          chaimager_info_modal_information: {},
          chaimager_info_modal_visible: false,
          welcome_modal_visible: true,
          first_time_book_opened: false,
          //Forge:
          forge_chaimager_modal: false,
          forge_library_modal: false,
          forge_selected_book: {},
          forge_selected_chaimager: {},
          forge_progress: 0,
      }

  }

  async load_welcome_page() {
      //Gets the info from the website

      try {
          var response = await fetch('https://absolutreader.works/api/welcome_page.json');

          var json = await response.json();
      }

      catch { //No internet connection or server error.

          var json = {
              title: "Welcome back",
              text: "Consider making a donation"
          }
      }

      this.setState((state) => {
          return {
              welcome_page: json
          }
      });


  }
  //Loading a new file
  load_file = async() => {
      console.log("User is adding a new book");
      var file = await this.file_selector();

      if (file == 0) {
      
         return 0;

	}
	
      var filepath = file[0];
      var filename = file[1];

      //Adding file to the library:
      this.add_pdf_to_library(filepath, filename);
  };

  create_chaimager = async(name) => {
      //Creates a new chaimager file to be added to the PDF
      //Moves to the adder screen

      //Making modal invisible:
      this.setState((state) => {
          return {
              chaimager_list_modal_visible: false,
              chaimager_info_modal_visible: false
          };
      });


      this.props.navigation.navigate('Chaimager_adder', {
          name: name
      });
  }

  delete_chaimager = async(name) => {

      var path = this.path + '/chaimager_files/' + name + '.json';

      await RNFS.unlink(path);

      //Reloading library:

      this.setState(() => {
          return {
              library_loaded: false,
              edit_modal_visible: false,
              chaimager_info_modal_visible: false,
          }
      })

  }

  forge_chaimager = async (selected_book, chaimager_file) => {

      //Runs if user ask to merge a skin with a pdf. Saves the pdf in the end in a folder
      //So that when user returns to it he does not have to wait.

      await this.setState(() => {return {forge_progress: 0}}, 
      );

      console.log("[MERGER] Starting merger.");

      //Checks 1st if files exist:
      try{
      try {
          var filepath = selected_book.source.uri;
          var chaimager_json = chaimager_file.chaimager;
      }

      catch {
          console.log("One of the files is missing.");

          showMessage({
              message: "You did not select a Book and a Chaimager file to merge!",
              type: "danger",
              durantion: 3000,
              floating: true,
              icon: "auto",
          });

          return 0;

      }

      //Opening files
      try {
      //Opening file first:
      var base64_pdf = await RNFS.readFile(filepath, 'base64');

      var pdfDoc = base64js.toByteArray(base64_pdf); //PDF as byte array so pdf.js library can understand it }
      }
      catch {
        //corrupted error
        console.log("[MERGER] Can´t open files.")


        showMessage({
          message: "Can´t open your files. Probably one of them is corrupted.",
          type: "danger",
          durantion: 3000,
          floating: true,
          icon: "auto",
      });

        return 0;
      }

      console.log("[MERGER] Files opened.");

      this.setState(() => {return {forge_progress: 0.05}}, 
      );

      //Getting a list of cords of where to add the hyperlinks
      async function get_pdf_coordinates(pdfDoc, keywords) {

          /*Given a file (Already opened by fs), it uses Pdfjs library to get the coordinates of the keywords
          that exist in every single page, and returns an array of dictionarys with the coords and pages
          for the link adder.
          */

          pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker; //Setting stuff for running the pdfjs library

          var coords_array = [];

          const loadingTask = pdfjsLib.getDocument({
              data: pdfDoc
          }); //Conversts base64 to something pdfjs understands

          const doc = await loadingTask.promise;

          var numPages = doc.numPages;

          for (let i = 1; i <= numPages; i++) {

            try{

              var page = await doc.getPage(i);

              var content = await page.getTextContent();

              var items = (content["items"]);

              for (let p = 0; p < items.length; p++) {

                  for (let z = 0; z < keywords.ids.length; z++) {

                      if (items[p]["str"].includes(keywords.ids[z].name)) {

                          var transform = items[p]["transform"];
                          var width = items[p]["width"];
                          var height = items[p]["height"];
                          var text = items[p]["str"];

                          var coords = calculate_coords(i, transform, width, height, text, keywords.ids[z].name, keywords.ids[z].color);
                          //sends back the page, transform with the x and y elements, size, the complete sentence and the keywords we want in a array.

                          for (const v of coords) {
                              coords_array.push(v);
                          };
                      }


                  }
              }
            }
              catch {
                  //Probably page has some element that was not recognized by th pdf js library. We just keep going on the other ones, without stopping.
              }

          };

          return coords_array;
      }

      try {
      var array_coordinate_dic = await get_pdf_coordinates(pdfDoc, chaimager_json); 
      }
      catch {
        //corrupted error
        console.log("[MERGER] Error while getting the cords to be edited.")


        showMessage({
          message: "Unkown error. If this keep happening, please submit this bug to our Github page. Thanks!",
          type: "danger",
          durantion: 5000,
          floating: true,
          icon: "auto",
      });

        return 0;
      }

      console.log("[MERGER] Coordinate array gotten, with this number of elements: " + array_coordinate_dic.length);
      await this.setState(() => {return {forge_progress: 0.45}}, 
      );

      //Now making the links, using the array of dictionaries:
      async function make_links(pdfDoc, array_coordinate_dic) {

          if (array_coordinate_dic != 0) { //In case it is empty it will jump out this phase

            console.log("Building links.");

            //Opening file
              var pdfDoc = await PDFDocument.load(pdfDoc, {
                  ignoreEncryption: true
              });
              //TODO #5
              const pages = await pdfDoc.getPages();

              for (let i = 0; i < array_coordinate_dic.length; i++) {

                  try {

                  var rgb_color = hexToRgb(array_coordinate_dic[i].color);

                  var page_number = array_coordinate_dic[i]["page"];

                  var page = pages[page_number - 1]; //Loading page from the index

                  const coordinate_dic = array_coordinate_dic[i];

                  //Drawing rectangle of the link
                  page.drawRectangle({
                      x: coordinate_dic["x"],
                      y: coordinate_dic["y"],
                      width: coordinate_dic["right_x"] - coordinate_dic["x"],
                      height: coordinate_dic["right_y"] - coordinate_dic["y"],
                      color: rgb(rgb_color.r / 255, rgb_color.g / 255, rgb_color.b / 255),
                      opacity: 0.5,
                  });

                  var linkAnnotation = pdfDoc.context.obj({
                      //Link adding information comes here
                      Type: 'Annot',
                      Subtype: 'Link',
                      Rect: [coordinate_dic["x"], coordinate_dic["y"], coordinate_dic["right_x"], coordinate_dic["right_y"]],

                      Border: [0, 0, 0],
                      C: [0, 0, 1],
                      A: {
                          Type: 'Action',
                          S: 'URI',
                          URI: PDFString.of('https://absolutreader.works/chaimager/[' + coordinate_dic.keywords + ']'), //It does not add if is not a valid url
                      },
                  });

                  var linkAnnotationRef = pdfDoc.context.register(linkAnnotation);

                  const annots = page.node.lookupMaybe(PDFName.of('Annots'), PDFArray);

                  if (annots) { //IF there are already annotations we just add a new one

                      annots.push(linkAnnotationRef);
                  }

                  else { //Need to create a new array of annotations
                      page.node.set(PDFName.of('Annots'), pdfDoc.context.obj([linkAnnotationRef]));
                  };

                }

                catch (e) { //Error while adding link. Keep going and ignore it.
                  console.log("Error while bulding links: " + e);
                }

              }

              const pdfBytes = await pdfDoc.save();

              return encodeToBase64(pdfBytes);
          }

          else { //Speeding up. use already given value
              return (base64_pdf);
          }
      }

      var base64_pdf = await make_links(pdfDoc, array_coordinate_dic);

      console.log("[MERGER] Links built.");

      function hexToRgb(hex) {
          var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16)
          } : null;
      }

      function calculate_coords(page, transform, width, height, text, keywords, color) {

          //Size (x coordinate system) of each letter
          var len_of_charachter = width / text.length;

          //Positions of beggining of string we want
          var startIndex = 0;
          var indices = [];
          var index;
          var coords = [];

          while ((index = text.indexOf(keywords, startIndex)) > -1) {
              indices.push(index);
              startIndex = index + keywords.length;
          };

          for (const v of indices) {

              var start_position = v * len_of_charachter;

              var x = transform[4] + start_position
              var y = transform[5];

              //Postions of the ending

              var right_y = y + height;

              var right_x = x + (keywords.length * len_of_charachter);

              coords.push({
                  page: page,
                  x: x,
                  y: y,
                  right_x: right_x,
                  right_y: right_y,
                  color: color,
                  keywords: keywords
              });
          };

          return (coords);
      }
      
      await this.setState(() => {return {forge_progress: 0.95}}, 
      );

      //Now saving the file:

      var title = filepath.split('\\').pop().split('/').pop();
      var path = RNFS.DocumentDirectoryPath + '/edited_pdfs/' + title + '.pdf';

      try{
      await RNFS.writeFile(path, base64_pdf, 'base64');
      }
      catch {
        //corrupted error
        console.log("[MERGER] Can´t save PDF")


        showMessage({
          message: "Could not save the new edited file!",
          type: "danger",
          durantion: 5000,
          floating: true,
          icon: "auto",
      });

        return 0;
      }

      console.log("[MERGER] New Pdf being saved.");

      //Editing the library info to run book from new path and the skin Applied

      await this.add_pdf_to_library(path, title, true, chaimager_json);

      console.log("[MERGER] Saved");
      await this.setState(() => {return {forge_progress: 1}}, 
      );

      showMessage({
          message: "Success! Your edited book was added to your library.",
          type: "success",
          durantion: 3000,
          floating: true,
          icon: "auto",
      });
    }

    catch (e) {
      //unknown error
      console.log(e);

      showMessage({
        message: " There was an unknown error while merging your files.",
        type: "danger",
        durantion: 3000,
        floating: true,
        icon: "auto",
    });
    }
  }

  chaimager_button = async() => {
      //Handles the click of the chaimager button, showing a modal with all chaimager files that exist in the app

      this.setState((state) => {
          return {
              chaimager_list_modal_visible: true
          }
      });


  }

  file_selector = async() => {

      try {
          const res = await DocumentPicker.pick({
              type: [DocumentPicker.types.pdf],
              copyTo: "documentDirectory",
          });

          var pdf_path = res.fileCopyUri;
          var name = res.name;
          //Reading imagefile after we have the path

          return [pdf_path, name];

      }
      catch (err) {

          console.log(err);
          return 0;
      }
  }

  add_pdf_to_library = async(filepath, filename, forged = false, chaimager = {}) => {
      //Gets information about pdf and adds it to the database
      //Picks up the title, pages, and thumbnail
      console.log("Saving new book to library");

      try{

      var title = filename.split('.').slice(0, -1).join('.');

      console.log("Saving book with the title" + title);

      var pagenumber = await pdf_pagenumber_getter(filepath);

      var source = {
          uri: filepath,
          cache: true
      };

      var info = {
          title: title,
          pages: pagenumber,
          current_page: 1,
          source: source,
          times_opened: 0,
          forged: forged,
          chaimager: chaimager
      };

      var new_library = this.state.library;

      new_library.push(info);

      this.setState((state) => {
          return {
              library: new_library
          };
      });


      //Now saving it to the json

      const path = RNFS.DocumentDirectoryPath; //Main path of the App

      const library_json = path + '/library.json';

      var saving_object = {
          "books": new_library
      };
      var saving_string = JSON.stringify(saving_object)

      await RNFS.unlink(library_json);
      await RNFS.writeFile(library_json, saving_string, 'utf8');

      console.log("Added book to library");

      showMessage({
        message: "Success! Your book was added to your library.",
        type: "success",
        durantion: 3000,
        floating: true,
        icon: "auto",
    });

    }

    catch {
      
      console.log("Error while adding nw book to library")

      showMessage({
        message: "There was an error while adding your boo to the library.",
        type: "danger",
        durantion: 5000,
        floating: true,
        icon: "auto",
    });

      return 0;
    }

  }

  remove_pdf_from_library = async() => {
      //Deletes pdf from library but the chaimager file will persist.

      var info = this.state.edit_modal_info;

      var library = this.state.library;

      for (let i = 0; i < library.length; i++) {
          //Locating book in library list
          if (library[i].source == info.source) {

              var index = i;

              library.splice(index, 1);

              {
                  this.setState((state) => {
                      return {
                          edit_modal_visible: false
                      };
                  });
              }

              //Now editing the .json file to save the changes:

              const path = RNFS.DocumentDirectoryPath; //Main path of the App

              const library_json = path + '/library.json';

              var saving_object = {
                  "books": this.state.library
              };
              var saving_string = JSON.stringify(saving_object)

              await RNFS.unlink(library_json);
              await RNFS.writeFile(library_json, saving_string, 'utf8');

          }


      }
  }

  read_book = async(source, page, times_opened, forged, chaimager) => {
      var filepath = source.uri;

      //Updating number of times book was opened:
      //TODO #11

      //Checks if is 1st time loading: 
      //TODO #9

      this.props.navigation.navigate('Pdf_renderer', {
          filepath: filepath,
          current_page: page,
          forged: forged,
          chaimager: chaimager
      });

  }

  requestStoragePermission = async() => {
      console.log("Asking for permissions.")
      try {
          const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE, {
                  title: "Read storage permission",
                  message: "AbsolutReader needs to have acess  " +
                      "to your storage to load the e-books",
                  buttonNeutral: "Ask me later",
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

  load_first_time = async() => {

      //Function to load when the user makes the 1st lauch of the app

      //Picks information about the user and saves it, to then send to server if user accepts
      //TODO #8

      //Checking if information file exists:

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

          console.log('This is the 1st run. Creating necessary files.');

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

          this.load_library();
      }

      else {

          //Just loads everything because is not 1st launch.
          this.load_library();

      }

  }

  async load_library() {
      //Will load the pdf library based on a stored json. Returns an array with the info to render

      try {
          var back = this.props.route.params["back_action"];
      }
      catch (e) {
          var back = false;
      }

      if (this.state.library_loaded == false || back == true) { //Stop from repeating itself to the eternity
          //Also loads if returns from the render

          try {
              this.props.route.params["back_action"] = false
          }
          catch {}


          const path = RNFS.DocumentDirectoryPath; //Main path of the App

          const library_json = path + '/library.json';

          var library = {
              "books": []
          } //While not loaded

          //Loading the json

          var json = await RNFS.readFile(library_json)

          var library = await JSON.parse(json);

          var library_list = [];

          for (var i = 0; i < library["books"].length; i++) {
              var title = library.books[i].title;
              var total_page = library.books[i].pages;
              var current_page = library.books[i].current_page;
              var forged = library.books[i].forged;
              var source = library.books[i].source;
              var times_opened = library.books[i].times_opened;
              var chaimager = library.books[i].chaimager;

              library_list.push({
                  title: title,
                  pages: total_page,
                  current_page: current_page,
                  source: source,
                  times_opened: times_opened,
                  forged: forged,
                  chaimager: chaimager
              });
          };
          console.log("Library found with " + library_list.length + ' elements.');

          //Loading library to state

          //Loading chaimager
          console.log("Loading chaimager list");

          const chaimager_dir = path + '/chaimager_files/';

          var files = await RNFS.readDir(chaimager_dir);

          var chaimager_list = []; //Variable to then update with the values

          for (const file of files) {

              var name = file.name;

              //Checking if is json:

              if (name.includes('.json')) {

                  //Opening file and getting all the information:

                  var file_info = await RNFS.readFile(file.path);

                  //Now converting to json
                  var json = await JSON.parse(file_info);

                  //Information:

                  var filename = json.filename;
                  var chaimager = json.chaimager;
                  var creator = json.creator;
                  var thumbnail = json.thumbnail;
                  var reccomended_book = json.reccomended_book;
                  var volume = json.volume;

                  //Appends information:

                  chaimager_list.push({
                      chaimager: chaimager,
                      filename: filename,
                      creator: creator,
                      thumbnail: thumbnail,
                      reccomended_book: reccomended_book,
                      volume: volume
                  });

              }

          };

          this.setState((state) => {
              return {
                  library: library_list,
                  library_loaded: true,
                  chaimager_list: chaimager_list
              };
          });

          //this.props.route.params["back_action"] = false; //So that it does not repeat itself to the end of the universe

          return library_list;
      }
  }

  async get_updates() {
      //Checks if there are new versions from the server.

      try{
        const response = await fetch('https://absolutreader.works/current_version.json');

        const data = await response.json();

        console.log(data);

        if (data.version == this.version) {
          //App is updated
          return 0;
        }

        else {

          //Warning the user the version is older

          showMessage({
            message: "AbsolutReader is outdated! Download it now to use the newest version with new features and bug corrections.",
            type: "danger",
            durantion: 10000,
            floating: true,
            icon: "auto",
        });

        }

      }
      catch{
        console.log("Connection to server failed.")
        //Connection error
        return 0
      }



  }

  toggle_menu() {
    console.log("Toggling menu.");
    this.props.navigation.toggleDrawer();
  }

  render() {
  this.load_first_time(); //Loading everything. library and chaimager.

  //Icons and images:
  const render_top_logo = () => (
    <Image source={require('./../assets/images/logo.png')} style={{
      width: Dimensions.get('window').height/12*0.7,
    height: Dimensions.get('window').height/12*0.7,
      }} />
    );

  const BugIcon = (props) => (
    <Icon {...props} name='alert-triangle-outline' />
  );

  const DropDownIcon = (props) => (
    <Icon {...props} name='more-vertical-outline'/>
  )

  const CloseIcon = (props) => (
    <Icon {...props} name='close'/>
  );

  const renderItem = (info) => (
    <Card
      status='basic'
      style= {{   width: Dimensions.get('window').width,
                  flex:1,
                  backgroundColor: info.item.forged ? this.state.library_forge_color : "#ffffff", 
                  }}
                  

      onPress={() => {this.read_book(info.item.source, info.item.current_page, info.item.times_opened, info.item.forged, info.item.chaimager)}}
      onLongPress={() => {renderDropDown(info.item)}}
      >
      
      <View style={{flexDirection: 'row', flex:1}}>

        <View style={{width:Dimensions.get('window').width / 2 * 0.8, flex:2}}>

          <Pdf
            source={info.item.source}
            style={{width:Dimensions.get('window').width / 2 * 0.7, height:Dimensions.get('window').height / 4}}
            fitPolicy={0}
            onError={() => {}}
            singlePage={true}
            onError={() => {}}
            
          />
        </View>

          <View style={{flex:3}}>

            <View style={{marginLeft:Dimensions.get('window').width / 50}}>

             <View style={{flexDirection: "row-reverse",}}>

                <Button 
                appearance="ghost"
                onPress={() => {renderDropDown(info.item)}}
                accessoryLeft={DropDownIcon}
                size="medium" />

                </View>

                  <Text>
                      {info.item.title}
                    </Text>

                    <Text>Chaimager merged: {info.item.forged ? "True" : "False"} </Text>

                    <Text>
                              {info.item.current_page} / {info.item.pages} Pages
                    </Text>

                </View>

          </View>

      </View>
    </Card>
  );

  const forge_renderItem = (info) => (
    <Card
      status='basic'
      onPress={() => {this.setState((state) => {return {
        forge_selected_book: info.item,
        forge_library_modal: false}
                                            ;}
                                );
                  }
          }
      style= {{ 
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: 1,}}
      >
      
      <View style={{alignItems: "center"}}>

          <Pdf
            source={info.item.source}
            style={{width:Dimensions.get('window').width / 2 * 0.8, height:Dimensions.get('window').height / 4}}
            fitPolicy={1}
            singlePage={true}
            
          />

          <Text style={{textAlign: "center"}}>{info.item.title}</Text>
          <Text style={{textAlign: "center"}}>Already forged: {info.item.forged ? "True" : "False"} </Text>
        </View>
    </Card>
  );

  const renderChaimagerItem = (info) => (
    <Card
      status='basic'
      style= {{  width:Dimensions.get('window').width,
                  margin: 1,}}
      
      onPress = {() => {this.setState(() => {return {
        chaimager_info_modal_visible: true,
        chaimager_info_modal_information: info.item,
      }})}}
      >
        <View style = {{flexDirection:'row', flex:1}}>

          <View>

            <Image source={{uri: info.item.thumbnail}}  
            style={{
              width: Dimensions.get('window').width / 4,
              height: Dimensions.get('window').width / 4}}/>

          </View>

          <View style={{flex: 4}}>
              <Text style={{marginLeft: Dimensions.get('window').width / 50}}>
                {info.item.filename}
              </Text>
              <Text style={{marginLeft: Dimensions.get('window').width / 50}}>
                Created by: {info.item.creator}
              </Text>
          </View>

          <View style={{ flexDirection: "row-reverse"}}>
              <Button  style={{height:  Dimensions.get('window').width / 8}} size='small'  onPress={() => {this.setState(() => {return {
                chaimager_info_modal_visible: true,
                chaimager_info_modal_information: info.item,
              }})}}>More...</Button>
          </View>

        </View>

      </Card>
  );

  const forge_renderChaimagerItem = (info) => (
    <Card
      status='basic'
      onPress={() => {this.setState((state) => {return {
            forge_selected_chaimager: info.item,
            forge_chaimager_modal: false,}
                                                ;}
                                    );
                      }
              }
      
      >
          <View style={{alignItems:"center"}}>

            <Image source={{uri: info.item.thumbnail}}  
            style={{
              width: Dimensions.get('window').width / 4,
              height: Dimensions.get('window').width / 4}}/>

            <Text style={{textAlign:"center"}}>{info.item.filename}</Text>

          </View>

      </Card>
  );

  const renderDropDown = async (info) => {
    await this.setState((state) => {return {
        edit_modal_visible: true,
        edit_modal_info: info}
          ;}
    );
  };

  const renderRightActions = () => (
    <React.Fragment>
      <TopNavigationAction icon={render_top_logo} style={{alignSelf:"center"}} />
    </React.Fragment>
  );

  const MenuIcon = (props) => (
    <Icon {...props} name='menu' />
  );

  const renderLeftActions = () => (
    <React.Fragment>
      <TopNavigationAction icon={MenuIcon} style={{alignSelf:"center"}} onPress={() => {this.toggle_menu()}} />
    </React.Fragment>
  );

  if (this.state.library_loaded == false) { //Is still loading the library
    return (
      <SafeAreaView style={{ flex: 1 }}>
  
        
      <TopNavigation style={{height:Dimensions.get('window').height / 12}}
              alignment='center'
              title='Absolut Reader'
              subtitle={'Version Beta ' + this.version}
              accessoryRight={render_top_logo}
              />
  
              <Divider />
        
        <Layout style={{flex: 1,
                        justifyContent: 'center', 
                        alignItems: 'center',}}>
  
          <View style={{flex: 9}}>
  
            <Text>
              Loading library...
            </Text>
  
          </View>
  
      </Layout>
    </SafeAreaView>
    );
  }
  else {

  return (
    <SafeAreaView style={{ flex: 1 }} >

    <TopNavigation style={{height:Dimensions.get('window').height / 12}}
                alignment='center'
                title='Absolut Reader'
                subtitle={'Version Beta ' + this.version}
                accessoryRight={renderRightActions}
                accessoryLeft={renderLeftActions}
                />

    <Modal 
			animationType="slide"
			transparent={true}
			onRequestClose={() => {this.setState((state) => {return {
                                                        edit_modal_visible: false}
                                                        ;}
                                            );
                              }
                      }
			visible={this.state.edit_modal_visible}>

			<View style = {{flex: 1,
						justifyContent: "center",
						alignItems: "center"
						}}>
			
				<View style = {{margin: 20,
								backgroundColor: "white",
								borderRadius: 20,
								padding: 35,
								alignItems: "center",
								shadowColor: "#000",
								shadowOffset: {
								width: 0,
								height: 2
								},
								shadowOpacity: 0.25,
								shadowRadius: 4,
								elevation: 5}} >

            <View style={{alignSelf: 'flex-end'}}>
              <Button accessoryLeft={CloseIcon} appearance='ghost' size='giant' status='basic'
                      onPress={() => {this.setState((state) => {return {
                        edit_modal_visible: false}
                        ;} );}} />
            </View>
					
              <Pdf
            source={this.state.edit_modal_info.source}
            style={{width:Dimensions.get('window').width / 2 * 0.8, height:Dimensions.get('window').height / 4}}
            singlePage={true}
            
          />

          <Text>{this.state.edit_modal_info.title}</Text>

          <View style={{margin:Dimensions.get('window').width/50}}>
            <Button title='Remove book from library'
            onPress={() => {this.remove_pdf_from_library()}} 
            style={{margin: 2 ,width: Dimensions.get('window').width * 0.8}}
            status='danger'>Remove book from library</Button>

          </View>

				</View>

			</View>


	</Modal>
 
    <Modal 
        animationType="slide"
        transparent={true}
        onRequestClose={() => {this.setState((state) => {return {
                                                          welcome_modal_visible: false}
                                                          ;}
                                              );
                                }
                        }
        visible={this.state.welcome_modal_visible}>

        <View style = {{flex: 1,
              justifyContent: "center",
              alignItems: "center",
              width: Dimensions.get('window').width,
              height:Dimensions.get('window').height,
              backgroundColor:"white"
              }}>
        

          
            <View>
            <Image style={{width: Dimensions.get('window').height / 5,
                        height: Dimensions.get('window').height / 5,
                        alignSelf: "center"}} 
        source={require('./../assets/images/logo.png')} />

                <Text style={{textAlign:'center', fontWeight:"bold", fontSize: Dimensions.get('window').height / 30 }}>AbsolutReader</Text>

                <Text style={{textAlign:'center',
              margin: Dimensions.get('window').height / 30,
              fontSize: Dimensions.get('window').height / 40 }}>
                Thanks for being using our app. If you are liking it, consider making a donation.</Text>

                <Text style={{textAlign:'center', fontSize: Dimensions.get('window').height / 45 }}>
                  Everyone hates ads. A donation helps us keep developing without them.</Text>

                <Text style={{textAlign:'center', fontSize: Dimensions.get('window').height / 45, marginBottom: Dimensions.get('window').height / 30,}}>Thanks!</Text>

                <View style={{flexDirection: "row", justifyContent:"center"}}>
                
                  <Button status="success"
                          onPress={() => {try{
                            Linking.openURL('https://ko-fi.com/absolutreader');
                            }
                            catch{
                                showMessage({
                                    message: "Link opening has failed. Check your internet connection or try again later.",
                                    type: "danger",
                                    durantion: 5000,
                                    floating: true,
                                    icon: "auto",
                                });
                            }}} style={{margin:10}}> Donate </Button>
                  
                  <Button accessoryLeft={CloseIcon} appearance='outline' style={{margin:10}} status='danger'
                          onPress={() => {this.get_updates(); //Checks for updates and notifies the user.;
                             this.setState((state) => {return {
                            welcome_modal_visible: false}
                            ;} );}} > Close </Button>

                </View>

          </View>

        </View>


    </Modal>
  
    <Modal 
        animationType="slide"
        transparent={true}
        onRequestClose={() => {this.setState((state) => {return {
          chaimager_info_modal_visible: false}
                                                          ;}
                                              );
                                }
                        }
        visible={this.state.chaimager_info_modal_visible}>

        <View style = {{flex: 1,
              justifyContent: "center",
              alignItems: "center"
              }}>
        
          <View style = {{margin: 20,
                  backgroundColor: "white",
                  borderRadius: 20,
                  padding: 35,
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: {
                  width: 0,
                  height: 2
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 5}} >

          
            <View style={{alignItems: "center"}}>

              <Image source={{uri: this.state.chaimager_info_modal_information.thumbnail}}  
                style={{
                width: Dimensions.get('window').width / 2,
                height: Dimensions.get('window').width / 2}}
                 />

              <Text>{this.state.chaimager_info_modal_information.filename}</Text>

              <Text style={{marginTop: Dimensions.get('window').width / 50}}>Created by: {this.state.chaimager_info_modal_information.creator}</Text>

              <Text>Reccomended book: {this.state.chaimager_info_modal_information.reccomended_book}</Text>
                  
              <Text>For volume: {this.state.chaimager_info_modal_information.volume}</Text>

            </View>

            <View style={{marginTop: Dimensions.get('window').width / 50, flexDirection: "column" }}>

              <Button status="success" onPress={() => {this.create_chaimager(this.state.chaimager_info_modal_information.filename)}}>Edit file</Button>
              <Button status="danger" onPress={() => {this.delete_chaimager(this.state.chaimager_info_modal_information.filename)}}>Delete (1 time touch)</Button>

            </View>

            <Button style={{alignSelf: "center"}} onPress={() => {this.setState(() =>{ return {chaimager_info_modal_visible: false }})}}>Return to library</Button>

          </View>

        </View>


    </Modal>

    <Modal 
        animationType="slide"
        transparent={true}
        onRequestClose={() => {this.setState((state) => {return {
          forge_library_modal: false}
                                                          ;}
                                              );
                                }
                        }
        visible={this.state.forge_library_modal}>

        <View style = {{flex: 1,
              justifyContent: "center",
              alignItems: "center"
              }}>
        
          <View style = {{margin: 20,
                  backgroundColor: "white",
                  borderRadius: 20,
                  padding: 35,
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: {
                  width: 0,
                  height: 2
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 5}} >

          
            <View style={{alignItems: "center"}}>

              <Text style= {{textAlign: "center"}}>Select the book you want to add to the forge</Text>


            <List
                data={this.state.library}
                renderItem={forge_renderItem}
                numColumns={1}
                  />

            </View>

          </View>

        </View>


    </Modal>

    <Modal 
        animationType="slide"
        transparent={true}
        onRequestClose={() => {this.setState((state) => {return {
          forge_chaimager_modal: false}
                                                          ;}
                                              );
                                }
                        }
        visible={this.state.forge_chaimager_modal}>

        <View style = {{flex: 1,
              justifyContent: "center",
              alignItems: "center"
              }}>
        
          <View style = {{margin: 20,
                  backgroundColor: "white",
                  borderRadius: 20,
                  padding: 35,
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: {
                  width: 0,
                  height: 2
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 5}} >

          
            <View style={{alignItems: "center"}}>

              <Text style= {{textAlign: "center"}}>Select the book you want to add to the forge</Text>


            <List
                data={this.state.chaimager_list}
                renderItem={forge_renderChaimagerItem}
                numColumns={1}
                  />

            </View>

          </View>

        </View>


    </Modal>

    <TabView selectedIndex={this.state.top_index} onSelect={(index) => {this.setState((state) => {return {
          top_index: index}
                                                          ;}
                                              );
                                }
                        }>

      <Tab title="Library">
      
      <Layout style={{ 
                      height:Dimensions.get('window').height / 12 * 10.4,
                      justifyContent: 'center', 
                      alignItems: 'center',}}>

        <View style={{flex: 9}}>

          <List
        data={this.state.library}
        renderItem={renderItem}
        numColumns={1}
      />

        </View>

        <View style={{flex: 1, flexDirection:'row'}}> 
          <Button onPress={this.load_file} style={{marginTop:10}}>Add PDF</Button>
      </View>
      
    </Layout>

    </Tab>

      <Tab title="Chaimager">

        <Layout style={{ 
                        height:Dimensions.get('window').height / 12 * 10.4,
                        justifyContent: 'center', 
                        alignItems: 'center',}}>

          <View style={{flex: 9}}>

          <List
                  data={this.state.chaimager_list}
                  renderItem={renderChaimagerItem}
                  numColumns={1}
          />

          </View>

          <View style={{flex: 1, flexDirection:'row'}}> 
          <Button onPress={() => {this.create_chaimager('#kofokfekowf#NEW7951')}} style={{marginTop:10, marginLeft:10 }}>Create new Chaimager file</Button>
        </View>
        
      </Layout>

      </Tab>

      <Tab title="The forge">

      <Layout style={{ 
                      height:Dimensions.get('window').height / 12 * 10.4,
                      justifyContent: 'center', 
                      alignItems: 'center',}}>

        <View style={{}}>

          <Text style={{alignSelf:"center", textAlign:"center"}}>Here you can merge a book that you have with a Chaimager skin. Choose the book and skin you want, and press Forge! </Text>
          <Text style={{alignSelf:"center", textAlign:"center"}}> This might take some time! </Text>

          <View style={{flexDirection:'row', flex:4}}>

            <View style={{width: Dimensions.get('window').width / 2, flex: 8}}>

              <Button onPress={() => {this.setState((state) => {return {
                    forge_library_modal: true}
                                                            ;}
                                                );
                                  }
                          }>Select Book</Button>

              <Text style={{textAlign:"center"}}>Selected Book:</Text>
              <Text style={{textAlign:"center", backgroundColor:"cyan", height:Dimensions.get('window').height / 12, justifyContent:"center" }}>{this.state.forge_selected_book.title}</Text>

            </View>
            
            <View style={{width: Dimensions.get('window').width / 2,}}>
                
              <Button onPress={() => {this.setState((state) => {return {
                    forge_chaimager_modal: true}
                                                            ;}
                                                );
                                  }
                          }>Select skin</Button>

              <Text style={{textAlign:"center"}} >Selected Chaimager: </Text>
              <Text style={{textAlign:"center", backgroundColor:"cyan", height:Dimensions.get('window').height / 12, justifyContent:"center"}} >{this.state.forge_selected_chaimager.filename}</Text>

          </View>

          </View>

          <View style={{alignItems:"center", flex:5}}>

              <Progress.Circle progress={this.state.forge_progress} showsText={true} size={Dimensions.get('window').height / 10 * 2.5}/>


          </View>

          <View style={{alignItems: "center", flex:1}}>
                
                <Button status="success" onPress={()=> {this.forge_chaimager(this.state.forge_selected_book, this.state.forge_selected_chaimager)}}>Forge!</Button>

          </View>

        </View>

        <View style={{flex: 1, flexDirection:'row'}}> 

      </View>

      </Layout>

      </Tab>
        
    </TabView>
            
  </SafeAreaView>
  );
  }}

}