var app = require('express')()
var server = require('http').Server(app)
var io = require('socket.io')(server)

const users = []

server.listen(3000, ()=>{
    console.log('server set up!')
})

app.use(require('express').static('public'))

app.get('/', function(req, res){
    res.redirect('/index.html')
})

io.on('connect', function(socket){
    console.log('user connected!')


    socket.on('login', data=>{
        console.log(data)
        let user = users.find(item => item.username === data.username)
        if (user){
            socket.emit('loginError', {msg:'Login error'})
            console.log('login failed!')
        }   else {
            users.push(data)
            socket.emit('loginSuccess', data)
            console.log('login succeeded!')
            //io.emit == broadcast, socket.emit == tell the current client
            io.emit('addUser', data)

            io.emit('userList', users, users.length-1)

            socket.username = data.username
            socket.avatar = data.avatar
        }
    })

    socket.on('disconnect', ()=>{
        let index = users.findIndex(item => item.username === socket.username)
        users.splice(index, 1)
        io.emit('delUser', {
            username: socket.username,
            avatar: socket.avatar
            
        })
        io.emit('userList', users, users.length-1)
    })

    socket.on('sendMsg', data=>{
        console.log(data)
        io.emit('receiveMsg', data)
    })
})



