import React from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, Layout, Text, Button, TopNavigation} from '@ui-kitten/components';
import { Image, StyleSheet, SafeAreaView} from 'react-native';
import DocumentPicker from 'react-native-document-picker';

async function image_selector () {

  try {
    const res = await DocumentPicker.pick({
      type: [DocumentPicker.types.pdf],
    });

    var pdf_path = res.uri;
    //Reading imagefile after we have the path

    return pdf_path;

    } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      // User cancelled the picker, exit any dialogs or menus and move on
    } else {
      throw err;
    }
    }

  
}

export const Homescreen = ({ navigation }) => {

  var app_package = require('./../../package.json');
  var version = app_package["version"];

  const load_file = async () => {
    var filepath = await image_selector();
    navigation.navigate('Pdf_renderer', {filepath: filepath});
  };

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

        <Button onPress={load_file} style={{marginTop:10}}>Open PDF</Button>
      
    </Layout>
  </SafeAreaView>
  );
};

