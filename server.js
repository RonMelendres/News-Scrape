var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio= require("cheerio");

var db = require("./models");

// var PORT = 9000;

var app = express();

app.use(logger("dev"));

app.use(express.urlencoded({extended: true}));

app.use(express.json());

app.use(express.static("public"));

mongoose.connect("mongodb://localhost/9000", {useNewUrlParser: true});

app.get("/scrape", function(req, res) {
    axios.get("https://abcnews.go.com/").then(function(response) {
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
            .then(function(dbArticle) {
                console.log(dbArticle);
            })
            .catch(function(err) {
                console.log(err);
            });
        });

        res.send("Scrape Complete");

    });
});





// app.listen(PORT, function() {
//     console.log("App running on port " + PORT + "!");
// });



