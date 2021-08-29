import React, {Component} from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, Layout, Divider, Button, TopNavigation, Icon,Text, TopNavigationAction, List, Card, Modal} from '@ui-kitten/components';
import { Image, StyleSheet, SafeAreaView, Dimensions, View, PermissionsAndroid} from 'react-native'

//Login page and account page if user already logged in

var RNFS = require('react-native-fs');

export default class Pdf_Renderer extends Component {

	constructor(props) {
		super(props);
        
		this.path = RNFS.DocumentDirectoryPath; //Main path of app

		this.state = {login: false, //User did not log in yet
                      username: '',
                      storage = {},
        }
		
	}

    
}