import React, {Component} from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, Layout, Divider, Button, TopNavigation, Icon, TopNavigationAction, List, Card} from '@ui-kitten/components';
import { Image, StyleSheet, SafeAreaView, Dimensions, View, Text} from 'react-native';
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
                library_loaded: false}
  }

  //Loading a new file
  load_file = async () => {
    console.log("User is adding a new book");
    var filepath = await this.file_selector();

    //Adding file to the library:
    this.add_pdf_to_library(filepath);
  };

  file_selector = async () => {

    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });
  
      var pdf_path = res.uri;
      //Reading imagefile after we have the path
  
      return pdf_path;
  
      } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        throw err;
      } else {
        throw err;
      }
      }
  }

  add_pdf_to_library = async (filepath) => {
    //Gets information about pdf and adds it to the database
    //Picks up the title, pages, and thumbnail

    var title = filepath.split('\\').pop().split('/').pop().split('.').slice(0, -1).join('.');

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

  read_book = async (source) => {
    var filepath = source.uri;

    this.props.navigation.navigate('Pdf_renderer', {filepath: filepath});
  }

  async load_library () {
    //Will load the pdf library based on a stored json. Returns an array with the info to render

    if (this.state.library_loaded == false){ //Stop from repeating itself to the eternity
  
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

  const render_top_logo = () => (
    <Image source={require('./../assets/images/logo.jpg')} style={{
      width: Dimensions.get('window').height/12*0.7,
    height: Dimensions.get('window').height/12*0.7,
      }} />
    );

  const MenuIcon = (props) => (
    <Icon {...props} name='menu'/>
    );

  const renderMenu = () => (
    <TopNavigationAction icon={MenuIcon}/>
    );

  const renderItemFooter = (info) => (
    <View>
        <Text >
          {info.item.title}
        </Text>
        <Text >
          {info.item.current_page} / {info.item.pages}
        </Text>
  </View>
);

  const renderItem = (info) => (
    <Card
      status='basic'
      style={styles.item}
      footer={renderItemFooter(info)}
      >
      
      <Pdf
				source={info.item.source}
        style={{width:Dimensions.get('window').width / 2 * 0.9, height:Dimensions.get('window').height / 4}}
        singlePage={true}
        
      />

    </Card>
  );

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
        style={styles.container}
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

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width
  },

  item: {
    width: Dimensions.get('window').width / 2,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1
  },
});