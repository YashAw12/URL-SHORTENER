const express = require("express");
const app = express();
const mongoose = require("mongoose");
const shortId = require("shortid");
const bodyParser = require("body-parser");


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://yash-admin:mm68Epg1jF8ZpCcx@cluster0.o1dcash.mongodb.net/shortUrlDB", {useNewUrlParser: true},)


const itemsSchema = new mongoose.Schema({
  full: {
    type: String,
    required: true
  },
  note: {
    type: String,
    
  },
  short: {
    type: String,
    required: true,
    default: shortId.generate
  },
  clicks: {
    type: Number,
    required: true,
    default:0
  }
});
const Item = mongoose.model("Item", itemsSchema);



app.get("/", function(req, res) {
  
  Item.find({})
  .then(savedItem => {
    res.render("list", {
            newListItems: savedItem
    });
  })
  .catch(err => console.log(err));


});

app.post("/shortUrl", function(req, res){
  const item=new Item({
    full: req.body.fullUrl,
    note: req.body.note
  });
  
    

  item.save()
  
  .then(function(newsaveditem){
    console.log("URL is saved");
        res.redirect("/");
      })
       .catch(err => console.log(err));
});

app.post("/search", function(req,res){
  const agg = [
    {
      $search: {
        compound:{
          should: [{
              autocomplete : {
          query: req.body.searchText,
           path: "full",},
                             },
        {
                    autocomplete : {
            query: req.body.searchText,
             path: "note",},
        },
        {
                    autocomplete : {
            query: req.body.searchText,
             path: "short",},
        } ,                    
                            ],
                            },
                                },
    },
    {
      $limit: 5,
    },
  
  ];
  
  Item.aggregate(agg)
  .then(savedItem => {
    res.render("search", {
            newListItems: savedItem
    })
  })
.catch(err => console.log(err))

})

app.post("/back", function(req,res){
  res.redirect("/");
})

app.get("/:any", function (req,res) {
   Item.findOne({short: req.params.any})
   .then((foundItem)=> {
    if (foundItem == null)
      return res.sendStatus(404);
      else {
        return foundItem
      }
       })
   .then((foundItem)=> {
    foundItem.clicks++;
    foundItem.save();
    res.redirect(foundItem.full);
   })
   .catch(err => console.log(err))
  
  
})



app.listen(process.env.PORT || 3000, function() {
    console.log("Server started on port 3000");
  });
  