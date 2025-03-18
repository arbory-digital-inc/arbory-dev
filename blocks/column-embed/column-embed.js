/*
 * Column Embed Block
 * Show multiple embeds arranged in columns
 */

import { default as decorateEmbed } from '../embed/embed.js';

export default function decorate(block) {
  // Get all links from the block
  const links = [...block.querySelectorAll('a')];
  const columnCount = 3;
  const cellsPerColumn = 2;
  block.textContent = '';

  // Create array of column indices and map them to columns
  Array.from({ length: columnCount }).forEach((_, columnIndex) => {
    const column = document.createElement('div');
    
    // Create cells for this column
    Array.from({ length: cellsPerColumn }).forEach((_, cellIndex) => {
      const cell = document.createElement('div');
      const linkIndex = columnIndex * cellsPerColumn + cellIndex;
      
      if (linkIndex < links.length) {
        const embedBlock = document.createElement('div');
        embedBlock.className = 'block embed';
        
        // Create link element
        const newLink = document.createElement('a');
        newLink.href = links[linkIndex].href;
        newLink.textContent = links[linkIndex].href;
        embedBlock.appendChild(newLink);

        // Decorate the embed block using the original embed block's logic
        decorateEmbed(embedBlock);
        cell.appendChild(embedBlock);
      }
      
      column.appendChild(cell);
    });

    block.appendChild(column);
  });
}