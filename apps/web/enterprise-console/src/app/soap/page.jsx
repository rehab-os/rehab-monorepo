'use client';
import React, { useState, useEffect, useRef } from 'react';

// Main App component
const App = () => {
  // State variables for the app
  const [recording, setRecording] = useState(false); // Indicates if recording is active
  const [audioBlob, setAudioBlob] = useState(null); // Stores the recorded audio blob
  const [transcribedText, setTranscribedText] = useState(''); // Stores the "transcribed" text (user input for now)
  const [isLoading, setIsLoading] = useState(false); // Indicates if API call is in progress
  const [soapNotes, setSoapNotes] = useState({
    // Stores the parsed SOAP notes
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  });
  const [message, setMessage] = useState(''); // General messages to the user
  const [showModal, setShowModal] = useState(false); // Controls modal visibility for messages
  const [modalContent, setModalContent] = useState(''); // Content for the modal

  // Ref for the media recorder instance
  const mediaRecorderRef = useRef(null);
  // Ref to store audio chunks during recording
  const audioChunksRef = useRef([]);

  // Function to show a modal message
  const showMessage = (content) => {
    setModalContent(content);
    setShowModal(true);
  };

  // Function to start audio recording
  const startRecording = async () => {
    try {
      // Request access to microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = []; // Clear previous chunks

      // Event handler for data available (audio chunks)
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      // Event handler for stopping recording
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        });
        setAudioBlob(audioBlob);
        // For now, we simulate transcription by expecting user to type.
        // In a real app, you would send this `audioBlob` to a speech-to-text API.
        showMessage(
          'Recording stopped. Please type or paste your notes into the text area to simulate transcription, then click "Process Notes".'
        );
      };

      mediaRecorderRef.current.start(); // Start recording
      setRecording(true);
      showMessage('Recording started. Click "Stop Recording" when done.');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      showMessage(
        'Error accessing microphone. Please ensure you have granted permission.'
      );
    }
  };

  // Function to stop audio recording
  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // Function to process the text and fill SOAP notes using Gemini API
  const processNotes = async () => {
    if (!transcribedText.trim()) {
      showMessage(
        'Please enter some text in the "Transcribed Notes" area to process.'
      );
      return;
    }

    setIsLoading(true);
    setMessage('Processing notes with AI...');

    try {
      // Construct the prompt for the LLM
      const prompt = `
            You are an expert physiotherapist assistant. understand the language maybe hindi or whatever and get result in English only; Your task is to analyze the following patient notes and extract information into Subjective, Objective, Assessment, and Plan sections.

            Input Notes:
            "${transcribedText}"

            Please structure your response as a JSON object with the following schema:
            {
                "subjective": "Extracted subjective information (patient's complaints, history, pain description, etc.)",
                "objective": "Extracted objective information (findings from physical examination, observations, measurements, etc.)",
                "assessment": "Extracted assessment (diagnosis, clinical impression, problem list, functional limitations, etc.)",
                "plan": "Extracted plan (treatment goals, interventions, home exercise program, referrals, follow-up, etc.)"
            }

            If a section is not explicitly mentioned or inferable, return an empty string for that field. Ensure all extracted text is concise and relevant to the respective SOAP section.
            `;

      // Prepare the payload for the Gemini API call
      const chatHistory = [];
      chatHistory.push({ role: 'user', parts: [{ text: prompt }] });
      const payload = {
        contents: chatHistory,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              subjective: { type: 'STRING' },
              objective: { type: 'STRING' },
              assessment: { type: 'STRING' },
              plan: { type: 'STRING' },
            },
            propertyOrdering: ['subjective', 'objective', 'assessment', 'plan'],
          },
        },
      };

      const apiKey = 'AIzaSyBP7kBDW63Y_2pidrsG7wSGZHke1Hf3FX4'; // Canvas will automatically provide the API key
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      // Make the fetch call to the Gemini API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      // Check if the response contains the expected structure
      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        const jsonString = result.candidates[0].content.parts[0].text;
        let parsedJson;
        try {
          parsedJson = JSON.parse(jsonString);
        } catch (parseError) {
          console.error('Error parsing JSON response from LLM:', parseError);
          showMessage(
            'Failed to parse AI response. Please try again or refine your input.'
          );
          return;
        }

        setSoapNotes({
          subjective: parsedJson.subjective || '',
          objective: parsedJson.objective || '',
          assessment: parsedJson.assessment || '',
          plan: parsedJson.plan || '',
        });
        setMessage('Notes processed successfully!');
      } else {
        console.error('Unexpected API response structure:', result);
        showMessage('Failed to process notes. Unexpected response from AI.');
      }
    } catch (error) {
      console.error('Error processing notes with AI:', error);
      showMessage(
        'An error occurred while communicating with the AI. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Function to clear all fields
  const clearNotes = () => {
    setTranscribedText('');
    setAudioBlob(null);
    setSoapNotes({ subjective: '', objective: '', assessment: '', plan: '' });
    setMessage('');
    setShowModal(false);
    setModalContent('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 font-sans text-gray-800 flex flex-col items-center">
      {/* Modal for messages */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-auto animate-fade-in-up">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Notification
            </h3>
            <p className="text-gray-700 mb-6">{modalContent}</p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-6 md:p-8 space-y-8 my-8 border border-blue-200">
        <h1 className="text-4xl font-extrabold text-center text-blue-800 mb-8 tracking-tight">
          Physio SOAP Notes Assistant (POC)
        </h1>

        {/* Voice Input Section */}
        <div className="bg-blue-50 p-6 rounded-lg shadow-inner border border-blue-100">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center">
            <svg
              className="w-6 h-6 mr-2 text-blue-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            Voice Notes Input
          </h2>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <button
              onClick={startRecording}
              disabled={recording}
              className={`flex-1 flex items-center justify-center py-3 px-6 rounded-lg font-bold transition duration-300 ease-in-out transform hover:scale-105 shadow-md
                                ${
                                  recording
                                    ? 'bg-red-500 text-white animate-pulse cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a3 3 0 00-3-3H7zM4 7a6 6 0 0112 0v4a6 6 0 01-12 0V7zm8-6a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
              {recording ? 'Recording...' : 'Start Recording'}
            </button>
            <button
              onClick={stopRecording}
              disabled={!recording}
              className={`flex-1 flex items-center justify-center py-3 px-6 rounded-lg font-bold transition duration-300 ease-in-out transform hover:scale-105 shadow-md
                                ${
                                  !recording
                                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              Stop Recording
            </button>
          </div>
          <textarea
            value={transcribedText}
            onChange={(e) => setTranscribedText(e.target.value)}
            placeholder="Type or paste your transcribed notes here. (In a real app, this would be filled by voice-to-text transcription)"
            rows="6"
            className="w-full p-4 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-y"
          ></textarea>
          <div className="mt-4 text-center">
            <button
              onClick={processNotes}
              disabled={isLoading || !transcribedText.trim()}
              className={`w-full md:w-auto py-3 px-8 rounded-lg font-bold transition duration-300 ease-in-out transform hover:scale-105 shadow-md
                                ${
                                  isLoading || !transcribedText.trim()
                                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
            >
              {isLoading ? 'Processing...' : 'Process Notes with AI'}
            </button>
          </div>
        </div>

        {/* SOAP Notes Output Section */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
            <svg
              className="w-6 h-6 mr-2 text-gray-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 6.293A1 1 0 015.586 7H4zm1.5 5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm5.5 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"
                clipRule="evenodd"
              />
            </svg>
            SOAP Notes
          </h2>

          {Object.entries(soapNotes).map(([key, value]) => (
            <div key={key} className="mb-5">
              <label className="block text-lg font-medium text-gray-700 mb-2 capitalize">
                {key}:
              </label>
              <textarea
                value={value}
                onChange={(e) =>
                  setSoapNotes((prev) => ({ ...prev, [key]: e.target.value }))
                }
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-y"
                placeholder={`AI generated ${key} notes...`}
              ></textarea>
            </div>
          ))}

          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mt-6">
            {/* The Save Notes button is removed for this POC version */}
            <button
              onClick={clearNotes}
              className="flex-1 flex items-center justify-center py-3 px-6 rounded-lg font-bold bg-red-500 hover:bg-red-600 text-white transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 01-2 0v6a1 1 0 112 0V8z"
                  clipRule="evenodd"
                />
              </svg>
              Clear All
            </button>
          </div>
        </div>

        {/* Message display area */}
        {message && (
          <div
            className={`p-4 text-center rounded-lg shadow-md ${
              isLoading
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
