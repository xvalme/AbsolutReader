import React, {Component} from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, Layout, Divider, Button, TopNavigation, Icon,Text, TopNavigationAction, List, Card, Modal} from '@ui-kitten/components';
import { Image, StyleSheet, SafeAreaView, Dimensions, View, TextInput, ScrollView, BackHandler} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import ColorPicker from 'react-native-wheel-color-picker';

var RNFS = require('react-native-fs');

export default class Chaimager_adder extends Component {
    //User screen to create a new chaimager file

    constructor(props){
        super(props);

        this.state = {
            chaimager: {"ids":[{}]},
            chaimager_adder_popup_visible: false,
            filename_cache: '',
            chaimager_name_cache: '',
            chaimager_bio_cache: '',
            chaimager_chache_color: '#FFFFFF',
            chaimager_image_cache: 'data:image/png;base64,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',
            height: Dimensions.get('window').height,
            width: Dimensions.get('window').width,

        }
    }

    componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
		Dimensions.addEventListener('change', (dimensions) => {this.setState(() => {return {width: dimensions.window.width,
																							height: dimensions.window.height }});} )

	}

    handleBackButton = async () => {

        //Closing possible modals:
        this.setState(() => { return {chaimager_adder_popup_visible: false}});

		this.props.navigation.navigate('Homescreen', {back_action: true});
		
	}

    toggle_chaimager = async () => {
        console.log("Toggle chaimager");

        this.setState(() => { return { chaimager_adder_popup_visible: !this.state.chaimager_adder_popup_visible }})
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

    async populator() {
        //If user is editing the file will populate it

        if (this.props.route.params["name"] == '#kofokfekowf#NEW7951') {
            //new chaimager
            return 0
        }

        else {

            //Editing so needs to parse data from file
            var path = RNFS.DocumentDirectoryPath + '/chaimager_files/' + this.props.route.params["name"] + '.json';

            var file = await RNFS.readFile (path);

            //Now converting to json
            var json = await JSON.parse(file);

            //Updating global

            this.setState((state) => {return {chaimager: json}});
            
        }

    }

    async chaimager_edit (info) {
		//When the user requests to change a character.
        console.log("User editing a character.")
		
		//Preparing edit modal variables:
		this.chaimager_cache_bio(info.bio);
		this.chaimager_cache_name(info.name);
		this.chaimager_chache_color(info.color);
		this.setState((state) => {return {chaimager_image_cache: info.image}});

		//Making modal visible

		this.setState((state) => {return {chaimager_adder_popup_visible: true}});		

	}

    async delete_chaimager (name) {
        console.log("Deleting chaimager.")

		var chaimager = this.state.chaimager["ids"];

		//Deletes a character
		for (let i=0; i<chaimager.length; i++) {
			if (chaimager[i].name == name){
				chaimager.splice(i, 1);
			}


		await this.setState((state) => {return {chaimager: {"ids":chaimager},
										}});

	}}
    
    chaimager_cache_name(name) {
		this.setState((state) => {return {chaimager_name_cache: name}});
	}

	chaimager_cache_bio(bio) {
		this.setState((state) => {return {chaimager_bio_cache: bio}});
	}

    chaimager_cache_filename(filename) {
		this.setState((state) => {return {filename_cache: filename}});

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

		var editing = false;

		//Checks if name already exists, and, if yes, edit it instead of adding it.
		for (let i=0; i<this.state.chaimager.ids.length; i++) {
			
			if (this.state.chaimager.ids[i].name == name){
				//Only editing
				this.state.chaimager.ids[i].name = name;
				this.state.chaimager.ids[i].bio = bio;
				this.state.chaimager.ids[i].color = color;
				this.state.chaimager.ids[i].image = image;

				editing = true;
				console.log("Changing character.");
			}
		}

		if (editing == false){
		this.state.chaimager["ids"].push({name: name, bio:bio, color:color, image:image}); }

		//Reseting cache:
		await this.setState((state) => {return {chaimager_loaded: false,
		chaimager_adder_popup_visible: false,
		chaimager_name_cache:'',
		chaimager_color_cache: '',
		chaimager_bio_cache: '',
		chaimager_image_cache: 'data:image/png;base64,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',
		};});

		console.log("New character saved");
		
	}

    async save_file () {

        //If file exists already (i.e. editing), deletes and creates a new one with updated information
        console.log("Saving file");

        var filename = this.state.filename_cache;

        var path = RNFS.DocumentDirectoryPath + '/chaimager_files/' + filename + '.json'

        console.log(path);

        if (RNFS.exists(path) == true) {

            await RNFS.unlink(path);  //Removing

        }

        //Saving
		await RNFS.writeFile(path, JSON.stringify(this.state.chaimager), 'utf8');

        console.log("Saved.");
    }

    render () {

        const renderChaimagerList = (info) => (
            <Card
              status='basic'
              style={{width: Dimensions.get('window').width *  0.95,  borderColor: info.item.color, alignSelf: 'center'}}
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

                    <View style={{
                        flex:1,
                        flexDirection: 'row-reverse', 
                        }}>

                            <Button size='small' appearance={'ghost'}  onPress={() => this.delete_chaimager(info.item.name)}>X</Button>
                            <Button size='small' onPress={() => this.chaimager_edit(info.item)}>Edit</Button>

                    </View>
    
                </View>
        
            </Card>
          );

        const BackIcon = (props) => (
            <Icon {...props} name='arrow-back'/>
        );
    
        const MenuIcon = (props) => (
            <Icon {...props} name='menu'/>
        );
    
        const renderRightActions = () => (
            <React.Fragment>
    
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

        return (
            <SafeAreaView style={{ flex: 1 }}>

                <TopNavigation style={{height:Dimensions.get('window').height / 12}}
                                        alignment='center'
                                        title='Absolut Reader'
                                        subtitle='Chaimager editor'
                                        accessoryLeft={renderBackAction}
                                        accessoryRight={renderRightActions}/>

                <View style={{flexDirection: 'row'}}>

                    <Text>Name of the Chaimager file:</Text>
                    <TextInput placeholder="Filename"
                                                defaultValue={this.state.filename}
                                                textAlign={'center'}
                                                onChangeText={(text) => this.chaimager_cache_filename(text)}/>

                </View>

                <View>

                    <Text>Characters</Text>

                    <List 
                        renderItem={renderChaimagerList}
                        numColumns={1}
                        data={this.state.chaimager.ids.slice(1)} />


                </View>

                <View style={{flex: 1, flexDirection:'row', alignSelf:'center'}}> 
                    <Button onPress={() => this.toggle_chaimager()} style={{marginTop:10, height:Dimensions.get('window').height / 12}}>Add character</Button>
                    <Button onPress={() => this.save_file()} style={{marginTop:10, height:Dimensions.get('window').height / 12}}>Save</Button>
                </View>

                <Modal 
		
                        animationType="slide"
                        transparent={true}
                        visible={this.state.chaimager_adder_popup_visible}
                        onRequestClose={() => {this.setState((state) => {
                            return {
                                chaimager_adder_popup_visible: false
                            };
                        })}}>

                        <ScrollView>

                        <View style = {{flex: 1,
                                    justifyContent: "center",
                                    alignItems: "center",
                                        flexDirection: "column"
                                    }}>
                        
                            <View style = {{margin: 20,
                                            backgroundColor: "white",
                                            flexDirection: "column",
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

                                <View 	style = {{height:this.state.height/6, }}>

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

                                    <Button  onPress={() => {this.toggle_chaimager();		//Reseting cache:
                                                                this.setState((state) => {return {chaimager_loaded: false,
                                                                chaimager_adder_popup_visible: false,
                                                                chaimager_name_cache:'',
                                                                chaimager_color_cache: '',
                                                                chaimager_bio_cache: '',
                                                                chaimager_image_cache: 'data:image/png;base64,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',
                                                                };});}} 
                                            status='danger' 
                                            title="Save" >Cancel</Button>
                                        
                                </View>

                            </View>
                        </View>
			</ScrollView>

        </Modal>

            </SafeAreaView>
        )
    }

}