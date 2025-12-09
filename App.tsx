import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { Console } from './components/Console';
import { Notes } from './components/Notes';
import { Capabilities } from './components/Capabilities';
import Sidebar from './components/Sidebar';
import DashboardLayout from './components/DashboardLayout';
import { User, Note, UsageStats, AppMode } from './types';
import { useAuth } from './context/AuthContext';

const App: React.FC = () => {
  const { user, loading, signInWithGoogle, signInWithApple, signOut, simulateLogin } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState<'landing' | 'home' | 'notes' | 'capabilities'>('landing');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Data State
  const [notes, setNotes] = useState<Note[]>([]);
  const [initialConsoleInput, setInitialConsoleInput] = useState('');

  // Usage tracking state
  const [usageStats, setUsageStats] = useState<UsageStats>(() => {
    const saved = localStorage.getItem('appraise_usage');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (new Date().toDateString() !== new Date(parsed.lastResetDate).toDateString()) {
        return { count: 0, lastResetDate: new Date().toDateString() };
      }
      return parsed;
    }
    return { count: 0, lastResetDate: new Date().toDateString() };
  });

  // Redirect to home (Console) when logged in
  useEffect(() => {
    if (!loading && user && currentView === 'landing') {
      setCurrentView('home');
    }
  }, [user, loading, currentView]);

  // Persist usage stats
  useEffect(() => {
    localStorage.setItem('appraise_usage', JSON.stringify(usageStats));
  }, [usageStats]);

  // Load notes
  useEffect(() => {
    const savedNotes = localStorage.getItem('appraise_notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  // Save notes
  useEffect(() => {
    if (user) {
      localStorage.setItem('appraise_notes', JSON.stringify(notes));
    }
  }, [notes, user]);

  const handleLogin = async (provider: 'google' | 'apple' | 'test') => {
    if (provider === 'test') {
      await simulateLogin();
    } else if (provider === 'google') {
      await signInWithGoogle();
    } else {
      await signInWithApple();
    }
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentView('landing');
    setSelectedNoteId(null);
  };

  const incrementUsage = () => {
    setUsageStats(prev => ({ ...prev, count: prev.count + 1 }));
  };

  const handleStartFromLanding = (text: string) => {
    setInitialConsoleInput(text);
    handleLogin('test'); // Auto trigger login for demo
  };

  const handleSaveNote = (note: Note) => {
    setNotes(prev => [note, ...prev]);
    setSelectedNoteId(note.id);
    setCurrentView('notes');
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
      setCurrentView('home');
    }
  };

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
  };

  // Derived State
  const sortedNotes = [...notes].sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
  const selectedNote = notes.find(n => n.id === selectedNoteId) || null;

  if (loading) {
    return <div className="h-screen bg-white dark:bg-[#212121] flex items-center justify-center transition-colors duration-200"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 dark:border-white"></div></div>;
  }

  // Unauthenticated View
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar
          user={user}
          onLogin={() => handleLogin('test')}
          onLogout={handleLogout}
          onNavigate={() => { }}
          currentView={'landing'}
        />
        <main className="flex-grow">
          <LandingPage onStart={handleStartFromLanding} onLogin={() => handleLogin('test')} />
        </main>
        <Footer />
      </div>
    );
  }

  // Authenticated Dashboard
  return (
    <DashboardLayout
      sidebar={
        <Sidebar
          user={user}
          notes={sortedNotes}
          selectedNoteId={selectedNoteId}
          onSelectNote={(note) => {
            setSelectedNoteId(note.id);
            setCurrentView('notes');
          }}
          onNewEntry={() => {
            setSelectedNoteId(null);
            setCurrentView('home');
          }}
          onLogout={handleLogout}
          currentView={currentView}
          onChangeView={(view) => {
            setCurrentView(view as any);
            if (view !== 'notes') setSelectedNoteId(null);
          }}
          onUpdateUser={useAuth().updateLocalUser}
        />
      }
    >
      {currentView === 'home' && (
        <Console
          user={user}
          initialInput={initialConsoleInput}
          onSaveNote={handleSaveNote}
          usageStats={usageStats}
          incrementUsage={incrementUsage}
          onRequestLogin={() => { }}
          onConsumeInitialInput={() => setInitialConsoleInput('')}
        />
      )}

      {currentView === 'notes' && (
        <Notes
          user={user}
          selectedNote={selectedNote}
          onDeleteNote={handleDeleteNote}
          onUpdateNote={handleUpdateNote}
        />
      )}

      {currentView === 'capabilities' && (
        <Capabilities
          notes={notes}
          mode={user?.default_mode === 'gp' ? AppMode.GP : AppMode.HOSPITAL}
        />
      )}

    </DashboardLayout>
  );
};

export default App;