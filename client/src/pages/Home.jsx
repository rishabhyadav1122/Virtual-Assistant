// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { Mic, MicOff } from "lucide-react";


export const Home = () => {
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isAssistantActive, setIsAssistantActive] = useState(false);
  const { transcript, resetTranscript, listening } = useSpeechRecognition();
  const isSpeakingRef = useRef(false);
  const shouldListenRef = useRef(false);
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");



  const checkAuthStatus = async () => {
    try {
      const res = await fetch("https://virtual-assistant-nu.vercel.app/api/auth/userdata", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log(data)
      if (res.ok) {
        setUser(data.userData);
        console.log(data.userData)
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setLoadingAuth(false);
    }
  };

  useEffect(() => {
    checkAuthStatus()
  },[])
  // const speak = (text) => {
  //   return new Promise((resolve) => {
  //     isSpeakingRef.current = true;
  //     const utterance = new SpeechSynthesisUtterance(text);
      
  //     utterance.onend = () => {
  //       isSpeakingRef.current = false;
  //       resolve();
  //     };
      
  //     window.speechSynthesis.speak(utterance);
  //   });
  // };
  const speak = (text) =>  {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    
    // Cancel any current speech
    synth.cancel();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0; // Normal speed
    utterance.pitch = 1.0; // Normal pitch

    // Try to find Heera voice
    const voices = synth.getVoices();
    const heeraVoice = voices.find(voice => 
      voice.name.includes("Heera") || 
      (voice.lang === "en-IN" && voice.name.includes("Microsoft"))
    );

    if (heeraVoice) {
      utterance.voice = heeraVoice;
      console.log("Using Heera voice:", heeraVoice.name);
    } else {
      console.warn("Heera voice not found - using default voice");
    }

    // Event handlers
    utterance.onend = () => resolve();
    utterance.onerror = (err) => {
      console.error("Speech error:", err);
      resolve();
    };

    synth.speak(utterance);
  });
}

  const startListening = () => {
    if (!isSpeakingRef.current) {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: false });
      shouldListenRef.current = true;
    }
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    shouldListenRef.current = false;
  };

  const activateAssistant = async () => {
    setChat([]);
    setIsAssistantActive(true);
    await speak("Assistant initialized. Speak now");
    startListening();
  };

  const deactivateAssistant = async () => {
    stopListening();
    setIsAssistantActive(false);
    await speak("Assistant deactivated");
    setChat([]);
  };

  const toggleAssistant = async () => {
    if (isAssistantActive) {
      await deactivateAssistant();
    } else {
      await activateAssistant();
    }
  };

  const processCommand = async () => {
    const currentTranscript = transcript.trim();
    
    if (!currentTranscript) return;

    // Add user message to chat
    setChat(prev => [...prev, { type: "user", text: currentTranscript }]);
    setLoading(true);
    
    try {
      stopListening();
      const response = await fetch("https://virtual-assistant-nu.vercel.app/api/command/getResponse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commandText: currentTranscript }),
      });

      if (response.ok) {
        const data = await response.json();
        const botResponse = data.data;
        setChat(prev => [...prev, { type: "bot", text: botResponse }]);
        await speak(botResponse);
      } else {
        throw new Error("API request failed");
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = "Sorry, I encountered an error. Please try again.";
      setChat(prev => [...prev, { type: "bot", text: errorMessage }]);
      await speak(errorMessage);
    } finally {
      setLoading(false);
      resetTranscript();
      
      // Restart listening if assistant is still active
      if (isAssistantActive) {
        await speak("Speak now");
        startListening();
      }
    }
  };

  // Effect to handle speech recognition results
  useEffect(() => {
    if (isAssistantActive && !listening && transcript && shouldListenRef.current) {
      processCommand();
    }
  }, [listening, transcript, isAssistantActive]);

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="absolute top-20 left-5 bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-500 text-white px-6 py-4 rounded-2xl shadow-lg text-lg font-medium font-sans">
  Hello {user.name}, Welcome back to your assistant ✨
</div>

      <div className="w-full max-w-2xl mb-8 p-4 space-y-4">
        {chat.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl w-fit max-w-[90%] ${
              msg.type === "user"
                ? "bg-blue-600 self-end ml-auto"
                : "bg-gray-700 self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="self-center text-sm text-gray-400 animate-pulse">
            Processing...
          </div>
        )}
      </div>

      <button
        onClick={toggleAssistant}
        className={`rounded-full p-6 shadow-xl transition ${
          isAssistantActive 
            ? "bg-red-600 animate-pulse" 
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        disabled={loading}
      >
        {isAssistantActive ? (
          <MicOff className="w-8 h-8 text-white" />
        ) : (
          <Mic className="w-8 h-8 text-white" />
        )}
      </button>
    </div>
  );
};