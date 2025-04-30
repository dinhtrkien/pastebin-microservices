document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const pasteForm = document.querySelector('.paste-form');
  const pasteView = document.querySelector('.paste-view');
  const pasteContent = document.getElementById('pasteContent');
  const expiration = document.getElementById('expiration');
  const createPasteBtn = document.getElementById('createPasteBtn');
  const successModal = document.getElementById('successModal');
  const pasteLink = document.getElementById('pasteLink');
  const copyLinkBtn = document.getElementById('copyLinkBtn');
  const viewPasteBtn = document.getElementById('viewPasteBtn');
  const createNewBtn = document.getElementById('createNewBtn');
  const pasteId = document.getElementById('pasteId');
  const pasteViewContent = document.getElementById('pasteViewContent');
  const createdAt = document.getElementById('createdAt');
  const expiresAt = document.getElementById('expiresAt');
  const viewCount = document.getElementById('viewCount');
  const copyBtn = document.getElementById('copyBtn');
  const deleteBtn = document.getElementById('deleteBtn');
  const backBtn = document.getElementById('backBtn');

  // Check if we're viewing a paste
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');
  
  if (slug) {
      loadPaste(slug);
  }

  // Event Listeners
  createPasteBtn.addEventListener('click', createPaste);
  copyLinkBtn.addEventListener('click', copyToClipboard);
  viewPasteBtn.addEventListener('click', viewCurrentPaste);
  createNewBtn.addEventListener('click', resetForm);
  copyBtn.addEventListener('click', copyPasteContent);
  deleteBtn.addEventListener('click', deletePaste);
  backBtn.addEventListener('click', resetForm);

  // Functions
  async function createPaste() {
      if (!pasteContent.value.trim()) {
          alert('Please enter some content for your paste.');
          return;
      }

      try {
          const response = await fetch('/api/paste', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  content: pasteContent.value,
                  expiration: expiration.value
              })
          });

          if (!response.ok) {
              throw new Error('Failed to create paste');
          }

          const data = await response.json();
          
          // Show success modal
          pasteLink.value = `${window.location.origin}?slug=${data.slug}`;
          successModal.style.display = 'flex';
          
          // Store current paste slug for view button
          localStorage.setItem('currentPasteSlug', data.slug);
          
      } catch (error) {
          console.error('Error creating paste:', error);
          alert('Failed to create paste. Please try again.');
      }
  }

  async function loadPaste(slug) {
      try {
          const response = await fetch(`/api/paste/${slug}`);
          
          if (!response.ok) {
              if (response.status === 404) {
                  alert('Paste not found or has expired.');
                  resetForm();
                  return;
              }
              throw new Error('Failed to load paste');
          }

          const data = await response.json();
          
          // Update paste view
          pasteId.textContent = slug;
          pasteViewContent.textContent = data.content;
          createdAt.textContent = new Date(data.createdAt).toLocaleString();
          expiresAt.textContent = data.expiresAt ? new Date(data.expiresAt).toLocaleString() : 'Never';
          
          // Get analytics
          fetchAnalytics(slug);
          
          // Show paste view
          pasteForm.style.display = 'none';
          pasteView.style.display = 'block';
          
          // Update URL if needed
          if (!window.location.search.includes(`slug=${slug}`)) {
              window.history.pushState({}, '', `?slug=${slug}`);
          }
          
      } catch (error) {
          console.error('Error loading paste:', error);
          alert('Failed to load paste. Please try again.');
          resetForm();
      }
  }

  async function fetchAnalytics(slug) {
      try {
          const response = await fetch(`/api/analytics/${slug}`);
          
          if (!response.ok) {
              throw new Error('Failed to fetch analytics');
          }

          const data = await response.json();
          viewCount.textContent = data.views || 0;
          
      } catch (error) {
          console.error('Error fetching analytics:', error);
          // Don't show error to user, just log it
      }
  }

  async function deletePaste() {
      const slug = pasteId.textContent;
      
      if (!slug) return;
      
      if (!confirm('Are you sure you want to delete this paste? This action cannot be undone.')) {
          return;
      }
      
      try {
          const response = await fetch(`/api/paste/${slug}`, {
              method: 'DELETE'
          });
          
          if (!response.ok) {
              throw new Error('Failed to delete paste');
          }
          
          alert('Paste deleted successfully.');
          resetForm();
          
      } catch (error) {
          console.error('Error deleting paste:', error);
          alert('Failed to delete paste. Please try again.');
      }
  }

  function copyToClipboard() {
      pasteLink.select();
      document.execCommand('copy');
      copyLinkBtn.textContent = 'Copied!';
      setTimeout(() => {
          copyLinkBtn.textContent = 'Copy';
      }, 2000);
  }

  function copyPasteContent() {
      const tempTextarea = document.createElement('textarea');
      tempTextarea.value = pasteViewContent.textContent;
      document.body.appendChild(tempTextarea);
      tempTextarea.select();
      document.execCommand('copy');
      document.body.removeChild(tempTextarea);
      
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
          copyBtn.textContent = 'Copy';
      }, 2000);
  }

  function viewCurrentPaste() {
      const slug = localStorage.getItem('currentPasteSlug');
      if (slug) {
          successModal.style.display = 'none';
          loadPaste(slug);
      }
  }

  function resetForm() {
      // Clear form
      pasteContent.value = '';
      expiration.value = 'never';
      
      // Hide modal if open
      successModal.style.display = 'none';
      
      // Show form, hide paste view
      pasteForm.style.display = 'block';
      pasteView.style.display = 'none';
      
      // Update URL
      window.history.pushState({}, '', window.location.pathname);
  }

  // Handle browser back/forward navigation
  window.addEventListener('popstate', function() {
      const urlParams = new URLSearchParams(window.location.search);
      const slug = urlParams.get('slug');
      
      if (slug) {
          loadPaste(slug);
      } else {
          resetForm();
      }
  });
});