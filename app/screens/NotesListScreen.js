import React, { useState } from 'react'
import { SafeAreaView, StyleSheet, View, TouchableOpacity, Modal, TouchableHighlight, Image } from 'react-native';
import { WebView } from 'react-native-webview';
import * as firebase from 'firebase';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import colors from '../config/colors';
import MyText from '../components/MyText';

const NotesListScreen = ({navigation}) => {

    const user = useSelector(state => state.user);
    const notebooks = useSelector(state => state.notebooks);
    const notebook = useSelector(state => state.notebook);
    const notes = useSelector(state => state.notes);
    const currentNotes = useSelector(state => state.currentNotes);
    const note = useSelector(state => state.note);
    const dispatch = useDispatch();
    const [modalVisible, setModalvisible] = useState(false);
    const [delNote, setDelNote] = useState('');

    const addNote = () => {
        navigation.navigate('NewNote')
    }

    const viewNoteDetail = note => {
        dispatch({
            type: 'ONENOTE',
            note: note
        })
        navigation.navigate('EditNote')
    }

    const deleteNote = async () => {
        if (delNote === '') return;
        const notesRef = firebase.firestore().collection('notes');
        notesRef.doc(delNote).delete()
            .then(() => {
                const updateIdx = notes.findIndex(item => item['id'] === delNote);
                const newNotes = [...notes.slice(0,updateIdx), ...notes.slice(updateIdx+1)];
                dispatch({
                    type: 'NOTES',
                    notes: newNotes
                })
                const updateIdx2 = currentNotes.findIndex(el => el['id'] === delNote);
                const newCurrentNotes = [...currentNotes.slice(0,updateIdx2), ...currentNotes.slice(updateIdx2+1)];
                dispatch({
                    type: 'CURRENTNOTES',
                    currentNotes: newCurrentNotes
                })
                // navigation.navigate('Folders')
                setModalvisible(false);
            })
    }

    const openModal = (noteId) => {
        setDelNote(noteId);
        setModalvisible(true);
    }

    const closeModal = () => {
        setDelNote('');
        setModalvisible(false);
    }

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.list}>
                {
                    currentNotes.map((onenote, idx) => {
                    let convertedDate = new Date(+onenote.updatedAtStr).toLocaleString();
                    return (
                        <View style={styles.container} key={idx}>
                            {/* <View style={styles.cardHeader}>
                                <TouchableOpacity>
                                    <MyText style={styles.cardText} size={10} color={colors.darkNeutral100}>X</MyText>
                                    <MaterialCommunityIcons name="delete" size={12} color={colors.darkNeutral60} onPress={() => openModal(onenote.id)} />
                                </TouchableOpacity>
                            </View> */}
                            <WebView  originWhitelist={['*']} source={{ html: '<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style> img { display: block; max-width: 95%; height: auto; margin: 0 auto;} body { background-color: #12191c; color: rgba(250, 250, 250, 0.5); font-family: Verdana; font-size: 13px;} </style></head><body>' + onenote.content + '</body></html>'}} scalesPageToFit={true} scrollEnabled={false} />
                            <TouchableOpacity onPress={() => viewNoteDetail(onenote)} style={styles.cardFooter}>
                                <MyText style={styles.cardText} size={12} color={colors.darkNeutral100}>{convertedDate}</MyText>
                            </TouchableOpacity>
                        </View>)})
                }
            
                <View style={styles.new}>
                    <TouchableOpacity style={styles.button} onPress={() => addNote()}>
                        <View style={styles.googleButton}>
                            <MyText color={colors.darkAction}>+ Add note</MyText>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <Modal animationType="slide" transparent={true} visible={modalVisible} >
                <View style={styles.modal}>
                    <View style={styles.modalContent}>
                        <MyText size={16} color={colors.darkNeutral60}>Are you sure you want to delete this note?</MyText>
                    </View>
                    <View style={styles.modalFooter}>
                        <MyText onPress={() => closeModal()} size={16} color={colors.darkNeutral60}>Cancel</MyText>
                        <TouchableHighlight style={styles.button} onPress={deleteNote}>
                            <MyText size={16} color={colors.darkAction} >Delete</MyText>
                        </TouchableHighlight>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '45%',
        height: 180,
        backgroundColor: colors.darkBackground,
        textAlign: 'center',
        margin: '2.5%',
        borderRadius: 10,
        overflow: 'hidden',
    },
    root: {
        flex: 1,
        alignItems: 'flex-start',
        backgroundColor: colors.darkBackground
    },
    new: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 2,
        borderStyle: 'dotted',
        borderColor: colors.darkNeutral20,
        width: '45%',
        height: 180,
        margin: '2.5%',
    },
    list: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'flex-start',
        flexWrap: 'wrap'
    },
    cardFooter: {
        backgroundColor: colors.darkBackgroundCard,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10
    },
    cardHeader: {
        backgroundColor: colors.darkBackgroundCard,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        paddingTop: 5,
        paddingRight: 5
    },
    modal: {
        justifyContent: 'space-between',
        width: '60%',
        height: '20%',
        alignSelf: 'center',
        marginTop: 200,
        backgroundColor: colors.darkNeutral80,
        borderRadius: 5,
        padding: 20
    },
    modalContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalFooter: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-evenly'

    }
});

export default NotesListScreen;