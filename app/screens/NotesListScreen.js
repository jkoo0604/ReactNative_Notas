import React from 'react'
import { SafeAreaView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSelector, useDispatch } from 'react-redux';

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

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.list}>
                {
                    currentNotes.map((onenote, idx) => {
                    let convertedDate = new Date(+onenote.updatedAtStr).toLocaleString();
                    return (
                        <View style={styles.container} key={idx}>
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
        padding: 15
    }
});

export default NotesListScreen;