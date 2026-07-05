// Email validation
export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Password strength check
export function checkPasswordStrength(password) {
  if (!password) return { score: 0, feedback: 'Mật khẩu không được để trống' };
  
  let score = 0;
  const feedback = [];

  if (password.length >= 8) score++;
  else feedback.push('Tối thiểu 8 ký tự');

  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  else feedback.push('Cần chữ thường');
  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Cần chữ hoa');
  if (/[0-9]/.test(password)) score++;
  else feedback.push('Cần số');
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push('Cần ký tự đặc biệt');

  const levels = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'];
  const level = Math.min(Math.floor(score / 1.5), 4);

  return {
    score,
    level: levels[level],
    feedback: feedback.join(', '),
    isValid: score >= 3
  };
}

// Username validation
export function isValidUsername(username) {
  const regex = /^[a-zA-Z0-9_]{3,20}$/;
  return regex.test(username);
}

// Phone validation
export function isValidPhone(phone) {
  const regex = /^[\d\s\-+()]{8,15}$/;
  return regex.test(phone);
}

// Latitude validation
export function isValidLat(lat) {
  const num = parseFloat(lat);
  return !isNaN(num) && num >= -90 && num <= 90;
}

// Longitude validation
export function isValidLng(lng) {
  const num = parseFloat(lng);
  return !isNaN(num) && num >= -180 && num <= 180;
}

// UUID validation
export function isValidUUID(uuid) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

// Required field validation
export function isRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

// Min length validation
export function minLength(value, min) {
  if (!value) return false;
  return String(value).length >= min;
}

// Max length validation
export function maxLength(value, max) {
  if (!value) return true;
  return String(value).length <= max;
}

// Form validation helper
export function validateForm(rules, data) {
  const errors = {};
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    for (const rule of fieldRules) {
      const value = data[field];
      
      if (rule.required && !isRequired(value)) {
        errors[field] = rule.message || `${field} là bắt buộc`;
        break;
      }
      
      if (rule.minLength && !minLength(value, rule.minLength)) {
        errors[field] = rule.message || `${field} tối thiểu ${rule.minLength} ký tự`;
        break;
      }
      
      if (rule.maxLength && !maxLength(value, rule.maxLength)) {
        errors[field] = rule.message || `${field} tối đa ${rule.maxLength} ký tự`;
        break;
      }
      
      if (rule.pattern && !rule.pattern.test(value)) {
        errors[field] = rule.message || `${field} không hợp lệ`;
        break;
      }
      
      if (rule.custom && !rule.custom(value)) {
        errors[field] = rule.message || `${field} không hợp lệ`;
        break;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
