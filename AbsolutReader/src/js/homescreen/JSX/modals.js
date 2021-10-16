import React from 'react';
import { Button, Text} from '@ui-kitten/components';
import { Image, Dimensions, View, Modal, Linking} from 'react-native';

export function Welcome_modal (props) {
  return (
  <Modal 
        animationType="slide"
        transparent={true}
        onRequestClose={() => {this.setState((state) => {return {
                                                          welcome_modal_visible: false}
                                                          ;}
                                              );
                                }
                        }
        visible={this.state.welcome_modal_visible}>

        <View style = {{flex: 1,
              justifyContent: "center",
              alignItems: "center",
              width: Dimensions.get('window').width,
              height:Dimensions.get('window').height,
              backgroundColor:"white"
              }}>
        

          
            <View>
            <Image style={{width: Dimensions.get('window').height / 5,
                        height: Dimensions.get('window').height / 5,
                        alignSelf: "center"}} 
        source={require('./../assets/images/logo.png')} />

                <Text style={{textAlign:'center', fontWeight:"bold", fontSize: Dimensions.get('window').height / 30 }}>AbsolutReader</Text>

                <Text style={{textAlign:'center',
              margin: Dimensions.get('window').height / 30,
              fontSize: Dimensions.get('window').height / 40 }}>
                Thanks for being using our app. If you are liking it, consider making a donation.</Text>

                <Text style={{textAlign:'center', fontSize: Dimensions.get('window').height / 45 }}>
                  Everyone hates ads. A donation helps us keep developing without them.</Text>

                <Text style={{textAlign:'center', fontSize: Dimensions.get('window').height / 45, marginBottom: Dimensions.get('window').height / 30,}}>Thanks!</Text>

                <View style={{flexDirection: "row", justifyContent:"center"}}>
                
                  <Button status="success"
                          onPress={() => {try{
                            Linking.openURL('https://ko-fi.com/absolutreader');
                            }
                            catch{
                                showMessage({
                                    message: "Link opening has failed. Check your internet connection or try again later.",
                                    type: "danger",
                                    durantion: 5000,
                                    floating: true,
                                    icon: "auto",
                                });
                            }}} style={{margin:10}}> Donate </Button>
                  
                  <Button accessoryLeft={CloseIcon} appearance='outline' style={{margin:10}} status='danger'
                          onPress={() => {this.get_updates(); //Checks for updates and notifies the user.;
                             this.setState((state) => {return {
                            welcome_modal_visible: false}
                            ;} );}} > Close </Button>

                </View>

          </View>

        </View>


    </Modal> )
};