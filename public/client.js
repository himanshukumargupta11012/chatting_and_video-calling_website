answer_btn = document.getElementById('answer_btn')
let outgoing_video = document.getElementById("outgoing_video")
let incoming_video = document.getElementById("incoming_video")
name_btn = document.getElementById("name_btn")


user_name = document.getElementById("name");
to = document.getElementById("to");
self_msg = document.getElementById("self_msg")


// ---------- function for taking name ----------
function storeName() {
  if (user_name.value != "") {
    document.getElementById("name_btn").disabled = true;
    document.getElementById('self_msg').disabled = false;

    ws.send(JSON.stringify({ type: 'store_name', name: user_name.value }))

    document.getElementById("msg_sender").classList.replace("hidden", "flex");
    user_name.blur()
    self_msg.focus()
  }
  else {
    alert("Name can't be empty")
  }
}
user_name.addEventListener("keypress", storeName2);

function storeName2(event) {

  if (event.key == "Enter") {
    storeName();
  }
}

// ------------ function for sending message -----------
function sendMessage() {
  if (to.value != "" && self_msg.value != "") {
    ws.send(JSON.stringify({
      type: "send_message",
      receiver: to.value,
      message: self_msg.value
    }))
    self_msg.value = ''
  }
}

self_msg.addEventListener("keyup", sendMessage2);

