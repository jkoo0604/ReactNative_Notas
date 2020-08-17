import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import AccountScreen from '../screens/AccountScreen';
import FolderNavigator from '../navigation/FolderNavigator';
import colors from '../config/colors';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
    

    return (
        <Tab.Navigator tabBarOptions={{tabStyle: {backgroundColor: colors.darkBackground, shadowColor: 'transparent'}, activeTintColor: colors.darkAction, inactiveTintColor: colors.darkNeutral60, style: {borderTopWidth: 0}}} initialRouteName="Folder">
            <Tab.Screen name="Folder" component={FolderNavigator} options={{ tabBarIcon: ({ color, size }) => ( <MaterialCommunityIcons name="home" color={color} size={size} /> ), }} />
            <Tab.Screen name="Account" component={AccountScreen} options={{ tabBarIcon: ({ color, size }) => ( <MaterialCommunityIcons name="account" color={color} size={size} /> ), }} />
        </Tab.Navigator>
    )
}

export default AppNavigator;