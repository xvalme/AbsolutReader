import React from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import { AppNavigator } from './navigation.component';
import { default as theme } from './../assets/themes/theme.json';
import { EvaIconsPack } from '@ui-kitten/eva-icons';

export default () => (
  <>
    <IconRegistry icons={EvaIconsPack} />
    <ApplicationProvider {...eva} theme={{ ...eva.light, ...theme }}>
      <AppNavigator/>
    </ApplicationProvider>
  </>
);