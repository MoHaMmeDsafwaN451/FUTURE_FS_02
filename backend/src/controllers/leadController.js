import Lead from '../models/Lead.js';

const validId = (id) => /^[a-f\d]{24}$/i.test(id);

// Get only leads belonging to the logged-in user
export async function listLeads(req, res, next) {
  try {
    const { search = '', status, source } = req.query;

    const filter = {
      user: req.user._id
    };

    if (status) filter.status = status;
    if (source) filter.source = source;

    if (search) {
      filter.$or = ['name', 'email', 'company'].map((field) => ({
        [field]: {
          $regex: search,
          $options: 'i'
        }
      }));
    }

    res.json(
      await Lead.find(filter).sort({ createdAt: -1 })
    );
  } catch (error) {
    next(error);
  }
}

// Get one lead belonging to the logged-in user
export async function getLead(req, res, next) {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid lead ID.'
      });
    }

    const lead = await Lead.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!lead) {
      return res.status(404).json({
        message: 'Lead not found.'
      });
    }

    res.json(lead);
  } catch (e) {
    next(e);
  }
}

// Create a lead for the logged-in user
export async function createLead(req, res, next) {
  try {
    const lead = await Lead.create({
      ...req.body,
      user: req.user._id
    });

    res.status(201).json(lead);
  } catch (e) {
    next(e);
  }
}

// Update only a lead belonging to the logged-in user
export async function updateLead(req, res, next) {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid lead ID.'
      });
    }

    const lead = await Lead.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id
      },
      {
        ...req.body,
        user: req.user._id
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!lead) {
      return res.status(404).json({
        message: 'Lead not found.'
      });
    }

    res.json(lead);
  } catch (e) {
    next(e);
  }
}

// Delete only a lead belonging to the logged-in user
export async function deleteLead(req, res, next) {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid lead ID.'
      });
    }

    const lead = await Lead.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!lead) {
      return res.status(404).json({
        message: 'Lead not found.'
      });
    }

    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

// Get statistics only for the logged-in user's leads
export async function leadStats(req, res, next) {
  try {
    const rows = await Lead.aggregate([
      {
        $match: {
          user: req.user._id
        }
      },
      {
        $group: {
          _id: '$status',
          count: {
            $sum: 1
          }
        }
      }
    ]);

    const map = Object.fromEntries(
      rows.map((r) => [r._id, r.count])
    );

    res.json({
      total: rows.reduce(
        (sum, r) => sum + r.count,
        0
      ),
      new: map.new || 0,
      contacted: map.contacted || 0,
      converted: map.converted || 0
    });
  } catch (e) {
    next(e);
  }
}
