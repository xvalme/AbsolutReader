import React from 'react';
import { Layout, Text} from '@ui-kitten/components';
import { Image, SafeAreaView} from 'react-native';


//TODO
export const Homescreen = ({ navigation }) => {

  var app_package = require('./../../package.json');
  var version = app_package["version"];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      
      <Layout style={{flex: 1,
                      justifyContent: 'center', 
                      alignItems: 'center',}}>

        <Text category='h6' style={{marginTop: 10}}>Made by Valentino. https://xval.me</Text>

        <Image source={require('./../assets/images/logo.jpg')} style={{ flex: 1,
                                                                      alignItems: 'center',
                                                                      aspectRatio: 0.5,
                                                                      resizeMode: 'contain',
                                                                      }} />

        <Text category='h1'>Absolut Reader</Text>

        <Text category='h6'>Version Alpha {version}</Text>

      
    </Layout>
  </SafeAreaView>
  );
};

