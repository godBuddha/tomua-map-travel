// Mock for otplib
module.exports = {
  generateSecret: () => 'MOCKSECRET123456',
  generateURI: (options) => `otpauth://totp/${options.issuer}:${options.label}?secret=${options.secret}`,
  verify: ({ token, secret }) => token === '123456'
};
