import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { Console } from './components/Console';
import { Notes } from './components/Notes';
import { User, Note, UsageStats } from './types';

// Mock user for "Logged In" state
const MOCK_USER: User = {
  id: 'user_123',
  name: 'Dr. Sarah Jenning',
  email: 'sarah.j@nhs.net',
  avatar: 'https://picsum.photos/200', // Placeholder
  plan: 'plus'
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('landing');
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [initialConsoleInput, setInitialConsoleInput] = useState('');
  
  // Usage tracking state
  const [usageStats, setUsageStats] = useState<UsageStats>(() => {
     const saved = localStorage.getItem('appraise_usage');
     if (saved) {
         const parsed = JSON.parse(saved);
         // Reset if new day
         if (new Date().toDateString() !== new Date(parsed.lastResetDate).toDateString()) {
             return { count: 0, lastResetDate: new Date().toDateString() };
         }
         return parsed;
     }
     return { count: 0, lastResetDate: new Date().toDateString() };
  });

  // Persist usage stats
  useEffect(() => {
      localStorage.setItem('appraise_usage', JSON.stringify(usageStats));
  }, [usageStats]);

  // Load notes from local storage on mount (mock persistence)
  useEffect(() => {
      const savedNotes = localStorage.getItem('appraise_notes');
      if (savedNotes) {
          setNotes(JSON.parse(savedNotes));
      }
  }, []);

  // Save notes to local storage
  useEffect(() => {
      if (user) { // Only persist "Notes" persistently if logged in (simulated)
        localStorage.setItem('appraise_notes', JSON.stringify(notes));
      }
  }, [notes, user]);


  const handleLogin = () => {
    // Simulate auth flow
    const confirm = window.confirm("Simulate Google Login Success?");
    if (confirm) {
        setUser(MOCK_USER);
        if (currentView === 'landing') {
            setCurrentView('console');
        }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('landing');
  };

  const handleStartFromLanding = (text: string) => {
    setInitialConsoleInput(text);
    setCurrentView('console');
    window.scrollTo(0,0);
  };

  const incrementUsage = () => {
      setUsageStats(prev => ({ ...prev, count: prev.count + 1 }));
  };

  const handleSaveNote = (note: Note) => {
      setNotes(prev => [note, ...prev]);
  };

  const renderView = () => {
    switch(currentView) {
      case 'landing':
        return <LandingPage onStart={handleStartFromLanding} onLogin={handleLogin} />;
      case 'console':
        return (
            <Console 
                user={user} 
                initialInput={initialConsoleInput} 
                onSaveNote={handleSaveNote}
                usageStats={usageStats}
                incrementUsage={incrementUsage}
                onRequestLogin={handleLogin}
            />
        );
      case 'notes':
        return <Notes notes={notes} />;
      case 'exports':
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                        ↓
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Export Data</h2>
                    <p className="text-gray-500 mb-6">Compile your notes into a submission-ready pack.</p>
                    <div className="space-y-3">
                        <button className="w-full py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium text-gray-700 flex items-center justify-center">
                            Download GP Summary (PDF)
                        </button>
                        <button className="w-full py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium text-gray-700 flex items-center justify-center">
                            Download MAG Pack (DOCX)
                        </button>
                        <button className="w-full py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium text-gray-700 flex items-center justify-center">
                            Export CSV Data
                        </button>
                    </div>
                </div>
            </div>
        );
      default:
        return <LandingPage onStart={handleStartFromLanding} onLogin={handleLogin} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar 
        user={user} 
        onLogin={handleLogin} 
        onLogout={handleLogout} 
        onNavigate={setCurrentView}
        currentView={currentView}
      />
      
      <main className="flex-grow">
        {renderView()}
      </main>

      <Footer />
    </div>
  );
};

export default App;