export default function decorate(block) {
    // Handle video setup
    const videoContainer = block.querySelector('p');
    video
    if (videoContainer) {
      const url = videoContainer.textContent.trim();
      if (url.endsWith('.webm')) {
        const video = document.createElement('video');
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        
        const source = document.createElement('source');
        source.src = url;
        source.type = 'video/webm';
        
        
        video.appendChild(source);
        videoContainer.textContent = '';
        videoContainer.appendChild(video);
      }
    }
  
    // Handle animated text
    const subtitles = [...block.querySelectorAll('h6')];
    let currentIndex = 0;
  
    // Store original texts and clear the elements
    const texts = subtitles.map(subtitle => subtitle.textContent);
    subtitles.forEach(subtitle => {
      subtitle.textContent = '';
      subtitle.classList.add('animate-in');
    });
  
    // Function to type text with cursor
    function typeWriter(element, text, callback) {
      let index = 0;
      element.textContent = '';
      element.classList.add('typing');
  
      function type() {
        if (index < text.length) {
          element.textContent += text.charAt(index);
          index++;
          setTimeout(type, 50);
        } else {
          // Wait for 2 seconds before starting deletion
          setTimeout(() => {
            deleteText(element, callback);
          }, 2000);
        }
      }
  
      type();
    }
  
    // Function to delete text with backspace effect
    function deleteText(element, callback) {
      function erase() {
        if (element.textContent.length > 0) {
          element.textContent = element.textContent.slice(0, -1);
          setTimeout(erase, 30);
        } else {
          element.classList.remove('typing');
          if (callback) callback();
        }
      }
  
      erase();
    }
  
    // Function to animate the next text
    function animateNext() {
      const currentElement = subtitles[currentIndex];
      const text = texts[currentIndex];
  
      // Type the current text
      typeWriter(currentElement, text, () => {
        // Move to next index
        currentIndex = (currentIndex + 1) % texts.length;
        // Start the next animation
        setTimeout(animateNext, 500);
      });
    }
  
    // Start the animation loop
    animateNext();
  
    // Remove any additional animation classes that might have been added by AEM
    subtitles.forEach(subtitle => {
      subtitle.classList.remove('animate-in', 'typing');
    });
  }