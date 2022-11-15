const express = require("express");
const { env } = require("process");
const bodyParser = require("body-parser");
const res = require("express/lib/response");
const sqlite3 = require("sqlite3");

const PORT = 8080 || process.env.PORT;
const app = express();
console.log("Setting up db");
let db = new sqlite3.Database(
  "./database.db",
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err && err.code == "SQLITE_CANTOPEN") {
      createDatabase();
      return;
    } else if (err) {
      console.log("Getting error " + err);
      exit(1);
    }
  }
);
createDatabase();

function createDatabase() {
  console.log("Creating database");
  var newdb = new sqlite3.Database("database.db", (err) => {
    if (err) {
      console.log("Getting error " + err);
      exit(1);
    }
    createTables(newdb);
  });
}

function createTables(newdb) {
  console.log("Creating tables");
  newdb.exec(
    `
    create table purchases(
        store text not null,
        location text not null,
        cardNumber int not null,
        date DATE not null,
        items text not null
    );

    insert into purchases (store, location, cardNumber, date, items)
      values ('kiwi', 'Oslo', '2468', '2022-11-12', 'mushroom');
        `,
    (err) => {
      console.log(err);
    }
  );
}

app.use(bodyParser.json());

//Purchase tracking system API
let items = [];

//Post item
app.post("/item", (req, res) => {
  let item = req.body;

  if (item) {
    if (item.name && item.name.length > 0 && item.price && Number(item.price)) {
      item.id = items.length + 1;
      item.price = Number(item.price);
      items.push(item);
      res.status(200).send("Item saved");
    } else {
      res.status(200).send("Item is missing name or price");
    }
  } else {
    res.status(200).send("There is no item");
  }
  console.log(items);
});

//Post card
app.post("/card", (req, res) => {
  let card = req.body;
  console.log(card);
  if (card) {
    if (
      card.card_number &&
      Number(card.card_number) &&
      card.card_number.length == 4 &&
      card.store_name &&
      card.store_name.length > 0 &&
      card.store_location &&
      card.store_location.length > 0 &&
      card.date &&
      card.date.length > 0
    ) {
      //1. hent alle items til lokal variabel
      const allItems = [item];
      //2. tøm items array
      //3. lagre lokal items til database

      db.run(
        "INSERT INTO purchases (store, location, cardNumber, date, items) VALUES ('" +
          card.store_name +
          card.store_location +
          card.card_number +
          card.date +
          item.name +
          "');"
      );
      res.status(200).send("Purchase is OK");
    } else {
      res.status(200).send("Missing data");
    }
  } else {
    res.status(200).send("Missing data");
  }
});

app.listen(PORT, () => {
  console.log("Server started");
});
