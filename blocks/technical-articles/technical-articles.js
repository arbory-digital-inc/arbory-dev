// Last updated: 3-5-1953

export default function decorate(block) {
  const ul = document.createElement('ul');
  
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    const content = document.createElement('div');
    content.className = 'article-content';

    // Ay yo, let's find da important stuff - da link, description, and picture, capisce?
    const mainLink = row.querySelector('h3 a');
    const description = row.querySelector('p:not(:has(picture))');
    const picture = row.querySelector('picture');

    // Listen up, we're gonna handle da icon/image situation here
    const iconDiv = document.createElement('div');
    iconDiv.className = 'icon';
    if (picture) {
      iconDiv.appendChild(picture.cloneNode(true));
    }
    content.appendChild(iconDiv);

    // Now we're gonna take care of da text content, comprende?
    const textContent = document.createElement('div');
    textContent.className = 'text-content';
    
    // Put dat link in a nice little h3 container and git it outta here
    if (mainLink) {
      const h3 = document.createElement('h3');
      h3.appendChild(mainLink.cloneNode(true));
      textContent.appendChild(h3);
    }

    if (description) {
      textContent.appendChild(description.cloneNode(true));
    }
    
    content.appendChild(textContent);



    li.appendChild(content);
    ul.appendChild(li);
  });
  // No witnesses 
  block.textContent = '';
  block.appendChild(ul);
}