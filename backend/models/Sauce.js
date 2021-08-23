const mongoose = require('mongoose');

const sauceSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100,
    validate: {
      validator: function(v) {
        return /^[a-z\d\-_\s]+$/i.test(v);
      },
      message: props => `${props.value} n'est pas un nom valide`
    }
  },

  userId: { type: String, required: true },

  manufacturer: {
    type: String,
    required: true,
    minlength: 3,
    maxlenght: 100,
    validate: {
      validator: function(v) {
        return /^[a-z\d\-_\s]+$/i.test(v);
      },
      message: props => `${props.value} n'est pas un nom de fabricant valide`
    }
  },

  description: {
    type: String,
    required: true,
    minlength: 10,
    maxlenght: 255,
    validate: {
      validator: function(v) {
        return /^[a-z\d\-_\s]+$/i.test(v);
      },
      message: props => `${props.value} n'est pas une description valide`
    }
  },

  mainPepper: {
    type: String,
    required: true,
    minlength: 6,
    maxlenght: 40,
    validate: {
      validator: function(v) {
        return /^[a-z\d\-_\s]+$/i.test(v);
      },
      message: props => `${props.value} n'est pas un ingrédient principal valide`
    }
  },

  imageUrl: { type: String, required: true },

  heat: { type: Number, required: true },

  likes: { type: Number },
  dislikes: { type: Number },
  usersLiked: { type: [String] },
  usersDisliked: { type: [String] },
});

module.exports = mongoose.model('Sauce', sauceSchema);