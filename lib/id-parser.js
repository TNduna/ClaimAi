// lib/id-parser.js (classic script)
function parseSouthAfricanID(idNumber) {
  const res = { isValid: false };
  if (!idNumber || typeof idNumber !== 'string') return res;
  const digits = idNumber.replace(/\D/g, '');
  if (digits.length !== 13) return res;

  // Luhn-style check used by South African ID numbers
  const arr = digits.split('').map(d => parseInt(d, 10));
  const checkDigit = arr[12];

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const n = arr[i];
    if (i % 2 === 0) {
      sum += n;
    } else {
      let doubled = n * 2;
      if (doubled > 9) doubled -= 9;
      sum += doubled;
    }
  }
  const calcCheck = (10 - (sum % 10)) % 10;
  if (calcCheck !== checkDigit) {
    return Object.assign(res, { isValid: false, reason: 'INVALID_CHECKSUM' });
  }

  const yy = parseInt(digits.substring(0, 2), 10);
  const mm = parseInt(digits.substring(2, 4), 10);
  const dd = parseInt(digits.substring(4, 6), 10);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) {
    return Object.assign(res, { isValid: false, reason: 'INVALID_DOB' });
  }
  const currentYear = new Date().getFullYear();
  const currentYY = currentYear % 100;
  const century = (yy > currentYY) ? 1900 : 2000;
  const year = century + yy;
  const dob = new Date(year, mm - 1, dd);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;

  const genderSeq = parseInt(digits.substring(6, 10), 10);
  const gender = (genderSeq >= 5000) ? 'M' : 'F';
  const citizenship = digits[10] === '0' ? 'SA' : 'NON-SA';

  return Object.assign(res, {
    isValid: true,
    dob: dob.toISOString().substring(0, 10),
    age,
    gender,
    citizenship,
    raw: digits
  });
}

// Expose globally for importScripts consumers
self.parseSouthAfricanID = parseSouthAfricanID;
