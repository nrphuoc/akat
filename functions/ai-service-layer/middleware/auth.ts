export const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  // Thêm logic validate API key
  next();
};

export const rateLimiter = (req, res, next) => {
  // Thêm logic rate limiting
  next();
}; 