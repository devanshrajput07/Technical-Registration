const mongoose = require('mongoose');

//Schema

const TeamSchema = new mongoose.Schema({
    leader_name: {
        type: String,
        required: true
    },
    leader_email: {
        type: String,
        required: true
    },
    profile_photo_url: {
        type: String,
        required: true
    },
    team_member_2: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['Bid', 'Code'],
            required: true
        }
    },
    team_member_3: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['Bid', 'Code'],
            required: true
        }
    },
    team_member_4: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['Bid', 'Code'],
            required: true
        }
    },
    payment_amount: {
        type: Number,
        required: true
    }
});

const TeamModel = mongoose.model('Team', TeamSchema);

export default TeamModel