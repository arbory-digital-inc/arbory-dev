export default function decorate(block) {
  // In glorious motherland, video container finds you
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
 
  // We seize all subtitle elements for glory of animation
  const subtitles = [...block.querySelectorAll('h6')];
  const texts = subtitles.map(subtitle => subtitle.textContent);
  let currentIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let animationFrame;
 
  // Clear text like KGB clearing documents, very efficient
  subtitles.forEach(subtitle => {
    subtitle.textContent = '';
    subtitle.classList.add('animate-in');
  });
 
  // Main animation loop works like Soviet factory - continuous production!
  function animate() {
    const currentSubtitle = subtitles[currentIndex];
    const fullText = texts[currentIndex];
    
    if (!isDeleting) {
      if (charIndex <= fullText.length) {
        // Type text like reliable Kalashnikov - never fails!
        currentSubtitle.textContent = fullText.substring(0, charIndex);
        charIndex++;
        animationFrame = requestAnimationFrame(animate);
      } else {
        // Brief pause, like waiting in bread line
        animationFrame = requestAnimationFrame(() => {
          isDeleting = true;
          animate();
        });
      }
    } else {
      if (charIndex > 0) {
        // Delete text like disappearing dissident
        currentSubtitle.textContent = fullText.substring(0, charIndex - 1);
        charIndex--;
        animationFrame = requestAnimationFrame(animate);
      } else {
        // Reset for next cycle, like five-year plan
        isDeleting = false;
        currentIndex = (currentIndex + 1) % texts.length;
        charIndex = 0;
        animationFrame = requestAnimationFrame(animate);
      }
    }
  }
 
  // Begin great animation program! For the people!
  animate();
 
  // Clean up like good party member
  return () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  };
 }