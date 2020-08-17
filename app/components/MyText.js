import React from 'react';
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold } from '@expo-google-fonts/dev';
import { Text } from 'react-native';

import colors from '../config/colors';

const MyText = props => {
    useFonts({Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold})
    return (
        <Text style={[{fontFamily: "Montserrat_400Regular", fontSize: props.size || 14,color: props.color || colors.darkNeutral40,}]} onPress={props.onPress}>{props.children}</Text>
    )
}

export default MyText;