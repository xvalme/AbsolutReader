import React from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider} from '@ui-kitten/components';
import { AppNavigator } from './navigation.component';
import { default as theme } from './../assets/themes/theme.json';

export default () => (
  <>
    <ApplicationProvider {...eva} theme={{ ...eva.dark, ...theme }}>
      <AppNavigator/>
    </ApplicationProvider>
  </>
);