const express = require("express");
const { env } = require("process");
const bodyParser = require("body-parser");
const res = require("express/lib/response");
const sqlite3 = require("sqlite3");
const { number } = require("prop-types");

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
        date varchar not null,
        items varchar not null
    );

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
      res.status(200).send("{'status': 'Item saved'}");
    } else {
      res.status(200).send("{'status': 'Item is missing name or price'}");
    }
  } else {
    res.status(200).send("{'status': 'There is no item'}");
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
      const parsedItems = JSON.stringify(items);

      db.run(
        "INSERT INTO purchases (store, location, cardNumber, date, items) values ('" +
          card.store_name +
          "', '" +
          card.store_location +
          "', '" +
          card.card_number +
          "', '" +
          card.date +
          "', '" +
          parsedItems +
          "');"
      );

      items = [];
      res.status(200).send("{'status': 'Purchase is OK'}");
    } else {
      res.status(200).send("{'status': 'Missing data'}");
    }
  } else {
    res.status(200).send("{'status': 'Missing data'}");
  }
});

//GET/card
app.get("/card/:card_number", (req, res) => {
  console.log(req.params.card_number);
  let data = [];
  let card = req.params.card_number;
  if (card && Number(card) && card.length == 4) {
    db.serialize(() => {
      db.each(
        "SELECT items FROM purchases WHERE cardNumber = " + card + ";",
        (err, row) => {
          data.push(row);
        },
        () => {
          res.send(data);
        }
      );
    });
  } else {
    res.status(200).send("{'status': 'Missing number'}");
  }
});

//GET/store_name
app.get("/store/:store_name", (req, res) => {
  let data = [];
  let storeName = req.params.store_name;
  if (storeName) {
    db.serialize(() => {
      db.each(
        "SELECT * FROM purchases WHERE store = '" + storeName + "';",
        (err, row) => {
          data.push(row);
        },
        () => {
          res.send(data);
        }
      );
    });
  } else {
    res.status(200).send("{'status': 'Missing data'}");
  }
});

//GET/store_location
app.get("/location/:store_location", (req, res) => {
  let data = [];
  let storeLocation = req.params.store_location;
  if (storeLocation) {
    db.serialize(() => {
      db.each(
        "SELECT * FROM purchases WHERE location = '" + storeLocation + "';",
        (err, row) => {
          data.push(row);
        },
        () => {
          res.send(data);
        }
      );
    });
  } else {
    res.status(200).send("{'status': 'Missing data'}");
  }
});

//GET/date
app.get("/day/:date", (req, res) => {
  let items = [];
  let date = req.params.date;

  if (date) {
    db.serialize(() => {
      db.each(
        "SELECT items, date, cardNumber FROM purchases WHERE date = '" +
          date +
          "';",
        (err, row) => {
          items.push(row);
        },
        () => {
          res.send(items);
        }
      );
    });
  } else {
    res.status(200).send("{'status': 'Missing data'}");
  }
});

//GET/month
app.get("/month/:month_number/:year_number", (req, res) => {
  let items = [];
  let month = req.params.month;
  let year = req.params.year;

  if (
    month &&
    Number(month) &&
    (month.length == 1 || month.length == 2) &&
    year &&
    Number(year) &&
    year.length == 2
  ) {
    let date = month + "." + year;
    db.serialize(() => {
      db.each(
        "SELECT items, date, cardNumber FROM purchases WHERE date LIKE '%" +
          date +
          "%';",
        (err, row) => {
          items.push(row);
        },
        () => {
          res.send(items);
        }
      );
    });
  } else {
    res.status(200).send("{'status': 'Missing data'}");
  }
});

app.delete("/card/:card_number", (req, res) => {
  let card = req.params.card_number;
  if (card && Number(card) && card.length == 4) {
    db.run("DELETE FROM purchases WHERE cardNumber = '" + card + "';");
    res.status(200).send("{'status': 'ok'}");
  } else {
    res.status(200).send("{'status': 'Invalid card number'}");
  }
});

app.listen(PORT, () => {
  console.log("Yay! Server started");
});
