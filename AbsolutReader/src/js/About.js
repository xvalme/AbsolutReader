import React, {Component} from 'react';
import { StyleSheet, View , Dimensions, SafeAreaView, Image, ScrollView, Linking} from 'react-native';
import { Text, TopNavigation, TopNavigationAction, Button, Icon, Divider} from '@ui-kitten/components';
import FlashMessage from "react-native-flash-message";
import { showMessage } from "react-native-flash-message";

export default class About extends Component {

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

    open_xval_wbsite = () => {
        try{
            Linking.openURL('https://xval.me');
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

    open_project_wbsite = () => {
        try{
            Linking.openURL('https://absolutreader.works');
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
                subtitle={"Version " + this.version} 
                accessoryLeft={renderBackAction}/>

                <Divider />

                <ScrollView>

                    <View style={{backgroundColor:"white"}}>

                        <Image style={styles.image} source={require('./../assets/images/logo.png')} />

                        <Text style={styles.big_text}>
                            About us
                        </Text>

                        <Text style={styles.backgrounded_text}>Main developer</Text>
                        <Text style={styles.backgrounded_text_2}>Valentino C. (Also know as xVal)</Text>
                        <Text></Text>
                        <Text style={styles.backgrounded_text}>Designer and Image Artist</Text>
                        <Text style={styles.backgrounded_text_2}>Valentino C. (Also know as xVal)</Text>
                        <Text></Text>
                        <Text style={styles.backgrounded_text}>Current version:</Text>
                        <Text style={styles.backgrounded_text_2}>{this.version} Released on Oct 3, 2021 </Text>
                        <Text></Text>
                        <Text style={styles.backgrounded_text}>This app is realeased under the GNU Affero General Public License v3.0. The
                        logo and paitings present in this software are Copyrighted by Valentino C. Do not use or redistribute these without 
                        permission. If you wish to contact any of the team´s members, use general@absolutreader.works.</Text>

                    </View>

                    <View style={{backgroundColor:"white", alignItems: "center", justifyContent:"center", margin:5 , flexDirection:"row"}}>

                        <Button onPress={() => {this.open_xval_wbsite()}}>xVal´s website</Button>
                        <Button style={{margin: 2}} onPress={() => {this.open_project_wbsite()}}>AbsolutReader Website</Button>
                        
                    </View>
                </ScrollView>

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
    },
    backgrounded_text:{
        textAlign: 'center',
        marginLeft: Dimensions.get('window').width / 20,
        marginRight: Dimensions.get('window').width / 20,
        backgroundColor:"#ffde8a",
    },
    backgrounded_text_2:{
        textAlign: 'center',
        marginLeft: Dimensions.get('window').width / 20,
        marginRight: Dimensions.get('window').width / 20,
        backgroundColor: '#ffe9b3',
    },
    bold_text : {
        textAlign:"center",
        fontWeight: "bold",
        fontSize: Dimensions.get('window').height / 25,
        margin: 10

    },
    semi_bold_text: {
        textAlign:"center",
        fontWeight:"bold",
        fontSize: Dimensions.get('window').height / 40,
        margin: 10
    },
    });