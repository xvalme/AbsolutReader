import React, {Component} from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, Layout, Divider, Button, TopNavigation, Icon,Text, TopNavigationAction, List, Card, Modal} from '@ui-kitten/components';
import { Image, StyleSheet, SafeAreaView, Dimensions, View, PermissionsAndroid} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { pdf_pagenumber_getter } from './pdf_tools/pdf_info_getter';
import Pdf from 'react-native-pdf'; //Rendering

var RNFS = require('react-native-fs');

export default class Homescreen extends Component {

  constructor(props){
    super(props);

    var app_package = require('./../../package.json');
    this.version = app_package["version"];

    this.state={library: [],
                library_loaded: false,
                edit_modal_visible: false,
                edit_modal_info: {},
                welcome_modal_visible: true}
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

    var info = {title: title, pages: pagenumber, current_page: 0, source:source};

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

  read_book = async (source, page) => {
    var filepath = source.uri;

    this.props.navigation.navigate('Pdf_renderer', {filepath: filepath, current_page: page});
  }

  requestStoragePermission = async () => {
    console.log("Asking user for permissions.");
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

  async load_library () {
    //Will load the pdf library based on a stored json. Returns an array with the info to render

    if (this.state.library_loaded == false){ //Stop from repeating itself to the eternity

    await this.requestStoragePermission();
  
    const path = RNFS.DocumentDirectoryPath; //Main path of the App
  
    const library_json = path + 'library.json';

    var library = {"books": []} //While not loaded
  
    //Loading the json
    var library = await RNFS.readFile(library_json).then(async (json) => {
      
      var library = await JSON.parse(json);

      return library;
  
      },async (err) => {//Json does not exit. Creating one
        console.log('Creating new library.');
        await RNFS.writeFile(library_json, '{"books": []}', 'utf8')
        .then((success) => {
          var library = JSON.parse('{"books": []}');
          return library;
        })
        .catch((err) => {
          console.log(err.message);
        });
    });

    var library_list = []; //Exporting list  
  
    for (var i = 0; i < library.books.length; i++) {
      var title = library.books[i].title;
      var total_page = library.books[i].pages;
      var current_page = library.books[i].current_page;
  
      var source = library.books[i].source;

      library_list.push({title: title, pages: total_page, current_page: current_page, source: source});
    };
    console.log("Library found with " + library_list.length + ' elements.');
  
      //Loading library to state
  
    this.setState((state) => {return {
      library: library_list,
      library_loaded: true};});

    return library_list; }
  }
  
  render() {
  this.load_library(); //Loading the library. Async function.

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
                  

      onPress={() => {this.read_book(info.item.source, info.item.current_page)}}
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
    <SafeAreaView style={{ flex: 1 }}>

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

            <Button title='Info about book' 
            style={{margin: 2, width: Dimensions.get('window').width * 0.8}}
            status='success'
            >Info about the book</Button>

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

        <View style={{flex: 1}}> 
          <Button onPress={this.load_file} style={{marginTop:10}}>Add PDF</Button>
      </View>
      
    </Layout>
  </SafeAreaView>
  );
  }}

}