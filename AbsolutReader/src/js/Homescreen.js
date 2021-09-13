import React, {Component} from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, Layout, Divider, Button, TopNavigation, Icon,Text, TopNavigationAction, List, Card} from '@ui-kitten/components';
import { Image, StyleSheet, SafeAreaView, Dimensions, View, PermissionsAndroid, Modal} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { pdf_pagenumber_getter } from './pdf_tools/pdf_info_getter';
import Pdf from 'react-native-pdf'; //Rendering

var RNFS = require('react-native-fs');

export default class Homescreen extends Component {

  constructor(props){
    super(props);

    var app_package = require('./../../package.json');
    this.version = app_package["version"];

    this.path = RNFS.DocumentDirectoryPath; //Main path of app

    this.state={library: [],
                chaimager_list: [],
                chaimager_list_loaded: false,
                library_loaded: false,
                edit_modal_visible: false,
                edit_modal_info: {},
                welcome_modal_visible: true,
                chaimager_list_modal_visible: false,
                first_time_book_opened: false,
                }
  }
  
  async load_welcome_page () {
		//Gets the info from the website

		try {
		var response = await fetch('https://absolutreader.works/api/welcome_page');

		var json = await response.json(); }

		catch { //No internet connection or server error.

		var json = {title: "Welcome back",
					text: "Consider making a donation"}
		}

		this.setState((state) => {return {welcome_page: json}});


	} 
  //Loading a new file
  load_file = async () => {
    console.log("User is adding a new book");
    var file = await this.file_selector();
    var filepath = file[0];
    var filename = file[1];

    //Adding file to the library:
    this.add_pdf_to_library(filepath, filename);
  };

  create_chaimager = async (name) => {
    //Creates a new chaimager file to be added to the PDF
    //Moves to the adder screen
    
    //Making modal invisible:
    this.setState((state) => {return {
      chaimager_list_modal_visible: false}
      ;}
    );


    this.props.navigation.navigate('Chaimager_adder', {name:name});
  }

  merge_chaimager = async (filepath, chaimager_file) => {

    //Runs if user ask to merge a skin with a pdf. Saves the pdf in the end in a folder
    //So that when user returns to it he does not have to wait.
    console.log("[MERGER] Starting merger.")

    //Opening file first:
    var base64_pdf = await RNFS.readFile(filepath, 'base64');

    //Opening chaimager:
    var json = await RNFS.readFile(chaimager_file);
		var chaimager_json = await JSON.parse(json);

    var pdfDoc = base64js.toByteArray(base64_pdf); //PDF as byte array so pdf.js library can understand it

    console.log("[MERGER] Files opened.")

		//Getting the coords

    async function get_pdf_coordinates (pdfDoc, keywords){
			
      /*Given a file (Already opened by fs), it uses Pdfjs library to get the coordinates of the keywords
      that exist in every single page, and returns an array of dictionarys with the coords and pages
      for the link adder.
      */

      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;  //Setting stuff for running the pdfjs library
      
      var coords_array = [];
    
      const loadingTask = pdfjsLib.getDocument({data: pdfDoc});  //Conversts base64 to something pdfjs understands
      
      const doc = await loadingTask.promise;
    
      var numPages = doc.numPages;
  
      for (let i = 1; i <= numPages; i++){

        var page = await doc.getPage(i);
    
        var content = await page.getTextContent();
              
        var items = (content["items"]);
    
        for (let p = 0; p < items.length; p++){

          for (let z = 0; z < keywords.ids.length; z++){
    
            if (items[p]["str"].includes(keywords.ids[z].name)){
      
              var transform = items[p]["transform"];
              var width = items[p]["width"];
              var height = items[p]["height"];
              var text = items[p]["str"];
      
              var coords = calculate_coords(i, transform, width, height, text, keywords.ids[z].name, keywords.ids[z].color);
              //sends the page, transform with the x and y elements, size, the complete sentence and the keywords we want in a array.
      
              for (const v of coords) {
                coords_array.push(v);
              };
            }
    
                      
          }
        }
      };
      return coords_array;
    }  

    var array_coordinate_dic = await get_pdf_coordinates (pdfDoc, chaimager_json);

    console.log("[MERGER] Coordinate array gotten.");

    async function make_links(pdfDoc, array_coordinate_dic) {

      if (array_coordinate_dic != 0) { //Empty. No characters.

        var pdfDoc = await PDFDocument.load(pdfDoc, { ignoreEncryption: true });
        //TODO #5
        const pages = await pdfDoc.getPages();

        for (let i = 0; i < array_coordinate_dic.length; i++) {

          var rgb_color = hexToRgb(array_coordinate_dic[i].color);
          var id = array_coordinate_dic[i].name;

          var page_number = array_coordinate_dic[i]["page"];

          var page = pages[page_number - 1]; //Loading page

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

        const pdfBytes = await pdfDoc.save();

        return encodeToBase64(pdfBytes);
      }

      else { //Speeding up. use already given value
        return (base64_pdf);
      }
    }

    var base64_pdf =  await make_links(pdfDoc, array_coordinate_dic);

    console.log("[MERGER] Links built.");

    function hexToRgb(hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    }

    function calculate_coords (page, transform, width, height, text, keywords, color){

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
    
        coords.push({page:page, x: x, y:y, right_x:right_x, right_y: right_y, color:color, keywords:keywords}); };
      
      return (coords);
    }

    //Now saving the file:

    var title = filepath.split('.').slice(0, -1).join('.');

    await RNFS.writeFile(RNFS.DocumentDirectoryPath + '/edited_pdfs/' + title + '.pdf' ,base64_pdf, 'base64');

    console.log("[MERGER] New Pdf saved");

    //Editing the library info to run book from new path and the skin Applied

    




  }

