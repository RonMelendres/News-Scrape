var express = require("express");
var exphbs = require("express-handlebars")
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 9000;

var app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/9000";


app.use(express.static("public"));

mongoose.connect("mongodb://localhost/9000", { useNewUrlParser: true });

app.get("/", function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {

            var stuff = {
                article: dbArticle,
            }

            res.render("index", stuff);
            console.log(dbArticle);
            
        }).catch(function (err) {
            res.json(err);
            
        });
});

app.get("/scrape", function (req, res) {
    axios.get("https://abcnews.go.com/").then(function (response) {
        var $ = cheerio.load(response.data);

        $("h1").each(function (i, element) {
            var result = {};

            result.title = $(this)
                .find("a")
                .text();

            result.link = $(this)
                .children("a")
                .attr("href");

            db.Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    console.log(err);
                });
        });

        res.send("Scrape Complete");
    });
});

app.get("/articles", function (req, res) {
    db.Article.find({})
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err)
        });
});

app.get("/articles/:id", function (req, res) {
    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        })
})

app.post("/articles/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);

        })
        .catch(function (err) {
            res.json(err);
        });
});

app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});

mongoose.connect(MONGODB_URI);

