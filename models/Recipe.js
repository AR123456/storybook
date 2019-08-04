const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Shema
//TODO wiht implementation of spin recipe this will be the recipe model
const RecipeSchema = new Schema({
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
  // this is an array of objects
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
        type: Schema.Types.ObjectId,
        ref: "users"
      }
    }
  ],
  // The user associated with the recipe / recipe
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Create collection and add schema-  specifying ies preventsy the default being recipes
mongoose.model("recipes", RecipeSchema, "recipes");
