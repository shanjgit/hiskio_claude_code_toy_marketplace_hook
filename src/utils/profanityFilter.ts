import * as Sentry from "@sentry/react";

// List of prohibited words (can be extended)
const PROFANITY_LIST = [
  'fuck', 'shit', 'damn', 'ass', 'bitch', 'hell', 'crap',
  'merder', 'murder', 'kill', 'die', 'death', 'stupid', 'idiot',
  // Add more words as needed
];

export interface ProfanityCheckResult {
  hasProfanity: boolean;
  detectedWords: string[];
  cleanedText?: string;
}

/**
 * Checks if text contains profanity and reports to Sentry if found
 * @param text - The text to check
 * @param context - Additional context for Sentry reporting (e.g., field name, user info)
 * @returns ProfanityCheckResult
 */
export const checkForProfanity = (text: string, context?: { field?: string; userId?: string }): ProfanityCheckResult => {
  if (!text || typeof text !== 'string') {
    return { hasProfanity: false, detectedWords: [] };
  }

  const normalizedText = text.toLowerCase().trim();
  const detectedWords: string[] = [];

  // Check for profanity
  PROFANITY_LIST.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(normalizedText)) {
      detectedWords.push(word);
    }
  });

  const hasProfanity = detectedWords.length > 0;

  // Report to Sentry if profanity is detected
  if (hasProfanity) {
    const sentryContext = {
      detectedWords: detectedWords,
      originalText: text,
      textLength: text.length,
      field: context?.field || 'unknown',
      userId: context?.userId || 'anonymous',
      timestamp: new Date().toISOString(),
    };

    // Set additional context
    Sentry.setContext('profanity_detection', sentryContext);
    
    // Add breadcrumb for tracking
    Sentry.addBreadcrumb({
      message: `Profanity detected in ${context?.field || 'form field'}`,
      category: 'content-moderation',
      level: 'warning',
      data: {
        detectedWords: detectedWords,
        field: context?.field,
      }
    });

    // Capture the message
    Sentry.captureMessage(
      `Profanity detected: ${detectedWords.join(', ')} in ${context?.field || 'form field'}`,
      'warning'
    );

    console.warn('Profanity detected and reported to Sentry:', {
      detectedWords,
      field: context?.field,
      textPreview: text.substring(0, 50) + (text.length > 50 ? '...' : '')
    });
  }

  return {
    hasProfanity,
    detectedWords,
    cleanedText: hasProfanity ? text : undefined
  };
};

/**
 * Validates multiple form fields for profanity
 * @param formData - Object containing form field values
 * @param userId - User ID for context
 * @returns Object with validation results for each field
 */
export const validateFormProfanity = (
  formData: Record<string, string>, 
  userId?: string
): Record<string, ProfanityCheckResult> => {
  const results: Record<string, ProfanityCheckResult> = {};

  Object.entries(formData).forEach(([fieldName, value]) => {
    if (value && typeof value === 'string') {
      results[fieldName] = checkForProfanity(value, { field: fieldName, userId });
    }
  });

  return results;
};