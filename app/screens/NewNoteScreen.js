import React, { useEffect, useState, useRef } from 'react'
import { KeyboardAvoidingView, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { actions, defaultActions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as firebase from 'firebase';
import { useSelector, useDispatch } from 'react-redux';

import colors from '../config/colors';
import MyText from '../components/MyText';

const NewNoteScreen = ({navigation}) => {
    const [tags, setTags] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const user = useSelector(state => state.user);
    const notebooks = useSelector(state => state.notebooks);
    const notebook = useSelector(state => state.notebook);
    const notes = useSelector(state => state.notes);
    const note = useSelector(state => state.note);
    const dispatch = useDispatch();

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
            ;

            var ref = firebase.storage().ref().child('images/' + fileName);
            const snapshot = await ref.put(blob);

            blob.close();

            var finalUri =  await snapshot.ref.getDownloadURL();
            
            richText.current?.insertImage(finalUri);
        } catch (error) {
            console.log('Error reading an image', error);
        };
    }

    const addNote = async () => {
        let html = await richText.current.getContentHtml();
        const tagsData = [];
        if (tags.length >0) {
            tagsData = tags.split(',');
        }
        const notesRef = firebase.firestore().collection('notes');
        const noteData = {
            userId: user.id,
            notebookName: notebook.name,
            notebookId: notebook.id,
            content: html,
            tags: tagsData,
            public: isPublic,
            likedBy: [],
            createdAtStr: Date.now().toString(),
            updatedAtStr: Date.now().toString(),
        }
        notesRef.add({...noteData, createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()})
            .then(doc => {
                // console.log(html);
                const newNotedata = {...noteData, id: doc.id};
                dispatch({
                    type: "NOTES",
                    notes: [newNotedata, ...notes]
                })
                dispatch({
                    type: "ONENOTE",
                    note: noteData
                })
                navigation.navigate('Folders')
            })
            .catch(err=>{
                console.log(err);
            })

        
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerForm}>
                <MyText color={colors.darkAction} onPress={addNote} size={16}>Save</MyText>
            </View>
            <ScrollView keyboardDismissMode={'none'} style={styles.editorWrapper}>             
                <RichEditor ref={richText} initialContentHTML="" containerStyle={{backgroundColor: colors.darkBackground}} editorStyle={styles.editor} style={styles.rich} placeholder={'Type anything'} />
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
        flex: 1
    },
    headerForm: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        justifyContent: 'flex-end'
    },
    editorWrapper: {
        textAlign: 'center',
    },
    editor: {
        backgroundColor: colors.darkBackground,
        color: colors.darkNeutral100,
    }
});

export default NewNoteScreen;