const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Shema
const StorySchema = new Schema({
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: "public"
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  /// bracket cause its an array of objects
  comments: [
    {
      commentBody: {
        type: String,
        required: true
      },
      commentDate: {
        type: Date,
        default: Date.now
      },
      commentUser: {
        // similar to a relation in the relational db world
        type: Schema.Types.ObjectId,
        // the model that is being refrenced
        ref: "users"
      }
    }
  ],
  // the user associated with the storie
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Create collection and add schema - the second stories takes care of pluarl of story
mongoose.model("stories", StorySchema, "stories");
