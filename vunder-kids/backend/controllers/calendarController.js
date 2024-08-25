const CalendarEvent = require('../models/calendarEvent');
const Notification = require('../models/Notifiication');
const Location = require("../models/Location")
const User = require('../models/User');
const schedule = require('node-schedule');

// Create a new calendar event
exports.createEvent = async (req, res) => {
  try {
    const { title, description, location, organizer, participants, startDate, endDate } = req.body;

    const newEvent = new CalendarEvent({
      title,
      description,
      location,
      organizer,
      participants,
      startDate,
      endDate
    });

    const savedEvent = await newEvent.save();
    const populatedEvent = await savedEvent.
    populate('organizer', 'name')
    .populate('participants', 'name')
    .populate('location')
    .execPopulate();

    // Notify participants
    await Promise.all(participants.map(async (participantId) => {
      await Notification.create({
        user: participantId,
        type: 'event-scheduled',
        message: `You have been invited to the event: ${savedEvent.title}`,
        event: savedEvent._id
      });
    }));

    // Schedule reminders or status updates if needed
    if (startDate) {
      const startTime = new Date(startDate);

      schedule.scheduleJob(savedEvent._id.toString(), startTime, async () => {
        console.log('Event started:', savedEvent.title);
        // You can update the status here or trigger other notifications
      });
    }

    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(400).json({ error: error.message });
  }
};

// Update an event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params; // Get event ID from params
    console.log("id :", id)
    const calendarData = req.body; // Get update data from request body
    console.log("calendar data : ",calendarData)

    // Find the event by ID and update it with new data
    const updatedEvent = await CalendarEvent.findByIdAndUpdate(id, calendarData, { new: true })
      .populate('organizer', 'name')
      .populate('participants', 'name')
      .populate('location')
      console.log("updatedEvent", updatedEvent)

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Notify participants about the update
    await Promise.all(updatedEvent.participants.map(async (participantId) => {
      await Notification.create({
        user: participantId,
        type: 'event-update',
        message: `The event "${updatedEvent.title}" has been updated.`,
        event: updatedEvent._id
      });
    }));

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(400).json({ error: error.message });
  }
};


exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await CalendarEvent.findById(id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Notify participants about the cancellation before deletion
    await Promise.all(event.participants.map(async (participantId) => {
      await Notification.create({
        user: participantId,
        type: 'event-cancelled',
        message: `The event "${event.title}" has been cancelled.`,
        event: event._id
      });
    }));
    // Delete the event from the database
    await CalendarEvent.findByIdAndDelete(id);

    // Respond with status 200 and message
    res.status(200).json({ message: 'event-deleted' });
  } catch (error) {
    console.error('Error cancelling event:', error);
    res.status(400).json({ error: error.message });
  }
};


// Get a single event by ID
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await CalendarEvent.findById(id)
      .populate('organizer', 'name')
      .populate('participants', 'name')
      .populate('location')

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json(event);
  } catch (error) {
    console.error('Error getting event:', error);
    res.status(400).json({ error: error.message });
  }
};



// Fetch all events for the logged-in user and events where they are a participant
exports.getUserEvents = async (req, res) => {
  try {
    const userId = req.user.id;  // Assuming req.user contains the logged-in user's ID

    // Find events organized by the logged-in user
    const organizedEvents = await CalendarEvent.find({ organizer: userId })
      .populate('participants', 'name email') // Populate participant names and emails
      .populate('location'); // Populate location details if needed

    // Find events where the user is a participant
    const participantEvents = await CalendarEvent.find({ participants: userId })
      .populate('participants', 'name email') // Populate participant names and emails
      .populate('location'); // Populate location details if needed

    // Combine both sets of events, avoiding duplicates
    const allEvents = [...organizedEvents, ...participantEvents].filter(
      (event, index, self) =>
        index === self.findIndex((e) => e._id.toString() === event._id.toString())
    );

    if (allEvents.length === 0) {
      return res.status(404).json({ message: 'No events found' });
    }
    
    res.status(200).json(allEvents);
    console.log(allEvents);
  } catch (error) {
    console.error('Error fetching user events:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
};
