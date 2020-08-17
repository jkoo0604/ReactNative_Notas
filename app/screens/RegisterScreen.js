import React, { useState } from 'react';
import { Image, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as firebase from 'firebase';
import * as Google from 'expo-google-app-auth';
import { useSelector, useDispatch } from 'react-redux';

import colors from '../config/colors';
import {IOS_CLIENT_ID} from '../config/clientId';
import MyText from '../components/MyText';

const RegistrationScreen = ({navigation}) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const user = useSelector(state => state.user);
    const dispatch = useDispatch();

    const onLinkPress = () => {
        navigation.navigate('Login');
    }

    const registerUser = () => {
        if (password !== confirmPassword) {
            alert('Passwords must match.')
            return
        }

        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(res => {
                const uid = res.user.uid;
                const data = {
                    id: uid,
                    email,
                    name,
                    created: firebase.firestore.FieldValue.serverTimestamp(),
                    updated: firebase.firestore.FieldValue.serverTimestamp()                    
                };
                const usersRef = firebase.firestore().collection('users');
                const foldersRef = firebase.firestore().collection('notebooks');
                usersRef.doc(uid).set(data)
                    .then(() => {
                        dispatch({
                            type: 'LOGIN',
                            user: data
                        })
                    })
                    .catch(err=> {
                        alert(err)
                    });
                foldersRef.doc().set({
                    userId: uid,
                    name: 'General',
                    createdAtStr: Date.now().toString(),            
                    updatedAtStr: Date.now().toString(), 
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                })
            })
            .catch(err => {
                alert(err);
            })
    }

    const registerWithGoogle = async () => {
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
                        const data = {
                            id: uid,
                            email: res.user.email,
                            name: res.user.displayName,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                            updatedAt: firebase.firestore.FieldValue.serverTimestamp()                    
                        };
                        const usersRef = firebase.firestore().collection('users');
                        const foldersRef = firebase.firestore().collection('notebooks');
                        if (res.additionalUserInfo.isNewUser!==true) {
                            usersRef.doc(uid).update({
                                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                            })
                                .then(() => {
                                    dispatch({
                                        type: 'LOGIN',
                                        user: data
                                    })
                                })
                                .catch(err =>{
                                    alert(err);
                                })
                        } else {
                            usersRef.doc(uid).set(data)
                                .then(() => {
                                    dispatch({
                                        type: 'LOGIN',
                                        user: data
                                    })
                                })
                                .catch(err => {
                                    alert(err);
                                })
                            foldersRef.doc().set({
                                userId: uid,
                                name: 'General',
                                createdAtStr: Date.now().toString(),            
                                updatedAtStr: Date.now().toString(), 
                                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                            })
                        }
                    })
                    .catch(err=>{
                        alert('signInWithCredential unsuccessfull', err);
                    });
            } else {
                alert('result type unsuccessful')
            }
        } catch (err) {
            alert('login: Error: ' + err);
        };
    }   

    return (
        <View style={styles.container}>
            <KeyboardAwareScrollView style={styles.flex} keyboardShouldPersistTaps="always" contentContainerStyle={{paddingBottom: 80}}>
                <Image style={styles.logo} source={require('../assets/logo-dark1.5.png')}/>
                <TextInput style={styles.input} placeholder="Name" placeholderTextColor="#aaaaaa" onChangeText={(text) => setName(text)} value={name} underlineColorAndroid="transparent" autoCapitalize="none" />
                <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor="#aaaaaa" onChangeText={(text) => setEmail(text)} value={email} underlineColorAndroid="transparent" autoCapitalize="none" />
                <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#aaaaaa" onChangeText={(text) => setPassword(text)} value={password} underlineColorAndroid="transparent" autoCapitalize="none" secureTextEntry />
                <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor="#aaaaaa" onChangeText={(text) => setConfirmPassword(text)} value={confirmPassword} underlineColorAndroid="transparent" autoCapitalize="none" secureTextEntry />
                <TouchableOpacity style={styles.button} onPress={() => registerUser()}>
                    <MyText style={styles.buttonTitle} size={16} color={colors.darkNeutral100}>Create account</MyText>
                </TouchableOpacity>                
                <View style={styles.footerView}>
                    <MyText style={styles.footerText} size={15} color={colors.darkNeutral60}>Already registered? <MyText style={styles.footerLink} size={15} color={colors.darkAction} onPress={onLinkPress}>Log in</MyText></MyText>
                </View>
                <View style={styles.orBox}>
                    <View style={styles.orLine}></View>
                    <View><MyText size={13} color={colors.darkNeutral40}>OR</MyText></View>
                    <View style={styles.orLine}></View>
                </View>
                <TouchableOpacity style={styles.google} onPress={() => registerWithGoogle()}>
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
        
        width: '100%',
        paddingTop: 60,
        backgroundColor: colors.darkBackground,
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

export default RegistrationScreen;