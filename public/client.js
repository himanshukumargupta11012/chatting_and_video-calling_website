answer_btn = document.getElementById('answer_btn');
let outgoing_video = document.getElementById("outgoing_video");
let incoming_video = document.getElementById("incoming_video");
name_btn = document.getElementById("name_btn");
msg_bar = document.getElementById("msg_sender");
select = document.getElementById("to")
user_name = document.getElementById("name");
to = document.getElementById("to");
self_msg = document.getElementById("self_msg");
alert_box = document.getElementById("alert_box");
msgs = document.getElementById("msgs");


// ---------- function for taking name ----------
function storeName() {
  if (user_name.value != "") {
    document.getElementById("name_btn").disabled = true;
    self_msg.disabled = false;

    ws.send(JSON.stringify({ type: 'store_name', name: user_name.value }))

    msg_bar.classList.replace("hidden", "flex");
    user_name.blur()
    self_msg.focus()
  }
  else {
    showAlert("Name can't be empty")
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
    msg_map[to.value].push({
      sender: "you",
      msg: self_msg.value
    })
    

    addMsg("you", self_msg.value);

    self_msg.value = '';
  }
}

self_msg.addEventListener("keyup", sendMessage2);

function sendMessage2(event) {
  if (self_msg.value != "") {
    document.getElementById("msg_send_btn").disabled = false
  }
  else {
    document.getElementById("msg_send_btn").disabled = true
  }
  if (event.key == "Enter") {
    sendMessage();
  }
}


// checking json or not
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
var msg_map = {
  "all": []
};

acceptCall = () => {
  accept = true
}
declineCall = () => {
  decline = true
}

