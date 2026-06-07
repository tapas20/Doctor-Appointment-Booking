import express from 'express';
import http from 'http';
const app = express();

app.use(express.json());

app.get('/test', (req, res, next) => {
  req.body = req.body || {};
  req.body.docId = "123";
  next();
}, (req, res) => {
  res.json({ success: true, body: req.body });
});

app.listen(4001, () => {
  console.log("Listening on 4001");
  http.get('http://127.0.0.1:4001/test', (resp) => {
    let data = '';
    resp.on('data', (chunk) => { data += chunk; });
    resp.on('end', () => {
      console.log("Response:", data);
      process.exit(0);
    });
  });
});
