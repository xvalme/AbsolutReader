import React, {Component} from 'react';
import Pdf from 'react-native-pdf'; //Rendering
import { AppState, StyleSheet, View , Dimensions, SafeAreaView, Modal, Image, BackHandler} from 'react-native';
import { Text, TopNavigation, TopNavigationAction, Icon, Divider, List, Card} from '@ui-kitten/components';
import FlashMessage from "react-native-flash-message";
import { showMessage } from "react-native-flash-message";

var RNFS = require('react-native-fs');

export default class Pdf_Renderer extends Component {

	constructor(props) {
		super(props);

		this.path = RNFS.DocumentDirectoryPath; //Main path of app

		this.state = {chaimager: {"ids": [{}]}, 
					chaimager_loaded: false, 
					source:{uri:props.route.params["filepath"],cache:true},
					current_page: props.route.params["current_page"],
					filename: "PDF E-book",
					can_leave: true, //If is everything ready to move screen
					appState: AppState.currentState, //If app is in fore/back-ground
					//Modals:
					chaimager_popup_visible: false,
					chaimager_list_visible: false,
					modal_character: '',
					//Dimensions for pdf:
					width: Dimensions.get('window').width,
					height: Dimensions.get('window').height,
					//Show (or not) top bar:
					show_topbar: true,
				}

		this.library_json = this.path + '/library.json';

		//Binding function of listener:
		this.AppStateChange = this.AppStateChange.bind(this);

		
	}

	AppStateChange (state) {

		if (state == "background") {

			this.update_page_homescreen(this.state.current_page);
		
			return 0;

		}
	}

	componentDidMount() {

		//Adding listeners:
		BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
		Dimensions.addEventListener('change', (dimensions) => {this.setState(() => {return {width: dimensions.window.width,
																							height: dimensions.window.height }});} );
		
		//Listener for fore/back ground
		AppState.addEventListener(
			"change", this.AppStateChange
		)	

		//Updating state with chaimager values (if they exist):

		if (this.props.route.params["forged"] == true) {

			//Chaimager is active in this file, so loading it to state

			var chaimager = this.props.route.params["chaimager"];

			this.setState(() => {return{chaimager:chaimager}});

		}

	}

	componentWillUnmount() {
		//User leaves 1st the screen, and only then component unmounts.

		AppState.removeEventListener(
			"change", this.AppStateChange
		)

		BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);

		console.log("Unmounted. Listeners sucessfully removed.")

	}

	handleBackButton = async () => {
		
		//Going back to library, not forgetting to update it

		//First saving the page counter;
		await this.update_page_homescreen(this.state.current_page);

		//Checks 1st if can leave the screen
		if (this.state.can_leave == false){
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
		//Updates the homescreen value of the pages read when user tries to:
		//1) Leave the file itself
		//2) Leave the app

		console.log("Updating library with changes of page counter.")

		try{

		this.state.can_leave = false;

		var json = await RNFS.readFile(this.library_json);

		var library = await JSON.parse(json);

		for (var i = 0; i<library.books.length; i++){
			
			//Finding the right book

			if (library.books[i].source.uri == this.props.route.params["filepath"]) {
				
				//Now editing the file
				library.books[i].current_page = page;

			}
		}

		//Saving file:
		var saving_library = JSON.stringify(library);

		await RNFS.unlink(this.library_json);
		await RNFS.writeFile(this.library_json, saving_library, 'utf8');

		this.state.can_leave = true; //Unlocking 

		return 0; }

		catch (e) {
			console.error("Could not update the homescreen with page counter due to: \n" + e);
		}
	}

	async toggle_topbar (state) {

		this.setState(() => {return {show_topbar: state}});
		
		return 0

	} 

	toggle_chaimager_list (state) {

		if (this.state.chaimager.ids.length == 1) {

			//There is nothing to be shown on chaimager, so it won´t open the chaimager list.

			//TODO #14
			showMessage(
				{
			  message: "Ups! It seems that this book does not have associated with it a Chaimager file, so there is no list to show.",
              type: "danger",
              durantion: 3000,
              floating: true,
              icon: "auto",
				}
			);

			return 0;

		} 
		
		this.setState((state) => {
			return {
				chaimager_list_visible: true
			};
		})

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

		<TopNavigationAction icon={PaletteIcon} onPress={() => {this.toggle_chaimager_list(true)}} />		
													
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

		{//Only shows if topbar state is true. Handled by toggle_topbar
		this.state.show_topbar == true  &&
		<TopNavigation style={{height:Dimensions.get('window').height / 12}}
						alignment='center'
						title='Absolut Reader'
						subtitle={this.state.filename}
						accessoryLeft={renderBackAction}
						accessoryRight={renderRightActions}/> }

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
					this.state.current_page = page;
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

				onPageSingleTap={() => {this.toggle_topbar(!this.state.show_topbar)}}

				style={{	flex:1,
							width: this.state.width}}/>
		</View>

		<FlashMessage position="bottom"/>
		
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