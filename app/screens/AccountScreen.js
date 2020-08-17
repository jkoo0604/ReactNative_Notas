import React from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import * as firebase from 'firebase';
import { useSelector, useDispatch } from 'react-redux';
import { CommonActions } from '@react-navigation/native';

import colors from '../config/colors';
import MyText from '../components/MyText';

const AccountScreen = ({navigation}) => {
    const user = useSelector(state => state.user);
    const dispatch = useDispatch();

    const logout = () => {
        firebase.auth().signOut()
            .then(() => {
                dispatch({
                    type: 'LOGOUT',
                    user: null
                })
                navigation.dispatch(CommonActions.reset({index: 0, routes: [{name: 'Folder'}]}));
            })
            .catch(err => {
                alert(err);
            })
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <MyText color={colors.darkNeutral60} size={18}>Account for {user.name}</MyText>
                <View style={styles.button}>
                    <MyText color={colors.darkAction} onPress={logout} size={15}>LOG OUT</MyText>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.darkBackground,
        justifyContent: 'center',
        alignItems: 'center'
    },
    content: {
        flex: 1,
        backgroundColor: colors.darkBackground,
        paddingTop: 300
    },
    button: {
        padding: 20,
        alignSelf: 'center'
    }
});

export default AccountScreen;