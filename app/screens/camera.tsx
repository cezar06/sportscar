import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { useRouter } from 'expo-router';

interface CameraButtonProps {
    onPress: () => void;
    icon?: string;
    isMain?: boolean;
}

interface PreviewProps {
    imageUri: string;
    recognizedText: string;
    onRetake: () => void;
    onSave: () => void;
}

interface RecognizedText {
    text: string;
}

const CameraButton: React.FC<CameraButtonProps> = ({ onPress, icon, isMain }) => (
    <TouchableOpacity
        style={isMain ? styles.mainButton : styles.circleButton}
        onPress={onPress}
    >
        {isMain ? (
            <View style={styles.mainButtonInner} />
        ) : (
            <Text style={styles.buttonIcon}>{icon}</Text>
        )}
    </TouchableOpacity>
);

const Preview: React.FC<PreviewProps> = ({
    imageUri,
    recognizedText,
    onRetake,
    onSave
}) => (
    <View style={styles.previewContainer}>
        <Image source={{ uri: imageUri }} style={styles.preview} />
        <Text style={styles.recognizedText}>{recognizedText}</Text>
        <View style={styles.previewButtonContainer}>
            <TouchableOpacity style={styles.previewButton} onPress={onRetake}>
                <Text style={styles.previewButtonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.previewButton} onPress={onSave}>
                <Text style={styles.previewButtonText}>Save Text</Text>
            </TouchableOpacity>
        </View>
    </View>
);

const CameraScreen: React.FC = () => {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<CameraType>('back');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [recognizedText, setRecognizedText] = useState<string>('');
    const router = useRouter();
    const cameraRef = useRef<CameraView>(null);

    const takePicture = useCallback(async () => {
        try {
            const photo = await cameraRef.current?.takePictureAsync();
            if (photo) {
                setCapturedImage(photo.uri);
                // For now, we'll just save the image without text recognition
                // until we implement a proper text recognition solution
                await MediaLibrary.saveToLibraryAsync(photo.uri);
                setRecognizedText('Text recognition is being implemented...');
            }
        } catch (error) {
            console.error('Error taking picture:', error);
        }
    }, []);

    const pickImage = useCallback(async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled) {
                setCapturedImage(result.assets[0].uri);
                // For now, we'll just show a placeholder message
                setRecognizedText('Text recognition is being implemented...');
            }
        } catch (error) {
            console.error('Error picking image:', error);
        }
    }, []);

    const saveText = useCallback(async () => {
        if (recognizedText) {
            router.push({
                pathname: '/screens/saved-texts' as const,
                params: { text: recognizedText }
            });
        }
    }, [recognizedText, router]);

    const toggleCameraFacing = useCallback(() => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }, []);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {!capturedImage ? (
                <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
                    <View style={styles.buttonContainer}>
                        <CameraButton onPress={toggleCameraFacing} icon="⟲" />
                        <CameraButton onPress={takePicture} isMain />
                        <CameraButton onPress={pickImage} icon="🖼️" />
                    </View>
                </CameraView>
            ) : (
                <Preview
                    imageUri={capturedImage}
                    recognizedText={recognizedText}
                    onRetake={() => setCapturedImage(null)}
                    onSave={saveText}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 40,
        flexDirection: 'row',
        width: '100%',
        padding: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    circleButton: {
        width: 45,
        height: 45,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    mainButton: {
        width: 65,
        height: 65,
        borderRadius: 35,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    mainButtonInner: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#000',
    },
    buttonIcon: {
        fontSize: 24,
    },
    previewContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#000',
    },
    preview: {
        width: '100%',
        height: '70%',
        resizeMode: 'contain',
    },
    recognizedText: {
        marginVertical: 20,
        fontSize: 16,
        color: '#fff',
    },
    previewButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    previewButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        minWidth: 120,
        alignItems: 'center',
    },
    previewButtonText: {
        fontSize: 16,
        color: '#000',
    },
    permissionButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
    },
    permissionButtonText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default CameraScreen; 