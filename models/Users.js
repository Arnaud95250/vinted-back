const mongoose = require("mongoose");

const Users = mongoose.model("Users", {
    email: {
      unique: true,
      type: String,
    },
    account: {
      username: {
        required: true,
        type: String,
      },
      phone: String,
      avatar: Object, // nous verrons plus tard comment uploader une image
    },
    token: String,
    hash: String,
    salt: String,
});



// Export du model User
module.exports = Users;
