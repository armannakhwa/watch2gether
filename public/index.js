const socket = io()
const messageContainer = document.getElementById('message-container')
const roomContainer = document.getElementById('room-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')

function vdourlchecker() {
  let vdourlc = document.getElementById('vdourl').value;
  let vdoreg = /\.(mp4|mp3)$/.test(vdourlc);

  if (vdourlc.length > 5) {
    if (vdoreg) {
      document.getElementById('Go').disabled = false;
    } else {
      document.getElementById('Go').disabled = true;
      alert('Note:We are supporting only .mp4 URL')
    }
  }
  if (vdourlc.length == 5) {
    document.getElementById('Go').disabled = false;
  } 
}


let getalldetails;
let allusers;
let vdourl = "video.mp4";

function start() {
  vdourl = document.getElementById('vdourl').value;

}
let name;
if (messageForm != null) {
  name = prompt('What is your name?')
  document.getElementById('userdetail').innerHTML = "<b>You:</b>" + name + "";
  appendMessage('You joined')
  activeusers(name + ' c');
  socket.emit('new-user', roomName, name, vdourl)




  messageForm.addEventListener('submit', e => {
    e.preventDefault()
    const message = messageInput.value
    appendMessage(`You: ${message}`)
    socket.emit('send-chat-message', roomName, message)
    messageInput.value = ''

    document.getElementById('message-container').scrollTop = document.getElementById('message-container').scrollHeight + 100;

  })
}

socket.on('room-created', room => {
  const roomElement = document.createElement('div')
  roomElement.innerText = room.room;
  const roomLink = document.createElement('a')
  roomLink.href = `/${room.room}`
  roomLink.innerText = 'join'
  roomContainer.append(roomElement)
  roomContainer.append(roomLink)

})

socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`)
  document.getElementById('message-container').scrollTop = document.getElementById('message-container').scrollHeight + 100;
})

function activeusers(names) {
  document.getElementById('a_users').innerHTML += names;

}

socket.on('user-connected', name => {
  appendMessage(`${name} connected`);
  activeusers(name + ' c');


})

socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`);
  activeusers(name + ' d');

})




socket.on("allusers", (users) => {
  allusers = users;
  // console.log("++++++" + allusers);
  document.getElementById('a_users').innerHTML = users;

});


function checkonlineusers() {
  let users = "";
  for (var key in allusers) {
    if (allusers[key].room == roomName) {
      users += "<b>" + allusers[key].name + "</b></br>";
    }
  }

  document.getElementById('a_users').innerHTML = users;

}

function sharelink() {
  navigator.clipboard.writeText(window.location.href);
  navigator.clipboard
    .writeText(window.location.href)
    .then(() => {
      alert('invitation link copied');
    })
    .catch(() => {
      alert("something went wrong");
    });
}

function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.append(messageElement)
}


socket.emit("users", name);
socket.on("user", (name) => {
  console.log(name);
  console.log(`${name}:has joined the room`);
});

socket.on("leave", (name) => {
  console.log(name);
  console.log(`${name}:has left the room`);
});

