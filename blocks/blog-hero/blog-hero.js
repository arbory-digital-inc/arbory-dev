/**
 * Decorates the blog-hero block
 * @param {HTMLElement} block The block element
 */
export default function decorate(block) {
  // Add necessary classes to help with styling
  block.classList.add("blog-hero");

  // Get all direct child divs
  const rows = block.children;

  // Background image (first row)
  const bgImageContainer = rows[0];
  if (bgImageContainer) {
    bgImageContainer.classList.add("blog-hero-background");
  }

  // Article image (second row)
  const articleImageContainer = rows[1];
  if (articleImageContainer) {
    articleImageContainer.classList.add("blog-hero-article");
    const picture = articleImageContainer.querySelector("picture");
    if (picture) {
      picture.classList.add("blog-hero-article-image");
    }
  }

  // Must read text (third row)
  const mustReadContainer = rows[2];
  if (mustReadContainer) {
    mustReadContainer.classList.add("blog-hero-must-read");
    const paragraph = mustReadContainer.querySelector("p");
    if (paragraph) {
      paragraph.classList.add("blog-hero-must-read-text");
    }
  }

  // Article title (fourth row)
  const titleContainer = rows[3];
  if (titleContainer) {
    titleContainer.classList.add("blog-hero-title-container");
    const heading = titleContainer.querySelector("h3");
    if (heading) {
      heading.classList.add("blog-hero-title");
    }
  }

  // Article description (fifth row)
  const descriptionContainer = rows[4];
  if (descriptionContainer) {
    descriptionContainer.classList.add("blog-hero-description-container");
    const paragraph = descriptionContainer.querySelector("p");
    if (paragraph) {
      paragraph.classList.add("blog-hero-description");
    }
  }

  // Make all images load eagerly for better performance
  const images = block.querySelectorAll('img[loading="lazy"]');
  images.forEach((img) => {
    img.setAttribute("loading", "eager");
  });
}
