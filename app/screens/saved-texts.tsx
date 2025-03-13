import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const SavedTextsScreen: React.FC = () => {
    const { text } = useLocalSearchParams<{ text: string }>();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Saved Text</Text>
            <Text style={styles.text}>{text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    text: {
        fontSize: 16,
        lineHeight: 24,
    },
});

export default SavedTextsScreen; 