import mongoose from "mongoose";

// Custom validator function
const validateEmail = function (email) {
  const emailRegex = /^([a-zA-Z0-9_.+-]+)@akgec\.ac\.in$/;
  return emailRegex.test(email);
};

// Schema
const TeamSchema = new mongoose.Schema({
  leader_name: {
    type: String,
    required: true,
  },
  leader_email: {
    type: String,
    required: true,
    unique: true,
    validate: [
      validateEmail,
      "Please use an email from the akgec.ac.in domain",
    ],
  },
  profile_photo_url: {
    type: String,
    required: true,
  },
  leader_role: {
    type: String,
    enum: ["Bid", "Code"],
    required: true,
  },
  team_member_2: {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [
        validateEmail,
        "Please use an email from the akgec.ac.in domain",
      ],
    },
    role: {
      type: String,
      enum: ["Bid", "Code"],
      required: true,
    },
  },
  team_member_3: {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [
        validateEmail,
        "Please use an email from the akgec.ac.in domain",
      ],
    },
    role: {
      type: String,
      enum: ["Bid", "Code"],
      required: true,
    },
  },
  team_member_4: {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [
        validateEmail,
        "Please use an email from the akgec.ac.in domain",
      ],
    },
    role: {
      type: String,
      enum: ["Bid", "Code"],
      required: true,
    },
  },
  payment_amount: {
    type: Number,
    required: true,
  },
});

const TeamModel = mongoose.model("Team", TeamSchema);

export default TeamModel;
