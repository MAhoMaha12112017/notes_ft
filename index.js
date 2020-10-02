let notes = [
  {
    id: 1,
    content: "HTML is easy",
    date: "2020-01-10T17:30:31.098Z",
    important: true
  },
  {
    id: 2,
    content: "Browser can execute only Javascript",
    date: "2020-01-10T18:39:34.091Z",
    important: false
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    date: "2020-01-10T19:20:14.298Z",
    important: true
  }
]

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Note = require('./models/note');
const app = express();

app.use(express.static('build'));
app.use(express.json());
// app.use(logger);
app.use(cors());

const PORT = process.env.PORT;

app.get('/', (req, res) => {
  res.status(200).send('<h1>Hello world!</h1>')
})

app.get('/api/notes', (req, res) => {
  Note.find({}).then(notes => {
    res.json(notes);
  }) 
});

app.get('/api/notes/:id', (req, res, next) => {
  Note.findById(req.params.id)
  .then(note => {
    if (note) {
      res.json(note)
    } else {
      res.status(404).end();
    }
  })
  .catch(error => {
    console.log(error => next(error));
    res.status(400).send({ error: 'malformatted id'});
  })
});

app.post('/api/notes', (req, res, next) => {
  const body = req.body;
  if (!body.content) {
    return res.status(400).json({
      error: 'content missing'
    });
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date()
  })

  note.save().then(savedNote => {
    res.json(savedNote);
    notes = notes.concat(savedNote);
  })
  .catch(error => next(error))
});

app.delete('/api/notes/:id', (req, res, next) => {
  Note.findByIdAndRemove(req.params.id)
  .then(result => {
    res.status(204).end()
  })
  .catch(error => next(error))
  // notes = notes.filter(note => note.id !== id);
  // res.status(204).end();
});

app.put('/api/notes/:id', (req, res, next) => {
  const body = req.body;
  console.log(req.params.id)
  const note = {
    content: body.content,
    important: body.important
  }

  Note.findByIdAndUpdate(req.params.id, note, {new: true})
  .then(updatedNote => {
    console.log(updatedNote);
    res.json(updatedNote)
  })
  .catch(error => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.log(error.message);
  if (error.name === 'CastError') {
    return response.status(400).send({error: 'malformatted id'});
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({error: error.message})
  }
  next(error);
}

app.use(errorHandler);

// const generateID = () => {
//   const maxId = notes.length > 0 ?
//     Math.max(...notes.map(n => n.id))
//     : 0;
//   return maxId + 1;
// }

const unknownEndpoint = (request, response) => {
  response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint);

app.listen(PORT);
console.log(`Server running in port ${PORT}`);

// const requestLogger = (request, response, next) => {
//   console.log('Method', request.method);
//   console.log('Path', request.path);
//   console.log('Body', request.body);
//   console.log('--------');
//   next();
// }

// app.use(requestLogger);
// const password = process.argv[2];
// if (process.argv.length < 3) {
//   console.log('give password as argument');
//   process.exit(1);
// }