const Reel = require("../models/Reel");

exports.createReel = (req, res) => {
  const reel = new Reel({
    userId: req.body.userId,
    videoUrl: req.body.videoUrl,
    description: req.body.description
  });

  reel.save((err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || 'Some error occurred while creating the reel.'
      });
    }
    res.send(data);
  });
};

exports.likeReel = (req, res) => {
  Reel.findByIdAndUpdate(
    req.params.reelId,
    { $inc: { likes: 1 } },
    { new: true }
  )
    .then(data => {
      if (!data) {
        return res.status(404).send({
          message: `Reel not found with id ${req.params.reelId}.`
        });
      }
      res.send(data);
    })
    .catch(err => {
      return res.status(500).send({
        message: `Error updating reel with id ${req.params.reelId}.`
      });
    });
};

exports.commentOnReel = (req, res) => {
  Reel.findByIdAndUpdate(
    req.params.reelId,
    {
      $push: {
        comments: {
          userId: req.body.userId,
          text: req.body.commentText
        }
      }
    },
    { new: true }
  )
    .then(data => {
      if (!data) {
        return res.status(404).send({
          message: `Reel not found with id ${req.params.reelId}.`
        });
      }
      res.send(data);
    })
    .catch(err => {
      return res.status(500).send({
        message: `Error updating reel with id ${req.params.reelId}.`
      });
    });
};

exports.getReels = (req, res) => {
  Reel.find({}, (err, data) => {
    if (err) {
      return res.status(500).send({
        message: err.message || 'Some error occurred while retrieving reels.'
      });
    }
    res.send(data);
  });
};