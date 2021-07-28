import React from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, Layout, Text, Button, TopNavigation} from '@ui-kitten/components';
import { Image, StyleSheet, SafeAreaView} from 'react-native';

export const Homescreen = ({ navigation }) => {

  const load_file = () => {
    navigation.navigate('Renderer');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      
      <Layout style={{flex: 1}}>

      <Image source={require('./../assets/images/logo.jpg')} style={styles.image}/>

      <Text category='h1'>Absolut Reader</Text>

      <Button onPress={load_file} >Open PDF</Button>
    
  </Layout>
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  image: {
    flex: 1,
    alignItems: 'center',
    aspectRatio: 0.5,
    resizeMode: 'contain', 
  },
});