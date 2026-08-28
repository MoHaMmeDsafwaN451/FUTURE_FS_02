export function notFound(req, res) { res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} was not found.` }); }
export function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid resource ID.' });
  if (err.name === 'ValidationError') return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(' ') });
  res.status(err.statusCode || 500).json({ message: err.message || 'An unexpected server error occurred.' });
}
