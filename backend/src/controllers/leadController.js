import Lead from '../models/Lead.js';
const validId = (id) => /^[a-f\d]{24}$/i.test(id);
export async function listLeads(req, res, next) {
  try {
    const { search = '', status, source } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (search) filter.$or = ['name', 'email', 'company'].map((field) => ({ [field]: { $regex: search, $options: 'i' } }));
    res.json(await Lead.find(filter).sort({ createdAt: -1 }));
  } catch (error) { next(error); }
}
export async function getLead(req, res, next) {
  try { if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid lead ID.' }); const lead = await Lead.findById(req.params.id); if (!lead) return res.status(404).json({ message: 'Lead not found.' }); res.json(lead); } catch (e) { next(e); }
}
export async function createLead(req, res, next) { try { const lead = await Lead.create(req.body); res.status(201).json(lead); } catch (e) { next(e); } }
export async function updateLead(req, res, next) {
  try { if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid lead ID.' }); const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!lead) return res.status(404).json({ message: 'Lead not found.' }); res.json(lead); } catch (e) { next(e); }
}
export async function deleteLead(req, res, next) {
  try { if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid lead ID.' }); const lead = await Lead.findByIdAndDelete(req.params.id); if (!lead) return res.status(404).json({ message: 'Lead not found.' }); res.status(204).send(); } catch (e) { next(e); }
}
export async function leadStats(req, res, next) {
  try { const rows = await Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]); const map = Object.fromEntries(rows.map((r) => [r._id, r.count])); res.json({ total: rows.reduce((sum, r) => sum + r.count, 0), new: map.new || 0, contacted: map.contacted || 0, converted: map.converted || 0 }); } catch (e) { next(e); }
}
