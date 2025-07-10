// Content script runs on every page
let accessibilityChecker;
let highlightedElements = [];

// Initialize checker when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeChecker);
} else {
  initializeChecker();
}

function initializeChecker() {
  accessibilityChecker = new AccessibilityChecker();
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scanPage') {
    const issues = accessibilityChecker.analyzeDocument();
    const summary = accessibilityChecker.getIssuesSummary();
    
    sendResponse({
      success: true,
      issues: issues,
      summary: summary
    });
  }
  
  if (request.action === 'highlightIssues') {
    highlightAccessibilityIssues();
    sendResponse({ success: true });
  }
  
  if (request.action === 'removeHighlights') {
    removeHighlights();
    sendResponse({ success: true });
  }
  
  return true; // Keep message channel open for async response
});

function highlightAccessibilityIssues() {
  removeHighlights(); // Clear existing highlights
  
  const issues = accessibilityChecker.issues;
  
  issues.forEach((issue, index) => {
    if (issue.element) {
      const element = issue.element;
      
      // Create highlight overlay
      const highlight = document.createElement('div');
      highlight.className = 'accessibility-highlight';
      highlight.dataset.issueIndex = index;
      
      // Position overlay
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      highlight.style.cssText = `
        position: absolute;
        top: ${rect.top + scrollTop}px;
        left: ${rect.left + scrollLeft}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
        background: ${issue.severity === 'critical' ? 'rgba(244, 67, 54, 0.3)' : 'rgba(255, 152, 0, 0.3)'};
        border: 2px solid ${issue.severity === 'critical' ? '#f44336' : '#ff9800'};
        pointer-events: none;
        z-index: 10000;
        box-sizing: border-box;
      `;
      
      // Add tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'accessibility-tooltip';
      tooltip.textContent = issue.title;
      tooltip.style.cssText = `
        position: absolute;
        top: -30px;
        left: 0;
        background: #333;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        z-index: 10001;
      `;
      
      highlight.appendChild(tooltip);
      document.body.appendChild(highlight);
      highlightedElements.push(highlight);
    }
  });
}

function removeHighlights() {
  highlightedElements.forEach(element => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });
  highlightedElements = [];
}