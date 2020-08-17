import React, { useState } from 'react';
import { StyleSheet, View, Image, TextInput, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as firebase from 'firebase'
import * as Google from 'expo-google-app-auth';
import { useSelector, useDispatch } from 'react-redux';

import colors from '../config/colors';
import {IOS_CLIENT_ID} from '../config/clientId';
import MyText from '../components/MyText';

const LoginScreen = ({navigation}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const user = useSelector(state => state.user);
    const dispatch = useDispatch();


    const onLinkPress = () => {
        navigation.navigate('Registration');
    }

    const loginUser = () => {
        try {
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then(res => {
                    const uid = res.user.uid;
                    const usersRef = firebase.firestore().collection('users');
                    usersRef.doc(uid).get()
                        .then(firestoreDoc => {
                            if (!firestoreDoc.exists) {
                                alert("User does not exist anymore");
                                return;
                            }
                            const loggedUser = firestoreDoc.data();
                            dispatch({
                                type: 'LOGIN',
                                user: loggedUser
                            })
                        })
                        .catch(err => {
                            alert(err);
                        })
                })
        } catch(error) {
            alert(error);
        }
    }

    const loginWithGoogle = async () => {
        try {
            const result = await Google.logInAsync({
                iosClientId: IOS_CLIENT_ID,
                scopes: ['profile', 'email']
            });

            if (result.type === 'success') {
                const credential = firebase.auth.GoogleAuthProvider.credential(result.idToken, result.accessToken);

                firebase.auth().signInWithCredential(credential)
                    .then(res => {
                        const uid = res.user.uid;
                        const usersRef = firebase.firestore().collection('users');

                        usersRef.doc(uid).get()
                            .then(firestoreDoc => {
                                if (!firestoreDoc.exists) {
                                    alert("User not found in firestore");
                                    return;
                                }
                                const loggedUser = firestoreDoc.data();
                                dispatch({
                                    type: 'LOGIN',
                                    user: loggedUser
                                })
                            })
                            .catch(err => {
                                alert(err);
                            })
                    })
                    .catch(err => {
                        alert(err);
                    })
            } else {
                alert('result type unsuccessful')
            }
        } catch (err) {
            alert('login: Error: ' + err);
        };
    }

    return(
        <View style={styles.container}>
            <KeyboardAwareScrollView style={styles.flex} keyboardShouldPersistTaps="always">
                <Image style={styles.logo} source={require('../assets/logo-dark1.5.png')}/>
                <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor="#aaaaaa" onChangeText={(text) => setEmail(text)} value={email} underlineColorAndroid="transparent" autoCapitalize="none" />
                <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#aaaaaa" onChangeText={(text) => setPassword(text)} value={password} underlineColorAndroid="transparent" autoCapitalize="none" secureTextEntry />
                <TouchableOpacity style={styles.button} onPress={() => loginUser()}>
                    <MyText style={styles.buttonTitle} size={16} color={colors.darkNeutral100}>LOG IN</MyText>
                </TouchableOpacity>
                <View style={styles.footerView}>
                    <MyText style={styles.footerText} size={15} color={colors.darkNeutral60}>Don't have an account? <MyText style={styles.footerLink} size={15} color={colors.darkAction} onPress={onLinkPress}>Sign up</MyText></MyText>
                </View>
                <View style={styles.orBox}>
                    <View style={styles.orLine}></View>
                    <View><MyText size={13} color={colors.darkNeutral40}>OR</MyText></View>
                    <View style={styles.orLine}></View>
                </View>
                <TouchableOpacity style={styles.google} onPress={() => loginWithGoogle()}>
                    <View style={styles.googleButtonView}>
                        <Image style={styles.googleButton} source={require('../assets/googleSignInButton.png')}/>
                    </View>
                </TouchableOpacity>
            </KeyboardAwareScrollView>
        </View>
    )

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.darkBackground,
        alignItems: 'center',
        justifyContent: 'center',
    },
    flex: {
        flex: 1,
        width: '100%',
        paddingTop: 60
    },
    logo: {
        flex: 1,
        alignSelf: "center",
        // margin: 30,
        width: '25%',
        resizeMode: 'contain'
    },
    input: {
        height: 60,
        borderRadius: 5,
        overflow: 'hidden',
        backgroundColor: colors.darkNeutral10,
        marginTop: 5,
        marginBottom: 3,
        marginLeft: 30,
        marginRight: 30,
        paddingLeft: 16,
        color: colors.darkNeutral100
    },
    button: {
        backgroundColor: colors.darkButton,
        marginLeft: 30,
        marginRight: 30,
        marginTop: 20,
        height: 48,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: 'center'
    },
    buttonTitle: {
        color: colors.darkNeutral60,
        fontSize: 16,
        fontWeight: "bold"
    },
    google: {
        marginLeft: 30,
        marginRight: 30,
        marginTop: 30,
        height: 45,       
        alignItems: "center",
        justifyContent: 'center'
    },
    googleButton: {
        flex: 1,
        alignSelf: "center",
        resizeMode: "contain",
    },
    googleButtonView: {
        borderRadius: 8,
    },
    footerView: {
        flex: 1,
        alignItems: "center",
        marginTop: 20
    },
    footerText: {
        fontSize: 16,
        color: colors.darkNeutral60
    },
    footerLink: {
        color: colors.darkAction,
        fontWeight: "bold",
        fontSize: 16
    },
    orBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 30,
        paddingHorizontal: 40,
    },
    orLine: {
        flex: 1,
        height: 1,
        borderColor: colors.darkNeutral20,
        borderWidth: 1,
        marginHorizontal: 5
    }
})

export default LoginScreen;