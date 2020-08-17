import React, { useState, useEffect } from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold } from '@expo-google-fonts/dev';
import * as firebase from 'firebase';
import 'firebase/firestore';

import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';
import {firebaseConfig} from '../config/firebaseConfig';

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const RootNavigator = ({navigation}) => {
    const [loading, setLoading] = useState(true);
    const user = useSelector(state => state.user);
    const dispatch = useDispatch();
    const [fontsLoaded] = useFonts({ Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold});

    useEffect(() => {
        const usersRef = firebase.firestore().collection('users');
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                usersRef.doc(user.uid).get()
                .then(doc => {
                    const userData = doc.data();
                    setLoading(false);
                    dispatch({
                    type: 'LOGIN',
                    user: userData
                    })
                })
                .catch(error => {
                    setLoading(false);
                })
            } else {
                setLoading(false);
            }
        });
    },[]);

    if (loading) {
        return (
        <></>
        )
    }

    return (
        <NavigationContainer>
            {user ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    )
}

export default RootNavigator;