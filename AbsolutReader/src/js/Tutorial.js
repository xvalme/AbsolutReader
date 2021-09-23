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
                <View>
                
                    <Text>Hi, there!</Text>
                    <Text>Welcome to Absolut Reader.</Text>
            
                </View>

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

                </TabView>
                
                    <Tab title="1">

                        <Tab1 />

                    </Tab>

                </View>

                <FlashMessage position="bottom"/>

            </SafeAreaView>

        )


    }

}