import React from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, Layout, Text, Button } from '@ui-kitten/components';
import { Image, StyleSheet} from 'react-native';
import { default as theme } from './../assets/themes/theme.json';
import Pdf_renderer from './renderer';

function load_file(){

}


const HomeScreen = () => (
  <Layout style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
    <Image source={require('./../assets/images/logo.jpg')} style={styles.image}/>
    <Text category='h1'>Absolut Reader</Text>
    <Button onPress={load_file} title='Open PDF'>Open PDF</Button>
  </Layout>
);

export default () => (
  <ApplicationProvider {...eva} theme={{ ...eva.dark, ...theme }}>
    <HomeScreen />
  </ApplicationProvider>
);

const styles = StyleSheet.create({
  image: {
    flex: 1,
    alignItems: 'center',
    aspectRatio: 0.5,
    resizeMode: 'contain', 
  },
});