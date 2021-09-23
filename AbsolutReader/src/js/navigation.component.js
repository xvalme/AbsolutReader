import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import  Homescreen  from './Homescreen';
import  Pdf_renderer  from './renderer';
import Settings from './settings';
import Chaimager_adder from './chaimager_adder';
import * as eva from '@eva-design/eva';

const { Navigator, Screen } = createStackNavigator();

//The order of screen matters
export const AppNavigator = () => (
  <NavigationContainer>
    <Navigator headerMode='none'>

      <Screen name='Homescreen' component={Homescreen} />
      <Screen name='Pdf_renderer' component={Pdf_renderer}/>
      <Screen name='Settings' component={Settings} />
      <Screen name='Chaimager_adder' component={Chaimager_adder} />
      
    
    </Navigator>
  </NavigationContainer>
);