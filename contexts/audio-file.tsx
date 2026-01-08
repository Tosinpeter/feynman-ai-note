import { useState, useRef, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { Platform } from 'react-native';

interface AudioFileData {
  uri: string;
  fileName: string;
  mimeType: string;
  base64Data: string | null;
}

export const [AudioFileProvider, useAudioFile] = createContextHook(() => {
  const [audioData, setAudioData] = useState<AudioFileData | null>(null);
  const base64Ref = useRef<string | null>(null);
  const fileInfoRef = useRef<{ name: string; type: string } | null>(null);

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const setAudioFile = useCallback(async (data: {
    uri: string;
    fileName: string;
    mimeType: string;
    webFile?: File | null;
  }) => {
    let base64Data: string | null = null;

    console.log('=== Setting Audio File in Context ===');
    console.log('URI:', data.uri);
    console.log('fileName:', data.fileName);
    console.log('mimeType:', data.mimeType);
    console.log('webFile provided:', !!data.webFile);
    console.log('Platform:', Platform.OS);

    if (Platform.OS === 'web') {
      try {
        if (data.webFile && data.webFile.size > 0) {
          const arrayBuffer = await data.webFile.arrayBuffer();
          base64Data = arrayBufferToBase64(arrayBuffer);
          console.log('Stored base64 from webFile:', base64Data.length, 'chars');
        } else if (data.uri) {
          console.log('Fetching blob from URI...');
          const response = await fetch(data.uri);
          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();
          base64Data = arrayBufferToBase64(arrayBuffer);
          console.log('Stored base64 from URI fetch:', base64Data.length, 'chars');
        }
        
        if (base64Data) {
          base64Ref.current = base64Data;
          fileInfoRef.current = { name: data.fileName, type: data.mimeType || 'audio/mpeg' };
        }
      } catch (error) {
        console.error('Failed to store audio data:', error);
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
    
    const base64 = audioData?.base64Data || base64Ref.current;
    const info = fileInfoRef.current || (audioData ? { name: audioData.fileName, type: audioData.mimeType } : null);
    
    if (base64 && info) {
      try {
        const arrayBuffer = base64ToArrayBuffer(base64);
        const file = new File([arrayBuffer], info.name, { type: info.type || 'audio/mpeg' });
        console.log('Created File from base64:', file.name, file.size, file.type);
        return file;
      } catch (error) {
        console.error('Failed to create File from base64:', error);
      }
    }
    
    console.log('No audio file available in context');
    return null;
  }, [audioData]);

  const getAudioBlob = useCallback((): Blob | null => {
    const file = getAudioFile();
    return file;
  }, [getAudioFile]);

  const clearAudioFile = useCallback(() => {
    console.log('Clearing audio file from context');
    setAudioData(null);
    base64Ref.current = null;
    fileInfoRef.current = null;
  }, []);

  return {
    audioData,
    setAudioFile,
    getAudioFile,
    getAudioBlob,
    clearAudioFile,
  };
});
