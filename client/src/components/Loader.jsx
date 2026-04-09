import { useState, useEffect } from 'react';
import './Loader.css';

const Loader = ({ fullScreen = false }) => {
  const [quoteIdx, setQuoteIdx] = useState(0);

  const quotes = [
    "Defining style, one click at a time...",
    "Good things take time. Your style shouldn't.",
    "Curating the best of fashion for you.",
    "Style is a way to say who you are...",
    "Fashion is what you buy, style is what you do with it.",
    "Loading your personalized store...",
    "Finding the perfect fit for your wardrobe.",
    "Transforming your look, just a moment...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % quotes.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`premium-loader-container ${fullScreen ? 'full-screen' : ''}`}>
      <div className="loader-content">
        <div className="loader-graphic">
          <div className="pulse-circle"></div>
          <div className="logo-icon">FS</div>
        </div>
        <div className="loader-text-wrap">
          <p className="loader-quote animate-slideUp" key={quoteIdx}>
            {quotes[quoteIdx]}
          </p>
          <div className="loader-progress-bar">
            <div className="progress-fill"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
