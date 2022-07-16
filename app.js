const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
// connecting mongoose
const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://yogesh:yogesh@cluster0.vddpgm4.mongodb.net/?retryWrites=true&w=majority", () => {
  console.log("mongoose connected");
});


app.get('/', (req, res) => {
  res.send('hello world')
})
//built-in middleware
app.use(express.json());
app.use(cors());
//user routes
app.use("/api/v1", require("./routes/UserRoute"));



app.listen(port, () => {
  console.log(`Server Started on port ${port}`)
})