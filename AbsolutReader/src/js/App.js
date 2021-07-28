import React from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, Layout, Text } from '@ui-kitten/components';
import Pdf_renderer from './renderer';

const HomeScreen = () => (
  <Layout style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
    <Text selectable={true} category='h1'>Absolut Reader</Text>
    <Text category='h5'>A new generation e-book Reader!</Text>
  </Layout>
);

export default () => (
  <ApplicationProvider {...eva} theme={eva.dark}>
    <HomeScreen />
  </ApplicationProvider>
);