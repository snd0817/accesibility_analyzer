class AccessibilityChecker {
    constructor() {
      this.issues = [];
    }
  
    analyzeDocument() {
      this.issues = [];
      
      // Check for missing alt text
      this.checkImageAltText();
      
      // Check heading structure
      this.checkHeadingStructure();
      
      // Check color contrast
      this.checkColorContrast();
      
      // Check form labels
      this.checkFormLabels();
      
      // Check keyboard navigation
      this.checkKeyboardNavigation();
      
      // Check ARIA attributes
      this.checkARIAAttributes();
      
      return this.issues;
    }
  
    checkImageAltText() {
      const images = document.querySelectorAll('img');
      images.forEach((img, index) => {
        if (!img.alt || img.alt.trim() === '') {
          this.addIssue({
            type: 'missing-alt-text',
            severity: 'critical',
            element: img,
            title: 'Missing Alt Text',
            description: 'Image lacks alternative text for screen readers',
            suggestion: 'Add descriptive alt attribute to image'
          });
        }
      });
    }
  
    checkHeadingStructure() {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let previousLevel = 0;
      
      headings.forEach((heading) => {
        const currentLevel = parseInt(heading.tagName.charAt(1));
        
        if (currentLevel > previousLevel + 1) {
          this.addIssue({
            type: 'heading-structure',
            severity: 'warning',
            element: heading,
            title: 'Heading Structure Issue',
            description: `Heading level ${currentLevel} follows level ${previousLevel}`,
            suggestion: 'Use proper heading hierarchy (h1, h2, h3, etc.)'
          });
        }
        
        previousLevel = currentLevel;
      });
    }
  
    checkColorContrast() {
      const textElements = document.querySelectorAll('p, span, div, a, button, label');
      
      textElements.forEach((element) => {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        // Simple contrast check (you can implement more sophisticated algorithm)
        if (this.hasLowContrast(color, backgroundColor)) {
          this.addIssue({
            type: 'color-contrast',
            severity: 'warning',
            element: element,
            title: 'Low Color Contrast',
            description: 'Text may be difficult to read due to poor contrast',
            suggestion: 'Increase contrast between text and background colors'
          });
        }
      });
    }
  
    checkFormLabels() {
      const inputs = document.querySelectorAll('input, textarea, select');
      
      inputs.forEach((input) => {
        const hasLabel = input.labels && input.labels.length > 0;
        const hasAriaLabel = input.getAttribute('aria-label');
        const hasAriaLabelledBy = input.getAttribute('aria-labelledby');
        
        if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
          this.addIssue({
            type: 'missing-form-label',
            severity: 'critical',
            element: input,
            title: 'Missing Form Label',
            description: 'Form input lacks proper labeling',
            suggestion: 'Add a label element or aria-label attribute'
          });
        }
      });
    }
  
    checkKeyboardNavigation() {
      const interactiveElements = document.querySelectorAll('button, a, input, textarea, select');
      
      interactiveElements.forEach((element) => {
        const tabIndex = element.getAttribute('tabindex');
        
        if (tabIndex && parseInt(tabIndex) > 0) {
          this.addIssue({
            type: 'tabindex-issue',
            severity: 'warning',
            element: element,
            title: 'Positive Tabindex',
            description: 'Positive tabindex can disrupt keyboard navigation',
            suggestion: 'Use tabindex="0" or remove tabindex attribute'
          });
        }
      });
    }
  
    checkARIAAttributes() {
      const elementsWithAria = document.querySelectorAll('[role], [aria-label], [aria-labelledby], [aria-describedby]');
      
      elementsWithAria.forEach((element) => {
        const role = element.getAttribute('role');
        
        if (role && !this.isValidAriaRole(role)) {
          this.addIssue({
            type: 'invalid-aria-role',
            severity: 'warning',
            element: element,
            title: 'Invalid ARIA Role',
            description: `Role "${role}" is not valid or properly used`,
            suggestion: 'Use valid ARIA roles according to WAI-ARIA specification'
          });
        }
      });
    }
  
    hasLowContrast(color, backgroundColor) {
      // Simplified contrast check - implement proper WCAG contrast ratio calculation
      return false; // Placeholder
    }
  
    isValidAriaRole(role) {
      const validRoles = ['button', 'link', 'menu', 'menuitem', 'tab', 'tabpanel', 'dialog', 'alert'];
      return validRoles.includes(role);
    }
  
    addIssue(issue) {
      this.issues.push(issue);
    }
  
    getIssuesSummary() {
      const critical = this.issues.filter(issue => issue.severity === 'critical').length;
      const warning = this.issues.filter(issue => issue.severity === 'warning').length;
      
      return {
        total: this.issues.length,
        critical: critical,
        warning: warning
      };
    }
  }
  
  // Make it globally available
  window.AccessibilityChecker = AccessibilityChecker;