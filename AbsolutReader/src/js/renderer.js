import React, {Component} from 'react';
import Pdf from 'react-native-pdf'; //Rendering
import { StyleSheet, View , Dimensions, SafeAreaView, useWindowDimensions} from 'react-native';
import { Layout, Text, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import {make_links, pdf_editor} from './pdf_tools/pdf_editor';

var RNFS = require('react-native-fs');
var base64js = require('base64-js');

export default class App extends Component {

	constructor(props) {
		super(props);

		this.path = RNFS.DocumentDirectoryPath; //Main path of app

		this.state = {chaimager: '{}', chaimager_loaded: 'False', source:{uri:'http://www.africau.edu/images/default/sample.pdf',cache:true}}
	}

	chaimager (link) {
		/* 
		Given a clicked link, checks if its Chaimager and opens a pop up windows
		with the information of the character.
		*/
		// First we check if it is a chaimager reference:
		
		if (link.includes("[chaimager]")==true) {
			
			var name = link.slice(11);

			//Searching in chaimager file if exists
		}

		



	
	
	}

	async load_chaimager (filepath) {
		//Checks if there is a chaimager file and, if not, creates one.
		//Updates chaimager inside of this.state with the values that got
		//and updates the PDF

		//Creates chaimager folder if it does not exists already:
		RNFS.mkdir(this.path + '/chaimager_files');

		//We pick the file name and check if it exists at library:
		const chaimager_file_name = filepath.split('\\').pop().split('/').pop().split('.').slice(0, -1).join('.') + '.json';
		const chaimager_file_path = this.path + '/chaimager_files/' + chaimager_file_name; //TODO #1

		//Loads json if file exists
		json = await RNFS.readFile(chaimager_file_path, 'utf8');
		
		if (json) { //Chaimager file exists

			var chaimager_json = JSON.parse(json);
			this.setState((state) => {return {chaimager: chaimager_json}})
		} 
		else { //File do not exists

			RNFS.writeFile(chaimager_file_path, '{}', 'utf8');
			this.setState((state) => {return {chaimager: JSON.parse('{}')};});
		}
	
		//Now that we have the Chaimager json, we need to edit the PDF
		//Reading the pdf again from filepath:

		var base64_pdf = await RNFS.readFile(filepath, 'base64');

		var PdfDoc = base64js.toByteArray(base64_pdf); //PDF as byte array so pdf.js library can understand it
				
		//4TESTING:
		this.setState((state) => {return {
			chaimager: JSON.parse('{"ids": [{"name":"Moriarty","image":"feioisfe"}, {"name":"Michael","image":"feioisfe"}] }')};});
				
		for (var i = 0; i < this.state.chaimager["ids"].length; i++) {
			
			//Calling our function to add the links
			base64_pdf = await pdf_editor(PdfDoc, this.state.chaimager["ids"][i]["name"]);

			//Now we change the source for this. Note that the edited file is not stored on the local filesystem,
			//rather in the RAM, so the original PDF stays unedited, which is good

			var new_source = {uri:'data:application/pdf;base64,' + base64_pdf + "'"};

			this.setState((state) => {return {
				source: new_source
			}});

		}
	}

	render(){
	return (
		<SafeAreaView style={{ flex: 1 }}>

		<View style={styles.container} > 
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
container: {
	flex: 1,
	justifyContent: 'flex-start',
	alignItems: 'center',
	marginTop: 25,
},
pdf: {
	flex:1,
	width:Dimensions.get('window').width,
}
});