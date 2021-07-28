import React, { useState } from 'react';
import Pdf from 'react-native-pdf';
import { Text,StyleSheet, View , Dimensions} from 'react-native';

export default function Pdf_renderer() {

	//Checks if file exist or else throws an error back TODO #4
	
	//var filepath = detect(file.filepath); #TODO #1 Quick fix:
	//const filepath = file.filepath
	const source = {uri:'http://www.africau.edu/images/default/sample.pdf',cache:true};

	return (
		<View style={styles.container}>
			<Pdf
				source={source}
				onLoadComplete={(numberOfPages,filePath)=>{
					console.log(`number of pages: ${numberOfPages}`);
				}}
				onPageChanged={(page,numberOfPages)=>{
					console.log(`current page: ${page}`);
				}}
				onError={(error)=>{
					console.log(error);
				}}
				style={styles.pdf}/>
		</View>
	)
}

const styles = StyleSheet.create({
container: {
	flex: 1,
	justifyContent: 'flex-start',
	alignItems: 'center',
	marginTop: 25,
},
pdf: {
	flex:1,
	width:Dimensions.get('window').width,
}
});