require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const mongoDB = `mongodb://localhost:27017/todolistDB`;

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema);

mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("MongoDB is connected");

  // Define default items
  const defaultItems = [
    { name: "Welcome to your todolist!" },
    { name: "Hit the + button to add a new item." },
    { name: "<--- Hit this to delete an item." },
  ];

  // Check if default items exist, insert if not
  Item.find().then(foundItems => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems).then(() => {
        console.log("Default items inserted.");
      });
    }
  });

  // Routes
  app.get("/", function (req, res) {
    Item.find().then(foundItems => {
      res.render("list", { kindOfDay: "Today", newListItems: foundItems });
    }).catch(err => {
      console.log("Error fetching items:", err);
      res.redirect("/");
    });
  });

  app.post("/", async function (req, res) {
    const itemName = req.body.newItem;
    const item = new Item({ name: itemName });

    try {
      await item.save();
      res.redirect("/");
    } catch (err) {
      console.log("Error saving item:", err);
      res.redirect("/");
    }
  });

  app.post("/delete", async function (req, res) {
    const checkedItemId = req.body.checkbox;

    try {
      await Item.findByIdAndRemove(checkedItemId);
      console.log("Successfully deleted checked item.");
      res.redirect("/");
    } catch (err) {
      console.log("Error deleting item:", err);
      res.redirect("/");
    }
  });

  app.listen(3000, function () {
    console.log("Server has started at port 3000!");
  });
}).catch(err => {
  console.log("Error connecting to MongoDB:", err);
});
