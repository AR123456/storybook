const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Shema
//TODO wiht implementation of spin recipe this will be the recipe model
const RecipeSchema = new Schema({
  status: {
    type: String,
    default: "public"
  },
  searchTerm: [
    {
      type: String,
      // required: true,
      maxlength: 200
    }
  ],
  userSearch: [
    {
      type: String,
      maxlength: 200
    }
  ],
  url: {
    type: String
    // trim: true
    // why is this unique not working.........
    // unique: true
    // required: "URL is required"
  },
  label: {
    type: String
    // trim: true
    // required: "Title is required"
  },
  image: {
    type: String
    // trim: true
  },
  ingredients: {
    type: String
    // trim: true
  },
  directions: {
    type: String
  },
  nutrition: {
    type: String
  },

  body: {
    type: String
    // required: true
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
