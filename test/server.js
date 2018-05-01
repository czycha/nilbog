const path = require('path')
const express = require('express')

const app = express()

app.use(express.static(path.join(__dirname, 'browser')))

app.listen(4444)