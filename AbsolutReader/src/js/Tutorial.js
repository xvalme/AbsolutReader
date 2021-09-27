import React, {Component} from 'react';
import { Layout, Divider, Button, TopNavigation, Icon,Text, TopNavigationAction, List, Card, TabView, Tab} from '@ui-kitten/components';
import { Image, SafeAreaView, Dimensions, View, Linking,  StyleSheet} from 'react-native';
import FlashMessage from "react-native-flash-message";
import {
    showMessage  }
from "react-native-flash-message";

export default class Tutorial extends Component {

    constructor(props){
        super(props);

        var app_package = require('../../package.json');
        this.version = app_package["version"];

        this.state={step: 0 //Current step of tutorial
        }
    }

    handleBackButton = async () => {
		
		//Going back to library, not forgetting to update it:

		this.props.navigation.navigate('Library', {back_action: true});

	}

    render () {

        const render_top_logo = () => (
            <Image source={require('./../assets/images/logo.png')} style={{
                width: Dimensions.get('window').height/12*0.7,
            height: Dimensions.get('window').height/12*0.7,
                }} />
            );

        const skip_button = () => (
            <Button size="small">Skip</Button>
        )

        return (

            <SafeAreaView style={{ flex: 1 }} >

                                
                <TopNavigation style={{height:Dimensions.get('window').height / 12}}
                                            alignment='center'
                                            title='Absolut Reader'
                                            subtitle={'Version Alpha ' + this.version}
                                accessoryRight={render_top_logo}
                                accessoryLeft={skip_button} />

                <Divider />

                <View style={{backgroundColor:"white", alignItems: "center"}}>

                    <TabView selectedIndex={this.state.step} onSelect={(index) => {this.setState((state) => {return {
                         step: index}
                                                          ;}
                                              );
                                }
                        } style={{width:Dimensions.get('window').width}}>

                        <Tab title="1">

                        <Layout style={{ 
                        height:Dimensions.get('window').height / 12 * 10.4,
                        justifyContent: 'center', 
                        alignItems: 'center',}}>

                                <Image source={require('./../assets/images/hello.png')} style={styles.image}/>

                                <View>
                        
                                    <Text style={styles.bold_text} >Hi, there!</Text>
                                    <Text style={styles.semi_bold_text} >Welcome to Absolut Reader.</Text>
                                    <Text style={styles.text}>Follow this quick tutorial to have an idea of the app´s functionalities.</Text>

                                </View>

                                

                            </Layout>
                        </Tab>

                        <Tab title="2">

                            <Layout style={{ 
                            height:Dimensions.get('window').height / 12 * 10.4,
                            justifyContent: 'center', 
                            alignItems: 'center',}}>

                                    <View>
                            
                                        <Text style={styles.bold_text} >So...what is AbsolutReader really?</Text>
                                        <Text style={styles.text} >We aim to create the best e-book reader out there, providing you
                                        the best tools to read confortably on your devices. Highly customizable, made by the community, and
                                        with new tools that will improve your experience.</Text>
                                        <Text style={styles.text}>Here is a small list of this app´s functionalities:</Text>
                                        <Text style={styles.backgrounded_text}>Chaimager to help you remember stuff.</Text>
                                        <Text style={styles.backgrounded_text_2}>Change everything you want, from the background color, to the library style.</Text>
                                        <Text style={styles.backgrounded_text}>Cloud ready - Never loose your track just because you don´t have your mobile next to you. Keep reading everywhere.</Text>
                                        <Text style={styles.backgrounded_text_2}>Track your progress online, and brag your friends about it.</Text>
                                        <Text style={styles.backgrounded_text}>Multi platform - Read on your android, IOS, or Windows device!</Text>
                                        <Text style={styles.backgrounded_text_2}>Stopwatch,and diferent night modes to help you not hurting your eyes.</Text>

                                    </View>

                                    

                                </Layout>
                        </Tab>

                        <Tab title="3">
                            <Layout style={{ 
                            height:Dimensions.get('window').height / 12 * 10.4,
                            justifyContent: 'center', 
                            alignItems: 'center',}}>
                                <View>
                        
                                    <Text style={styles.semi_bold_text}>What to expect from this app:</Text>
                                    <Text style={styles.backgrounded_text_2}>Basic functionalities such as PDF reading, Chaimager, and a library are already working. We are slowly updating them and adding new features.</Text>
                                    <Text style={styles.backgrounded_text}>This app is currently in heavy development. Bugs might happen and we count on you to help us! </Text>
                                    <Text style={styles.backgrounded_text_2}>For now we only support PDFs. Other formats available soon.</Text>
                                    <Text style={styles.backgrounded_text}>This app is 100% free, but we also need to eat (and drink coffe). We are planning to add custom features for 
                                    donators soon!</Text>

                                    <Text style={styles.semi_bold_text}>New stuff from last version:</Text>
                                    <Text style={styles.backgrounded_text_2}>This is the 1st version :D.</Text>

                                    <Text style={styles.semi_bold_text}>Want to contribute?</Text>
                                    <Text style={styles.backgrounded_text}>If you are a React Native programmer, or a Graphic Designer that wants to contribute with 
                                    some heavy work, contact us in our main website: absolutreader.works .</Text>

                                </View>
                            </Layout>
                        </Tab>

                        <Tab title="4">
                        
                         <Layout style={{ 
                        height:Dimensions.get('window').height / 12 * 10.4,
                        justifyContent: 'center', 
                        alignItems: 'center',}}>
                                <View>
                        
                                    <Text style={styles.semi_bold_text}>The biggest tool of AbsolutReader: Chaimager</Text>
                                    <Text style={styles.backgrounded_text_2}>Always forgetting the names of the characters from the book you are reading? </Text>
                                    <Text style={styles.backgrounded_text}>Chaimager is here to help:</Text>
                                    <Text style={styles.backgrounded_text_2}>It allows you to create a config file with the names, and a small biography/image of each one
                                        and using the Forge Tool you can merge it with a pdf, and that will create a new E-book, full of hyperlinks
                                        anywhere the character´s name is called, so that you may click on it and get the information about it. 
                                    </Text >
                                    <Text style={styles.backgrounded_text}>Simple, right? There is a specifi tutorial for it in the app if you have questions.</Text>

                                </View>
                            </Layout>
                        </Tab>
                        
                    </TabView>

                </View>

                <FlashMessage position="bottom"/>

            </SafeAreaView>

        )


    }

}

//Stylesheet
const styles = StyleSheet.create({
    text: {
        textAlign: 'center',
        margin: 5,
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
    image:{
        width: Dimensions.get('window').height / 5,
        height: Dimensions.get('window').height / 5,
        alignSelf: "center"
    }
    });