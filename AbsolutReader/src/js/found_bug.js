import React, {Component} from 'react';
import {Divider, Button, TopNavigation, Icon,Text, TopNavigationAction} from '@ui-kitten/components';
import { Image, SafeAreaView, Dimensions, View, Linking, StyleSheet} from 'react-native';
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

		this.props.navigation.navigate('Library', {back_action: true});

	}

    open_github = async () => {

        try{
        Linking.openURL('https://github.com/xvalme/AbsolutReader/issues/new');
        }
        catch{
            showMessage({
                message: "Link opening has failed. Check your internet connection or try again later.",
                type: "danger",
                durantion: 5000,
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

            <SafeAreaView style={{backgroundColor:"white", flex:1}}>

                <TopNavigation style={{height:Dimensions.get('window').height / 12}}
                            alignment='center'
                            title='Absolut Reader'
                subtitle={'Make a bug report.'}
                accessoryRight={render_top_logo}
                accessoryLeft={renderBackAction}/>

                <Divider />

                <View style={{ justifyContent:"center", alignItems:"center", flex:1 }} >

                    <View style={{backgroundColor:"white"}}>

                        <Image style={styles.image} source={require('./../assets/images/Magnifying_glass_icon.svg.png')} />

                        <Text style={styles.big_text}>
                            We don´t like bugs either.
                        </Text>

                        <Text style={styles.text}>Help us finding them. Or just give us some ideas :).</Text>
                        <Text style={styles.text}> Use the button below to open our Github repository and fill out the form. </Text>
                        <Text style={styles.text}>Thanks!</Text>

                    </View>

                    <View style={{backgroundColor:"white", alignItems: "center", margin: 10}}>

                        <Button onPress={() => {this.open_github()}}>Open a Github Issue</Button>
                        
                    </View>
                </View>

                <FlashMessage position="bottom"/>

            </SafeAreaView>

        )


    }

}

const styles = StyleSheet.create({
    text: {
        textAlign: "center",
        margin: 2,
        fontSize: Dimensions.get('window').height / 48,
    },
    big_text: {
        margin: 10,
        textAlign: "center",
        fontWeight: "bold",
        fontSize: Dimensions.get('window').height / 30,
    },
    image:{
        width: Dimensions.get('window').height / 3,
        height: Dimensions.get('window').height / 3,
        alignSelf: "center"
    }
    });