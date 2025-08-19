const express = require('express');
const app = express();  
const PORT = 8000;

app.get('/', (req, res) => {
    res.send('Server is up and running!');
});

app.get('/api/data', (req, res) => {
  res.json({
    status: 'success',
    message: 'Here is your data!',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`);
});