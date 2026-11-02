
import Lead from '../models/Lead.js';

const validId = (id) => /^[a-f\d]{24}$/i.test(id);

// Only accept fields that users are allowed to modify
const allowedFields = [
  'name',
  'email',
  'phone',
  'company',
  'source',
  'status',
  'notes',
  'followUpDate',
  'budget',
  'expense'
];

const getLeadData = (body) =>
  Object.fromEntries(
    allowedFields
      .filter((field) => body[field] !== undefined)
      .map((field) => [field, body[field]])
  );

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
      filter.$or = ['name', 'email', 'company', 'notes'].map(
        (field) => ({
          [field]: {
            $regex: search,
            $options: 'i'
          }
        })
      );
    }

    const leads = await Lead.find(filter).sort({
      createdAt: -1
    });

    res.json(leads);
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
  } catch (error) {
    next(error);
  }
}

// Create a lead
export async function createLead(req, res, next) {
  try {
    const lead = await Lead.create({
      ...getLeadData(req.body),
      user: req.user._id
    });

    res.status(201).json(lead);
  } catch (error) {
    next(error);
  }
}

// Update a lead
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
        $set: getLeadData(req.body)
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
  } catch (error) {
    next(error);
  }
}

// Delete a lead
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
  } catch (error) {
    next(error);
  }
}

// Get statistics for the logged-in user's leads
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
      rows.map((row) => [row._id, row.count])
    );

    const total = rows.reduce(
      (sum, row) => sum + row.count,
      0
    );

    res.json({
      total,
      new: map.new || 0,
      contacted: map.contacted || 0,
      qualified: map.qualified || 0,
      converted: map.converted || 0,
      lost: map.lost || 0
    });
  } catch (error) {
    next(error);
  }
}
