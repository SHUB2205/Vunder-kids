const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
    country: { // Renamed 'Country' to 'country' to follow camelCase convention
        type: String,
        required: true // Added required for consistency
    },
    state: {
        type: String,
        required: true // Added required for consistency
    },
    city: {
        type: String,
        required: true // Added required for consistency
    },
    zip: {
        type: String,
        required: true // Added required for consistency
    }
});

const Location = mongoose.model('Location', LocationSchema);

module.exports = Location;
