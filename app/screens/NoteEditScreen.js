import React, { useEffect, useState, useRef } from 'react'
import { KeyboardAvoidingView, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { actions, defaultActions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as firebase from 'firebase';
import { useSelector, useDispatch } from 'react-redux';

import colors from '../config/colors';
import MyText from '../components/MyText';

const NoteEditScreen = ({navigation}) => {
    const user = useSelector(state => state.user);
    const note = useSelector(state => state.note);
    const notes = useSelector(state => state.notes);
    const currentNotes = useSelector(state => state.currentNotes);
    const dispatch = useDispatch();
    const [tags, setTags] = useState(note.tags.join());
    const [isPublic, setIsPublic] = useState(note.public);

    const richText = useRef(null);

    useEffect(() => {
        requestPermission();
    },[])

    const requestPermission = async () => {
        const { granted } = await ImagePicker.requestCameraRollPermissionsAsync();
        if (!granted) alert("Access to photo library denied");
    }

    const onPressAddImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.5,
                allowsEditing: false,
                allowsMultipleSelection: false
            });
            if (result.cancelled) {
                return;
            } 
            const manipResult = await ImageManipulator.manipulateAsync(result.uri, [{resize: {width: 400}}],{format: ImageManipulator.SaveFormat.JPEG});
            const blob = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = function() {
                    resolve(xhr.response);
                };
                xhr.onerror = function(e) {
                    reject(new TypeError('Network request failed'));
                };
                xhr.responseType = 'blob';
                xhr.open('GET', manipResult.uri, true);
                xhr.send(null);
            });
            const fileName = 'up' + Date.now();
            var ref = firebase.storage().ref().child('images/' + fileName);
            const snapshot = await ref.put(blob);

            blob.close();

            var finalUri =  await snapshot.ref.getDownloadURL();
            richText.current?.insertImage(finalUri);
        } catch (error) {
            console.log('Error reading an image', error);
        };
    }

    const updateNote = async () => {
        let html = await richText.current.getContentHtml();
        const notesRef = firebase.firestore().collection('notes');
        const tagsData = [];
        if (tags.length > 0) {
            tagsData = tags.split(',');
        }
        const updateData = {
            content: html,
            tags: tagsData,
            public: isPublic,
            updatedAtStr: Date.now().toString(),
        };
        notesRef.doc(note.id).update({...updateData, updatedAt: firebase.firestore.FieldValue.serverTimestamp()})
            .then(() => {
                const newNote = {...note, ...updateData};
                dispatch({
                    type: 'ONENOTE',
                    note: {...note, ...updateData}
                });
                const updateIdx = notes.findIndex(item => item['id'] === note.id);
                const newNotes = [...notes.slice(0,updateIdx), newNote, ...notes.slice(updateIdx+1)];
                dispatch({
                    type: 'NOTES',
                    notes: newNotes
                })
                const updateIdx2 = currentNotes.findIndex(el => el['id']===note.id);
                const newCurrentNotes = [...currentNotes.slice(0,updateIdx2), newNote, ...currentNotes.slice(updateIdx2+1)];
                dispatch({
                    type: 'CURRENTNOTES',
                    currentNotes: newCurrentNotes
                })
                    navigation.navigate('Folders')
            })

        console.log(html);
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerForm}>
                <MyText color={colors.darkAction} onPress={updateNote} size={16}>Save</MyText>
            </View>
            <ScrollView keyboardDismissMode={'none'} style={styles.editorWrapper}>             
                <RichEditor ref={richText} initialContentHTML={note.content} containerStyle={{backgroundColor: colors.darkBackground}} editorStyle={styles.editor} style={styles.rich} placeholder={'some default text'} />
            </ScrollView>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} enabled keyboardVerticalOffset={60}>
                <RichToolbar
                    style={styles.richBar}
                    editor={richText}
                    iconTint={colors.darkNeutral60}
                    selectedIconTint={colors.darkAction}
                    selectedButtonStyle={{ backgroundColor: 'transparent' }}
                    onPressAddImage={onPressAddImage}
                    getEditor={() => richText}
                    // disabled={true}
                    actions={[
                        // ...defaultActions,
                        actions.heading1,
                        actions.heading4,
                        actions.setBold,
                        actions.setItalic,
                        actions.insertBulletsList,
                        actions.insertImage,
                    ]}
                    iconMap={{[actions.heading1]: ({tintColor}) => (
                        <Text style={[styles.tib, {color: tintColor}]}>H1</Text>
                    ),
                    [actions.heading4]: ({tintColor}) => (
                        <Text style={[styles.tib, {color: tintColor}]}>H3</Text>
                    ),}}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.darkBackground,
    },
    nav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 5,
    },
    rich: {
        minHeight: 300,
        flex: 1,
    },
    richBar: {
        height: 50,
        backgroundColor: '#333',
        },
    scroll: {
        backgroundColor: '#ffffff',
    },
    item: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#eee',
        flexDirection: 'row',
        height: 40,
        alignItems: 'center',
        paddingHorizontal: 15
    },
    input: {
        width: 150,
        height: 40,
        borderRadius: 5,
        overflow: 'hidden',
        backgroundColor: colors.darkNeutral10,
        marginTop: 5,
        marginBottom: 3,
        marginLeft: 15,
        marginRight: 50,
        paddingLeft: 16
    },
    headerForm: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        justifyContent: 'center'
    },
    editorWrapper: {
        textAlign: 'center',
    },
    editor: {
        backgroundColor: colors.darkBackground,
        color: colors.darkNeutral100
    }
});

export default NoteEditScreen;