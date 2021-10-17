import React, {Component} from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import { AppNavigator } from './navigation.component';
import { default as theme } from './../assets/themes/main_theme.json';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import SplashScreen from  "react-native-splash-screen";
import FlashMessage from "react-native-flash-message";

export default class extends Component {

  componentDidMount() {
      SplashScreen.hide();

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

