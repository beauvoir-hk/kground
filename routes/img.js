const express = require("express");
const app = express();

app.post("/", (req, res) => {
  const file = req.files.image;
  const reader = new FileReader();

  reader.onload = function(event) {
    const image = new Image();
    image.src = event.target.result;
    res.send(image);
  };

  reader.readAsDataURL(file);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});