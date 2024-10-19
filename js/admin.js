import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";
import { createToast } from "./notification.js";
import { myModal, myOffcanvas, myCarousel, activeKeyFrameView } from "./carousel.js";
import { submit_KIS_or_QNA, get_session_ID, get_evaluationID } from "./fetching.js";

const modeModal = new bootstrap.Modal(document.getElementById("mode-modal"));
modeModal.toggle();
const submitModel = new bootstrap.Modal(document.getElementById("submit-modal"));

let queue_view = document.querySelector('#queue-view');
let targetImg = "";
let isOffcanvasShown = false;
let mode = "";
let sessionID = "";
let evaluationID = "";
let loginName = "Admin";

export function get_video_path_m3u8(video_name) {
  let video_path = ""
  if (video_name < "L13_V001"){
    video_path = "http://localhost:3031/mlcv2/Datasets/HCMAI24/streaming/batch1_audio/";
  }
  else if (video_name >="L15_V001"){
    video_path = "http://localhost:3031/mlcv2/Datasets/HCMAI24/streaming/batch3/";
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
    // if (e.key == 'b' && targetImg){

    //   // currentResult.length = 0;
    //   console.log(targetImg);
    //   const src = targetImg.getAttribute("src") || targetImg.getAttribute("data-lazy");
    //   let win = window.open(
    //     `http://localhost:3031/?src=${encodeURIComponent(src)}`, // Use backticks for template literals
    //     null,
    //     "popup"
    //   )
    //   window.scrollTo({  top: 0, behavior: 'instant'  });


    //   const getPath = encodeURIComponent(get_video_path_m3u8(vid_name));
    //   const getFrame = encodeURIComponent(frame_idx);
    //   Open the new window with the specified URL and dimensions


    //   );
    // }


    if (e.key == 'e') {
      e.preventDefault();
      if (document.activeElement.tagName.toLowerCase() != "textarea") {
        let chosenImg = "";
        if (isOffcanvasShown) {
          chosenImg = document.querySelector(".modal-body img");
        } else {
          chosenImg = targetImg;
        }

        if (chosenImg) {
          let videoID = chosenImg.src.split("/").slice(-2)[0];
          let frameIdx = chosenImg.src.split("/").slice(-1)[0].split(".")[0];
          if (mode == "practice") {
            submit_KIS_or_QNA(loginName, socket, "", videoID, frameIdx, "KIS", sessionID, evaluationID, mode);
          } else {
            document.getElementById("video-id").value = videoID;
            document.getElementById("frame-idx").value = frameIdx;
            submitModel.toggle();
            document.getElementById("qa-answer").focus();
          }

        }
      }
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
  }
}
);

// Chuột phải
document.addEventListener("contextmenu", function (e) {
  // Nếu element là hình keyframe: Hiện Offcanvas + Modal
  if (e.target.classList.contains("keyframeImg")) {
    isOffcanvasShown = true;
    e.preventDefault();
    activeKeyFrameView(e.target.getAttribute("src"));
  }
});


document.addEventListener('click', function (e) {
  if (e.target.classList.contains("keyframeImg")) {
    const path = e.target.getAttribute('src');
    const videoName = path.split("/").slice(-2)[0];
    const frameidx = path.split("/").slice(-1)[0].split(".")[0];
    openWin(videoName, frameidx);
  }
})

document.getElementById("add-file-modal").addEventListener("shown-bs-modal", _ => {
  isAddFileModal = true;
});

document.getElementById("add-file-modal").addEventListener("hidden-bs-modal", _ => {
  isAddFileModal = false;
});

export let currentPositionKeyframe = 0;
export let isShownNearKeyFrameWindow = 0;
export let keyFrameWindowData = null;
export let maxLenBatch = 0;
export let originalKFIndex = 0;

function createImgElement(directory, frame_idx){
  const imgElement = document.createElement("img");
  imgElement.setAttribute("data-lazy", directory);
  imgElement.setAttribute("class", "keyframeImg");
  imgElement.setAttribute('frame_idx', frame_idx);


  imgElement.addEventListener("mouseenter", function (event) {
    event.preventDefault();
    targetImg = imgElement;
    // console.log(targetImg);
  });

  imgElement.addEventListener("mouseleave", function (event) {
    event.preventDefault();
    targetImg = "";
  });

  return imgElement;
}

