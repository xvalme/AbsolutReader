import React, {Component} from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import { AppNavigator } from './navigation.component';
import { default as theme } from './../assets/themes/main_theme.json';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import SplashScreen from  "react-native-splash-screen";
import { load_first_time } from './first_launch/first_lauch';
import FlashMessage from "react-native-flash-message";

export default class extends Component {

  componentDidMount() {
      SplashScreen.hide();

      //Checking if is 1st run of the app:

      load_first_time();


  }

  render () {

    return (
    <>
    <IconRegistry icons={EvaIconsPack} />
    <ApplicationProvider {...eva} theme={{ ...eva.light, ...theme }}>

      <AppNavigator/>

      <FlashMessage position="bottom"/>
      
    </ApplicationProvider>
  </>)
  }


}

