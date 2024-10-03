import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";
import { createToast } from "./notification.js";
import { myModal, myOffcanvas, myCarousel, activeKeyFrameView } from "./carousel.js";

let submit_url = "http://localhost:8053/submit";
let queue_view = document.querySelector('#queue-view');
let targetImg = "";
let selectedSrc = "";
let selectedFile = "";
let isOffcanvasShown = false;

let submitModal = new bootstrap.Modal(document.getElementById('submit-modal'));

let isAddFileModal = false;

function loadModalContent() {
  // Content
  document.getElementById("video-name").setAttribute("value", selectedSrc.split("/").slice(-2)[0]);
  document.getElementById("frame-idx").setAttribute("value", selectedSrc.split("/").slice(-1)[0].split(".")[0]);
  document.getElementById("answer").value = "";
}

function submit() {
  let qs_pack = document.getElementById("qs-pack").value;
  let question = document.getElementById("question").value;
  let qs_type = document.getElementById("qs-type").value;

  let file_name = `query-p${qs_pack}-${question}-${qs_type}.csv`;
  let video_name = document.getElementById("video-name").value;
  let frame_idx = parseInt(document.getElementById("frame-idx").value);
  let answer = document.getElementById("answer").value;

  let submitData = {
    "file_name": file_name,
    "vid_name": video_name,
    "frame_idx": frame_idx,
    "answer": answer
  }
  console.log(submitData);
  fetch(submit_url, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(submitData),
  })
    .then((res) => {
      if (res.ok) {
        console.log("SUCCESS");
        res.json().then((response) => {
          createToast("success", `Added submission to ${response.file_name}: ${response.vid_name}, ${response.frame_idx}` + (response.answer ? `, ${response.answer}` : ""));
          socket.emit("submit-image", selectedSrc);
          targetImg = "";
        });
      } else {
        console.log("Not successful");
        console.log("Status: " + res.status);
        console.log("Status Text: " + res.statusText);
        res.text().then((text) => console.log("Response Body: " + text));
        createToast("danger", "Cannot submit image.");
      }
    })
    .catch((error) => {
      console.log("Fetch error: ", error);
      createToast("danger", "Cannot submit image.");
    });
}


export function get_video_path_m3u8(video_name) {
  let video_path = ""
  if (video_name < "L13_V001"){
    video_path = "http://localhost:3031/mlcv2/Datasets/HCMAI24/streaming/batch1_audio/";
  }
  else{
    video_path = "http://localhost:3031/mlcv2/Datasets/HCMAI24/streaming/batch2_audio/";
  }
  return video_path + video_name + "/" + video_name +".m3u8";
}

export const openWin = (vid_name, frame_idx) => {
  // Encode path and frame index
  const getPath = encodeURIComponent(get_video_path_m3u8(vid_name));
  const getFrame = encodeURIComponent(frame_idx);

  // Open the new window with the specified URL and dimensions
  let win = window.open(
    `../show_video.html?videoPath=${getPath}&frameIdx=${getFrame}`, // Use backticks for template literals
    null,
    "popup"
  );

  if (win) win.resizeTo(500, 400);
}


function displayQueue(Queue) {
  queue_view.innerHTML = "";

  Queue.forEach(element => {
    let src = element;

    let img = document.createElement('img');
    img.setAttribute('src', src);
    img.setAttribute('class', 'keyframeImg');
    // img.setAttribute('frame_idx', frame_idx);

    img.addEventListener("mouseenter", function (event) {
      event.preventDefault();
      targetImg = img;
      img.style.border = "3px solid red";
    });

    img.addEventListener("mouseleave", function (event) {
      event.preventDefault();
      targetImg = "";
      img.style.border = "3px solid black";
    });

    let container = document.createElement('div');
    container.setAttribute("class", "imgContainer");
    container.appendChild(img);

    let name = document.createElement('p');
    name.innerHTML = src.split("/").slice(-2)[0] + '_' + src.split("/").slice(-1)[0].split(".")[0];

    container.appendChild(name);
    queue_view.appendChild(container);
  });
}

const socket = io("http://localhost:5053/boss");

socket.on("connect", () => {
  console.log("CONNECTED");
});

socket.on("display-noti", (id, message) => {
  console.log("Recieved");
  createToast(id, message);
});

socket.on('queue-update', queue => {
  displayQueue(queue);
})

document.addEventListener("keydown", function (e) {
  // var module_displaying;
  if (e.key == "d") {
    myCarousel.next();
  }
  if (e.key == "a") {
    myCarousel.prev();
  }
  if (e.key == "c" || e.key == "g") {
    myOffcanvas.hide();
    myModal.hide();
  }
  if (e.key == "z") {
    myModal.toggle();
  }
	
  if (e.key == 'q' && targetImg) {
    socket.emit("reject-image", targetImg.getAttribute("src"));
    targetImg = "";
  }
  if (e.ctrlKey) {
    if (e.key == 'e' && targetImg) {
      e.preventDefault();
      selectedSrc = targetImg.getAttribute("src");
      loadModalContent();
      submitModal.toggle();
      targetImg = "";
    }
    if (e.key == "\\") {
      e.preventDefault();
      socket.emit('empty-queue');
    }
    if(e.key == 'v'){
      e.preventDefault();
      let imgSrc = document.getElementById("modal-img").src;
      const videoName = imgSrc.split("/").slice(-2)[0];
      const frameidx = imgSrc.split("/").slice(-1)[0].split(".")[0];
      openWin(videoName, frameidx);
    }
    if(e.key == 'x'){
      let chosenImg = "";
      
      if (isOffcanvasShown) {
        chosenImg = document.querySelector(".modal-body img");
      } else {
        chosenImg = targetImg;
      }

      if(chosenImg){
        const session = "node01htgt4ew31vrfuydpjfx8lzb02";
        // const session = "node0ta25lhf8t1bsvu724zl5whfk12"
        let data = chosenImg.getAttribute("src");
        let item = data.split('/').slice(-2)[0];
        let frame = data.split('/').slice(-1)[0].split('.')[0];
        fetch(`http://127.0.0.1:1992/api/v1/submit?item=${item}&frame=${frame}&session=${session}`);
        createToast("success", `Submitted: ${item}_${frame}`);
      }
    }
  }
});

// Chuột phải
document.addEventListener("contextmenu", function (e) {
  // Nếu element là hình keyframe: Hiện Offcanvas + Modal
  if (e.target.classList.contains("keyframeImg")) {
    isOffcanvasShown = true;
    e.preventDefault();
    activeKeyFrameView(e.target.getAttribute("src"));
  }
});

document.getElementById("submit-btn").addEventListener("click", _ => {
  //submit_to_server();
  submit();
  submitModal.toggle();
})


document.addEventListener('click', function (e) {
  if (e.target.classList.contains("keyframeImg")) {
    const path = e.target.getAttribute('src');
    const videoName = path.split("/").slice(-2)[0];
    const frameidx = path.split("/").slice(-1)[0].split(".")[0];
    // console.log(videoName,frameidx);
    openWin(videoName, frameidx);
  }
})

document.getElementById("add-file-modal").addEventListener("shown-bs-modal", _ => {
  isAddFileModal = true;
});

document.getElementById("add-file-modal").addEventListener("hidden-bs-modal", _ => {
  isAddFileModal = false;
});
