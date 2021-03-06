import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerItemList, DrawerContentScrollView } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import  Homescreen  from './homescreen/Homescreen';
import  Pdf_renderer  from './renderer';
import Chaimager_adder from './chaimager_adder';
import Found_bug from './found_bug';
import Tutorial from './Tutorial';
import About from './About';
import { Button} from '@ui-kitten/components';
import { Image, Dimensions, View, Linking} from 'react-native';

const { Navigator, Screen } = createStackNavigator();
const Drawer = createDrawerNavigator();

//The order of screens matters
export const Library = () => (

    <Navigator headerMode='none'>

      <Screen name='Homescreen' component={Homescreen} />
      <Screen name='Pdf_renderer' component={Pdf_renderer}/>
      <Screen name='Chaimager_adder' component={Chaimager_adder} />
      
    </Navigator>


);

export const AppNavigator = () => (

  <NavigationContainer>

    <Drawer.Navigator initialRouteName="Library" 
    drawerStyle={{width: Dimensions.get('screen').width / 4 * 3.1}}
    drawerContent={(props) => {
      return (

                <DrawerContentScrollView {...props} style={{marginTop: -5}}>

                <View>

                  <Image source={require('./../assets/images/SnowMountain.jpg')}
                    style={{width: Dimensions.get('screen').width / 4 * 3.1,
                          height: Dimensions.get('screen').height / 2.5 }} />

                </View>

                <Button appearance="outline" style={{backgroundColor:"white"}} onPress={() => {
                  Linking.openURL("https://absolutreader.works")
                }}>Website</Button>

                <DrawerItemList {...props} />

                </DrawerContentScrollView>

        );
    }} >
        

      <Drawer.Screen name="Library" component={Library} />
      <Drawer.Screen name="Help" component={Tutorial} />
      <Drawer.Screen name="Report a bug" component={Found_bug} />
      <Drawer.Screen name="About" component={About} />

    </Drawer.Navigator>

  </NavigationContainer>
);