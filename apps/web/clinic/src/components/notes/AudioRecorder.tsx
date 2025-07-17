'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square, Play, Pause, Trash2, Upload, AlertCircle } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
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
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onRecordingComplete(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const pauseResumeRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        
        // Resume timer
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        
        // Pause timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
  };

  const playPauseAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {!audioBlob ? (
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={disabled}
                className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mic className="h-5 w-5" />
                <span>Start Recording</span>
              </button>
            ) : (
              <>
                <button
                  onClick={pauseResumeRecording}
                  className="p-3 bg-healui-accent text-white rounded-lg hover:bg-healui-accent/80 transition-all duration-200"
                >
                  {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                </button>
                <button
                  onClick={stopRecording}
                  className="flex items-center space-x-2 px-6 py-3 bg-text-gray text-white rounded-lg hover:bg-text-dark transition-all duration-200"
                >
                  <Square className="h-5 w-5" />
                  <span>Stop</span>
                </button>
              </>
            )}
          </div>
          
          {isRecording && (
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2">
                <div className={`h-3 w-3 rounded-full ${isPaused ? 'bg-healui-accent' : 'bg-red-500 animate-pulse'}`} />
                <span className="text-sm font-medium text-text-gray">
                  {isPaused ? 'Paused' : 'Recording'}
                </span>
              </div>
              <span className="text-lg font-mono text-text-dark">{formatTime(recordingTime)}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-bg-light rounded-lg">
            <div className="flex items-center space-x-4">
              <button
                onClick={playPauseAudio}
                className="p-2 bg-healui-primary text-white rounded-lg hover:bg-healui-physio transition-all duration-200"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              <div>
                <p className="text-sm font-medium text-text-gray">Audio Recording</p>
                <p className="text-xs text-text-light">{formatTime(recordingTime)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={deleteRecording}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          )}
          
          <div className="flex items-center justify-center">
            <button
              onClick={() => deleteRecording()}
              className="text-sm text-text-gray hover:text-text-dark transition-all duration-200"
            >
              Record Again
            </button>
          </div>
        </div>
      )}
      
      {isTranscribing && (
        <div className="flex items-center justify-center space-x-2 text-healui-primary">
          <div className="animate-spin h-4 w-4 border-2 border-healui-primary border-t-transparent rounded-full" />
          <span className="text-sm">Transcribing audio...</span>
        </div>
      )}
    </div>
  );
}