function sendMessage2(event) {
  if (self_msg.value != ""){
    document.getElementById("msg_send_btn").disabled = false
  }
  else{
    document.getElementById("msg_send_btn").disabled = true
  }
  if (event.key == "Enter") {
    sendMessage();
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

let accept = false
let decline = false

acceptCall = () => {
  accept = true
}
declineCall = () => {
  decline = true
}

disconnect = () => {
  disconnect2()
  if (newPeer){
    ws.send(JSON.stringify({
      type: "end_call",
      other: to.value
    }))
  }
}

disconnect2 = () => {
  document.getElementById("call_btn").disabled = false
  document.getElementById("msgs").style.display = "block";
  document.getElementById("call").classList.replace("block", "hidden")

  if (newPeer) {
    
    outgoing_video.srcObject.getVideoTracks()[0].stop()

    newPeer.close()
    newPeer = new RTCPeerConnection(configuration)

    iceAndTrack()
    
    return newPeer
  }
}

iceAndTrack = ()=>{
  newPeer.onicecandidate = ((e) => {
    console.log('ice candiate for', user_name.value)
    if (e.candidate == null) {
      console.log('ice candiate null')
      return
    }
    ws.send(JSON.stringify({
      type: "send_candidate",
      candidate: e.candidate,
      to: to.value
    }))
  })

  newPeer.ontrack = function (event) {
    console.log('track')
    incoming_video.srcObject = event.streams[0]
  }
}

var configuration = {
  "iceServers": [
    {
      "urls": "stun:stun.1.google.com:19302"
    },
    {
      urls: 'turn:192.158.29.39:3478?transport=tcp',
      credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      username: '28224511:1379330808'
    }
  ]
};
var newPeer = new RTCPeerConnection(configuration)



iceAndTrack()

function startCall() {
  if (to.value == ""){
    return
  }
  document.getElementById("call_btn").disabled = true
  document.getElementById("msgs").style.display = "none";
  document.getElementById("call").classList.replace("hidden", "block")
  if (navigator.mediaDevices.getUserMedia) {

    ws.send(JSON.stringify({
      type: "request_video_call",
      to: to.value
    }))

    navigator.mediaDevices.getUserMedia({
      video: true,
      // audio: true
    })

      .then((stream) => {
        stream.getTracks().forEach((track) => {
          newPeer.addTrack(track, stream)
        })
        outgoing_video.srcObject = stream
      })
      .catch((error) => {
        alert(error)
      })
  }
}
function receiveCall() {
  document.getElementById("call_btn").disabled = true
  if (navigator.mediaDevices.getUserMedia) {

    navigator.mediaDevices.getUserMedia({
      video: true,
      // audio: true
    })
      .then((stream) => {
        stream.getTracks().forEach((track) => {

          newPeer.addTrack(track, stream)
        })

        outgoing_video.srcObject = stream
      })

      .catch((error) => {
        alert(error)
      })
  }
}

disableEnable = (btn) => {
  btn.classList.add("")
}

ws.onmessage = (data) => {

  const msg = data.data

  if (isJson(msg)) {
    let obj = JSON.parse(msg)
    console.log(obj.type)

    if (obj.names != null) {
      select = document.getElementById("to")

      for (i = select.options.length - 1; i >= 0; i--) {
        select.remove(i);
      }
      if (obj.names.length > 2) {
        new_option = document.createElement("option")
        text = document.createTextNode('all')
        new_option.appendChild(text)
        new_option.setAttribute('value', 'all')
        select.appendChild(new_option)
      }
      for (i = 0; i < obj.names.length; i++) {
        if (user_name.value != obj.names[i]) {
          new_option = document.createElement("option")
          text = document.createTextNode(obj.names[i])
          new_option.appendChild(text)
          new_option.setAttribute('value', obj.names[i])
          select.appendChild(new_option)
        }
      }
    }
    else if (obj.type == 'msg') {
      ul = document.getElementById("msgs")

      msg_element = document.getElementById("msg_element").cloneNode(true)
      msg_element.style.display = 'block'

      div1 = document.createElement('div');
      div1.setAttribute("class", "block text-xs");
      div1.textContent = obj.sender;
      msg_element.appendChild(div1);

      div2 = document.createElement('div');
      div2.setAttribute("class", "block");
      div2.textContent = obj.msg;
      msg_element.appendChild(div2);

      if (obj.sender == "you")
        msg_element.style.marginLeft = "auto"

      else
        msg_element.style.marginRight = "auto"

      ul.appendChild(msg_element)
    }

    else if (obj.type == 'end_call') {

      console.log("disconnect")
      disconnect2()
    }

    else if (obj.type == 'request_video_call') {
      document.getElementById("call").classList.replace("hidden", "block");
      receiveCall()
      incoming_call_message = document.createElement('p')
      console.log(obj)
      incoming_call_message.appendChild(document.createTextNode(obj.from + ' is video calling you'))
      answer_btn.prepend(incoming_call_message)
      times = 0
      answer_btn.classList.replace("hidden", "block")
      const wait_interval = setInterval(
        () => {

          console.log(accept, decline)
          times++
          if (accept == true) {
            // receiveCall()
            ws.send(JSON.stringify({
              type: 'answer_video_call',
              to: obj.from,
              answer: true
            }))

            console.log('accepted')
            accept = false
            answer_btn.classList.replace("block", "hidden")
            clearInterval(wait_interval)
          }
          else if (decline == true) {
            console.log('rejected')
            disconnect()
            ws.send(JSON.stringify({
              type: 'answer_video_call',
              to: obj.from,
              answer: false
            }))
            decline = false
            answer_btn.classList.replace("block", "hidden")
            clearInterval(wait_interval)
          }
          else if (times == 20) {
            console.log('time end')
            disconnect()
            ws.send(JSON.stringify({
              type: 'answer_video_call',
              to: obj.from,
              answer: false
            }))
            answer_btn.style.display = 'none'
            clearInterval(wait_interval)
          }
        }
        , 1000)
    }
    else if (obj.type == 'answer_video_call') {
      if (obj.answer == true) {
        sendOffer()
      }
      else {
        alert('video call denied')
      }
    }
    else if (obj.type == 'offer') {
      sender = obj.from
      out = new RTCSessionDescription(obj.offer)
      newPeer.setRemoteDescription(out).then(() => {
        newPeer.createAnswer().then((answer) => {
          newPeer.setLocalDescription(answer)
          ws.send(JSON.stringify({
            type: 'answer',
            to: sender,
            answer: answer
          }))
        }).catch((error) => {
          console.error(error)
        })
      })
    }


    else if (obj.type == 'answer') {
      answer = new RTCSessionDescription(obj.answer)
      newPeer.setRemoteDescription(answer).then(() => {
        console.log('og')
      })
    }
    else if (obj.type == 'store_candidate') {
      candidate = new RTCIceCandidate(obj.candidate)
      newPeer.addIceCandidate(candidate).then(() => {
        console.log('candiate added')
      })
    }
  }
}






sendOffer = () => {
  // sending call offer to other end
  newPeer.createOffer((offer) => {
    console.log('username check', user_name.value)
    newPeer.setLocalDescription(offer)
    ws.send(JSON.stringify({
      type: "offer",
      offer: offer,
      to: to.value,
      from: user_name.value
    }))
    console.log('offer', offer)
  },
    (error) => {
      console.log(error)
    })
}





// function onOffAudio() {
//   local_stream.getAudioTracks()[0].enabled = !audio
//   audio = !audio
// }
video = true
audio = true

function onOffVideo() {
  video = !video

  if (!video) {
    outgoing_video.srcObject.getVideoTracks()[0].stop()
    // sender = newPeer.getSenders().find(s => s.track && s.track.kind === 'video')
    // sender.replaceTrack(null)
  }

  else {
    if (navigator.mediaDevices.getUserMedia) {

      navigator.mediaDevices.getUserMedia({
        video: true,
        // audio: true
      })
        .then((stream) => {
          stream.getVideoTracks().forEach((track) => {

            // newPeer.addTrack(track, stream)
            const sender = newPeer.getSenders().find(s => s.track && s.track.kind === 'video');
            console.log("ff")
            if (sender) {
              console.log("sender")
              sender.replaceTrack(track); // Replace with the new video track
            } else {
              console.log("new")
              newPeer.addTrack(track, stream); // Add the new video track
            }
          })

          outgoing_video.srcObject = stream
        })

        .catch((error) => {
          alert(error)
        })
    }
  }
  outgoing_video.pause()
  outgoing_video.currentTime = 0
}



  // ws.onerror = (erro) => {
  //   document.write(erro)
  // }

  // ws.onclose = () => {
  //   select = document.getElementById("to")

  //   for (i = 0; i < select.options.length; i++) {
  //     select.remove(i);
  //   }
  //   console.log("connection closed")
  // }