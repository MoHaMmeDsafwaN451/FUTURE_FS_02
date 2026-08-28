const statuses = ['new', 'contacted', 'qualified', 'converted', 'lost'];
const sources = ['website', 'linkedin', 'referral', 'instagram', 'google', 'other'];
export function validateLead(req, res, next) {
  const { name, email, status, source, followUpDate } = req.body;
  if (!name?.trim() || !email?.trim()) return res.status(400).json({ message: 'Name and email are required.' });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
  if (status && !statuses.includes(status)) return res.status(400).json({ message: 'Invalid lead status.' });
  if (source && !sources.includes(source)) return res.status(400).json({ message: 'Invalid lead source.' });
  if (followUpDate && Number.isNaN(Date.parse(followUpDate))) return res.status(400).json({ message: 'Invalid follow-up date.' });
  next();
}
