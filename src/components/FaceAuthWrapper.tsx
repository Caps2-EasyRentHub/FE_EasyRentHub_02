import React from 'react';
import {View} from 'react-native';
import FaceCapture from './FaceCapture';
import {useFaceAuth, FaceAuthPurpose} from '@/hooks/useFaceAuth';

interface FaceAuthWrapperProps {
  children: React.ReactNode;
  onAuthSuccess: () => void;
  purpose?: FaceAuthPurpose;
}

const FaceAuthWrapper: React.FC<FaceAuthWrapperProps> = ({
  children,
  onAuthSuccess,
  purpose = FaceAuthPurpose.VERIFY,
}) => {
  const {
    isModalVisible,
    showFaceAuthModal,
    hideFaceAuthModal,
    handleFaceCapture,
    handleFaceCaptureError,
  } = useFaceAuth({
    onSuccess: () => {
      onAuthSuccess();
    },
  });

  return (
    <View style={{flex: 1}}>
      {children}
      <FaceCapture
        isVisible={isModalVisible}
        onClose={hideFaceAuthModal}
        onSuccess={handleFaceCapture}
        onError={handleFaceCaptureError}
        title={
          purpose === FaceAuthPurpose.REGISTER
            ? 'Register Your Face'
            : 'Verify Your Face'
        }
        subtitle={
          purpose === FaceAuthPurpose.REGISTER
            ? 'We need to register your face for future verification'
            : 'Please verify your identity to proceed'
        }
      />
    </View>
  );
};

export default FaceAuthWrapper; 