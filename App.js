import React from 'react';
import 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';

import RootNavigator from './app/navigation/RootNavigator';
import store from './app/redux/store';

const App = () => {
  return (
    <Provider store={store}>
      <RootNavigator/>
      <StatusBar style="light" />
    </Provider>
  );
}

export default App;