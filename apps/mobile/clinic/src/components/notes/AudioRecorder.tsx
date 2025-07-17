import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';

interface AudioRecorderProps {
  onRecordingComplete: (audioUri: string) => void;
  onTranscriptionComplete?: (transcription: string) => void;
  isTranscribing?: boolean;
  disabled?: boolean;
}

export default function AudioRecorder({ 
  onRecordingComplete, 
  onTranscriptionComplete,
  isTranscribing = false,
  disabled = false 
}: AudioRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Audio Recording Permission',
            message: 'This app needs access to your microphone to record audio notes.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const startRecording = async () => {
    try {
      setError(null);
      
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setError('Microphone permission is required to record audio.');
        return;
      }

      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording', err);
      setError('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      setAudioUri(uri);
      setRecording(null);
      setIsRecording(false);
      setIsPaused(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (uri) {
        onRecordingComplete(uri);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
      setError('Failed to stop recording. Please try again.');
    }
  };

  const pauseResumeRecording = async () => {
    if (!recording) return;

    try {
      if (isPaused) {
        await recording.startAsync();
        setIsPaused(false);
        
        // Resume timer
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        await recording.pauseAsync();
        setIsPaused(true);
        
        // Pause timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    } catch (err) {
      console.error('Failed to pause/resume recording', err);
      setError('Failed to pause/resume recording.');
    }
  };

  const playPauseAudio = async () => {
    if (!audioUri) return;

    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    } catch (err) {
      console.error('Failed to play audio', err);
      setError('Failed to play audio.');
    }
  };

  const deleteRecording = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    
    if (audioUri) {
      try {
        await FileSystem.deleteAsync(audioUri);
      } catch (err) {
        console.log('Failed to delete audio file:', err);
      }
    }

    setAudioUri(null);
    setRecordingTime(0);
    setIsPlaying(false);
    setError(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <View className="bg-red-50 p-4 rounded-xl mb-4">
        <View className="flex-row items-center space-x-2">
          <Icon name="alert-circle" size={20} color={colors?.red?.[600] || '#DC2626'} />
          <Text className="text-red-800 text-sm flex-1">{error}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setError(null)}
          className="mt-2 bg-red-100 px-3 py-1 rounded"
        >
          <Text className="text-red-800 text-xs">Dismiss</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!audioUri) {
    return (
      <View className="bg-white rounded-xl p-6 items-center space-y-4">
        {!isRecording ? (
          <TouchableOpacity
            onPress={startRecording}
            disabled={disabled}
            className={`w-20 h-20 rounded-full items-center justify-center ${
              disabled ? 'bg-gray-300' : 'bg-red-500'
            }`}
          >
            <Icon 
              name="microphone" 
              size={32} 
              color={disabled ? '#9CA3AF' : '#FFFFFF'} 
            />
          </TouchableOpacity>
        ) : (
          <View className="items-center space-y-4">
            <View className="flex-row items-center space-x-4">
              <TouchableOpacity
                onPress={pauseResumeRecording}
                className="w-12 h-12 rounded-full bg-yellow-500 items-center justify-center"
              >
                <Icon 
                  name={isPaused ? "play" : "pause"} 
                  size={24} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={stopRecording}
                className="w-12 h-12 rounded-full bg-gray-500 items-center justify-center"
              >
                <Icon name="stop" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View className="items-center space-y-2">
              <View className="flex-row items-center space-x-2">
                <View className={`w-3 h-3 rounded-full ${
                  isPaused ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <Text className="text-sm font-medium text-gray-700">
                  {isPaused ? 'Paused' : 'Recording'}
                </Text>
              </View>
              <Text className="text-2xl font-mono text-gray-900">
                {formatTime(recordingTime)}
              </Text>
            </View>
          </View>
        )}
        
        <Text className="text-sm text-gray-600 text-center">
          {!isRecording ? 'Tap to start recording' : 'Recording in progress...'}
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-xl p-4 space-y-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center space-x-3">
          <TouchableOpacity
            onPress={playPauseAudio}
            className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center"
          >
            <Icon 
              name={isPlaying ? "pause" : "play"} 
              size={24} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
          <View>
            <Text className="text-sm font-medium text-gray-700">Audio Recording</Text>
            <Text className="text-xs text-gray-500">{formatTime(recordingTime)}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={deleteRecording}
          className="w-10 h-10 rounded-full bg-red-100 items-center justify-center"
        >
          <Icon name="delete" size={20} color={colors?.red?.[600] || '#DC2626'} />
        </TouchableOpacity>
      </View>
      
      {isTranscribing && (
        <View className="flex-row items-center justify-center space-x-2 py-2">
          <View className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <Text className="text-sm text-blue-600">Transcribing audio...</Text>
        </View>
      )}
      
      <TouchableOpacity
        onPress={deleteRecording}
        className="items-center py-2"
      >
        <Text className="text-sm text-gray-600">Record Again</Text>
      </TouchableOpacity>
    </View>
  );
}