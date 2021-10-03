import React, {Component} from 'react';
import { TopNavigation} from '@ui-kitten/components';
import { SafeAreaView, Dimensions, View} from 'react-native'

//Login page and account page if user already logged in

var RNFS = require('react-native-fs');

export default class Account extends Component {

	constructor(props) {
		super(props);
        
		this.path = RNFS.DocumentDirectoryPath; //Main path of app

		this.state = {login: false, //User did not log in yet
                      username: '',
                      storage = {},
        }
		
	}

	login = async (email, password) => {

		//fetching website api

		//Authorization header

		const string = email + ':' + password;
		
		//to base 64

		const authorization = btoa(string);

		//Now fetching website:

		var response = await fetch ('https://absolutreader.works/api/login/'+authorization);

		//if server response says the user has logged in, we save the data credentials:

		var data = JSON.parse(response);

		if (data.login == true) { //User logged in

			return 0

		}
	}

	render () {
		return (
			<SafeAreaView style={{ flex: 1 }}>
						
						
			<TopNavigation style={{height:Dimensions.get('window').height / 12}}
			alignment='center'
			title='Absolut Reader'
            subtitle={'Version Beta ' + this.version}/>

				<View>
					
				</View>

			</SafeAreaView>
		)
	}

    
}