var app = require('express')()
var server = require('http').Server(app)
var io = require('socket.io')(server)

const users = []
const client_sockets = []
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
            console.log('login succeeded!'+socket.id)
            //io.emit == broadcast, socket.emit == tell the current client
            io.emit('addUser', data)

            io.emit('userList', users, users.length-1)

            socket.username = data.username
            socket.avatar = data.avatar
            client_sockets.push({
                username: socket.username,
                socketid: socket.id
            })
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

    socket.on('sendPersonalMsg', data=>{
        console.log(data)
        let user = client_sockets.find(item => item.username === data.targetname)
        if (user) console.log("haha")
        io.to(user.socketid).emit('receivePersonalMsg',{
            username: data.username,
            msg: data.msg,
            avatar: data.avatar,
            targetname: data.username
        })
        socket.emit('receivePersonalMsg', data)
    })

    socket.on('sendImg', data=>{
        io.emit('receiveImage', data)
    })

    socket.on('sendPersonalImg',data=>{
        let user = client_sockets.find(item => item.username === data.targetname)
        io.to(user.socketid).emit('receivePersonalImg',{
            username: data.username,
            img: data.img,
            avatar: data.avatar,
            targetname: data.username
        })
        socket.emit('receivePersonalImg', data)
    })

})





