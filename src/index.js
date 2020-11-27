const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const { exec } = require('child_process');

const app = express();

// middlewares
app.use(fileUpload({ createParentPath: true })); // files upload
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 8080;

app.post('/upload-file', async (req, res) => {
  console.log(req.body);
  try {
    const image = req.files.image;
    const name = req.body.name;
    image.mv(`./uploads/${image.name}`);
    const { stdout } = exec(
      `python src/aws/uploadImages.py ${image.name} ${name}`
    );
    stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });
    res.send({ message: 'File uploaded' });
  } catch (error) {
    res.status(404);
    res.send({ message: 'Any image was provided' });
  }
});

app.post('/recognice-face', async (req, res) => {
  const image = req.files.image;
  image.mv(`./faces/${image.name}.png`);
  const { stdout, stderr } = exec(
    `python src/aws/checkImage.py faces/${image.name}.png`
  );
  stdout.on('data', (data) => {
    let dataA = data.split('\n');
    try {
      const name = dataA[dataA.length - 2];
      if (name.trim() === 'No match found in person lookup') {
        res.send({ message: 'No reconocido' });
      } else {
        res.send({ message: 'Reconocido', name });
      }
    } catch (error) {
      res.status(404);
      res.send({ message: 'Error' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server on port ${port}`);
});
