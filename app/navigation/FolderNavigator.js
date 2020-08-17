import React from "react";
import { createStackNavigator } from '@react-navigation/stack';

import FolderListScreen from '../screens/FolderListScreen';
import NotesListScreen from '../screens/NotesListScreen';
import NoteEditScreen from '../screens/NoteEditScreen';
import NewNoteScreen from '../screens/NewNoteScreen';
import colors from "../config/colors";

const Stack = createStackNavigator();

const FolderNavigator = ({navigation}) => {
    
    return(
        <Stack.Navigator mode="card" screenOptions={{ headerShown: false }} initialRouteName="Folders">
            <Stack.Screen name="Folders" component={FolderListScreen} />
            <Stack.Screen name="Notes" component={NotesListScreen} options={({ route })=>({title: route.params.name, headerShown: true, headerBackTitleVisible: false, headerStyle: {backgroundColor: colors.darkBackground, shadowColor: 'transparent'}, headerTintColor: colors.darkActionLight })}/>
            <Stack.Screen name="EditNote" component={NoteEditScreen} options={{ headerShown: true, title: "Edit Note", headerBackTitleVisible: false, headerBackTitleVisible: false, headerStyle: {backgroundColor: colors.darkBackground, shadowColor: 'transparent'}, headerTintColor: colors.darkActionLight, }}/>
            <Stack.Screen name="NewNote" component={NewNoteScreen} options={{ headerShown: true, title: "New Note", headerBackTitleVisible: false, headerBackTitleVisible: false, headerStyle: {backgroundColor: colors.darkBackground, shadowColor: 'transparent'}, headerTintColor: colors.darkActionLight, }}/>
        </Stack.Navigator>
    )
}

export default FolderNavigator;