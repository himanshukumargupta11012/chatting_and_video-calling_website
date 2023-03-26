
express = require('express')
const { Server } = require('ws');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = express()
    .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));



const webServer = new Server({ server });

// const webSocketSv = require("ws")

// const webServer = new webSocketSv.Server({
//     port: 3000
// })

webServer.on('listening', () => {
    console.log("server started")
})

// const clients=new Map();
const client2 = [];

webServer.on("connection", (self) => {
    console.log("connected")

    function isJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }


    self.on('message', (messag) => {
        // console.log(messag.toString())

        if (isJson(messag.toString())) {
            let object = JSON.parse(messag.toString())
            client2.forEach((client) => {
                if (client.id == self)
                    sender = client.name
            })

            if (object.type == 'store_name') {
                client2.push({
                    name: object.name,
                    id: self
                })
                self.send(JSON.stringify({
                    type: "msg",
                    msg: "hello " + object.name
                }))

                all_names = { names: [] }
                client2.forEach((client) => {
                    if (client.id.readyState === 1)
                        all_names.names.push(client.name)
                })
                client2.forEach((client) => {
                    if (client.name != null) client.id.send(JSON.stringify(all_names))
                })
            }
            else if (object.type == "send_message") {
                // let object = JSON.parse(messag.toString())

                client2.forEach((client) => {

                    if (client.name == object.receiver) {
                        client.id.send(JSON.stringify({
                            type: "msg",
                            msg: sender + ' : ' + object.message
                        }))
                    }
                    else if ('all' === object.receiver && client.id != self) {
                        client.id.send(JSON.stringify({
                            type: "msg",
                            msg: sender + ' : ' + object.message
                        }))
                    }
                })
                self.send(JSON.stringify({
                    type: "msg",
                    msg: 'you to' + object.receiver + ' : ' + object.message
                }))
            }
            else if (object.type == "ask_permission") {
                client2.forEach((client) => {

                    if (client.name == object.to) {
                        client.id.send(JSON.stringify({
                            type: "request",
                            msg: sender + ' is video calling you'
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
            else if (object.type == 'reply') {
                if (object.reply == 'yes') {

                }
            }
            else if (object.type == 'offer') {
                client2.forEach((client) => {
                    console.log(object.from)
                    if (client.name == object.to) {
                        client.id.send(JSON.stringify({
                            type: "offer",
                            offer: object.offer,
                            from: object.from
                            // msg:sender + ' is video calling you'
                        }))
                        console.log("offer sent from server")
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
                console.log("answer is going from server ")
                // console.log(object.to)
                client2.forEach((client) => {
                    // console.log(object.to)
                    if (client.name === object.to) {
                        console.log('yes')
                        client.id.send(JSON.stringify({
                            type: 'answer',
                            answer: object.answer,
                            from: object.from
                        }))
                    }
                })
                
                console.log("answer sent from server ")
                // client2.forEach((client) => {

                //     if (client.name == object.to) {
                //         client.id.send(JSON.stringify({
                //             type: "offer",
                //             offer: object.offer,
                //             from: self
                //             // msg:sender + ' is video calling you'
                //         }))
                //     }
                //     else if ('all' === object.receiver && client.id != self) {
                //         client.id.send(JSON.stringify({
                //             type: "offer",
                //             offer: object.offer,
                //             // msg:sender + ' is doing group video call'
                //         }))
                //     }
                // })
            }
            else if (object.type == 'send_candidate') {
                client2.forEach((client) => {

                    if (client.name == object.to) {
                        client.id.send(JSON.stringify({
                            type: "store_candidate",
                            candidate: object.candidate,
                            from: sender
                            // msg:sender + ' is video calling you'
                        }))
                    }
                })
            }

            // else if(object.type==){}
        }



        // else {
        //     client2.forEach((client) => {
        //         if (client.name == "aman")
        //             client.id.send('\n', object.name, ':', messag.toString());
        //         console.log(messag.toString())
        //     })
        // }

        // webServer.clients.forEach((client)=>{
        //     if(self==client && client.readyState === webSocketSv.OPEN)
        //     client.send(messag.toString());
        //     console.log(client)

        // webServer.clients.forEach((client)=>{
        //     if(self!=client && client.readyState === webSocketSv.OPEN)
        //     client.send(messag.toString());
        //     console.log(client)

        //  });
    })

    self.on("close", () => {
        all_names = { names: [] }
        client2.forEach((client) => {
            if (client.id.readyState === 1)
                all_names.names.push(client.name)
        })
        client2.forEach((client) => {
            if (client.name != null) client.id.send(JSON.stringify(all_names))
        })
        console.log("connection closed")
    })
})

