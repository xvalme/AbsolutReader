import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import  Homescreen  from './Homescreen';
import  Pdf_renderer  from './renderer';
import Settings from './settings';
import Chaimager_adder from './chaimager_adder';
import Found_bug from './found_bug';
import Tutorial from './Tutorial';

const { Navigator, Screen } = createStackNavigator();
const Drawer = createDrawerNavigator();

//The order of screens matters
export const Library = () => (
  <NavigationContainer independent={true}>
    <Navigator headerMode='none'>

      <Screen name='Homescreen' component={Homescreen} />
      <Screen name='Pdf_renderer' component={Pdf_renderer}/>
      <Screen name='Chaimager_adder' component={Chaimager_adder} />
      
    </Navigator>

  </NavigationContainer>
);

export const AppNavigator = () => (

  <NavigationContainer>

    <Drawer.Navigator initialRouteName="Library" >

      <Drawer.Screen name="Library" component={Library} />
      <Drawer.Screen name="Help" component={Tutorial} />
      <Drawer.Screen name="Chaimager tutorial" component={Library} />
      <Drawer.Screen name="Report a bug" component={Found_bug} />
      <Drawer.Screen name="Support us" component={Library} />
      <Drawer.Screen name="About" component={Library} />
      <Drawer.Screen name="Settings" component={Settings} />

    </Drawer.Navigator>

  </NavigationContainer>
);