  chaimager_button = async () => {
    //Handles the click of the chaimager button, showing a modal with all chaimager files that exist in the app

    this.setState((state) => {return {chaimager_list_modal_visible: true}});


    
  }

  file_selector = async () => {

    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
        copyTo: "documentDirectory",
      });
  
      var pdf_path = res.fileCopyUri;
      var name = res.name;
      //Reading imagefile after we have the path
  
      return [pdf_path, name];
  
      } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        throw err;
      } else {
        throw err;
      }
      }
  }

  add_pdf_to_library = async (filepath, filename) => {
    //Gets information about pdf and adds it to the database
    //Picks up the title, pages, and thumbnail

    var title = filename.split('.').slice(0, -1).join('.');

    var pagenumber = await pdf_pagenumber_getter (filepath);

    var source = {uri: filepath, cache:true};

    var info = {title: title, pages: pagenumber, current_page: 1, source:source, times_opened: 0};

    var new_library = this.state.library;
    
    new_library.push(info);

    this.setState((state) => {return {
			library: new_library};});

    //Now saving it to the json

    const path = RNFS.DocumentDirectoryPath; //Main path of the App
  
    const library_json = path + 'library.json';

    var saving_object = {"books": new_library};
    var saving_string = JSON.stringify(saving_object)

    await RNFS.unlink(library_json);
    await RNFS.writeFile(library_json, saving_string, 'utf8');
    
    console.log("Added book to library");
  }

  remove_pdf_from_library = async () => {
    //Deletes pdf from library but the chaimager file will persist.

    var info = this.state.edit_modal_info;

    var library = this.state.library;

    for (let i = 0; i < library.length; i++){
      //Locating book in library list
      if (library[i].source == info.source){

        var index = i;

        library.splice(index, 1);

        {this.setState((state) => {return {
          edit_modal_visible: false}
          ;}
        );
        }

        //Now editing the .json file to save the changes:

    const path = RNFS.DocumentDirectoryPath; //Main path of the App
      
    const library_json = path + 'library.json';

    var saving_object = {"books": this.state.library};
    var saving_string = JSON.stringify(saving_object)

    await RNFS.unlink(library_json);
    await RNFS.writeFile(library_json, saving_string, 'utf8');

      }


    }
  }

  read_book = async (source, page, times_opened) => {
    var filepath = source.uri;

    //Updating number of times book was opened:
    //TODO

    //Checks if is 1st time loading:
    //TODO #9

    if (times_opened == 0){
      this.setState(() => { return {first_time_book_opened: true }})
    }
    
    else{
    this.props.navigation.navigate('Pdf_renderer', {filepath: filepath, current_page: page});
    }
  }

  requestStoragePermission = async () => {
    console.log("Asking for permissions.")
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: "Read storage permission",
          message:
            "AbsolutReader needs to have acess  " +
            "to your storage to load the e-books",
          buttonNeutral: "Ask me later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
    
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.warn(err);
    }
  };

  load_first_time = async () => {

    //Function to load when the user makes the 1st lauch of the app

    //Picks information about the user and saves it, to then send to server if user accepts
    //TODO #8

    //Checking if information file exists:

    var run = await RNFS.exists(this.path + 'info.json');

    if (run == false) {
      //First run

      //Creating the chaimager dir

      console.log('1st run. Creating necessary files.');
            
      //Permissions
      await this.requestStoragePermission();

      //Chaimager
      await RNFS.mkdir(this.path + '/chaimager_files/');

      //Chaimager edited pdfs
      await RNFS.mkdir(this.path + '/edited_pdfs/');

      //Library:
      await RNFS.writeFile(this.path + 'library.json', '{"books": []}', 'utf8');

      //Info file:
      await RNFS.writeFile(this.path + 'info.json', '');

      this.load_library();

    }

    else {

    //Just loads everything because is not 1st launch.
    this.load_library();

    }

  }

  async load_library () {
    //Will load the pdf library based on a stored json. Returns an array with the info to render

    try {
      var back = this.props.route.params["back_action"];
    }
    catch (e) {
      var back = false;
    }

    if (this.state.library_loaded == false || back == true){ //Stop from repeating itself to the eternity
      //Also loads if returns from the render

    try {
      this.props.route.params["back_action"] = false }
      catch {}

  
    const path = RNFS.DocumentDirectoryPath; //Main path of the App
  
    const library_json = path + 'library.json';

    var library = {"books": []} //While not loaded
  
    //Loading the json

    var json = await RNFS.readFile(library_json)
      
    var library = await JSON.parse(json);

    var library_list = [];

    for (var i = 0; i < library["books"].length; i++) {
      var title = library.books[i].title;
      var total_page = library.books[i].pages;
      var current_page = library.books[i].current_page;
  
      var source = library.books[i].source;
      var times_opened = library.books[i].times_opened;

      library_list.push({title: title, pages: total_page, current_page: current_page, source: source, times_opened: times_opened});
    };
    console.log("Library found with " + library_list.length + ' elements.');
  
      //Loading library to state

    //Loading chaimager
    console.log("Loading chaimager list");

    const chaimager_dir = path + '/chaimager_files/';

    var files = await RNFS.readDir(chaimager_dir);

    var chaimager_list = []; //Variable to then update with the values

    files.forEach(file => {

      var name = file.name;

      //Checking if is json:

      if (name.includes('.json')) {

        //Appends:

        chaimager_list.push (name.split('.json')[0])

      }

    })
  
    this.setState((state) => {return {
      library: library_list,
      library_loaded: true,
      chaimager_list: chaimager_list, 
      chaimager_list_loaded: true};});

      //this.props.route.params["back_action"] = false; //So that it does not repeat itself to the end of the universe

    return library_list; }
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

  const MenuIcon = (props) => (
    <Icon {...props} name='menu'/>
    );

  const DropDownIcon = (props) => (
    <Icon {...props} name='more-vertical-outline'/>
  )

  const CloseIcon = (props) => (
    <Icon {...props} name='close'/>
  );
  //Rendering things
  const renderMenu = () => (
    <TopNavigationAction icon={MenuIcon} onPress={() => {this.props.navigation.navigate('Settings');}}/>
    );

  const renderItem = (info) => (
    <Card
      status='basic'
      style= {{   width: Dimensions.get('window').width / 2,
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: 1}}
                  

      onPress={() => {this.read_book(info.item.source, info.item.current_page, info.item.times_opened)}}
      onLongPress={() => {renderDropDown(info.item)}}
      >
      
      <View>
      <Pdf
				source={info.item.source}
        style={{width:Dimensions.get('window').width / 2 * 0.8, height:Dimensions.get('window').height / 4}}
        singlePage={true}
        
      />
      </View>

          <View>
            <Text style={{   justifyContent: 'center',
                             textAlign: 'center',}}>
                {info.item.title}
              </Text>
                <View style={{flexDirection: 'row', alignItems:'center', justifyContent: 'center',}}>
                      <Text>
                        {info.item.current_page} / {info.item.pages} Pages
                      </Text>

                      <Button 
                      appearance='ghost'
                      onPress={() => {renderDropDown(info.item)}}
                      accessoryLeft={DropDownIcon}
                      size='small' />

                 </View>
          </View>

    </Card>
  );

  const renderChaimagerItem = (info) => (
    <Card
      status='basic'
      style= {{  
                  margin: 1}}
      >
        <View style = {{flexDirection:'row', flex:1}}>

          <View style={{flex: 6}}>
              <Text style={{}}>
                {info.item}
              </Text>
          </View>

          <View style={{flex: 4}}>
              <Button style={{}}  onPress={() => {this.create_chaimager(info.item)}}>Edit</Button>
          </View>

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

  if (this.state.library_loaded == false) { //Is still loading the library
    return (
      <SafeAreaView style={{ flex: 1 }}>
  
        
      <TopNavigation style={{height:Dimensions.get('window').height / 12}}
              alignment='center'
              title='Absolut Reader'
              subtitle={'Version Alpha ' + this.version}
              accessoryRight={render_top_logo}
              accessoryLeft={renderMenu}/>
  
              <Divider />
        
        <Layout style={{flex: 1,
                        justifyContent: 'center', 
                        alignItems: 'center',}}>
  
          <View style={{flex: 9}}>
  
            <Text>
              Loading library...
            </Text>
  
          </View>
  
          <View style={{flex: 1}}> 
            <Button onPress={this.load_file} style={{marginTop:10}}>Add PDF</Button>
        </View>
        
      </Layout>
    </SafeAreaView>
    );
  }
  else {

  return (
    <SafeAreaView style={{ flex: 1 }} >

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

            <Button title='Reset' 
            style={{margin: 2, width: Dimensions.get('window').width * 0.8}}
            status='success'
            onPress={() => {}} 
            >Chaimager skin</Button>

            <Button title='Share Chaimager file' 
            style={{margin: 2, width: Dimensions.get('window').width * 0.8}}
            status='basic'
            >Share Chaimager file</Button>
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

          
            <View>
                <Text style={{textAlign:'center'}}>Welcome back!</Text>
                
                
                <Button accessoryLeft={CloseIcon} appearance='outline' size='small' status='danger'
                        onPress={() => {this.setState((state) => {return {
                          welcome_modal_visible: false}
                          ;} );}} />
            </View>

          </View>

        </View>


    </Modal>
  
    <Modal 
        animationType="slide"
        transparent={true}
        onRequestClose={() => {this.setState((state) => {return {
                                                          chaimager_list_modal_visible: false}
                                                          ;}
                                              );
                                }
                        }
        visible={this.state.chaimager_list_modal_visible}>

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

          
            <View>
                <Text style={{textAlign:'center'}}>Chaimager files in your device</Text>

                          <List
                  data={this.state.chaimager_list}
                  renderItem={renderChaimagerItem}
                  numColumns={1}
                />
                
                <View style={{flexDirection: 'row'}}>
                  <Button onPress={() => {this.create_chaimager('#kofokfekowf#NEW7951')}} style={{marginTop:10, marginLeft:10 }}>Create new Chaimager file</Button>

                  <Button onPress={() => {this.setState((state) => {return {
                                                          chaimager_list_modal_visible: false}
                                                          ;}
                                              );
                                }} 
                          style={{marginTop:10, marginLeft:10 }} 
                          status='danger'>Exit</Button>

                  <Button>Import</Button>


                </View>
                  
            </View>

          </View>

        </View>


    </Modal>
  
    <Modal 
        animationType="slide"
        transparent={true}
        onRequestClose={() => {this.setState((state) => {return {
          first_time_book_opened: false}
                                                          ;}
                                              );
                                }
                        }
        visible={this.state.first_time_book_opened}>

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

          
            <View>
                <Text style={{textAlign:'center'}}>It seems that this is your first time loading this book. 
                Would you like to add a Chaimager Skin?</Text>
                <Text>(It takes some time)</Text>

                <Text style={{textAlign:'center'}}>Chaimager files in your device:</Text>

                          <List
                  data={this.state.chaimager_list}
                  renderItem={renderChaimagerItem}
                  numColumns={1}
                />

                <Button>Read without Chaimager skin</Button>
                
                <View style={{flexDirection: 'row'}}>

                  <Button onPress={() => {this.setState((state) => {return {
                                                          first_time_book_opened: false}
                                                          ;}
                                              );
                                }} 
                          style={{marginTop:10, marginLeft:10 }} 
                          status='danger'>Exit</Button>



                </View>
                  
            </View>

          </View>

        </View>


    </Modal>


		<TopNavigation style={{height:Dimensions.get('window').height / 12}}
						alignment='center'
						title='Absolut Reader'
            subtitle={'Version Alpha ' + this.version}
            accessoryRight={render_top_logo}
            accessoryLeft={renderMenu}/>

            <Divider />
      
      <Layout style={{flex: 1,
                      justifyContent: 'center', 
                      alignItems: 'center',}}>

        <View style={{flex: 9}}>

          <List
        data={this.state.library}
        renderItem={renderItem}
        numColumns={2}
      />

        </View>

        <View style={{flex: 1, flexDirection:'row'}}> 
          <Button onPress={this.load_file} style={{marginTop:10}}>Add PDF</Button>
          <Button onPress={this.chaimager_button} style={{marginTop:10, marginLeft:10 }}>Chaimager</Button>
      </View>
      
    </Layout>
  </SafeAreaView>
  );
  }}

}