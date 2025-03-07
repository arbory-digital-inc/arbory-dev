/**
 * Decorates the arbory-blog-hero block
 * @param {HTMLElement} block The block element
 */
export default function decorate(block) {
    // Add necessary class to help with styling
    block.classList.add('arbory-blog-hero');
    

    if (block.children.length === 3) {

      const thirdRow = block.querySelector(':scope > div:nth-child(3) > div');
      

      const fourthRowWrapper = document.createElement('div');
      const fourthRowContent = document.createElement('div');
      fourthRowWrapper.appendChild(fourthRowContent);
      

      if (thirdRow) {
        const articleHeading = thirdRow.querySelector('h3');
        const articleDescription = thirdRow.querySelector('p:last-child');
        
        const mustReadParagraph = thirdRow.querySelector('p:first-child');
        if (mustReadParagraph) {
          const thirdRowClone = mustReadParagraph.cloneNode(true);
          thirdRow.innerHTML = '';
          thirdRow.appendChild(thirdRowClone);
        }
        
        if (articleHeading) {
          const picture = articleHeading.querySelector('picture');
          if (picture && articleHeading.contains(picture)) {
            fourthRowContent.appendChild(picture);
            
            articleHeading.innerHTML = articleHeading.innerHTML.replace(/<\/picture>\s*/i, '').trim();
          }
          
          fourthRowContent.appendChild(articleHeading);
        }
        
        if (articleDescription) {
          fourthRowContent.appendChild(articleDescription);
        }
        
        block.appendChild(fourthRowWrapper);
      }
    } else if (block.children.length >= 4) {
      const fourthRow = block.querySelector(':scope > div:nth-child(4) > div');
      
      if (fourthRow) {
        const articleHeading = fourthRow.querySelector('h3');
        
        if (articleHeading) {
          const picture = articleHeading.querySelector('picture');
          if (picture && articleHeading.contains(picture)) {
            articleHeading.parentNode.insertBefore(picture, articleHeading);
            
            articleHeading.innerHTML = articleHeading.innerHTML.replace(/<\/picture>\s*/i, '').trim();
          }
        }
      }
    }
    
    const images = block.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      img.setAttribute('loading', 'eager');
    });
  }