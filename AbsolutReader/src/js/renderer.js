import React, {Component} from 'react';
import Pdf from 'react-native-pdf'; //Rendering
import { StyleSheet, View , Dimensions, SafeAreaView, Modal, Image, TextInput} from 'react-native';
import { Layout, Text, TopNavigation, TopNavigationAction, Button, Icon, Divider} from '@ui-kitten/components';
import {pdf_loader} from './pdf_tools/pdf_loader';
import { IndexOutOfBoundsError } from 'pdf-lib';
import ColorPicker from 'react-native-wheel-color-picker'
import DocumentPicker from 'react-native-document-picker';

var RNFS = require('react-native-fs');
var base64js = require('base64-js');

export default class Pdf_Renderer extends Component {

	constructor(props) {
		super(props);

		//Creates chaimager folder if it does not exists already:
		//RNFS.mkdir(this.path + '/chaimager_files'); 

		this.path = RNFS.DocumentDirectoryPath; //Main path of app

		this.state = {chaimager: '{}', 
					chaimager_loaded: false, 
					source:{uri:'http://www.africau.edu/images/default/sample.pdf',cache:true},
					filepath:'', //Added after PDF is loaded
					filename:'', //Added after PDF is loaded
					chaimager_popup_visible: false,
					chaimager_adder_popup_visible: false,
					modal_character: '',
					//Cache for adding new character
					chaimager_name_cache:'',
					chaimager_color_cache: '',
					chaimager_bio_cache: '',
					chaimager_image_cache: '',
				}
		
	}

	async chaimager (link) {
		/* 
		Given a clicked link, checks if its Chaimager and opens a pop up windows
		with the information of the character.
		*/
		// First we check if it is a chaimager reference:
		
		if (link.includes("https://chaimager.me/[")==true) {

			console.log('Chaimager link clicked');
			var name = link.slice(21).replace('[', '').replace(']', '');
			var index = 0

			//Getting the rest of the info using the json
			for (var i = 0; i < this.state.chaimager["ids"].length; i++){

				if (this.state.chaimager["ids"][i]["name"] == name){

					var index = i;
					
				}
			};
			

			//Loading modal information
			await this.setState((state) => {
				return {
					modal_character: this.state.chaimager["ids"][index],
					chaimager_popup_visible: true
				};
			});

		}

	}

	async load_chaimager (filepath) {
		//Checks if there is a chaimager file and, if not, creates one.
		//Updates chaimager inside of this.state with the values that got
		//and updates the PDF

		//Where file is stored
		this.setState((state) => {return {
			filepath: filepath};});

		//Runs only if not already loaded:
		if (this.state.chaimager_loaded == false) {
			console.log("Loading chaimager");

			//We pick the file name and check if it exists at library:
			const chaimager_file_name = filepath.split('\\').pop().split('/').pop().split('.').slice(0, -1).join('.') + '.json';
			const chaimager_file_path = this.path + '/chaimager_files/' + chaimager_file_name; //TODO #1

			this.setState((state) => {return {filename: filepath.split('\\').pop().split('/').pop().split('.').slice(0, -1).join('.') }});

			//Loads json if file exists
			try {
				json = await RNFS.readFile(chaimager_file_path, 'utf8');
				var chaimager_json = JSON.parse(json);
				this.setState((state) => {return {chaimager: chaimager_json}});
			}
			catch { //Chaimager file does not exist
				RNFS.writeFile(chaimager_file_path, '{}', 'utf8');
				this.setState((state) => {return {chaimager: JSON.parse('{}')};});
			}
		
			//Now that we have the Chaimager json, we need to edit the PDF
			//Reading the pdf again from filepath:

			var base64_pdf = await RNFS.readFile(filepath, 'base64');

			var PdfDoc = base64js.toByteArray(base64_pdf); //PDF as byte array so pdf.js library can understand it
					
			//4TESTING:
			this.setState((state) => {return {
				chaimager: JSON.parse('{"ids": [{"name":"text","image":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==","bio":"A super cool character"}, {"name":"pdf","image":"feioisfe","bio":"likes hentai"}] }')};});
					
			for (var i = 0; i < this.state.chaimager["ids"].length; i++) {

				var name = this.state.chaimager["ids"][i]["name"];
				
				//Calling our function to add the links
				var pdf_source = await pdf_loader(PdfDoc, name);

				var PdfDoc = base64js.toByteArray(pdf_source["base64_pdf"]);
			};
			
			//Now we change the source for this. Note that the edited file is not stored on the local filesystem,
			//rather in the RAM, so the original PDF stays unedited, which is good

				this.setState((state) => {return {
					source: pdf_source["new_source"],
					chaimager_loaded: true,
				}});
	};
	}

