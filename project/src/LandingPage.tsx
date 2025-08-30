import React, { useState } from 'react';
import AuthForm from './components/AuthForm';

const LandingPage: React.FC = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const handleToggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Glassmorphic Image Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img
          src="https://res.cloudinary.com/dpgchpnuk/image/upload/v1756535625/freepik__the-style-is-candid-image-photography-with-natural__32483_s4cr7e.png"
          alt="Background Visual"
          className="w-full h-full object-cover opacity-90 scale-110"
          style={{ filter: 'blur(6px)', objectPosition: 'center' }}
        />
      </div>
      {/* Landing Section */}
      <div
        className={`absolute left-0 top-0 w-full h-full flex flex-col items-center justify-center transition-transform duration-700 ${showAuth ? '-translate-y-full' : 'translate-y-0'} z-10`}
        onClick={() => setShowAuth(true)}
      >
        {/* ...no foreground image, only background... */}
        <h1 className="text-5xl font-extrabold text-white drop-shadow-lg mb-6 cursor-pointer select-none">
          User Authentication
        </h1>
        <p className="text-xl text-white/80 mb-10">Click anywhere to get started</p>
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm animate-bounce">
          <span className="text-3xl text-white">↑</span>
        </div>
      </div>

      {/* Auth Section */}
      <div
        className={`absolute left-0 top-0 w-full h-full flex items-center justify-center transition-transform duration-700 ${showAuth ? 'translate-y-0' : 'translate-y-full'} z-20`}
      >
        {showAuth && <AuthForm mode={mode} onToggleMode={handleToggleMode} />}
      </div>
    </div>
  );
};

export default LandingPage;
