import { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Languages } from 'lucide-react';

const INDIAN_LANGUAGES = [
  { code: 'hi-IN', label: 'हिन्दी', name: 'Hindi' },
  { code: 'en-IN', label: 'English', name: 'English (India)' },
  { code: 'ta-IN', label: 'தமிழ்', name: 'Tamil' },
  { code: 'te-IN', label: 'తెలుగు', name: 'Telugu' },
  { code: 'bn-IN', label: 'বাংলা', name: 'Bengali' },
  { code: 'mr-IN', label: 'मराठी', name: 'Marathi' },
  { code: 'kn-IN', label: 'ಕನ್ನಡ', name: 'Kannada' },
  { code: 'gu-IN', label: 'ગુજરાતી', name: 'Gujarati' },
  { code: 'ml-IN', label: 'മലയാളം', name: 'Malayalam' },
  { code: 'pa-IN', label: 'ਪੰਜਾਬੀ', name: 'Punjabi' },
];

export default function VoiceInput({ onTranscript, onClose }) {
  const [selectedLang, setSelectedLang] = useState('hi-IN');
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [showLangPicker, setShowLangPicker] = useState(false);
  const recognitionRef = useRef(null);

  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Voice input is not supported in this browser. Please use Chrome.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = selectedLang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => { setListening(true); setError(''); };
    recognition.onend = () => setListening(false);
    recognition.onerror = (e) => {
      setError(e.error === 'not-allowed' ? 'Microphone permission denied.' : `Error: ${e.error}`);
      setListening(false);
    };

    recognition.onresult = (event) => {
      let full = '';
      for (let i = 0; i < event.results.length; i++) {
        full += event.results[i][0].transcript;
      }
      setTranscript(full);
    };

    recognition.start();
  }, [selectedLang, isSupported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const handleUse = () => {
    if (transcript.trim()) {
      onTranscript(transcript.trim());
      setTranscript('');
    }
  };

  const currentLang = INDIAN_LANGUAGES.find(l => l.code === selectedLang) || INDIAN_LANGUAGES[0];

  return (
    <div style={{ padding: '0 0 16px' }}>
      {/* Language Selector */}
      <div style={{ marginBottom: 24, position: 'relative' }}>
        <div className="section-label">
          <Languages size={12} /> Choose Language
        </div>
        <button
          className="glass-card"
          style={{
            padding: '12px 16px', display: 'flex', alignItems: 'center',
            gap: 10, width: '100%', borderRadius: 'var(--r-md)', cursor: 'pointer',
          }}
          onClick={() => setShowLangPicker(!showLangPicker)}
        >
          <span style={{ fontSize: 20 }}>🌐</span>
          <div style={{ textAlign: 'left', flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{currentLang.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-500)' }}>{currentLang.name}</div>
          </div>
          <span style={{ color: 'var(--text-500)', fontSize: 12 }}>▾</span>
        </button>

        {showLangPicker && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
            background: 'rgba(5, 5, 20, 0.98)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--r-lg)',
            overflow: 'hidden',
            backdropFilter: 'blur(20px)',
            marginTop: 4,
            boxShadow: 'var(--shadow-float)',
          }}>
            {INDIAN_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                style={{
                  width: '100%', padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: lang.code === selectedLang ? 'var(--fresh-bg)' : 'transparent',
                  borderBottom: '1px solid var(--glass-border)',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onClick={() => { setSelectedLang(lang.code); setShowLangPicker(false); }}
              >
                <span style={{ fontSize: 14, fontWeight: 700, color: lang.code === selectedLang ? 'var(--fresh)' : 'var(--text-200)', width: 60 }}>
                  {lang.label}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-500)' }}>{lang.name}</span>
                {lang.code === selectedLang && <span style={{ marginLeft: 'auto', color: 'var(--fresh)' }}>✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Voice Orb */}
      <div style={{ textAlign: 'center', padding: '20px 0 24px' }}>
        <div
          className={`voice-orb ${listening ? 'listening' : ''}`}
          onClick={listening ? stopListening : startListening}
        >
          {listening ? (
            <div className="voice-bars">
              <div className="voice-bar" />
              <div className="voice-bar" />
              <div className="voice-bar" />
              <div className="voice-bar" />
              <div className="voice-bar" />
            </div>
          ) : (
            <Mic size={32} color="var(--violet-400)" />
          )}
        </div>

        <div style={{ marginTop: 16, fontSize: 14, fontWeight: 600 }}>
          {listening ? (
            <span style={{ color: 'var(--violet-400)' }}>🎤 Listening in {currentLang.label}...</span>
          ) : (
            <span style={{ color: 'var(--text-500)' }}>Tap to speak</span>
          )}
        </div>

        {!listening && (
          <div style={{ fontSize: 12, color: 'var(--text-600)', marginTop: 4 }}>
            Try: "ek kilo aloo, 500 gram palak, do litre doodh"
          </div>
        )}
      </div>

      {error && (
        <div style={{
          padding: '12px 14px', borderRadius: 'var(--r-md)',
          background: 'var(--urgent-bg)', border: '1px solid var(--urgent-border)',
          color: 'var(--urgent)', fontSize: 13, marginBottom: 16,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Transcript */}
      {transcript && (
        <div style={{ marginBottom: 16 }}>
          <div className="section-label">Heard</div>
          <div style={{
            padding: '14px 16px',
            background: 'rgba(167,139,250,0.06)',
            border: '1px solid rgba(167,139,250,0.2)',
            borderRadius: 'var(--r-md)',
            fontSize: 15,
            lineHeight: 1.6,
            color: 'var(--text-200)',
          }}>
            "{transcript}"
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button
              className="btn btn-glass"
              style={{ flex: 1 }}
              onClick={() => setTranscript('')}
            >
              🗑️ Clear
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 2 }}
              onClick={handleUse}
            >
              ✨ Parse with AI
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
