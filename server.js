const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const db             = require('./config/db');
const port           = process.env.PORT || 3000;
const app            = express();

var cors             = require('cors');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

MongoClient.connect( db.url , (err, database) => {
    if (err) return console.log(err);
    database = database.db(db.DB_NAME);
    require('./app/routes') (app, database);
    
    console.log("connected to mongo")
});

require('./app/routes') (app, {});
app.listen(port, () =>{
    console.log('we are live on ' + port);
});

app.get("/bid",(req,res)=>{
    app.use(cors());
    console.log(req.query);
    
    MongoClient.connect(db.url, (err,database) => {
        if (err){
            console.log(err);
            res.send("failed");
        }
        
        var dbo = database.db(db.DB_NAME);
        require('./app/routes') (app, database);
        
        dbo.collection("ipl").findOneAndUpdate(
            {"name": req.query.name},
            { $inc: {"current_bid" : 500000} },
        );
        dbo.collection("ipl").findOneAndUpdate(
            {"name": req.query.name},
            { $set: {"team_bidding" : req.query.team_name} }, 
        );
        console.log(req.query.team_name);
    });
    res.send("success");
});
        
app.get('/send', (req,res) => {
    app.use(cors());
    MongoClient.connect(db.url, (err,database) => {
        if (err){
            console.log(err);
            res.send("failed");
        }

        var dbo = database.db(db.DB_NAME);
        require('./app/routes') (app,database);

        dbo.collection('ipl').find({}).toArray(function(err, result){
            if (err){
                console.log(err);
                res.send("failed");
            }

            res.send(result);
        })
    })
})


app.get('/populate', (req, res) => {
    app.use(cors());
    MongoClient.connect(db.url, (err,database) => {
        if (err){
            console.log(err);
            res.send("failed");
        }
        
        var dbo = database.db(db.DB_NAME);
        require('./app/routes') (app, database);
        
        var item = {"name": req.query.name,
                    "nationality": req.query.nationality,
                    "current_bid": parseInt(req.query.current_bid),
                    "base_price": req.query.base_price,
                    "bowler": req.query.bowler,
                    "batting": req.query.batting,
                    "wk" : req.query.wk,
                    "team_bidding": "null",
                    "image": req.query.image}
        dbo.collection("ipl").insertOne(item, (err, res) => {
            if (err){
                console.log(err);
                res.send("failed");
            }
            console.log("amazing");
        });
    });
    res.send("success");
})