import React, {Component} from 'react';
import { Layout, Divider, Button, TopNavigation, Icon,Text, TopNavigationAction, List, Card, TabView, Tab} from '@ui-kitten/components';
import { Image, SafeAreaView, Dimensions, View, Linking} from 'react-native';
import FlashMessage from "react-native-flash-message";
import {
    showMessage  }
from "react-native-flash-message";

export default class Tutorial extends Component {

    constructor(props){
        super(props);

        var app_package = require('../../package.json');
        this.version = app_package["version"];

        this.state={step: 1 //Current step of tutorial
        }
    }

    handleBackButton = async () => {
		
		//Going back to library, not forgetting to update it:

		this.props.navigation.navigate('Homescreen', {back_action: true});

	}

    render () {

        const render_top_logo = () => (
            <Image source={require('./../assets/images/logo.png')} style={{
                width: Dimensions.get('window').height/12*0.7,
            height: Dimensions.get('window').height/12*0.7,
                }} />
            );

        const tab1 = () => (
                
            <Tab title="1">
                <View>
            
                    <Text>Hi, there!</Text>
                    <Text>Welcome to Absolut Reader.</Text>
                    <Text>Follow this quick tutorial to have an idea of the app´s functionalities.</Text>

                </View>
            </Tab>

        )

        const tab2 = () => (
                
            <Tab title="2">
                <View>
            
                    <Text>Things to keep in mind:</Text>
                    <Text>-This app is currently in Beta version. Bugs might happen and we count on you to help us finding them! </Text>
                    <Text>-For now we only support PDFs. Other formats we be available soon.</Text>

                </View>
            </Tab>

        )

        const tab3 = () => (

            <Tab title="3">
                <View>
            
                    <Text>The biggest tool of AbsolutReader: Chaimager</Text>
                    <Text>Always forgetting the names of the characters from the book you are reading? </Text>
                    <Text>Chaimager is here to help:</Text>
                    <Text>It allows you to create a config file with the names, and a small biography/image of each one
                        and using the Forge Tool you can merge it with a pdf, and that will create a new E-book, full of hyperlinks
                        anywhere the character´s name is called, so that you may click on it and get the information about it. 
                    </Text>
                    <Text>Simple, right?</Text>


                </View>
            </Tab>

        )


        return (

            <SafeAreaView style={{ flex: 1 }} >

                    <Button> Skip Tutorial</Button>

                <View style={{backgroundColor:"white", alignItems: "center"}}>

                    <TabView selectedIndex={this.state.step} onSelect={(index) => {this.setState((state) => {return {
                         top_index: index}
                                                          ;}
                                              );
                                }
                        }>

                        <tab1 />
                        <tab2 />
                        <tab3 />

                    </TabView>

                </View>

                <FlashMessage position="bottom"/>

            </SafeAreaView>

        )


    }

}