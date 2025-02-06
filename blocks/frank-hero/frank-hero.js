// made with moon energy crystals by ur boy frank

export default function decorate(block) {
  if (!block || !(block instanceof HTMLElement)) {
    console.warn('Invalid block parameter');
    return;
  }

  try {
    // Video handling remains the same...
    const videoContainer = block.querySelector('p');
    if (videoContainer) {
      const videoUrl = videoContainer.textContent?.trim();
      if (videoUrl?.endsWith('.webm')) {
        const videoEl = document.createElement('video');
        Object.assign(videoEl, {
          autoplay: true,
          loop: true,
          muted: true,
          playsInline: true
        });
        
        const sourceEl = document.createElement('source');
        sourceEl.src = videoUrl;
        sourceEl.type = 'video/webm';
        
        videoEl.appendChild(sourceEl);
        videoContainer.textContent = '';
        videoContainer.appendChild(videoEl);
      }
    }

    // Fixed animation part
    const subtitles = [...block.querySelectorAll('h6')];
    console.log('Found subtitles:', subtitles.length);
    
    if (subtitles.length === 0) {
      console.log('No subtitles found');
      return;
    }

    // Store original texts
    const texts = subtitles.map(subtitle => subtitle.textContent);
    let currentIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let animationFrame = null;

    // Clear initial text
    subtitles.forEach(subtitle => {
      subtitle.textContent = '';
      subtitle.classList.add('animate-in');
    });

    const TYPING_SPEED = 50; // Milliseconds between characters
    let lastUpdateTime = 0;

    const animate = (timestamp) => {
      if (!subtitles[currentIndex]) {
        console.log('Animation target lost');
        return;
      }

      // Control animation speed
      if (timestamp - lastUpdateTime < TYPING_SPEED) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      lastUpdateTime = timestamp;
      const currentSubtitle = subtitles[currentIndex];
      const fullText = texts[currentIndex];
      
      if (!isDeleting) {
        // Adding characters
        if (charIndex <= fullText.length) {
          currentSubtitle.textContent = fullText.substring(0, charIndex);
          charIndex++;
          animationFrame = requestAnimationFrame(animate);
        } else {
          // Pause at the end of typing
          setTimeout(() => {
            isDeleting = true;
            animationFrame = requestAnimationFrame(animate);
          }, 2000); // Wait 2 seconds before deleting
        }
      } else {
        // Removing characters
        if (charIndex > 0) {
          charIndex--;
          currentSubtitle.textContent = fullText.substring(0, charIndex);
          animationFrame = requestAnimationFrame(animate);
        } else {
          // Move to next subtitle
          isDeleting = false;
          currentIndex = (currentIndex + 1) % texts.length;
          charIndex = 0;
          animationFrame = requestAnimationFrame(animate);
        }
      }
    };

    // Start the animation
    animate(performance.now());

    // Cleanup function
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
    
  } catch (error) {
    console.error('Error in hero decoration:', error);
  }
}