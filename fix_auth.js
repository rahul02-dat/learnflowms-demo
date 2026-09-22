const fs = require('fs');
const file = 'frontend/web/src/pages/Auth.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace otpSchema
content = content.replace(
  /const otpSchema = z\.object\(\{\s*otp:\s*z\.string\(\)\.min\(6, '[^']+'\)\.max\(6\),\s*\}\);/,
  `const otpSchema = z.object({
  otp: z.string()
    .transform((val) => val.replace(/[\\s-]/g, ''))
    .pipe(z.string().length(6, 'Enter the complete 6-digit verification code')),
});`
);

// Remove maxLength={6}
content = content.replace(/maxLength=\{6\}/, 'maxLength={10}');

fs.writeFileSync(file, content);
console.log('Fixed Auth.tsx');
