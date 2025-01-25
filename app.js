const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/user');
const _ = require('lodash');
const bcrypt = require('bcrypt');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const dbURI = "mongodb+srv://nygymettollaaibibi9:DHXAx3jgi2QtAk4f@cluster0.j4ydp.mongodb.net/";

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.log('MongoDB Atlas connection error:', err));

app.get("/login", (req, res) => {
  res.render("login"); 
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Request body password:', password); 

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send('User not found');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).send('Invalid password');
    }

    res.redirect('/main');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/register', (req, res) => {
    res.render('register'); 
});
  
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).send('Username and password are required');
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('Username already exists. Please choose another.');
    }

   

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.send('User registered successfully');
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).send('Username already exists. Please choose another.');
    } else {
      console.error(err);
      res.status(500).send('An error occurred while registering the user');
    }
  }
});



app.get('/profile', async (req, res) => {
    try {
      const user = await User.findOne({ username: 'Aibibi_new' }); 
      if (!user) return res.status(404).send('User not found');
      res.render('profile', { user });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });
  
app.post('/profile', async (req, res) => {
const { username, password } = req.body;
try {
    const hashedPassword = await bcrypt.hash(password, 10); 
    await User.updateOne({ username: 'Aibibi' }, { username, password: hashedPassword });
    res.send('Profile updated successfully');
} catch (err) {
    console.error(err);
    res.status(500).send('Failed to update profile');
}
});
  
const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome"
});

const item2 = new Item({
  name: "Create"
});

const item3 = new Item({
  name: "Read"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", async function (req, res) {
  try {
    const foundItems = await Item.find({});

    if (foundItems.length === 0) {
      await Item.insertMany(defaultItems);
      console.log("successully added");
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/", async function (req, res) {
  try {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
      name: itemName
    });

    if (listName === "Today") {
      await item.save();
      res.redirect("/");
    } else {
      const foundList = await List.findOne({ name: listName });
      foundList.items.push(item);
      await foundList.save();
      res.redirect("/" + listName);
    }
  } catch (err) {
    console.log(err);
  }
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.post("/delete", async function (req, res) {
  try {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
      await Item.findByIdAndDelete(checkedItemId);
      console.log("successfully deleted");
      res.redirect("/");
    } else {
      await List.findOneAndUpdate(
        { name: listName },
        { $pull: { items: { _id: checkedItemId } } }
      );
      console.log("successfully deleted from custom list");
      res.redirect("/" + listName);
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/:customListName", async function (req, res) {
  try {
    const customListName = _.capitalize(req.params.customListName);
    const foundList = await List.findOne({ name: customListName }).exec();

    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      await list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
    }
  } catch (err) {
    console.log(err);
  }
});

app.listen(3000, function () {
  console.log("Server is running on http://localhost:3000/");
});
