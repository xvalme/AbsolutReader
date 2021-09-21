import React, {Component} from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, Layout, Divider, Button, TopNavigation, Icon,Text, TopNavigationAction, List, Card} from '@ui-kitten/components';
import { Image, StyleSheet, SafeAreaView, Dimensions, View, PermissionsAndroid, Modal, TextInput} from 'react-native';

export default class Homescreen extends Component {

    constructor(props){
        super(props);

        var app_package = require('./../../package.json');
        this.version = app_package["version"];

        this.state={}
    }

    handleBackButton = async () => {
		
		//Going back to library, not forgetting to update it:

		this.props.navigation.navigate('Homescreen', {back_action: true});

	}

    render () {

        const renderBackAction = () => (
            <TopNavigationAction icon={BackIcon} onPress={() => this.handleBackButton()}/>
            );

        const BackIcon = (props) => (
            <Icon {...props} name='arrow-back'/>
            );

        const render_top_logo = () => (
            <Image source={require('./../assets/images/logo.png')} style={{
                width: Dimensions.get('window').height/12*0.7,
            height: Dimensions.get('window').height/12*0.7,
                }} />
            );

        return (

            <SafeAreaView style={{ flex: 1 }} >

                <TopNavigation style={{height:Dimensions.get('window').height / 12}}
                            alignment='center'
                            title='Absolut Reader'
                subtitle={'Make a bug report.'}
                accessoryRight={render_top_logo}
                accessoryLeft={renderBackAction}/>

                <View style={{backgroundColor:"white", alignItems: "center"}}>

                    <Text>As you know, our app is quite recent and it is in heavy development, so bugs might appen, and we need your help to find them.</Text>
                    <Text>If you found a bug, glitch, or something that does not work very well, or just have an idea/request, you are in the right place.
                        Thanks for your contribute in making the app even better!</Text>

                </View>

                <View style={{backgroundColor:"white", alignItems: "center"}}>



                </View>


            </SafeAreaView>

        )


    }

}