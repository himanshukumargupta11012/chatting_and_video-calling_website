



// var HOST = location.origin.replace(/^http/, 'ws')
// ws = new WebSocket(HOST);


// ws = new WebSocket("ws://localhost:5500")

user_name = document.getElementById("name");

user_name.addEventListener("keypress", nameVerify);

function nameVerify(event) {
    user_name = document.getElementById("name");
    if (user_name != null && event.key == "Enter") {
        console.log(JSON.stringify({ name: user_name.value }))
        ws.send(JSON.stringify({ name: user_name.value }))
    }
}

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

ws.onmessage = (data) => {

    const msg = data.data

    if (isJson(msg)) {
        obj = JSON.parse(msg)
        
        if (obj.names != null) {
            select = document.getElementById("to")  

            console.log(select.options.length)


            for(i=select.options.length-1;i>=0;i--) {
                select.remove(i);
            }
            new_option = document.createElement("option")
            text = document.createTextNode('all')
            new_option.appendChild(text)
            new_option.setAttribute('value', 'all')
            select.appendChild(new_option)

            for(i=0;i<obj.names.length;i++){
                // alert(user_name.value)
                if(user_name.value!=obj.names[i]){
                    new_option = document.createElement("option")
                    text = document.createTextNode(obj.names[i])
                    new_option.appendChild(text)
                    new_option.setAttribute('value', obj.names[i])
                    select.appendChild(new_option)
                }

            }

            
            
        }
    }
    else {
        ul = document.getElementById("output")
        li = document.createElement("li")
        li.appendChild(document.createTextNode(msg))
        ul.appendChild(li)
    }
}

ws.onerror = (erro) => {
    document.write(erro)
}

ws.onclose = () => {
    select = document.getElementById("to")  

    console.log(select.options.length)
    for(i=0;i<select.options.length;i++) {
        select.remove(i);
    }
    console.log("connection closed")
}

self_msg = document.getElementById("self_msg")
self_msg.addEventListener("keypress", sendMessage);




function sendMessage(event) {
    to = document.getElementById("to");
    self_msg = document.getElementById("self_msg")
    if (to != null && self_msg != null && event.key == "Enter") {
        console.log(JSON.stringify({
            receiver: to.value,
            message: self_msg.value
        }))
        ws.send(JSON.stringify({
            receiver: to.value,
            message: self_msg.value
        }))
    }
}


