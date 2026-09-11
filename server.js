require('dotenv').config();
const express = require('express');
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const estadiaRoutes = require('./src/routes/estadia.routes');
app.use('/estadia', estadiaRoutes);
const veiculoRoutes = require('./src/routes/veiculo.routes');
app.use('/veiculo', veiculoRoutes);

app.use('/',(req, res)=>{
  res.json("API estacionamento online");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
