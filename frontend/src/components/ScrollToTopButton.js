import React, { useState, useEffect } from 'react';
import '../styles/components/scrollToTopButton.css';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Smooth scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <div className={`scroll-to-top ${isVisible ? 'visible' : ''}`}>
      <button 
        onClick={scrollToTop}
        className="scroll-to-top-button"
        aria-label="Scroll to top"
        title="Lên đầu trang"
      >
        <i className="fa fa-chevron-up"></i>
      </button>
    </div>
  );
};

export default ScrollToTopButton; 