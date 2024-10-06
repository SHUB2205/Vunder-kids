// controllers/placeController.js
const Facility = require('../models/Facility');
const Booking = require('../models/Booking');

exports.getAllFacility = async (req, res) => {
  try {
    const facility = await Facility.find();
    res.json(facility);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFacility = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({ message: 'Facility not found' });
    res.json(facility);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createFacility = async (req, res) => {
  const facility = new Facility({
    name: req.body.name,
    description: req.body.description,
    address: req.body.address,
    pricePerHour: req.body.pricePerHour,
    owner: req.user.id, 
    imageUrls: req.body.imageUrls
  });

  try {
    const newfacility = await facility.save();
    res.status(201).json(newfacility);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateFacility = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({ message: 'Facility not found' });
    
    if (facility.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this facility' });
    }

    Object.assign(facility, req.body);
    const updatedFacility = await facility.save();
    res.json(updatedFacility);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getUserFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find({ owner: req.user.id });
    res.json(facilities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteFacility = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({ message: 'Facility not found' });
    
    if (facility.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this facility' });
    }

    await facility.remove();
    res.json({ message: 'facility deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

