const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const isEqual = require("lodash.isequal");
let db = require("./db.json");
const app = express();
const port = 3000;

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/allmovies", (req, res) => {
  const movieTitles = db.map((selectedMovie) => {
    return selectedMovie.title;
  });
  res.send(movieTitles);
});

app.get("/allmovies/:year", (req, res) => {
  const movieYear = Number(req.params.year);

  const moviesByYear = db.filter((oneMovie) => {
    return movieYear === oneMovie.year;
  });
  res.send(moviesByYear);
});

app.post("/add-movie", (req, res, next) => {
  const doesItAlreadyExist = checksElementExistence(req.body);
  if (doesItAlreadyExist === undefined) {
    res.status(409).send("Already Exists...");
  }
  saveNewElementToDb(req.body);
  res.status(201).send(db);
});

function saveNewElementToDb(newDbElement) {
  const copyOfNewDbElement = { ...newDbElement, id: db.length + 1 };
  const dbCopy = [...db, copyOfNewDbElement];
  fs.writeFileSync("./db.json", JSON.stringify(dbCopy));
  db = dbCopy;
}

function checksElementExistence(newDbElement) {
  const objectValuesOfNewDbElement = Object.values(newDbElement);
  console.log(objectValuesOfNewDbElement);
  for (const dbElement of db) {
    const { id, ...elementCopy } = dbElement;
    const objectValuesOfElementCopy = Object.values(elementCopy);
    console.log(objectValuesOfElementCopy);

    if (isEqual(objectValuesOfElementCopy, objectValuesOfNewDbElement)) {
      return;
    }
  }
  return newDbElement;
}

app.delete("/delete-movie/:title", (req, res) => {
  const dbWithoutDeletion = db.filter(
    (movie) => movie.title.toLowerCase() !== req.params.title.toLowerCase()
  );
  fs.writeFileSync("./db.json", JSON.stringify(dbWithoutDeletion));
  db = dbWithoutDeletion;
  res.send(dbWithoutDeletion).status(204);
});

app.put("/modify-movie/:title", (req, res) => {
  const arrOfModifiedMovies = db.map((movie) => {
    if (movie.title.toLowerCase() === req.params.title.toLowerCase()) {
      //Modify Bodyof element
      const modifiedElement = { ...req.body, id: movie.id };
      return modifiedElement;
    }
    return movie;
  });
  fs.writeFileSync("./db.json", JSON.stringify(arrOfModifiedMovies));
  db = arrOfModifiedMovies;
  res.send(arrOfModifiedMovies).status(202);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
