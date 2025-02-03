export default function decorate(block) {
  console.log('Starting hero decoration...');
  
  // In glorious motherland, we verify block exists first
  if (!block) {
    console.log('No block found, comrade');
    return;
  }

  try {
    // We search for container with precision of Sputnik
    const videoContainer = block.querySelector('p');
    console.log('Video container found:', videoContainer);
    
    if (videoContainer) {
      const videoUrl = videoContainer.textContent.trim();
      console.log('Video URL:', videoUrl);
      
      if (videoUrl.endsWith('.webm')) {
        // Create new video element like factory creates tractor
        const videoEl = document.createElement('video');
        Object.assign(videoEl, {
          autoplay: true,
          loop: true,
          muted: true,
          playsInline: true
        });
        
        // Source element is like fuel for tractor
        const sourceEl = document.createElement('source');
        sourceEl.src = videoUrl;
        sourceEl.type = 'video/webm';
        
        // Assembly of video like assembly of mighty tank
        videoEl.appendChild(sourceEl);
        videoContainer.textContent = '';
        videoContainer.appendChild(videoEl);
      }
    }

    // We seize all subtitle elements for glory of animation
    const subtitles = [...block.querySelectorAll('h6')];
    console.log('Found subtitles:', subtitles.length);
    
    if (subtitles.length === 0) {
      console.log('No subtitles found, animation canceled');
      return;
    }

    const texts = subtitles.map(subtitle => subtitle.textContent);
    let currentIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let animationFrame = null;

    // Clear text like KGB clearing documents, very efficient
    subtitles.forEach(subtitle => {
      subtitle.textContent = '';
      subtitle.classList.add('animate-in');
    });

    // Main animation loop works like Soviet factory - continuous production!
    const animate = () => {
      if (!subtitles[currentIndex]) {
        console.log('Animation target lost, comrade');
        return;
      }

      const currentSubtitle = subtitles[currentIndex];
      const fullText = texts[currentIndex] || '';
      
      if (!isDeleting) {
        if (charIndex <= fullText.length) {
          currentSubtitle.textContent = fullText.substring(0, charIndex);
          charIndex++;
          animationFrame = window.requestAnimationFrame(animate);
        } else {
          isDeleting = true;
          animationFrame = window.requestAnimationFrame(animate);
        }
      } else {
        if (charIndex > 0) {
          currentSubtitle.textContent = fullText.substring(0, charIndex - 1);
          charIndex--;
          animationFrame = window.requestAnimationFrame(animate);
        } else {
          isDeleting = false;
          currentIndex = (currentIndex + 1) % texts.length;
          charIndex = 0;
          animationFrame = window.requestAnimationFrame(animate);
        }
      }
    };

    // Begin great animation program! For the people!
    animate();

    // Clean up like good party member
    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
    
  } catch (error) {
    console.error('Error in hero decoration:', error);
  }
}