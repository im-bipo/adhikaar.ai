import express from 'express'
const app = express()
const port = 4000


app.get('/', (req, res) => {
    res.json({res: "Hello World!"})   
})

app.listen(port, ()=>{{
    console.log("App is running in port: ",port)
}})
