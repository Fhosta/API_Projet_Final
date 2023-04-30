const express = require('express')
const mysql = require('mysql')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 8080

app.listen(port, () => console.log('Listen on port ' + port))
//Mysql

app.use(function (req, res, next) {
  res.locals.connection = mysql.createConnection({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'CO2',
  })
  res.locals.connection.connect()
  next()
})
const corsOptions = {
  origin: '*',
  method: 'GET,PUT,POST,DELETE,OPTIONS',
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))

// JSON body parser, there is no `extended` option here
app.use(express.json())

// URL-encoded body parser
app.use(express.urlencoded({ limit: '20mb', extended: true }))


/////////////////////////Connexion////////////////////////


//API CONNEXION

app.post('/api/login', function (req, res) {
  const { username, password } = req.body
  console.log (username,password)
  // SQL query to check if user exists and password is correct
  const query = `SELECT * FROM utilisateur WHERE login = '${username}' AND password = '${password}'`

  // Execute the SQL query
  res.locals.connection.query(query, function (err, rows) {
    if (err) {
      console.log(err)
      res.status(500).send('Internal server error')
    } else if (rows.length == 0) {
      res.status(401).send('Invalid username or password')
    } else {
      const utilisateur = rows[0]
      // Successful login, send back the user data
      res.send({
        id: utilisateur.id,
        login: utilisateur.login,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        idRole: utilisateur.idRole,
      })
    }
  })
})


//API Paramètre

app.get('/api/getParametre', function (req, res, next) {
  res.locals.connection.query('Select * from parametre', function (error, results, fields) {
    if (error) throw error
    res.json(results)
  })
})

app.put('/api/parametre', (req, res) => {
  const { CO2Max, CO2Min, TVOCMin,TVOCMax} = req.body
  
  console.log(CO2Max, CO2Min, TVOCMin,TVOCMax)
  const sql =
    'UPDATE parametre SET CO2Max = ?, CO2Min = ?, TVOCMin = ?, TVOCMAX = ?'
  res.locals.connection.query(
    sql,
    [CO2Max, CO2Min, TVOCMin,TVOCMax],
    (err, results) => {
      if (err) {
        console.error('Error updating data: ', err)
        res.status(500).send('Error updating data')
        return
      } else {
        console.log('Data updated successfully')
        res.send(results)
      }
    },
  )
})

