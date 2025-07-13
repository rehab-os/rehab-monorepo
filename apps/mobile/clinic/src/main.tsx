import React from 'react';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';
import { AppRegistry } from 'react-native';
// Fix the import path - remove 'src' if the file is at app/App.tsx
import App from './app/App';

AppRegistry.registerComponent('ClinicMobile', () => App);
