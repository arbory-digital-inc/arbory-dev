export default async function decorate(block) {
  const fragmentName = block.textContent.trim();
  if (!fragmentName.startsWith('author-fragment-')) {
    console.warn(`Author block: Invalid fragment name "${fragmentName}"`);
    return;
  }

  // Build the relative path to /authors/<fragmentName>
  const fragmentPath = `/authors/${fragmentName}`;

  try {
    // Fetch published HTML of the fragment
    const resp = await fetch(fragmentPath);
    if (!resp.ok) {
      console.error(`Failed to fetch fragment at ${fragmentPath}`);
      return;
    }


    const temp = document.createElement('div');
    temp.innerHTML = html;
    const mainContent = temp.querySelector('main') || temp;
    block.innerHTML = mainContent.innerHTML;
  } catch (err) {
    console.error('Error loading author fragment:', err);
  }
}