setTimeout(() => {

  let uusers = "";
  for (var key in allusers) {
    if (allusers[key].room == roomName) {
      uusers += "<b>" + allusers[key].name + "</b></br>";
      var vurl = allusers[key].videourl;

      var main_video = document.getElementById("main_video");

      main_video.innerHTML = ` <video controls class="video" id="video" preload="metadata" poster="">
          <source src=${vurl} type="video/mp4"></source>
        </video>`;

      console.log("#############" + vurl)
    }
  }

  // Select elements here
  const video = document.getElementById("video");
  const videoControls = document.getElementById("video-controls");
  const playButton = document.getElementById("play");
  const playbackIcons = document.querySelectorAll(".playback-icons use");
  const timeElapsed = document.getElementById("time-elapsed");
  const duration = document.getElementById("duration");
  const progressBar = document.getElementById("progress-bar");
  const seek = document.getElementById("seek");
  const seekTooltip = document.getElementById("seek-tooltip");
  const volumeButton = document.getElementById("volume-button");
  const volumeIcons = document.querySelectorAll(".volume-button use");
  const volumeMute = document.querySelector('use[href="#volume-mute"]');
  const volumeLow = document.querySelector('use[href="#volume-low"]');
  const volumeHigh = document.querySelector('use[href="#volume-high"]');
  const volume = document.getElementById("volume");
  const playbackAnimation = document.getElementById("playback-animation");
  const fullscreenButton = document.getElementById("fullscreen-button");
  const videoContainer = document.getElementById("video-container");
  const fullscreenIcons = fullscreenButton.querySelectorAll("use");
  const pipButton = document.getElementById("pip-button");

  const videoWorks = !!document.createElement("video").canPlayType;
  if (videoWorks) {
    video.controls = false;
    videoControls.classList.remove("hidden");
  }

  function togglePlay() {

    let vt = video.currentTime;

    if (video.paused || video.ended) {
      video.play();
      let msg = "play";
      socket.emit("play_pause", {
        msg,
        name,
        vt,
      });
    } else {
      video.pause();
      let msg = "pause";
      socket.emit("play_pause", {
        msg,
        name,
        vt
      });
    }
  }


  function updatePlayButton() {
    playbackIcons.forEach((icon) => icon.classList.toggle("hidden"));

    if (video.paused) {
      playButton.setAttribute("data-title", "Play (k)");
    } else {
      playButton.setAttribute("data-title", "Pause (k)");
    }
  }


  function formatTime(timeInSeconds) {
    const result = new Date(timeInSeconds * 1000).toISOString().substr(11, 8);

    return {
      minutes: result.substr(3, 2),
      seconds: result.substr(6, 2),
    };
  }


  function initializeVideo() {
    const videoDuration = Math.round(video.duration);
    seek.setAttribute("max", videoDuration);
    progressBar.setAttribute("max", videoDuration);
    const time = formatTime(videoDuration);
    duration.innerText = `${time.minutes}:${time.seconds}`;
    duration.setAttribute("datetime", `${time.minutes}m ${time.seconds}s`);



  }




  function updateTimeElapsed() {
    const time = formatTime(Math.round(video.currentTime));
    timeElapsed.innerText = `${time.minutes}:${time.seconds}`;
    timeElapsed.setAttribute("datetime", `${time.minutes}m ${time.seconds}s`);

  }


  function updateProgress() {
    seek.value = Math.floor(video.currentTime);
    progressBar.value = Math.floor(video.currentTime);
  }



  function updateSeekTooltip(event) {
    const skipTo = Math.round(
      (event.offsetX / event.target.clientWidth) *
      parseInt(event.target.getAttribute("max"), 10)
    );
    seek.setAttribute("data-seek", skipTo);
    const t = formatTime(skipTo);
    seekTooltip.textContent = `${t.minutes}:${t.seconds}`;
    const rect = video.getBoundingClientRect();
    seekTooltip.style.left = `${event.pageX - rect.left}px`;
  }





  function skipAhead(event) {
    togglePlay();
    const skipTo = event.target.dataset.seek ?
      event.target.dataset.seek :
      event.target.value;
    video.currentTime = skipTo;
    progressBar.value = skipTo;
    seek.value = skipTo;


  }

  function updateVolume() {
    if (video.muted) {
      video.muted = false;
    }

    video.volume = volume.value;
  }

  function updateVolumeIcon() {
    volumeIcons.forEach((icon) => {
      icon.classList.add("hidden");
    });

    volumeButton.setAttribute("data-title", "Mute (m)");

    if (video.muted || video.volume === 0) {
      volumeMute.classList.remove("hidden");
      volumeButton.setAttribute("data-title", "Unmute (m)");
    } else if (video.volume > 0 && video.volume <= 0.5) {
      volumeLow.classList.remove("hidden");
    } else {
      volumeHigh.classList.remove("hidden");
    }
  }

  function toggleMute() {
    video.muted = !video.muted;

    if (video.muted) {
      volume.setAttribute("data-volume", volume.value);
      volume.value = 0;
    } else {
      volume.value = volume.dataset.volume;
    }
  }

  // animatePlayback displays an animation when
  // the video is played or paused
  function animatePlayback() {
    playbackAnimation.animate(
      [{
          opacity: 1,
          transform: "scale(1)",
        },
        {
          opacity: 0,
          transform: "scale(1.3)",
        },
      ], {
        duration: 500,
      }
    );
  }

  function toggleFullScreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (document.webkitFullscreenElement) {
      // Need this to support Safari
      document.webkitExitFullscreen();
    } else if (videoContainer.webkitRequestFullscreen) {
      // Need this to support Safari
      videoContainer.webkitRequestFullscreen();
    } else {
      videoContainer.requestFullscreen();
    }
  }

  function updateFullscreenButton() {
    fullscreenIcons.forEach((icon) => icon.classList.toggle("hidden"));

    if (document.fullscreenElement) {
      fullscreenButton.setAttribute("data-title", "Exit full screen (f)");
    } else {
      fullscreenButton.setAttribute("data-title", "Full screen (f)");
    }
  }

  async function togglePip() {
    try {
      if (video !== document.pictureInPictureElement) {
        pipButton.disabled = true;
        await video.requestPictureInPicture();
      } else {
        await document.exitPictureInPicture();
      }
    } catch (error) {
      console.error(error);
    } finally {
      pipButton.disabled = false;
    }
  }


  function hideControls() {
    if (video.paused) {
      return;
    }

    videoControls.classList.add("hide");
  }

  function showControls() {


    videoControls.classList.remove("hide");
  }


  function keyboardShortcuts(event) {
    const {
      key
    } = event;
    switch (key) {
      case "k":
        togglePlay();
        animatePlayback();
        if (video.paused) {
          showControls();
        } else {
          setTimeout(() => {
            hideControls();
          }, 2000);
        }
        break;
      case "m":
        toggleMute();
        break;
      case "f":
        toggleFullScreen();
        break;
      case "p":
        togglePip();
        break;
    }
  }

  // Add eventlisteners here
  playButton.addEventListener("click", togglePlay);
  video.addEventListener("play", updatePlayButton);
  video.addEventListener("pause", updatePlayButton);
  video.addEventListener("loadedmetadata", initializeVideo);
  video.addEventListener("timeupdate", updateTimeElapsed);
  video.addEventListener("timeupdate", updateProgress);
  video.addEventListener("volumechange", updateVolumeIcon);
  video.addEventListener("click", togglePlay);
  video.addEventListener("click", animatePlayback);
  video.addEventListener("mouseenter", showControls);
  video.addEventListener("mouseleave", hideControls);
  videoControls.addEventListener("mouseenter", showControls);
  videoControls.addEventListener("mouseleave", hideControls);
  seek.addEventListener("mousemove", updateSeekTooltip);
  seek.addEventListener("input", skipAhead);
  volume.addEventListener("input", updateVolume);
  volumeButton.addEventListener("click", toggleMute);
  fullscreenButton.addEventListener("click", toggleFullScreen);
  videoContainer.addEventListener("fullscreenchange", updateFullscreenButton);
  pipButton.addEventListener("click", togglePip);

  document.addEventListener("DOMContentLoaded", () => {
    if (!("pictureInPictureEnabled" in document)) {
      pipButton.classList.add("hidden");
    }
  });
  document.addEventListener("keyup", keyboardShortcuts);
  document.getElementById('ndata').style.display = "none";

  socket.on("ppstatus", (data) => {
    document.getElementById('ndata').style.display = "block";

    console.log(data);

    video.currentTime = Math.floor(data.vt);


    if (data.msg == "play") {
      video.play();
      document.getElementById('ndata').innerHTML = "<b>" + data.name + "</b> has played this video";

    }
    if (data.msg == "pause") {
      video.pause();
      document.getElementById('ndata').innerHTML = "<b>" + data.name + "</b> has paused this video";

    }

    setTimeout(() => {
      document.getElementById('ndata').style.display = "none";
    }, 4000)
  });



}, 1000);