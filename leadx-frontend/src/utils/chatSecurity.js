/**
 * Chat Security Utility
 * Prevents sharing of personal information like email, phone numbers, and WhatsApp links
 */

// Regex patterns for detecting sensitive information
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(\+91|91)?[6-9]\d{9}|\d{10}/g;
const WHATSAPP_REGEX = /whatsapp|wa\.me|wa\.ly|whatsapp\.com/gi;
const SOCIAL_MEDIA_REGEX = /(facebook|instagram|twitter|linkedin|snapchat|telegram)\.com/gi;

/**
 * Validates if a message contains sensitive information
 * @param {string} message - The message to validate
 * @returns {object} - Validation result with violations
 */
export const validateMessage = (message) => {
  if (!message || typeof message !== 'string') {
    return { isValid: true, violations: {} };
  }

  const hasEmail = EMAIL_REGEX.test(message);
  const hasPhone = PHONE_REGEX.test(message);
  const hasWhatsapp = WHATSAPP_REGEX.test(message);
  const hasSocialMedia = SOCIAL_MEDIA_REGEX.test(message);

  const violations = {
    email: hasEmail,
    phone: hasPhone,
    whatsapp: hasWhatsapp,
    socialMedia: hasSocialMedia
  };

  return {
    isValid: !hasEmail && !hasPhone && !hasWhatsapp && !hasSocialMedia,
    violations
  };
};

/**
 * Filters sensitive data from a message for display
 * @param {string} message - The message to filter
 * @returns {string} - Filtered message
 */
export const filterSensitiveData = (message) => {
  if (!message || typeof message !== 'string') {
    return message;
  }

  let filteredMessage = message
    .replace(EMAIL_REGEX, '[Email Removed for Security]')
    .replace(PHONE_REGEX, '[Phone Number Removed for Security]')
    .replace(WHATSAPP_REGEX, '[WhatsApp Link Removed for Security]')
    .replace(SOCIAL_MEDIA_REGEX, '[Social Media Link Removed for Security]');

  return filteredMessage;
};

/**
 * Gets appropriate warning message based on violations
 * @param {object} violations - Object containing violation flags
 * @returns {string} - Warning message
 */
export const getSecurityWarning = (violations) => {
  const warnings = [];
  
  if (violations.email) warnings.push('email addresses');
  if (violations.phone) warnings.push('phone numbers');
  if (violations.whatsapp) warnings.push('WhatsApp links');
  if (violations.socialMedia) warnings.push('social media links');

  if (warnings.length === 0) return '';
  
  const warningText = warnings.join(', ');
  return `Please don't share ${warningText} for security reasons.`;
};

/**
 * Gets detailed security warning for UI display
 * @param {object} violations - Object containing violation flags
 * @returns {object} - Detailed warning with title and message
 */
export const getDetailedSecurityWarning = (violations) => {
  const warnings = [];
  
  if (violations.email) warnings.push('Email addresses');
  if (violations.phone) warnings.push('Phone numbers');
  if (violations.whatsapp) warnings.push('WhatsApp links');
  if (violations.socialMedia) warnings.push('Social media links');

  if (warnings.length === 0) return null;

  return {
    title: 'Security Warning',
    message: `For your safety, please don't share: ${warnings.join(', ')}.`,
    type: 'warning'
  };
};

/**
 * Checks if message contains only sensitive information
 * @param {string} message - The message to check
 * @returns {boolean} - True if message contains only sensitive data
 */
export const isOnlySensitiveData = (message) => {
  if (!message || typeof message !== 'string') return false;
  
  const validation = validateMessage(message);
  if (!validation.isValid) {
    const filteredMessage = filterSensitiveData(message).trim();
    const cleanMessage = filteredMessage
      .replace(/\[.*?Removed for Security\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    return cleanMessage.length === 0;
  }
  
  return false;
};
