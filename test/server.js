const path = require('path')
const express = require('express')
const chalk = require('chalk')

const app = express()
app.use(express.static(path.join(__dirname, 'browser')))

let port = 4444
const index = Math.max(process.argv.indexOf('--port'), process.argv.indexOf('-p'))
if(index !== -1) {
	port = +process.argv[index + 1] || port
}

app.listen(port)
console.log(`Server started at ${chalk.green(`http://localhost:${port}/`)}`)