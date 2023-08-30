
const express = require('express')
const { Server } = require('ws');
var path = require('path');

const app = express()
const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

// public files
app.use(express.static(path.join(__dirname, 'public')));
app.get('/public/output.css', (req, res) => {
    res.sendFile(__dirname + '/public/output.css')
})
app.get('/public/client.js', (req, res) => {
    res.sendFile(__dirname + '/public/client.js')
})


function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

const server = app
    .get('*', (req, res) => res.sendFile(INDEX, { root: __dirname }))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));



const webServer = new Server({ server });


webServer.on('listening', () => {
    console.log("server started")
})

const client2 = [];

webServer.on("connection", (self) => {
    console.log("connected")

    
    self.on('message', (messag) => {

        if (isJson(messag.toString())) {
            let object = JSON.parse(messag.toString())

            console.log(object.type)
            
            client2.forEach((client) => {
                if (client.id == self)
                    sender = client.name
            })

            if (object.type == 'store_name') {
                client2.push({
                    name: object.name,
                    id: self
                })
                old_names = {
                    type: "add_old",
                    names: []
                };
                client2.forEach((client)=>{
                    if(client.id != self) {
                        old_names.names.push(client.name)
                    }
                })
                self.send(JSON.stringify(old_names));

                new_name = { 
                    type: "add_new",
                    name: object.name
                }

                client2.forEach((client) => {
                    if (client.name != null && client.id != self) 
                    client.id.send(JSON.stringify(new_name))
                })
            }
            else if (object.type == "send_message") {

                client2.forEach((client) => {

                    if (client.name == object.receiver) {
                        client.id.send(JSON.stringify({
                            type: "msg",
                            sender: sender,
                            msg: object.message
                        }))
                    }
                    else if ('all' === object.receiver && client.id != self) {
                        client.id.send(JSON.stringify({
                            type: "msg",
                            sender: sender,
                            msg: object.message
                        }))
                    }
                })
                // self.send(JSON.stringify({
                //     type: "msg",
                //     sender: "you",
                //     msg: object.message
                // }))
            }
            else if (object.type == "request_video_call") {
                client2.forEach((client) => {

                    if (client.name == object.to) {
                        client.id.send(JSON.stringify({
                            type: "request_video_call",
                            from: sender
                        }))
                    }
                    else if ('all' === object.receiver && client.id != self) {
                        client.id.send(JSON.stringify({
                            type: "request",
                            msg: sender + ' is doing group video call'
                        }))
                    }
                })
                self.send(JSON.stringify({
                    type: "wait_for_accept",
                    msg: 'requesting to' + object.receiver
                }))
            }

            else if (object.type == 'answer_video_call') {
                client2.forEach((client) => {

                    if (client.name == object.to) {
                        client.id.send(JSON.stringify({
                            type: "answer_video_call",
                            answer: object.answer,
                            from: sender
                        }))
                    }
                })
            }
            else if (object.type == 'offer') {
                client2.forEach((client) => {
                    if (client.name == object.to) {
                        client.id.send(JSON.stringify({
                            type: "offer",
                            offer: object.offer,
                            from: object.from
                            // msg:sender + ' is video calling you'
                        }))
                    }
                    else if ('all' === object.receiver && client.id != self) {
                        client.id.send(JSON.stringify({
                            type: "offer",
                            offer: object.offer,
                            // msg:sender + ' is doing group video call'
                        }))
                    }
                })
            }
            else if (object.type == 'answer') {
                client2.forEach((client) => {
                    if (client.name === object.to) {
                        client.id.send(JSON.stringify({
                            type: 'answer',
                            answer: object.answer,
                            from: object.from
                        }))
                    }
                })
            }
            else if (object.type == 'send_candidate') {
                client2.forEach((client) => {

                    if (client.name == object.to) {
                        client.id.send(JSON.stringify({
                            type: "store_candidate",
                            candidate: object.candidate,
                            from: sender
                        }))
                    }
                })
            }
            else if (object.type == 'end_call') {
                client2.forEach((client) => {
                    if (client.name == object.other) {
                        client.id.send(
                            JSON.stringify({
                                type: "end_call",
                                other: object.other
                            })
                        )
                    }
                })
            }

        }

    })

    self.on("close", () => {
        user_name = { 
            type: "remove_user"
        }
        client2.forEach((client) => {
            if (client.id == self) {
                user_name.name = client.name;
                return;
            }
        })
        client2.forEach((client) => {
            client.id.send(JSON.stringify(user_name))
        })
        console.log("connection closed")
    })
})

