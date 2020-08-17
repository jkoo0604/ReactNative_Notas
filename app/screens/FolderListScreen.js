import React, { useEffect, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, TextInput, View, TouchableHighlight, Modal } from 'react-native';
import { ListItem } from 'react-native-elements';
import * as firebase from 'firebase';
import { useSelector, useDispatch } from 'react-redux';

import colors from '../config/colors';
import MyText from '../components/MyText';

const FolderListScreen = ({navigation}) => {

    const user = useSelector(state => state.user);
    const notebooks = useSelector(state => state.notebooks);
    const notes = useSelector(state => state.notes);
    const dispatch = useDispatch();   
    const [modalVisible, setModalvisible] = useState(false);
    const [newNotebook, setNewNotebook] = useState('');

    useEffect(() => {
        const notebooksRef = firebase.firestore().collection('notebooks');
        const notesRef = firebase.firestore().collection('notes');
        notebooksRef.where("userId", "==", user.id).orderBy("updatedAt","desc").get()
            .then(res=> {
                // console.log(res);
                const newNotebooks = [];
                res.forEach(doc => {                    
                    const rawData = doc.data();
                    const newData = {
                        id: doc.id,
                        ...rawData
                    }
                    newNotebooks.push(newData);
                })
                dispatch({
                    type: 'NOTEBOOKS',
                    notebooks: newNotebooks
                })
            })
            .catch(err=> {
                console.log(err);
            })
        notesRef.where("userId", "==", user.id).orderBy("updatedAt","desc").get()
            .then(notesRes=> {
                const newNotes = [];
                notesRes.forEach(doc => {
                    const rawData = doc.data();
                    const newData = {
                        id: doc.id,
                        ...rawData
                    }
                    newNotes.push(newData); 
                })
                dispatch({
                    type: 'NOTES',
                    notes: newNotes
                })
            })
            .catch(err=>{
                console.log(err);
            })
    },[]);

    const selectList = (notebook, fNotes) => {
        dispatch({
            type: 'ONENOTEBOOK',
            notebook: notebook
        })
        dispatch({
            type: 'CURRENTNOTES',
            currentNotes: fNotes
        })
        navigation.navigate('Notes', {name: notebook.name})
    }

    const addNotebook = () => {
        if (newNotebook.length <1 ) {
            closeModal();
        } else {
            const notebooksRef = firebase.firestore().collection('notebooks');
            const data = {
                userId: user.id,
                name: newNotebook,
                createdAtStr: Date.now().toString(),            
                updatedAtStr: Date.now().toString(),            
            };
            notebooksRef.add({...data, createdAt: firebase.firestore.FieldValue.serverTimestamp(), updatedAt: firebase.firestore.FieldValue.serverTimestamp()})
                .then(firestoreDoc => {
                    const newData = {...data, id: firestoreDoc.id};
                    dispatch({
                        type: 'NOTEBOOKS',
                        notebooks: [newData, ...notebooks]
                    })
                    closeModal();
                })
                .catch(err => {
                    alert(err);
                })
        }
    }

    const openModal = () => {
        setModalvisible(true);
    }

    const closeModal = () => {
        setNewNotebook('');
        setModalvisible(false);
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <MyText size={30} color={colors.darkNeutral100}>Notebooks</MyText>
            </View>
            <ScrollView style={styles.noteList}>
                {
                    notebooks.map((notebook, idx) => {
                        var fNotes = notes.filter(item=> item.notebookId === notebook.id);
                        return(
                            <View key={idx} >
                                <ListItem 
                                badge={{ value: fNotes.length, badgeStyle: { backgroundColor: colors.darkNeutral20,  borderWidth: 0,} }} 
                                onPress={() => selectList(notebook, fNotes)}                             
                                title={
                                    <MyText color={colors.darkNeutral100} size={17}>{notebook.name}</MyText>
                                }
                                containerStyle={styles.listItem}
                                />
                                <View style={styles.orLine}></View>
                            </View>
                        )
                    })
                }
                <ListItem containerStyle={styles.listItemAdd} key={-1} title={<MyText size={15} color={colors.darkAction}>+ Add notebook</MyText>} onPress={()=> openModal()}/>
            </ScrollView>
            <Modal animationType="slide" transparent={true} visible={modalVisible} >
                <View style={styles.modal}>
                    <View style={styles.modalContent}>
                        <TextInput style={styles.input} placeholder="Notebook name" placeholderTextColor={colors.darkNeutral40} onChangeText={(text) => setNewNotebook(text)} value={newNotebook} underlineColorAndroid="transparent" autoCapitalize="none" />
                    </View>
                    <View style={styles.modalFooter}>
                        <MyText onPress={() => closeModal()} size={16} color={colors.darkNeutral60}>Cancel</MyText>
                        <TouchableHighlight style={styles.button} onPress={() => addNotebook()}>
                            <MyText size={16} color={colors.darkAction} >Add</MyText>
                        </TouchableHighlight>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.darkBackground,
    },
    input: {
        flex: 1
    },
    header: {
        paddingTop: 80,
        paddingBottom: 30,
        paddingHorizontal: 15
    },
    noteList: {
        paddingHorizontal: 15,
        paddingBottom: 50
    },
    listItem: {
        backgroundColor: colors.darkBackground,
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    listItemAdd: {
        backgroundColor: colors.darkBackground,
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 50
    },
    orLine: {
        flex: 1,
        height: 1,
        borderColor: colors.darkNeutral10,
        borderWidth: 1,
        marginHorizontal: 10
    },
    modal: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '80%',
        height: '40%',
        alignSelf: 'center',
        marginTop: 200,
        backgroundColor: colors.darkNeutral80,
        borderRadius: 5
    },
    input: {
        height: 60,
        borderRadius: 5,
        overflow: 'hidden',
        backgroundColor: colors.darkNeutral00,
        marginTop: 5,
        marginBottom: 3,
        marginLeft: 10,
        marginRight: 20,
        paddingLeft: 10,
        paddingRight: 10,
        color: colors.darkNeutral100,
        width: 200
    },
    button: {
        marginLeft: 30
    },
    modalContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalFooter: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    }
});

export default FolderListScreen;