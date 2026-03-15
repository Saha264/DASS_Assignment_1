import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';

// @desc    Organizer analytics: registration totals + timeseries for organizer's events
// @route   GET /api/analytics/organizer/registrations
// @access  Private (Organizer)
export const getOrganizerRegistrationAnalytics = async (req, res, next) => {
  try {
    const organizerId = req.user?._id;
    if (!organizerId) {
      res.status(401);
      throw new Error('Not authorized');
    }

    // Fetch organizer events (include even drafts; registrations will typically exist only for published/ongoing)
    const events = await Event.find({ organizer: organizerId })
      .select('_id eventName eventType registrationLimit status eventStartDate registrationDeadline createdAt')
      .sort({ createdAt: -1 });

    const eventIds = events.map(e => e._id);

    // Aggregate confirmed registrations by event
    const registrationsByEvent = await Registration.aggregate([
      { $match: { event: { $in: eventIds }, status: 'Confirmed' } },
      { $group: { _id: '$event', total: { $sum: 1 } } }
    ]);
    const totalsMap = new Map(registrationsByEvent.map(r => [String(r._id), r.total]));

    // Time-series: confirmed registrations per day (UTC) per event
    const seriesAgg = await Registration.aggregate([
      { $match: { event: { $in: eventIds }, status: 'Confirmed' } },
      {
        $group: {
          _id: {
            event: '$event',
            day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.day': 1 } },
      {
        $group: {
          _id: '$_id.event',
          points: { $push: { date: '$_id.day', count: '$count' } }
        }
      }
    ]);
    const seriesMap = new Map(seriesAgg.map(s => [String(s._id), s.points]));

    const eventsWithStats = events.map(e => {
      const id = String(e._id);
      return {
        _id: e._id,
        eventName: e.eventName,
        eventType: e.eventType,
        status: e.status,
        registrationLimit: e.registrationLimit,
        eventStartDate: e.eventStartDate,
        registrationDeadline: e.registrationDeadline,
        registrationsConfirmed: totalsMap.get(id) || 0,
        registrationsSeries: seriesMap.get(id) || []
      };
    });

    const totalConfirmedRegistrations = eventsWithStats.reduce(
      (acc, e) => acc + (e.registrationsConfirmed || 0),
      0
    );

    res.json({
      totalConfirmedRegistrations,
      events: eventsWithStats
    });
  } catch (err) {
    next(err);
  }
};
