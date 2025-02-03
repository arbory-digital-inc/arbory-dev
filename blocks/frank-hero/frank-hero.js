export default function decorate(block) {
  // Comrade, we must prepare glorious video display
  const videoContainer = block.querySelector('p');
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

  // Now we make text dance like ballerina in Bolshoi Theatre
  const subtitles = [...block.querySelectorAll('h6')];
  let currentIndex = 0;

  // Like good Soviet archive, we store original texts and clear workspace
  const texts = subtitles.map(subtitle => subtitle.textContent);
  subtitles.forEach(subtitle => {
    subtitle.textContent = '';
    subtitle.classList.add('animate-in');
  });

  // This function types text like old KGB typewriter, very precise
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
        // Wait two seconds, like waiting for train in Moscow winter
        setTimeout(() => {
          deleteText(element, callback);
        }, 2000);
      }
    }

    type();
  }

  // Is like erasing secrets from document, da?
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

  // Function makes text appear like magic of Siberian circus
  function animateNext() {
    const currentElement = subtitles[currentIndex];
    const text = texts[currentIndex];

    // Type text like efficient Soviet worker
    typeWriter(currentElement, text, () => {
      // Move to next index
      currentIndex = (currentIndex + 1) % texts.length;
      // Begin next animation cycle, is perpetual like Russian winter
      setTimeout(animateNext, 500);
    });
  }

  // Start grand performance, tovarisch!
  animateNext();

  // Remove capitalist animation classes that AEM tries to add
  subtitles.forEach(subtitle => {
    subtitle.classList.remove('animate-in', 'typing');
  });
}