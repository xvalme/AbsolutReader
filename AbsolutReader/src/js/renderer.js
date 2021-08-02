import React, {Component} from 'react';
import Pdf from 'react-native-pdf'; //Rendering
import { StyleSheet, View , Dimensions, SafeAreaView, useWindowDimensions} from 'react-native';
import { Layout, Text, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { encodeToBase64, PDFDocument } from "pdf-lib"; //Adding links
import { pdfjsWorker } from "pdfjs-dist/legacy/build/pdf.worker.entry";
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'; //Getting coordinates of text in pdf


var RNFS = require('react-native-fs');
var base64js = require('base64-js');

export default class App extends Component {

	state = {

	  }
	
	constructor(props) {
		super(props);

		this.path = RNFS.DocumentDirectoryPath; //Main path of app
		this.source = {uri:'https://juventudedesporto.cplp.org/files/sample-pdf_9359.pdf',cache:true};

		this.state = {chaimager: '{}', chaimager_loaded: 'False'}
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

	load_chaimager (filepath) {
		//Checks if there is a chaimager file and, if not, creates one.
		//Updates chaimager inside of this.state with the values that got
		//and updates the PDF

		//Creates chaimager folder if it does not exists already:
		RNFS.mkdir(this.path + '/chaimager_files');

		//We pick the file name and check if it exists at library:
		const chaimager_file_name = filepath.split('\\').pop().split('/').pop().split('.').slice(0, -1).join('.') + '.json';
		const chaimager_file_path = this.path + '/chaimager_files/' + chaimager_file_name; //TODO #1

		
		const createPageLinkAnnotation = (pdfDoc, id , color, left_x, left_y, right_x, right_y) =>
		pdfDoc.context.register(
		pdfDoc.context.obj({
			Type: 'Annot',
			Subtype: 'Link',

			Rect: [left_x, left_y, right_x, right_y],

			//Colors go here
			Border: [0, 0, 1],
			C: [0, 0, 1],

			Dest: ['[Chaimager:${id}]', 'XYZ', null, null, null],
		}),
		);
		function pdf_get_coordinates(doc, searchtext) {
			var numPages = doc.numPages;
			for (let i = 1; i <= numPages; i++){
				doc.getPage(i)
					.then(function (page) {
				 		page.getTextContent()
							.then(function (content) {
								console.log(content);
							})
			})
	
			};
		  }
		

		//Loads json if file exists
		RNFS.readFile(chaimager_file_path, 'utf8')
		.then((json) => {
			var chaimager_json = JSON.parse(json);
			//Updating state if file exists
			this.setState((state) => { return {chaimager: chaimager_json}});},
			() => {
				//File does not exists. Create a new one:
				RNFS.writeFile(chaimager_file_path, '{}', 'utf8');
				this.setState((state) => {return {chaimager: JSON.parse('{}')};});
			})
			.then(() => {
				//Now that we have the Chaimager json, we need to edit the PDF

				//Reading the pdf from filepath:
				RNFS.readFile(filepath, 'base64').then((data) => {
					return base64js.toByteArray(data);})
					//Returns PDF as ByteArray
	
				.then((PdfDoc) => {
					//We now add the links based on the chaimager file

					//4TESTING:
					this.setState((state) => {return {
						chaimager: JSON.parse('{"ids": [{"name":"Moriarty","image":"feioisfe"}, {"name":"Michael","image":"feioisfe"}] }')};});
					
					pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;  //Setting stuff for running the pdfjs library

					const loadingTask = pdfjsLib.getDocument({data: PdfDoc});  //Conversts base64 to something pdfjs understands
					loadingTask.promise
					.then(function (doc) {
						//PDF was loaded, now we do a text search
						pdf_get_coordinates(doc,'Sample'); //returns an array of all found coordinates for a specific keyword

					
						});


					for (var i = 0; i < this.state.chaimager["ids"].length; i++) {
						//For each id in the Chaimager file we update the pdf:

					};

				}) 
				
				
			})

	}

	render(){
	return (
		<SafeAreaView style={{ flex: 1 }}>

		<View style={styles.container} > 
			<Pdf
				source={this.source}
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