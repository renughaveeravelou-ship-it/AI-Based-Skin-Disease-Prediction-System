import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Mic, Volume2, Sparkles, HelpCircle } from 'lucide-react';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I am your DermShield AI Skincare Care Advisor. Ask me anything about Acne, Melanoma, Ringworm, Vitiligo, SPF protective routines, or general skincare recommendations! How can I support your skin today?",
      timestamp: new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const scrollRef = useRef(null);

  // Auto Scroll Chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Speech Recognition (Speech-to-Text STT)
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice speech recognition (STT) is not supported by your current browser. Please type your message.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setInputVal(speechToText);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Text to Speech (TTS)
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel previous speech playing
      window.speechSynthesis.cancel();
      const utterance = new SpeechUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech audio playing is not supported in this browser.");
    }
  };

  // Send Message handler
  const handleSend = async (customText = null) => {
    const textToSend = (customText || inputVal).trim();
    if (!textToSend) return;

    // Add user message
    const userMsg = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    try {
      const res = await fetch("/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend })
      });
      const data = await res.json();
      
      const botMsg = {
        sender: 'bot',
        text: data.reply || "I am processing your query. Please hold on.",
        timestamp: new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        sender: 'bot',
        text: "I failed to contact the care advisor server. Please check your network connection.",
        timestamp: new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Suggestions HashTags
  const suggestTags = [
    { label: "Acne Prevention Routine", query: "What is the best routine to prevent Acne breakout?" },
    { label: "SPF Sunscreen Guidelines", query: "How often should I apply broad-spectrum SPF sunscreen?" },
    { label: "Fitzpatrick Phototypes", query: "Can you explain the Fitzpatrick skin phototype scale?" },
    { label: "Atypical Melanoma Moles", query: "What are the ABCDE warning signs of melanoma moles?" }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-16 md:pb-0 h-[calc(100vh-120px)] md:h-[screen] flex flex-col">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">AI Skincare Advisor</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Chat with our clinical-guided AI skin care and wellness assistant.
        </p>
      </div>

      {/* Main Panel */}
      <div className="glass-panel flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Top Active Bar */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-[#1f293d] flex items-center justify-between bg-slate-50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Bot size={18} className="animate-pulse" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 dark:text-white text-xs leading-none">DermShield Bot</h4>
              <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Active Care Advisor</span>
              </span>
            </div>
          </div>
          <Volume2 
            size={18} 
            className="text-slate-450 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-all" 
            title="Voice Speech Support Enabled"
          />
        </div>

        {/* Bubbles Frame */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, idx) => {
            const isBot = msg.sender === 'bot';
            return (
              <div 
                key={idx} 
                className={`flex gap-3 max-w-[85%] ${isBot ? 'self-start' : 'self-end ml-auto flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border ${
                  isBot 
                    ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400' 
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-[#1f293d] text-slate-600 dark:text-slate-300'
                }`}>
                  {isBot ? <Bot size={15} /> : <User size={15} />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-1">
                  <div className={`p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-lg ${
                    isBot 
                      ? 'bg-slate-100 dark:bg-slate-800/40 border border-slate-250 dark:border-[#1f293d] text-slate-800 dark:text-slate-200 rounded-tl-none' 
                      : 'bg-indigo-600 text-white rounded-tr-none'
                  }`}>
                    <p className="whitespace-pre-line">{msg.text}</p>
                    {isBot && (
                      <button
                        onClick={() => speakText(msg.text)}
                        className="mt-2 text-[10px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-extrabold flex items-center gap-1 transition-all"
                      >
                        <Volume2 size={12} />
                        <span>Listen Audio</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-450 dark:text-slate-400 font-bold px-1 text-right">{msg.timestamp}</p>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-[85%] self-start">
              <div className="w-8 h-8 rounded-lg shrink-0 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Bot size={15} />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-[#1f293d] text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center gap-1.5 rounded-tl-none">
                <span className="w-1.5 h-1.5 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce delay-0" />
                <span className="w-1.5 h-1.5 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce delay-150" />
                <span className="w-1.5 h-1.5 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce delay-300" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-5 py-2 overflow-x-auto flex gap-2 border-t border-slate-200/50 dark:border-[#1f293d]/50 bg-slate-50 dark:bg-slate-900/20 scrollbar-none shrink-0">
          {suggestTags.map((tag, i) => (
            <button
              key={i}
              onClick={() => handleSend(tag.query)}
              className="py-1 px-3 rounded-full bg-slate-100 dark:bg-slate-800/30 hover:bg-indigo-600/10 border border-slate-200 dark:border-[#1f293d] hover:border-indigo-500/30 text-[10px] font-bold text-slate-650 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap transition-all flex items-center gap-1 shrink-0"
            >
              <Sparkles size={10} />
              <span>{tag.label}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-[#1f293d] bg-slate-50 dark:bg-slate-900/40 shrink-0">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2 items-center"
          >
            {/* Mic Speech Button */}
            <button
              type="button"
              onClick={startListening}
              className={`p-3 rounded-xl border transition-all ${
                isListening 
                  ? 'bg-rose-600 border-transparent text-white animate-pulse shadow-lg shadow-rose-600/25' 
                  : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-[#1f293d] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
              title="Speak voice query"
            >
              <Mic size={16} />
            </button>

            {/* Input Element */}
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask anything about Acne, Melanoma, SPF routines..."
              className="flex-1 bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-[#1f293d] focus:border-indigo-500 rounded-xl px-4 py-3 text-xs font-medium text-slate-800 dark:text-slate-200 placeholder-slate-450 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />

            {/* Send Button */}
            <button
              type="submit"
              className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 border border-indigo-400/20 transition-all active:scale-95 shrink-0"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
