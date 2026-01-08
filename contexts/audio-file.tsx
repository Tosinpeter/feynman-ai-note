import { useState, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { Platform } from 'react-native';

interface AudioFileData {
  uri: string;
  fileName: string;
  mimeType: string;
  base64Data?: string;
}

export const [AudioFileProvider, useAudioFile] = createContextHook(() => {
  const [audioData, setAudioData] = useState<AudioFileData | null>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const base64ToFile = (base64: string, fileName: string, mimeType: string): File => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    return new File([blob], fileName, { type: mimeType });
  };

  const setAudioFile = useCallback(async (data: {
    uri: string;
    fileName: string;
    mimeType: string;
    webFile?: File | null;
  }) => {
    console.log('=== Setting Audio File in Context ===');
    console.log('URI:', data.uri);
    console.log('fileName:', data.fileName);
    console.log('mimeType:', data.mimeType);
    console.log('webFile provided:', !!data.webFile);
    console.log('Platform:', Platform.OS);

    let base64Data: string | undefined;

    if (Platform.OS === 'web' && data.webFile && data.webFile.size > 0) {
      try {
        console.log('Converting file to base64 for persistence...');
        base64Data = await fileToBase64(data.webFile);
        console.log('File converted to base64, length:', base64Data.length);
      } catch (error) {
        console.error('Failed to convert file to base64:', error);
      }
    }

    setAudioData({
      uri: data.uri,
      fileName: data.fileName,
      mimeType: data.mimeType,
      base64Data,
    });
  }, []);

  const getAudioFile = useCallback((): File | null => {
    console.log('=== Getting Audio File from Context ===');
    
    if (Platform.OS === 'web' && audioData?.base64Data) {
      try {
        const file = base64ToFile(
          audioData.base64Data,
          audioData.fileName,
          audioData.mimeType
        );
        console.log('Reconstructed File from base64:', file.name, file.size, file.type);
        return file;
      } catch (error) {
        console.error('Failed to reconstruct file from base64:', error);
      }
    }
    
    console.log('No audio file available in context');
    return null;
  }, [audioData]);

  const getAudioBlob = useCallback((): Blob | null => {
    return getAudioFile();
  }, [getAudioFile]);

  const clearAudioFile = useCallback(() => {
    console.log('Clearing audio file from context');
    setAudioData(null);
  }, []);

  return {
    audioData,
    setAudioFile,
    getAudioFile,
    getAudioBlob,
    clearAudioFile,
  };
});
