import React, {Component} from 'react';
import Pdf from 'react-native-pdf'; //Rendering
import { StyleSheet, View , Dimensions, SafeAreaView, Modal, Image, TextInput, BackHandler} from 'react-native';
import { Layout, Text, TopNavigation, TopNavigationAction, Button, Icon, Divider, List, ListItem} from '@ui-kitten/components';
import ColorPicker from 'react-native-wheel-color-picker'
import DocumentPicker from 'react-native-document-picker';
import { pdfjsWorker } from "pdfjs-dist/legacy/build/pdf.worker.entry";
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'; //Getting coordinates of text in pdf
import { encodeToBase64, PDFDocument, PDFName, PDFString, PDFArray, rgb } from "pdf-lib"; //Adding links

var RNFS = require('react-native-fs');
var base64js = require('base64-js');

export default class Pdf_Renderer extends Component {

	constructor(props) {
		super(props);

		//Creates chaimager folder if it does not exists already:
		//RNFS.mkdir(this.path + '/chaimager_files'); 

		this.path = RNFS.DocumentDirectoryPath; //Main path of app

		this.state = {chaimager: {"ids": [{}]}, 
					chaimager_loaded: false, 
					source:{uri:props.route.params["filepath"],cache:true},
					filepath:props.route.params["filepath"],
					current_page: props.route.params["current_page"],
					filename:'', //Added after PDF is loaded
					//Rendering chaimager stage. Value from 0 to 100;
					chaimager_stage:0,
					//Modals:
					chaimager_popup_visible: false,
					chaimager_adder_popup_visible: false,
					chaimager_list_visible: false,
					modal_character: '',
					//Cache for adding new character:
					chaimager_name_cache:'',
					chaimager_color_cache: '',
					chaimager_bio_cache: '',
					chaimager_image_cache: 'data:image/png;base64,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',
				}
		
	}

	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
	}

	handleBackButton = async () => {

		//Going back to library, not forgetting to update it:
		this.props.navigation.navigate('Homescreen', {back_action: true});
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

		//Runs only if not already loaded:

		if (this.state.chaimager_loaded == false) {

			//We pick the file name and check if it exists at library:
			const chaimager_file_name = filepath.split('\\').pop().split('/').pop().split('.').slice(0, -1).join('.') + '.json';
			const chaimager_file_path = this.path + '/chaimager_files/' + chaimager_file_name; //TODO #1

			this.setState((state) => {return {filename: filepath.split('\\').pop().split('/').pop().split('.').slice(0, -1).join('.') }});

			/* TODO
			//Loads json if file exists
			await RNFS.writeFile(chaimager_file_path, '');
			//Only gets the information from the file if it is not 1st time loading

			RNFS.readFile(chaimager_file_path).then((json) => {
				console.log(json);
				var chaimager_json = JSON.parse(json);
				this.setState((state) => {return {chaimager: chaimager_json}});
			},
			(error) => {				
				//Chaimager file does not exist
				RNFS.writeFile(chaimager_file_path, '{"ids": [{}]}', 'utf8');
			}) */
		
			//Now that we have the Chaimager json, we need to edit the PDF
			//Reading the pdf again from filepath:

			var base64_pdf = await RNFS.readFile(filepath, 'base64');

			var pdfDoc = base64js.toByteArray(base64_pdf); //PDF as byte array so pdf.js library can understand it

			//Calling our function to add the links

			var keywords = this.state.chaimager;

				//Keywords as an array of objects with name and color keys
				//Ex: [{name:"Antunes", color:"#FFFFFF"}]

			console.log("Initiating the chaimager pdf_loader.");

			async function get_pdf_coordinates (pdfDoc, keywords){
			
					/*Given a file (Already opened by fs), it uses Pdfjs library to get the coordinates of the keywords
					that exist in every single page, and returns an array of dictionarys with the coords and pages
					for the link adder.
					*/
				
					//TODO #2
					pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;  //Setting stuff for running the pdfjs library
					
					var coords_array = [];
				
					const loadingTask = pdfjsLib.getDocument({data: pdfDoc});  //Conversts base64 to something pdfjs understands
					
					const doc = await loadingTask.promise;
				
					var numPages = doc.numPages;
		
					var absolut_unit = 50 / numPages;
				
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

			var array_coordinate_dic = await get_pdf_coordinates (pdfDoc, keywords);
			
			async function make_links(pdfDoc, array_coordinate_dic) {

				if (array_coordinate_dic != 0) { //Empty. No characters.

					var pdfDoc = await PDFDocument.load(pdfDoc, { ignoreEncryption: true });
					//TODO #5
					const pages = await pdfDoc.getPages();

					var absolut_unit = 50 / array_coordinate_dic.length;

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
								URI: PDFString.of('https://chaimager.me/[' + id + ']'), //It does not add if is not a valid url
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

			console.log("Pdf links of expressions made. Pdf edited.");
			
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
			
			var new_source = {uri:'data:application/pdf;base64,' + base64_pdf};
	
			//Loading completed.
			this.setState((state) => {return {chaimager_stage: 100}});

			var pdfDoc = base64js.toByteArray(base64_pdf);
			
			//Now we change the source for this. Note that the edited file is not stored on the local filesystem,
			//rather in the RAM, so the original PDF stays unedited, which is good

			this.setState((state) => {return {
				source: new_source,
				chaimager_loaded: true,
				chaimager_loading: false
			}});	
			console.log("Chaimager loaded");
	};
	}

	async update_page_homescreen (page) {
		//Updates the homescreen value of the pages read when user starts new page

		const filepath = this.state.filepath;

		const path = RNFS.DocumentDirectoryPath; //Main path of the App
      
		const library_json = path + 'library.json';

		var json = await RNFS.readFile(library_json);

		var library = await JSON.parse(json);

		for (var i = 0; i<library.books.length; i++){
			
			//Finding the right book

			if (library.books[i].source.uri == filepath) {
				
				//Now editing the file
				library.books[i].current_page = page;

			}
		}

		//Now saving file:
		var saving_library = JSON.stringify(library);

		await RNFS.unlink(library_json);
		await RNFS.writeFile(library_json, saving_library, 'utf8');

	}

	async image_selector () {

		console.log('User requested to choose image.');

		try {
			const res = await DocumentPicker.pick({
			  type: [DocumentPicker.types.images],
			});

			var image_path = res.uri;
			//Reading imagefile after we have the path

			try {

				var image = await RNFS.readFile(image_path, 'base64');

				await this.setState((state) => {return {chaimager_image_cache: 'data:image/png;base64,'+image}});

				this.forceUpdate();

			}
			catch (e) {throw e;}



		  } catch (err) {
			if (DocumentPicker.isCancel(err)) {
			  // User cancelled the picker, exit any dialogs or menus and move on
			} else {
			  throw err;
			}
		  }

		
	}

	chaimager_cache_name(name) {
		this.setState((state) => {return {chaimager_name_cache: name}});
	}

	chaimager_cache_bio(bio) {
		this.setState((state) => {return {chaimager_bio_cache: bio}});
	}

	chaimager_chache_color (color) {
		this.setState((state) => {return {chaimager_color_cache: color}});
	}
	
	async chaimager_cache_save () {
		//Ads new information to json and reset chaimager cache
		console.log("Saving character");

		var name = this.state.chaimager_name_cache;
		var bio = this.state.chaimager_bio_cache;
		var color = this.state.chaimager_color_cache;
		var image = this.state.chaimager_image_cache;

		var editing = false

		//Checks if name already exists, and, if yes, edit it instead of adding it.
		for (let i=0; i<this.state.chaimager.length - 1; i++) {
			if (this.state.chaimager[i].name == name){
				//Only editing
				this.state.chaimager[i].name = name;
				this.state.chaimager[i].bio = bio;
				this.state.chaimager[i].color = color;
				this.state.chaimager[i].image = image;

				editing = true;
			}
		}

		if (editing == false){
		this.state.chaimager["ids"].push({name: name, bio:bio, color:color, image:image}); }

		//Making the modal invisible and preparing to relaod chaimager:

		//Reseting cache:
		await this.setState((state) => {return {chaimager_loaded: false,
		chaimager_adder_popup_visible: false,
		chaimager_name_cache:'',
		chaimager_color_cache: '',
		chaimager_bio_cache: '',
		chaimager_image_cache: 'data:image/png;base64,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',
		};});

		//Reloading chaimager
		console.log("Reloading chaimager");
		this.load_chaimager(this.state.filepath);
		
	}

	chaimager_edit (info) {
		//When the user requests to change a character.
		
		//Preparing edit modal variables:
		this.chaimager_cache_bio(info.bio);
		this.chaimager_cache_name(info.name);
		this.chaimager_chache_color(info.color);
		this.setState((state) => {return {chaimager_image_cache: info.image}});

		//Making modal visible

		this.setState((state) => {return {chaimager_adder_popup_visible: true}});		

	}

	render(){

	const BackIcon = (props) => (
		<Icon {...props} name='arrow-back'/>
		);

	const EditIcon = (props) => (
		<Icon {...props} name='edit'/>
		);

	const PaletteIcon = (props) => (
		<Icon {...props} name='color-palette-outline'/>
	)

	const MenuIcon = (props) => (
		<Icon {...props} name='menu'/>
		);

	const renderRightActions = () => (
		<React.Fragment>
		  <TopNavigationAction icon={EditIcon} onPress={() => {this.setState((state) => {
																	return {
																		chaimager_adder_popup_visible: true
																	};
																})}}/>

		<TopNavigationAction icon={PaletteIcon} onPress={() => {this.setState((state) => {
																									return {
																										chaimager_list_visible: true
																									};
																								})}}/>	

			<TopNavigationAction icon={MenuIcon} onPress={() => {this.setState((state) => {
																				return {
																					chaimager_adder_popup_visible: true
																				};
																			})}}/>			
													
		</React.Fragment>
	  );

	const renderBackAction = () => (
	<TopNavigationAction icon={BackIcon}/>
	);

	const renderChaimagerList = (info) => (
		<Card
		  status='basic'
		  style= {{   width: Dimensions.get('window').width * 0.9,
					  justifyContent: 'center',
					  alignItems: 'center',
					  margin: 1}}
					  
		  >

			  <Text style={{alignSelf:'center'}}>
				Chaimager list of characters.
			  </Text>
		  
		  <View style={{flexDirection:'row'}}>

			<Text>{info.item.name}</Text>
			<Image source={info.item.image} />

		  </View>

	
		</Card>
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

		<View
			style={{ 
				borderBottomColor: 'blue',
				borderBottomWidth: 1,
				width: Dimensions.get('window').width * this.state.chaimager_stage / 100 
			}}
			/>

		<Modal 
			animationType="slide"
			transparent={true}
			visible={this.state.chaimager_list_visible}
			onRequestClose={() => {this.setState((state) => {
				return {
					chaimager_list_visible: false
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

					<List 
						data={this.state.chaimager}
						renderItem={renderChaimagerList}
						numColumns={1}/>

				</View>

			</View>


	</Modal>
					
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

					<View>
						<TextInput placeholder="Keywords to find"
									defaultValue={this.state.chaimager_name_cache}
									textAlign={'center'}
									onChangeText={(text) => this.chaimager_cache_name(text)}/>
									

						<TextInput	placeholder= "Small biography (max 4 lines)"
									defaultValue={this.state.chaimager_bio_cache}
									textAlign={'center'}
									numberOfLines={4}
									multiline={true}
									maxLength={200}
									onChangeText={(text) => this.chaimager_cache_bio(text)}
						/>
					</View>

					<View 	style = {{height: Dimensions.get('window').height/6, }}>
					<ColorPicker
						onColorChangeComplete={(color) => this.chaimager_chache_color(color)}
						thumbSize={40}
						sliderSize={40}
						noSnap={true}
						row={false}
						discrete={true}
					/>
					</View>

					<View 	style = {{height: Dimensions.get('window').height/6,
										marginTop: Dimensions.get('window').height/4,
										flexDirection: 'row'}}>
											
						<Button onPress={() => this.image_selector()}  
								title="Select Image" >Select Image</Button>

						<Image source={{uri:this.state.chaimager_image_cache}} 
								style={{width: Dimensions.get('window').height/6,
										height: Dimensions.get('window').height/6,}}
								/>

					</View>
					
					<View style={{flexDirection:'row',
								marginTop: 10}}>

						<Button  onPress={() => this.chaimager_cache_save()}  
								title="Save" >Save</Button>
							
					</View>

				</View>
			</View>


	</Modal>
		
		<View style={styles.pdf_container}> 
			<Pdf
				source={this.state.source}
				onLoadComplete={(numberOfPages,filePath)=>{
					this.load_chaimager(filePath);
				}}
				onPageChanged={(page,numberOfPages)=>{
					this.update_page_homescreen(page);
				}}

				page={this.state.current_page}

				onError={(error)=>{
					console.log(error);
				}}

				onPressLink={(uri)=>{
					this.chaimager(uri);  //Chaimager handling of characters
				}}
				enableRTL={true}

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