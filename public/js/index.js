//main functions of the chatting room

var socket = io('http://localhost:3000')
var username, avatar
//part1 login
//(1)choose avatar
$('#login_avatar li').on('click', function(){
    $(this).addClass('now').siblings().removeClass('now')
})
//login
$('#loginBtn').on('click', function(){
    //get username and pic
    var username = $('#username').val().trim()
    if (!username){
        alert('please input your username!')
        return
    }
    var avatar = $('#login_avatar li.now img').attr('src')
    console.log(username, avatar)

    //send data to server
    socket.emit('login', {
        username: username,
        avatar: avatar
    })
})



//listen to login requests: fail/success
socket.on('loginError', data=>{
    alert('Username has been resgitered!')
})

socket.on('loginSuccess', data=>{
    $('.login_box').fadeOut()
    $('.container').fadeIn()
    $('.avatar_url').attr('src',data.avatar) 
    $('.user-list .username').text(data.username)
    username = data.username
    avatar = data.avatar
})

socket.on('addUser', data=>{
    $('.box-bd').append(`
        <div class="system">
            <p class="message_system">
                <span class="content">${data.username} entered the chatting room</span>
            </p>
        </div>
    `)
})

socket.on('userList', (users, index)=>{
    $('#chatName').text('Group Chatting('+users.length+')')
    $('.user-list ul').html('')
    $('.user-list ul').append(`
        <li class="user">
            <div class="avatar"><img src="images/group.jpg" alt=""></div>
            <div class="name">Group Chatting</div>
        </li>
    `)
    users.forEach(item => {
        $('.user-list ul').append(`
            <li class="user">
                <div class="avatar"><img src="${item.avatar}" alt=""></div>
                <div class="name">${item.username}</div>
            </li>
        `)
    })
})

socket.on('delUser', data=>{
    $('.box-bd').append(`
        <div class="system">
            <p class="message_system">
                <span class="content">${data.username} left the chatting room</span>
            </p>
        </div>
    `)
})

$('.btn-send').on('click', ()=>{
    var content = $('#content').val().trim()
    $('#content').val('')
    if (!content){
        return alert('please type some words')
    } 
    socket.emit('sendMsg', {
        msg: content,
        username: username,
        avatar: avatar
    })
})

socket.on('receiveMsg', data=>{
    if (data.username == username){
        $('.box-bd').append(`
            <div class="message-box">
                <div class="my message">
                    <img src="${data.avatar}" alt="" class="avatar">
                    <div class="content">
                        <div class="bubble">
                        <div class="bubble_cont">${data.msg}</div>
                        </div>
                    </div>
                </div>
            </div>
        `)
    }   else {
        $('.box-bd').append(`
            <div class="message-box">
            <div class="other message">
            <img src="${data.avatar}" alt="" class="avatar">
            <div class="nickname">${data.username}</div>
            <div class="content">
                <div class="bubble">
                <div class="bubble_cont">${data.msg}</div>
                </div>
            </div>
            </div>
        </div>
        `)
    }
})