	add_chaimager () {
		//Function to add new link to chaimager. Simply modifies the json




		//At the end, we run load_chaimager again to update current view:
		load_chaimager(this.state.filepath);
	}

	async image_selector () {
		try {
			const res = await DocumentPicker.pick({
			  type: [DocumentPicker.types.images],
			});
			return res.uri;
		  } catch (err) {
			if (DocumentPicker.isCancel(err)) {
			  // User cancelled the picker, exit any dialogs or menus and move on
			} else {
			  throw err;
			}
		  }
	}

	chaimager_cache_name() {}

	chaimager_cache_bio() {}

	chaimager_chache_color () {}

	chaimager_cache_image () {
		image_path = this.image_selector();

		//Opening image

		//Converting image to base64

	}
	chaimager_cache_save () {
	}

	render_top_menu () {}

	render(){

	const BackIcon = (props) => (
		<Icon {...props} name='arrow-back'/>
		);
	const EditIcon = (props) => (
		<Icon {...props} name='edit'/>
		);

	const renderRightActions = () => (
		<React.Fragment>
		  <TopNavigationAction icon={EditIcon}/>
		</React.Fragment>
	  );

	const renderBackAction = () => (
	<TopNavigationAction icon={BackIcon}/>
	);
	
	return (

	<SafeAreaView style={{ flex: 1 }}>

		<TopNavigation style={{height:Dimensions.get('window').height / 12}}
						alignment='center'
						title='Absolut Reader'
						subtitle={this.state.filename}
						accessoryLeft={renderBackAction}
						accessoryRight={renderRightActions}/>

		<Divider />
					
		<Modal 
		
			animationType="slide"
			transparent={true}
			visible={this.state.chaimager_popup_visible}
			onRequestClose={() => {this.setState((state) => {
				return {
					chaimager_popup_visible: false
				};
			})}}>
			
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
							elevation: 5}}>

				<Text style = {{marginBottom: 15,
								textAlign: "center",
								color: "black"}}>

					{this.state.modal_character["name"]}
				
				</Text>

				<Image source={{uri:this.state.modal_character["image"]}} 
						style={{width: 200,
								height: 200,}}
						/>

				<Text style = {{marginBottom: 15,
								textAlign: "center",
								color: "black"}} >

					{this.state.modal_character["bio"]}

				</Text>

			</View>

		</View>

	</Modal>

		<Modal 
		
			animationType="slide"
			transparent={true}
			visible={this.state.chaimager_adder_popup_visible}
			onRequestClose={() => {this.setState((state) => {
				return {
					chaimager_adder_popup_visible: false
				};
			})}}>
			
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

					<TextInput placeholder="Name of character"
								onChangeText={(text) => this.chaimager_cache_name(text)}/>

					<TextInput	placeholder= "Small biography"
								onChangeText={(text) => this.chaimager_cache_bio(text)}
					/>

					<ColorPicker
						onColorChangeComplete={(color) => this.chaimager_chache_color(color)}
						thumbSize={40}
						sliderSize={40}
						noSnap={true}
						row={true}
					/>
					
					<Button onPress={this.chaimager_cache_image}  
							title="Select Image"  />

					<Button onPress={this.chaimager_cache_save}  
							title="Save"  
					/>
				</View>
			</View>


	</Modal>
		
		<View style={styles.pdf_container} > 
			<Pdf
				source={this.state.source}
				onLoadComplete={(numberOfPages,filePath)=>{
					this.load_chaimager(filePath);
				}}
				onPageChanged={(page,numberOfPages)=>{
					console.log(`current page: ${page}`);
				}}

				onError={(error)=>{
					console.log(error);
				}}

				onPressLink={(uri)=>{
					this.chaimager(uri);  //Chaimager handling of characters
				}}

				style={styles.pdf}/>
		</View>
		
	</SafeAreaView>
	)}
}

const styles = StyleSheet.create({
pdf_container: {
	flex: 1,
	justifyContent: 'flex-start',
	alignItems: 'center',
},
pdf: {
	flex:1,
	width:Dimensions.get('window').width,
}
});