// made with moon energy crystals by ur boy frank

export default function decorate(block) {
  // Validate that we received a valid DOM element
  if (!block || !(block instanceof HTMLElement)) {
    console.warn('Invalid block parameter');
    return;
  }

  try {
    // PART 1: VIDEO HANDLING
    // Find the first paragraph element in the block that contains our video
    const videoContainer = block.querySelector('p');
    
    if (videoContainer) {
      // Check if video URL is inside an <a> tag or direct text
      const videoLink = videoContainer.querySelector('a');
      // If there's an <a> tag, get href, otherwise get text content
      const videoUrl = videoLink ? videoLink.href : videoContainer.textContent?.trim();

      // Only process if it's a .webm video
      if (videoUrl?.endsWith('.webm')) {
        // Create new video element with specific attributes
        const videoEl = document.createElement('video');
        // Set multiple attributes at once using Object.assign
        Object.assign(videoEl, {
          autoplay: true,    // Video plays automatically
          loop: true,        // Video will loop when finished
          muted: true,       // No sound by default
          playsInline: true  // iOS-specific: play inline instead of fullscreen
        });
        
        // Create and configure source element for the video
        const sourceEl = document.createElement('source');
        sourceEl.src = videoUrl;      // Set video source URL
        sourceEl.type = 'video/webm'; // Set MIME type
        
        // Build video element structure
        videoEl.appendChild(sourceEl);
        // Clear existing content (link or text)
        videoContainer.innerHTML = '';
        // Insert the video
        videoContainer.appendChild(videoEl);
      }
    }

    // PART 2: TEXT ANIMATION
    // Get all h6 elements that will be animated
    const subtitles = [...block.querySelectorAll('h6')];
    
    // Exit if no subtitles found
    if (subtitles.length === 0) {
      console.log('No subtitles found');
      return;
    }

    // Store original text content before clearing
    const texts = subtitles.map(subtitle => subtitle.textContent);
    
    // Animation state variables
    let currentIndex = 0;    // Which subtitle we're currently animating
    let charIndex = 0;       // Position in current text
    let isDeleting = false;  // Whether we're adding or removing characters
    let animationFrame = null; // Store animation frame for cleanup

    // Clear all subtitles and add animation class
    subtitles.forEach(subtitle => {
      subtitle.textContent = '';
      subtitle.classList.add('animate-in');
    });

    // Animation timing control
    const TYPING_SPEED = 50; // Milliseconds between character updates
    let lastUpdateTime = 0;  // Track last update for consistent speed

    // Main animation function
    const animate = (timestamp) => {
      // Safety check: ensure current subtitle exists
      if (!subtitles[currentIndex]) {
        console.log('Animation target lost');
        return;
      }

      // Control animation speed
      if (timestamp - lastUpdateTime < TYPING_SPEED) {
        // If not enough time has passed, schedule next frame
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      // Update timing
      lastUpdateTime = timestamp;
      
      // Get current elements we're working with
      const currentSubtitle = subtitles[currentIndex];
      const fullText = texts[currentIndex];
      
      if (!isDeleting) {
        // TYPING MODE
        if (charIndex <= fullText.length) {
          // Add next character
          currentSubtitle.textContent = fullText.substring(0, charIndex);
          charIndex++;
          animationFrame = requestAnimationFrame(animate);
        } else {
          // Finished typing, pause before deleting
          setTimeout(() => {
            isDeleting = true;
            animationFrame = requestAnimationFrame(animate);
          }, 2000); // 2 second pause when fully typed
        }
      } else {
        // DELETING MODE
        if (charIndex > 0) {
          // Remove one character
          charIndex--;
          currentSubtitle.textContent = fullText.substring(0, charIndex);
          animationFrame = requestAnimationFrame(animate);
        } else {
          // Finished deleting, move to next subtitle
          isDeleting = false;
          currentIndex = (currentIndex + 1) % texts.length; // Loop back to start if needed
          charIndex = 0;
          animationFrame = requestAnimationFrame(animate);
        }
      }
    };

    // Start the animation
    animate(performance.now());

    // Return cleanup function to prevent memory leaks
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
    
  } catch (error) {
    // Log any errors that occur during execution
    console.error('Error in hero decoration:', error);
  }
}