function createKeyFrameImg(currentKFIndex){
  let keyframeGrid = document.querySelector(".nearest-keyframes");
  keyframeGrid.innerHTML = "<i class='bx bx-x' id='close-near-kf'></i>"; // reset - innercontent need to have cls button

  const closeButton = document.querySelector("#close-near-kf");
  if (closeButton) {
    closeButton.addEventListener("click", function() {
      console.log("close");
      document.querySelector(".nearest-keyframes").style.display = "none";
      document.querySelector(".nearest-keyframes").style.transform = "";
      document.querySelector(".contentGrid").style.filter = "";
      document.body.style.overflow = "";
      isShownNearKeyFrameWindow = 0;
    });
  }

  let divElement = document.createElement("div");
  divElement.setAttribute("class", "lil-kf");

  keyframeGrid.scrollTo({top: 0, behavior: 'instant'});


  for(let i = Math.max(0, currentKFIndex - 32); i < Math.min(maxLenBatch, currentKFIndex + 32); i++){ // 30 previous keyframes and 30 next keyframes

    let path = keyFrameWindowData[i];
    const segments = path.split("/");
    const vid_name = segments[segments.length - 2];
    const frame_idx = segments[segments.length - 1].split(".")[0];
    let video_name = vid_name + "_" + frame_idx;

    // tạo Element chứa link dẫn tới vid của frame
    const linkElement = document.createElement("a");
    linkElement.setAttribute("target", "_blank");
    linkElement.setAttribute("rel", "noreferrer noopener");

    linkElement.addEventListener("click", function (ev) { // CLick ảnh sẽ dẫn tới video
      ev.preventDefault();
      openWin(vid_name, frame_idx);
    });

    // Tạo element ảnh từ directory
    const imgElement = createImgElement(path, frame_idx);
    imgElement.src = path;

    if(i === originalKFIndex){
      imgElement.style.border = '8px solid blue';
      console.log("find the blue kf");
    }

    // Video name và keyframe của mỗi ảnh for identification
    const name = document.createElement("p");
    name.innerHTML = video_name;

    linkElement.appendChild(imgElement);
    linkElement.appendChild(name);
    divElement.appendChild(linkElement);
  }
  keyframeGrid.appendChild(divElement);

  for (const directory of queueImg) {
    if(document.querySelector(`[src = "${directory}"]`)) document.querySelector(`[src = "${directory}"]`).style.border = "4px solid yellow";
  }

  for (const dir of rejectImg) { // Rejected imgs
    if(document.querySelector(`[src = "${dir}"]`)) document.querySelector(`[src = "${dir}"]`).style.border = "4px solid red";
  }
} 

// Nearest keyframes search
export function nearestKeyFrameSearch() {
  // Get the fetch path and save the original target index @@
  let FrameSrc = targetImg.src;
  let splittedKeyFramePath = FrameSrc.split('/');
  let kfIdx = splittedKeyFramePath[splittedKeyFramePath.length - 1].split('.')[0];
  splittedKeyFramePath.pop();
  let videoName = splittedKeyFramePath[splittedKeyFramePath.length - 1];
  splittedKeyFramePath.pop();
  splittedKeyFramePath.pop();
  let pathForFetch = splittedKeyFramePath.join('/') + '/json/' + videoName +'.json';

  FrameSrc = FrameSrc.replace("http://localhost:3031", "");

  maxLenBatch = 0;

  // Fetch the JSON data path
  fetch(pathForFetch)
    .then(response => {
      if (!response.ok) {
        throw new Error("Response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then(data => { // data is a video batch in json format that has the target frame idx

      // console.log(data);

      keyFrameWindowData = data;

      Object.entries(keyFrameWindowData).forEach(([key, value]) => {
        maxLenBatch = Math.max(maxLenBatch, key);
        if(FrameSrc === value){
          currentPositionKeyframe = Number(key);
        }
      });
      originalKFIndex = currentPositionKeyframe;

      createKeyFrameImg(currentPositionKeyframe);


    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });

}

document.addEventListener("keydown", function(e){
  if(e.ctrlKey && e.key === 's'){
    e.preventDefault();

    isShownNearKeyFrameWindow = 1;

    nearestKeyFrameSearch();

    document.querySelector(".nearest-keyframes").style.display = "flex";
    document.querySelector(".nearest-keyframes").style.transform = `translateY(${window.scrollY}px)`; // the pop up nearKeyFrameWindow follow wherever the window scroll to
    document.querySelector(".contentGrid").style.filter = "blur(4px) brightness(50%)";
    document.body.style.overflow = "hidden";
  }

  if(isShownNearKeyFrameWindow){
    if(e.key === 'a' && !isOffcanvasShown){
      e.preventDefault();
      currentPositionKeyframe = Math.max(currentPositionKeyframe - 64, 0);
      if(keyFrameWindowData && maxLenBatch){
        createKeyFrameImg(currentPositionKeyframe);
        console.log("move keyframe window left side");
      }
    }
    if(e.key === 'd' && !isOffcanvasShown){
      e.preventDefault();
      currentPositionKeyframe = Math.min(currentPositionKeyframe + 64, maxLenBatch);
      if(keyFrameWindowData && maxLenBatch){
        createKeyFrameImg(currentPositionKeyframe);
        console.log("move keyframe window right side");
      }
    }
    if(e.key === 'Escape'){
      isShownNearKeyFrameWindow = 0;
      e.preventDefault();
      document.querySelector(".nearest-keyframes").style.display = "none";
      document.querySelector(".nearest-keyframes").style.transform = "";
      document.querySelector(".contentGrid").style.filter = "";
      document.body.style.overflow = "";
    }
  }
});

document.querySelectorAll(".mode-btn").forEach(btn => {
  btn.addEventListener("click", function (_) {
    mode = btn.innerHTML == "Practice Mode" ? "practice" : "competition";
    console.log(mode);
    get_session_ID(mode).then(sID => {
      sessionID = sID;
      get_evaluationID(sID, mode).then(eID => evaluationID = eID);
    });
    modeModal.toggle();
  })
});
