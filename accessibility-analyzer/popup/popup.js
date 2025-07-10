document.addEventListener('DOMContentLoaded', function() {
    const scanButton = document.getElementById('scanButton');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultsDiv = document.getElementById('results');
    const highlightButton = document.getElementById('highlightButton');
    const exportButton = document.getElementById('exportButton');
    
    let currentScanResults = null;
    let isHighlighting = false;
  
    scanButton.addEventListener('click', scanCurrentPage);
    highlightButton.addEventListener('click', toggleHighlight);
    exportButton.addEventListener('click', exportReport);
  
    async function scanCurrentPage() {
      // Show loading
      scanButton.style.display = 'none';
      loadingIndicator.classList.remove('hidden');
      resultsDiv.classList.add('hidden');
  
      try {
        // Get active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Send message to content script
        chrome.tabs.sendMessage(tab.id, { action: 'scanPage' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error:', chrome.runtime.lastError);
            showError('Failed to scan page. Please refresh and try again.');
            return;
          }
          
          if (response && response.success) {
            currentScanResults = response;
            displayResults(response);
          } else {
            showError('Failed to analyze page');
          }
          
          // Hide loading
          loadingIndicator.classList.add('hidden');
          scanButton.style.display = 'block';
        });
      } catch (error) {
        console.error('Error scanning page:', error);
        showError('An error occurred while scanning');
        loadingIndicator.classList.add('hidden');
        scanButton.style.display = 'block';
      }
    }
  
    function displayResults(results) {
      const { issues, summary } = results;
      
      // Update summary stats
      document.getElementById('totalIssues').textContent = summary.total;
      document.getElementById('criticalIssues').textContent = summary.critical;
      document.getElementById('warningIssues').textContent = summary.warning;
      
      // Display issues list
      const issuesList = document.getElementById('issuesList');
      issuesList.innerHTML = '';
      
      if (issues.length === 0) {
        issuesList.innerHTML = '<div class="issue-item">No accessibility issues found!</div>';
      } else {
        issues.forEach((issue, index) => {
          const issueElement = document.createElement('div');
          issueElement.className = 'issue-item';
          issueElement.innerHTML = `
            <div class="issue-title">${issue.title}</div>
            <div class="issue-description">${issue.description}</div>
            <div class="issue-severity severity-${issue.severity}">${issue.severity.toUpperCase()}</div>
          `;
          issuesList.appendChild(issueElement);
        });
      }
      
      resultsDiv.classList.remove('hidden');
    }
  
    async function toggleHighlight() {
      if (!currentScanResults) return;
      
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (isHighlighting) {
          // Remove highlights
          chrome.tabs.sendMessage(tab.id, { action: 'removeHighlights' });
          highlightButton.textContent = 'Highlight Issues';
          isHighlighting = false;
        } else {
          // Add highlights
          chrome.tabs.sendMessage(tab.id, { action: 'highlightIssues' });
          highlightButton.textContent = 'Remove Highlights';
          isHighlighting = true;
        }
      } catch (error) {
        console.error('Error toggling highlights:', error);
      }
    }
  
    function exportReport() {
      if (!currentScanResults) return;
      
      const report = generateReport(currentScanResults);
      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'accessibility-report.txt';
      a.click();
      
      URL.revokeObjectURL(url);
    }
  
    function generateReport(results) {
      const { issues, summary } = results;
      let report = 'ACCESSIBILITY ANALYSIS REPORT\n';
      report += '================================\n\n';
      report += `Total Issues: ${summary.total}\n`;
      report += `Critical Issues: ${summary.critical}\n`;
      report += `Warning Issues: ${summary.warning}\n\n`;
      
      report += 'DETAILED ISSUES:\n';
      report += '================\n\n';
      
      issues.forEach((issue, index) => {
        report += `${index + 1}. ${issue.title}\n`;
        report += `   Severity: ${issue.severity.toUpperCase()}\n`;
        report += `   Description: ${issue.description}\n`;
        report += `   Suggestion: ${issue.suggestion}\n\n`;
      });
      
      return report;
    }
  
    function showError(message) {
      resultsDiv.innerHTML = `<div class="error">${message}</div>`;
      resultsDiv.classList.remove('hidden');
    }
  });