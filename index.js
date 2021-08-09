const express = require("express");
const app = express();

const bodyparse = require("body-parser");
var admin = require("firebase-admin");
app.use(express.json());

var serviceAccount = require("./serviceaccount.json"); //Add your serviceaccount.json path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://torrentserver-8847c-default-rtdb.asia-southeast1.firebasedatabase.app",
});

var database = admin.database();
var ref = database.ref("/TorrentAdded");
app.get("/getAllTorrent", (req, res) => {
  ref.once("value", function (snapshot) {
    if (snapshot.val() == null) {
      res.json({ message: "empty torrent" });
    } else {
      var snap = snapshot.val();
      var arrayOfTorrents = [];
      var keys = Object.keys(snap);
      console.log(keys);
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        var firebase_id = keys[i];
        var isDelete = snap[k].isDelete;
        var isDeleteWithData = snap[k].isDeleteWithData;
        var isPause = snap[k].isPause;
        var left_until_done = snap[k].left_until_done;
        var title = snap[k].name;
        var progress = snap[k].progess;
        var rate_downloaded = snap[k].rate_download;
        var status = snap[k].status;
        var total_size = snap[k].total_size;
        var id = snap[k].id;

        var torrentObj = new TorrentModel(
          id,
          isDelete,
          isDeleteWithData,
          isPause,
          left_until_done,
          title,
          progress,
          rate_downloaded,
          status,
          total_size,
          firebase_id
        );
        arrayOfTorrents.push(torrentObj);
      }
      console.log(arrayOfTorrents);
      res.send(arrayOfTorrents);
    }
  });
});
app.get("/pause/:firebase_id", (req, res) => {
  var firebase_id = req.params.firebase_id;
  ref.child(firebase_id).update({ isPause: 2 });
  res.send({ message: "success" });
});

app.get("/start/:firebase_id", (req, res) => {
  var firebase_id = req.params.firebase_id;
  ref.child(firebase_id).update({ isPause: 3 });
  res.send({ message: "success" });
});

app.get("/delete/:firebase_id", (req, res) => {
  var firebase_id = req.params.firebase_id;
  ref.child(firebase_id).update({ isDelete: true });
  res.send({ message: "success" });
});
app.get("/deletewithdata/:firebase_id", (req, res) => {
  var firebase_id = req.params.firebase_id;
  ref.child(firebase_id).update({ isDeleteWithData: true });
  res.send({ message: "success" });
});
app.post("/addTorrent", (req, res) => {
  const addTorrent = {
    magnetlinks: req.body.magnetlinks,
    isAdded: false,
  };
  var ref = database.ref("/TorrentToBeAdded");
  ref.push().set(addTorrent);
  res.json({ message: "success" });
});
var port_number = process.env.PORT || 3000;
app.listen(port_number);

class TorrentModel {
  constructor(
    id,
    isDelete,
    isDeleteWithData,
    isPause,
    left_until_done,
    title,
    progress,
    rate_downloaded,
    status,
    total_size,
    firebase_id
  ) {
    this.id = id;
    this.isDelete = isDelete;
    this.isDeleteWithData = isDeleteWithData;
    this.isPause = isPause;
    this.left_until_done = left_until_done;
    this.title = title;
    this.progress = progress;
    this.rate_downloaded = rate_downloaded;
    this.status = status;
    this.total_size = total_size;
    this.firebase_id = firebase_id;
  }
}
