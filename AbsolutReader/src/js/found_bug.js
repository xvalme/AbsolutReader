import React, {Component} from 'react';
import { Layout, Divider, Button, TopNavigation, Icon,Text, TopNavigationAction, List, Card} from '@ui-kitten/components';
import { Image, SafeAreaView, Dimensions, View, Linking} from 'react-native';
import FlashMessage from "react-native-flash-message";
import {
    showMessage  }
from "react-native-flash-message";

export default class Found_bug extends Component {

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

    open_github = async () => {

        try{
        Linking.openURL('https://github.com/xvalme/AbsolutReader/issues/new');
        }
        catch{
            showMessage({
                message: "Link opening has failed. Check your internet connection.",
                type: "danger",
                durantion: 3000,
                floating: true,
                icon: "auto",
            });
        }

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
                    <Text>If you found a bug, glitch, or something that does not work very well, or just have an idea/request, you are in the right place.</Text>
                    <Text> Use the button below to open our Github repository and fill out the form. </Text>
                        <Text>Thanks for your contribute in making the app even better!</Text>

                </View>

                <View style={{backgroundColor:"white", alignItems: "center"}}>

                    <Button onPress={() => {this.open_github()}}>Open a Github Issue</Button>
                    
                </View>

                <FlashMessage position="bottom"/>

            </SafeAreaView>

        )


    }

}