import React, { useRef } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';              // static, named import
import { IconButton, useTheme } from 'react-native-paper';

export default function CameraModal({ visible, onClose, onPhotoTaken }) {
  const cameraRef = useRef(null);
  const theme = useTheme();

  if (!visible) return null;

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
      });
      onPhotoTaken(photo.uri);
    }
  };

  return (
    <Modal animationType="slide" visible={visible} presentationStyle="fullScreen">
      <View style={styles.container}>
        <Camera style={styles.camera} ref={cameraRef}>
          <IconButton
            icon="close"
            size={28}
            color="#fff"
            onPress={onClose}
            style={styles.closeButton}
          />
          <View style={styles.footer}>
            <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
              <View
                style={[
                  styles.innerCircle,
                  { borderColor: theme.colors.primary },
                ]}
              />
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 4,
  },
});