disconnect = () => {
  disconnect2()
  if (newPeer) {
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

iceAndTrack = () => {
  newPeer.onicecandidate = ((e) => {
    if (e.candidate == null) {
      return
    }
    ws.send(JSON.stringify({
      type: "send_candidate",
      candidate: e.candidate,
      to: to.value
    }))
  })

  newPeer.ontrack = function (event) {
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
  if (to.value == "") {
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
      audio: true
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
      audio: true
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
showAlert = (msg) => {
  alert_box.firstElementChild.innerText = msg;
  alert_box.classList.replace("opacity-0", "opacity-100");
  alert_box.firstElementChild.nextElementSibling.classList.add("w-full");


  setTimeout(() => {
    alert_box.classList.replace("opacity-100", "opacity-0");
    alert_box.firstElementChild.nextElementSibling.classList.remove("w-full")
  }, 4000)
}

singleUserCheck = () => {
  if (to.options.length == 0) {
    msg_bar.classList.replace("flex", "hidden");

    showAlert("No one in chat. Send url and ask to join");

  }
  else if (msg_bar.classList.contains("hidden"))
    msg_bar.classList.replace("hidden", "flex")
}

addSelect = (val, place = true) => {
  new_option = document.createElement("option")
  new_option.innerText = val
  new_option.setAttribute('value', val)
  if (place)
    select.appendChild(new_option)
  else
    to.insertBefore(new_option, to.firstElementChild)
}

addMsg = (sender, msg)=>{
  msg_element = document.getElementById("msg_element").cloneNode(true)
  msg_element.classList.replace("hidden", "block")
  div1 = msg_element.firstElementChild
  div1.innerText = sender;
  
  div2 = div1.nextElementSibling
  div2.innerText = msg;

  if (sender == "you")
  msg_element.style.marginLeft = "auto"

  else
    msg_element.style.marginRight = "auto"

  msgs.appendChild(msg_element)
}

toChanged = ()=>{
  if(to.value == "all") {
    document.getElementById("call_btn").disabled = true
  }
  else {
    document.getElementById("call_btn").disabled = false
  }
  msgs.innerHTML = "";
  for(let i = 0; i < msg_map[to.value].length; i++) {
    addMsg(msg_map[to.value][i].sender, msg_map[to.value][i].msg)
  }

}

ws.onmessage = (data) => {

  const msg = data.data

  if (isJson(msg)) {
    let obj = JSON.parse(msg)
    console.log(obj.type)
    switch (obj.type) {
      case "add_old":

        if (obj.names.length > 1) {
          addSelect("all");
        }
        for (i = 0; i < obj.names.length; i++) {
          addSelect(obj.names[i]);
          msg_map[obj.names[i]] = [];
        }
        singleUserCheck();
        break;

      case "add_new":
        addSelect(obj.name);
        msg_map[obj.name] = [];
        if (to.options.length == 2) {
          addSelect("all", false);
        }
        singleUserCheck();
        break;

      case "remove_user":
        curr = to.firstElementChild;
        while (curr.value != obj.name) {
          if (curr.innerText == "all") {
            curr2 = curr;
            curr = curr.nextElementSibling;
            curr2.remove();
          }
          else
            curr = curr.nextElementSibling;
        }
        curr.remove();


        // for (i = select.options.length - 1; i >= 0; i--) {
        //   select.remove(i);
        // }
        singleUserCheck();
        break;
      case "msg":

        if(to.value == obj.sender) {
          addMsg(obj.sender, obj.msg);
        }

        msg_map[obj.sender].push(obj);
        break;
      case "end_call":
        disconnect2()
        break;
      case "request_video_call":
        document.getElementById("call").classList.replace("hidden", "block");
        receiveCall()

        answer_btn.firstElementChild.innerText = obj.from + ' is video calling you';
        times = 0;
        answer_btn.classList.replace("hidden", "block")
        const wait_interval = setInterval(
          () => {
            times++
            if (accept == true) {
              ws.send(JSON.stringify({
                type: 'answer_video_call',
                to: obj.from,
                answer: true
              }))

              accept = false
              answer_btn.classList.replace("block", "hidden")
              clearInterval(wait_interval)
            }
            else if (decline == true) {
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
        break;
      case "answer_video_call":
        if (obj.answer == true) {
          sendOffer()
        }
        else {
          showAlert("video call denied")
        }
        break;
      case "offer":
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
        break;
      case "answer":
        answer = new RTCSessionDescription(obj.answer)
        newPeer.setRemoteDescription(answer).then(() => {
        })
        break;
      case "store_candidate":
        candidate = new RTCIceCandidate(obj.candidate)
        newPeer.addIceCandidate(candidate).then(() => {
          console.log('candidate added')
        })
    }
  }
}

sendOffer = () => {
  // sending call offer to other end
  newPeer.createOffer((offer) => {
    newPeer.setLocalDescription(offer)
    ws.send(JSON.stringify({
      type: "offer",
      offer: offer,
      to: to.value,
      from: user_name.value
    }))
  },
    (error) => {
      console.log(error)
    })
}

video = true
audio = true

function onOffVideo(btn) {
  video = !video

  if (!video) {
    btn.innerText = "On Video";
    outgoing_video.srcObject.getVideoTracks()[0].stop()
    // sender = newPeer.getSenders().find(s => s.track && s.track.kind === 'video')
    // sender.replaceTrack(null)
  }

  else {
    btn.innerText = "Off Video";
    if (navigator.mediaDevices.getUserMedia) {

      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
        .then((stream) => {
          stream.getVideoTracks().forEach((track) => {

            const sender = newPeer.getSenders().find(s => s.track && s.track.kind === 'video');
            if (sender) {
              sender.replaceTrack(track);
            } else {
              newPeer.addTrack(track, stream);
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

function onOffAudio(btn) {
  audio = !audio

  if (!audio) {
    btn.innerText = "Unmute";
    outgoing_video.srcObject.getAudioTracks()[0].enabled = false
  }

  else {
    btn.innerText = "mute";
    outgoing_video.srcObject.getAudioTracks()[0].enabled = true
  }

}