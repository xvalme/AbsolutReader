import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import  Homescreen  from './Homescreen';
import  Pdf_renderer  from './renderer';

const { Navigator, Screen } = createStackNavigator();

//The order of screen matters
export const AppNavigator = () => (
  <NavigationContainer>
    <Navigator headerMode='none'>

      <Screen name='Homescreen' component={Homescreen} />
      <Screen name='Pdf_renderer' component={Pdf_renderer}/>
      
    
    </Navigator>
  </NavigationContainer>
);