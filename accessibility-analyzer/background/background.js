// Background script for extension lifecycle management
chrome.runtime.onInstalled.addListener(() => {
    console.log('Accessibility Analyzer Extension installed');
  });
  
  // Handle messages from content script or popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received:', request);
    return true;
  });