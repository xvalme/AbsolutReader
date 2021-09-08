import React, {Component} from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, Layout, Divider, Button, TopNavigation, Icon,Text, TopNavigationAction, List, Card, Modal} from '@ui-kitten/components';
import { Image, StyleSheet, SafeAreaView, Dimensions, View} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import ColorPicker from 'react-native-wheel-color-picker';

var RNFS = require('react-native-fs');

export default class Chaimager_adder extends Component {
    //User screen to create a new chaimager file

    constructor(props){
        super(props);

        this.state = {
            function: props.route.params["name"] //can be editing or creating new chaimager
        }
    }



    render () {
        return (
            <SafeAreaView style={{ flex: 1 }}>



            </SafeAreaView>
        )
    }

}