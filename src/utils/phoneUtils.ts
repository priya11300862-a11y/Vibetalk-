/**
 * VibeTalk Phone Validation and Normalization Utility
 * Strictly normalizes Indian (+91) and international numbers for MiniMoth OTP delivery.
 * Prevents duplicate country codes (+91+91), strips leading zeros, validates TRAI mobile ranges.
 */

export interface PhoneValidationResult {
  isValid: boolean;
  phone: string; // Clean E.164 format, e.g., "+919876543210"
  nationalNumber: string; // 10-digit national number, e.g., "9876543210"
  countryCode: string; // "+91"
  error?: string;
}

/**
 * Normalizes and validates a phone number according to TRAI (India) & E.164 specifications.
 * 
 * Rules for India (+91):
 * - Exactly 10 digits for the national mobile number
 * - Must begin with 6, 7, 8, or 9
 * - Strips duplicate country codes (+91+91, 9191, etc.)
 * - Strips leading trunk prefixes (e.g. 0)
 * - Returns clean E.164: +91XXXXXXXXXX
 */
export function normalizeAndValidatePhone(
  rawInput: string,
  selectedCountryCode: string = '+91'
): PhoneValidationResult {
  if (!rawInput || typeof rawInput !== 'string') {
    return {
      isValid: false,
      phone: '',
      nationalNumber: '',
      countryCode: selectedCountryCode,
      error: 'Please enter your mobile phone number.',
    };
  }

  const trimmed = rawInput.trim();
  // Extract only numeric digits from input
  let digits = trimmed.replace(/\D/g, '');

  if (!digits) {
    return {
      isValid: false,
      phone: '',
      nationalNumber: '',
      countryCode: selectedCountryCode,
      error: 'Please enter a valid phone number containing digits.',
    };
  }

  const isIndia =
    selectedCountryCode === '+91' ||
    trimmed.startsWith('+91') ||
    (digits.length === 12 && digits.startsWith('91')) ||
    (digits.length === 10 && /^[6-9]/.test(digits));

  if (isIndia) {
    // 1. Remove leading trunk zeros (e.g., "09876543210" -> "9876543210")
    while (digits.startsWith('0') && digits.length > 10) {
      digits = digits.slice(1);
    }

    // 2. Prevent duplicate country codes:
    // Strip redundant '91' prefixes if total length exceeds 10 digits
    // Example: "91919876543210" (length 14) -> "919876543210" (length 12) -> "9876543210" (length 10)
    // Preserves numbers whose genuine 10-digit national number starts with 91 (e.g., "9123456789")
    while (digits.startsWith('91') && digits.length > 10) {
      digits = digits.slice(2);
      while (digits.startsWith('0') && digits.length > 10) {
        digits = digits.slice(1);
      }
    }

    // 3. Remove single leading trunk zero if user entered 11 digits (e.g., "09876543210")
    if (digits.length === 11 && digits.startsWith('0')) {
      digits = digits.slice(1);
    }

    // 4. Validate exact 10 digits for Indian mobile numbers
    if (digits.length < 10) {
      return {
        isValid: false,
        phone: '',
        nationalNumber: digits,
        countryCode: '+91',
        error: `Incomplete mobile number: Please enter all 10 digits (currently ${digits.length} digits).`,
      };
    }

    if (digits.length > 10) {
      return {
        isValid: false,
        phone: '',
        nationalNumber: digits,
        countryCode: '+91',
        error: `Mobile number too long: Indian mobile numbers are exactly 10 digits (received ${digits.length} digits).`,
      };
    }

    // 5. Enforce TRAI allocation: Indian mobile numbers must start with 6, 7, 8, or 9
    if (!/^[6-9]/.test(digits)) {
      return {
        isValid: false,
        phone: '',
        nationalNumber: digits,
        countryCode: '+91',
        error: 'Invalid Indian mobile number. Valid mobile numbers in India must start with 6, 7, 8, or 9.',
      };
    }

    // 6. Prevent obvious invalid repeated sequences (e.g. "0000000000", "1111111111")
    if (/^(\d)\1{9}$/.test(digits)) {
      return {
        isValid: false,
        phone: '',
        nationalNumber: digits,
        countryCode: '+91',
        error: 'Invalid mobile number. Repeating single-digit test patterns are not allowed.',
      };
    }

    const cleanE164 = `+91${digits}`;
    return {
      isValid: true,
      phone: cleanE164,
      nationalNumber: digits,
      countryCode: '+91',
    };
  }

  // Non-India international format
  const cc = selectedCountryCode.startsWith('+') ? selectedCountryCode : `+${selectedCountryCode}`;
  const ccDigits = cc.replace(/\D/g, '');

  while (digits.startsWith(ccDigits) && digits.length > 10) {
    digits = digits.slice(ccDigits.length);
  }

  if (digits.length < 7 || digits.length > 14) {
    return {
      isValid: false,
      phone: '',
      nationalNumber: digits,
      countryCode: cc,
      error: `Invalid international phone number length (${digits.length} digits). Expected 7 to 14 digits.`,
    };
  }

  return {
    isValid: true,
    phone: `${cc}${digits}`,
    nationalNumber: digits,
    countryCode: cc,
  };
}
