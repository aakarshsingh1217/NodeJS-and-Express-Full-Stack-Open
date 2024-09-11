const express = require('express')
const morgan = require('morgan');
const cors = require('cors')
const app = express()
require('dotenv').config()
app.use(cors())
app.use(express.static('dist'))

const Person = require('./models/note')

let persons = [
]

app.use(express.json())
morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (request, response) => {
    const currentTime = new Date();
    Person.countDocuments({}).then(count => {
        response.send(`<p>Phonebook has info for ${count}
            people</p><p>${currentTime}</p>`)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person) {
          response.json(person)
        } else {
          response.status(404).end()
        }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response) => {
    Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if(!body.name || !body.number) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
  
    const person = {
      name: body.name,
      number: body.number,
    }
  
    Person.findByIdAndUpdate(request.params.id, person, {new: true})
      .then(updatedPerson => {
        response.json(updatedPerson)
      })
  })

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({error: 'malformatted id'})
    }
  
    next(error)
  }
  
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})