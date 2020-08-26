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
    $('#groupchatting').append(`
        <div class="system">
            <p class="message_system">
                <span class="content">${data.username} entered the chatting room</span>
            </p>
        </div>
    `)
    scrollIntoView1()
})

socket.on('userList', (users, index)=>{
    $('#chatName').text('Group Chatting('+users.length+')')
    $('.user-list ul').html('')
    $('.user-list ul').append(`
        <li class="user selected">
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
    $('#listusers li').on('click', function(){
        $(this).addClass('selected').siblings().removeClass('selected')
        if ($('.selected .name').text() === "Group Chatting"){
            $('#chatName').text('Group Chatting('+users.length+')')
            $('#groupchatting').show()
            $('#groupchatting').siblings().hide()
        }   else {
            var str = "#personal_"+$('.selected .name').text()
            if($(str).length <= 0){
        
                var box = document.createElement("div")
                box.setAttribute("id", "personal_"+$('.selected .name').text())
                $('#chattingbox').append(box)
                
            }
            $(str).show()
            $(str).siblings().hide()
            $('#chatName').text($('.selected .name').text())
        } 
    })
})






socket.on('delUser', data=>{
    $('#groupchatting').append(`
        <div class="system">
            <p class="message_system">
                <span class="content">${data.username} left the chatting room</span>
            </p>
        </div>
    `)
    $('#personal_'+data.username).remove()
    scrollIntoView1()
})

$('#btn-send').on('click', ()=>{
    var content = $('#content').html().trim()
    $('#content').html('')
    if (!content){
        return alert('please type some words')
    } 
    if ($('.selected .name').text() === "Group Chatting"){
        socket.emit('sendMsg', {
            msg: content,
            username: username,
            avatar: avatar
        })
    }   else {
        socket.emit('sendPersonalMsg', {
            msg: content,
            username: username,
            avatar: avatar,
            targetname: $('.selected .name').text()
        })
    }
})

socket.on('receiveMsg', data=>{
    if (data.username == username){
        addmymsg('#groupchatting', false, data)
    }   else {
        addothermsg('#groupchatting', false,data)
    }
    scrollIntoView1()
})

socket.on('receivePersonalMsg', data=>{
    console.log("i received the msg")
    var str = "#personal_"+data.targetname
    //auto jump to the msg page
    if($(str).length <= 0){
        var box = document.createElement("div")
        box.setAttribute("id", "personal_"+data.targetname)
        $('#chattingbox').append(box)  
    }
    if (data.username == username){
        addmymsg(str, false, data)
    }   else {
        addothermsg(str, false, data)
    }
    if ($('.selected .name')[0].innerText != data.targetname){
        $(str).hide()
        alert("You have a message from: " + data.targetname)
    }
    scrollIntoView1()
})

socket.on('receivePersonalImg', data=>{
    console.log("i received the msg")
    var str = "#personal_"+data.targetname
    //auto jump to the msg page
    if($(str).length <= 0){
        var box = document.createElement("div")
        box.setAttribute("id", "personal_"+data.targetname)
        $('#chattingbox').append(box)  
    }
    if (data.username == username){
        addmymsg(str, true, data)
    }   else {
        addothermsg(str, true, data)
    }
    if ($('.selected .name')[0].innerText != data.targetname){
        $(str).hide()
        alert("You have a message from: " + data.targetname)
    }
    $('.box-bd img:last').on('load', function(){
        scrollIntoView1()
    })
})




$('#file').on('change', function(){
    var file = this.files[0]
    var fr = new FileReader()
    fr.readAsDataURL(file)
    fr.onload = function(){
        if ($('.selected .name').text().substr(0,14) != "Group Chatting"){
            console.log($('.selected .name').text().substr(0,14))
            socket.emit('sendPersonalImg',{
                username: username,
                avatar: avatar,
                img: fr.result,
                targetname: $('.selected .name').text()
            })
        }
        else {
            socket.emit('sendImg', {
                username: username,
                avatar: avatar,
                img: fr.result,
            })
        }
    }
})

socket.on('receiveImage',data=>{
    if (data.username == username){
        addmymsg('#groupchatting',true,data)
    }   else {
        addothermsg('#groupchatting',true,data)
    }
    $('.box-bd img:last').on('load', function(){
        scrollIntoView1()
    })
})

function scrollIntoView1() {
    $('.box-bd').children(':last').get(0).scrollIntoView(false)
}





function addmymsg(id, isImg, data){
    if (isImg){
        $(id).append(`
        <div class="message-box">
            <div class="my message">
                <img src="${data.avatar}" alt="" class="avatar">
                <div class="content">
                    <div class="bubble">
                    <div class="bubble_cont">
                        <img src="${data.img}">
                    </div>
                    </div>
                </div>
            </div>
        </div>
    `)
    }   else {
        $(id).append(`
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
    }
}

function addothermsg(id, isImg, data){
    if (isImg){
        $(id).append(`
            <div class="message-box">
            <div class="other message">
            <img src="${data.avatar}" alt="" class="avatar">
                <div class="nickname">${data.username}</div>
                <div class="content">
                    <div class="bubble">
                    <div class="bubble_cont">
                        <img src="${data.img}">
                    </div>
                </div>
                </div>
                </div>
            </div>
        `)
    }   else {
        $(id).append(`
        <div class="message-box">
        <div class="other message">
        <img src="${data.avatar}" alt="" class="avatar">
        <div class="nickname">${data.username}</div>
        <div class="content">
            <div class="bubble">
            <div class="bubble_cont">
            ${data.msg}
            </div>
            </div>
        </div>
        </div>
    </div>
    `)
    }
}

$('.face').on('click', function () {
    $('#content').emoji({
      button: '.face',
      showTab: false,
      animation: 'slide',
      position: 'topRight',
      icons: [{
        name: 'QQ表情',
        path: 'lib/jquery-emoji/img/qq/',
        maxNum: 91,
        excludeNums: [41, 45, 54],
        file: '.gif'
      }]
    })
  })

