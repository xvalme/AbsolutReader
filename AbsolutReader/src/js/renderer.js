import React, {Component} from 'react';
import Pdf from 'react-native-pdf'; //Rendering
import { StyleSheet, View , Dimensions, SafeAreaView, Modal, Image, TextInput, BackHandler, ScrollView} from 'react-native';
import { Layout, Text, TopNavigation, TopNavigationAction, Button, Icon, Divider, List, ListItem, Card} from '@ui-kitten/components';

var RNFS = require('react-native-fs');

export default class Pdf_Renderer extends Component {

	constructor(props) {
		super(props);

		//Creates chaimager folder if it does not exists already:
		//RNFS.mkdir(this.path + '/chaimager_files'); 

		this.path = RNFS.DocumentDirectoryPath; //Main path of app

		this.state = {chaimager: {"ids": [{}]}, 
					chaimager_loaded: false, 
					source:{uri:props.route.params["filepath"],cache:true},
					current_page: props.route.params["current_page"],
					filename:props.route.params["filepath"],
					can_leave: true, //If is everything ready to move screen
					is_page_updating: false,
					//Modals:
					chaimager_popup_visible: false,
					chaimager_list_visible: false,
					modal_character: '',
					//Dimensions for pdf:
					width: Dimensions.get('window').width,
					height: Dimensions.get('window').height,
				}

		
	}

	componentDidMount() {

		//Adding listeners:
		BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
		Dimensions.addEventListener('change', (dimensions) => {this.setState(() => {return {width: dimensions.window.width,
																							height: dimensions.window.height }});} )

		//Updating state with chaimager values (if they exist):

		if (this.props.route.params["forged"] == true) {

			//Chaimager is active in this file, so loading it to state

			var chaimager = this.props.route.params["chaimager"];

			this.setState(() => {return{chaimager:chaimager}});

		}



	}

	handleBackButton = async () => {
		
		//Going back to library, not forgetting to update it:

		//Checks 1st if can leave the screen:
		var can_leave = this.state.can_leave;

		if (can_leave == false){
			setTimeout(() => {  console.log("Cannot leave. 1second timeout");this.handleBackButton() }, 1000);
		}
		else {
		this.props.navigation.navigate('Homescreen', {back_action: true});
		}


		
	}

	async chaimager (link) {
		/* 
		Given a clicked link, checks if its Chaimager and opens a pop up windows
		with the information of the character.
		*/
		
		// First we check if it is a chaimager reference:
		
		if (link.includes("https://absolutreader.works/chaimager/[")==true) {

			console.log('Chaimager link clicked');
			var name = link.slice(38).replace('[', '').replace(']', '');
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

	async update_page_homescreen (page) {
		//Updates the homescreen value of the pages read when user starts new page

		if (this.state.is_page_updating == false) {
			console.log(page);

			this.setState((state) => {return {can_leave: false,
												is_page_updating: true}}); //Locking

			const filepath = this.state.source.uri;

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

			this.setState((state) => {return {can_leave: true, is_page_updating: true}}); //Unlocking 
		}

		else {
			setTimeout(this.update_page_homescreen(page), 100)
		}

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
	<TopNavigationAction icon={BackIcon} onPress={() => this.handleBackButton()}/>
	);

	const renderChaimagerList = (info) => (
		<Card
		  status='basic'
		  style={{width: Dimensions.get('window').width *  0.8,  borderColor: info.item.color}}
		  >
		
			<View style={{flexDirection: 'row', 
						height: Dimensions.get('window').height / 20, }}>

				<View style={{flexDirection: 'row', alignItems: 'center'
						}}>

					<Image source={{uri:info.item.image}} 
											style={{width: Dimensions.get('window').height / 12,
													height: Dimensions.get('window').height / 12,}}
											/>

					<Text>{info.item.name}</Text>

				</View>

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

					<Text>Chaimager list of characters</Text>

					<List 
						style = {{marginLeft: -20, marginRight: -20}}
						data={this.state.chaimager.ids.slice(1)}
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
	
		<View style={styles.pdf_container}> 
			<Pdf
				source={this.state.source}
				onLoadComplete={(numberOfPages,filePath)=>{
					
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

				maxScale={10}
				minScale={0.1}

				fitPolicy={0}

				style={{	flex:1,
							width: this.state.width}}/>
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
});