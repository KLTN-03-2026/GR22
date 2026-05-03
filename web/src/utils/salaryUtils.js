// Module: utils/salaryUtils.js - Quản lý logic hệ thống
/**
 * Formats a salary string to Vietnamese currency format (e.g., "10.000.000")
 * @param {string|number} salary - The raw salary from the database
 * @returns {string} - The formatted salary string
 */
export const formatSalary = (salary) => {
  if (!salary && salary !== 0) return 'Thỏa thuận';
  
  const salaryStr = String(salary);

  // If it's already a string like "Thỏa thuận", return it
  if (salaryStr.toLowerCase() === 'thoả thuận' || salaryStr.toLowerCase() === 'thỏa thuận') {
    return 'Thỏa thuận';
  }

  // Extract all numbers from the string
  const numbers = salaryStr.match(/\d+/g);
  
  if (!numbers || numbers.length === 0) {
    return salaryStr; // Return as-is if no numbers found
  }

  // Helper to format a single number string
  const formatNum = (numStr) => {
    const num = parseInt(numStr.replace(/\D/g, ''), 10);
    if (isNaN(num)) return numStr;
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  if (numbers.length === 1) {
    // Single number: "20.000.000 VNĐ"
    return `${formatNum(numbers[0])} VNĐ`;
  } else if (numbers.length >= 2) {
    // Range: "10.000.000 - 20.000.000 VNĐ"
    return `${formatNum(numbers[0])} - ${formatNum(numbers[1])} VNĐ`;
  }

  return salaryStr;
};

/**
 * Removes all non-digit characters from a string
 * @param {string} value 
 * @returns {string}
 */
export const stripSalary = (value) => {
  if (!value) return '';
  return String(value).replace(/\D/g, '');
};

/**
 * Formats for input field (no VNĐ suffix)
 * @param {string|number} value 
 * @returns {string}
 */
export const formatSalaryInput = (value) => {
  if (!value && value !== 0) return '';
  const num = String(value).replace(/\D/g, '');
  if (!num) return '';
  return new Intl.NumberFormat('vi-VN').format(parseInt(num, 10));
};

// Git update: Triggering change for push
