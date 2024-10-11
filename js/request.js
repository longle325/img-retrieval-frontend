import { contentGrid, currentMode} from "./document.js";
import { queueImg, rejectImg } from "./client.js";
import { isOffcanvasShown } from "./carousel.js";
let api = "http://localhost:8053/";

let random_pic_api = "http://localhost:8053/random_pic";

const fps30Files = ['L24_V028', 'L15_V015', 'L15_V012', 
  'L17_V025', 'L18_V025', 'L19_V024', 'L24_V021', 'L22_V004', 
  'L19_V023', 'L16_V023', 'L17_V019', 'L18_V019', 'L19_V016', 
  'L16_V016', 'L19_V011', 'L20_V001', 'L15_V029', 'L17_V010', 
  'L18_V010', 'L17_V017', 'L21_V007', 'L18_V017', 'L19_V018', 
  'L20_V008', 'L18_V006', 'L21_V016', 'L17_V006', 'L16_V009', 
  'L19_V009', 'L22_V029', 'L20_V010', 'L22_V027', 'L22_V020', 
  'L16_V007', 'L20_V017', 'L19_V007', 'L22_V015', 'L24_V037', 
  'L20_V022', 'L20_V025', 'L22_V012', 'L24_V030', 'L15_V003', 
  'L24_V042', 'L21_V023', 'L24_V039', 'L15_V004', 'L24_V045', 
  'L21_V006', 'L18_V016', 'L19_V019', 'L20_V009', 'L16_V019', 
  'L17_V011', 'L21_V001', 'L18_V011', 'L19_V010', 'L15_V028', 
  'L17_V018', 'L18_V018', 'L19_V017', 'L20_V007', 'L24_V027', 
  'L22_V005', 'L19_V022', 'L16_V022', 'L19_V025', 'L24_V020', 
  'L17_V024', 'L18_V024', 'L24_V029', 'L18_V023', 'L21_V022', 
  'L24_V038', 'L15_V005', 'L20_V024', 'L22_V013', 'L24_V031', 
  'L22_V014', 'L24_V036', 'L22_V021', 'L18_V009', 'L21_V019', 
  'L16_V006', 'L20_V016', 'L16_V001', 'L20_V011', 'L19_V001', 
  'L22_V026', 'L22_V028', 'L17_V007', 'L15_V030', 'L16_V008', 
  'L20_V018', 'L19_V008', 'L24_V040', 'L20_V029', 'L21_V026', 
  'L21_V021', 'L22_V019', 'L24_V035', 'L15_V008', 'L19_V030', 
  'L21_V028', 'L16_V002', 'L22_V025', 'L22_V022', 'L20_V015', 
  'L19_V005', 'L18_V004', 'L21_V014', 'L17_V004', 'L18_V003', 
  'L21_V013', 'L17_V003', 'L15_V025', 'L17_V012', 'L21_V002', 
  'L18_V012', 'L21_V005', 'L15_V022', 'L20_V004', 'L16_V014', 
  'L20_V003', 'L16_V013', 'L19_V026', 'L16_V026', 'L24_V023', 
  'L22_V001', 'L24_V024', 'L22_V006', 'L20_V031', 'L15_V019', 
  'L16_V021', 'L17_V020', 'L18_V020', 'L21_V030', 'L15_V017', 
  'L15_V010', 'L16_V028', 'L17_V027', 'L18_V027', 'L18_V002', 
  'L21_V012', 'L18_V005', 'L21_V015', 'L17_V005', 'L20_V014', 
  'L19_V004', 'L16_V003', 'L19_V003', 'L21_V029', 'L22_V011', 
  'L24_V033', 'L15_V009', 'L19_V031', 'L20_V021', 'L22_V018', 
  'L24_V041', 'L20_V028', 'L21_V027', 'L19_V029', 'L15_V011', 
  'L16_V029', 'L17_V026', 'L18_V026', 'L17_V021', 'L15_V016', 
  'L24_V025', 'L20_V030', 'L15_V018', 'L16_V020', 'L16_V027', 
  'L17_V028', 'L24_V022', 'L19_V012', 'L20_V002', 'L16_V012', 
  'L24_V017', 'L19_V015', 'L16_V015', 'L17_V014', 'L15_V023', 
  'L15_V024', 'L24_V019', 'L17_V013', 'L18_V013',"L09_V009","L06_V003"];

export let targetImg = "";
export let currentResult = [];
export let currentResult2 = [];
export let currentCollection = "clip";
const numElementPerPage = 203;
let maxLengthPage = 1;
let Pages = [[]]; // Storing frame grouped by video Names for each page from 1 to 5
let Pages2 = [[]];
export let StateOfTemporal = 1;
export let currentPage = 1;
export let prePage = 1;
export let currentPositionKeyframe = 0;
export let isShownNearKeyFrameWindow = 0;
export let keyFrameWindowData = null;
export let maxLenBatch = 0;
export let originalKFIndex = 0;

export let where = 1;
class ArrayHashTable {
  constructor() {
    this.table = {};
  }

  hash(value) {
    if (Array.isArray(value)) {
      return value.join(',');
    } else {
      return String(value);
    }
  }

  add(value) {
    this.table[this.hash(value)] = true;
  }

  has(value) {
    return !!this.table[this.hash(value)];
  }

  clear() {
    this.table = {};
  }
}

let hashTable = new ArrayHashTable();
let rejectedHashTable = new ArrayHashTable();

class DefaultDict {
  constructor(defaultInit) {
    return new Proxy(
      {},
      {
        get: (target, name) =>
          name in target
            ? target[name]
            : (target[name] =
              typeof defaultInit === "function"
                ? new defaultInit().valueOf()
                : defaultInit),
      }
    );
  }
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

const lazyLoad = (target) => {
  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.setAttribute("src", img.getAttribute("data-lazy"));
        observer.unobserve(img);
      }
    });
  });
  io.observe(target);
};

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

function createImgElement(directory, frame_idx){
  const imgElement = document.createElement("img");
  imgElement.setAttribute("data-lazy", directory);
  imgElement.setAttribute("class", "keyframeImg");
  imgElement.setAttribute('frame_idx', frame_idx);

  if (hashTable.has(directory) && !rejectedHashTable.has(directory)) {
    imgElement.style.border = "4px solid yellow";
  }
  else if (rejectedHashTable.has(directory)) {
    imgElement.style.border = "4px solid red";
  }

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

export function VideoGroupSearch(Pages) {

  console.log("Pages from video group search", Pages);


  rejectedHashTable.clear();
  for (const dir of rejectImg) rejectedHashTable.add(dir); // Load các ảnh bị rejects để apply border màu đỏ

  const imageContainer = document.getElementById("content");
  imageContainer.innerHTML = "";

  let colorGroup = "black";

  if(currentPage > maxLengthPage) {
    console.log(`Error happens due to the current page index - Page ${currentPage} gets beyond the length of pages storage`);
    return;
  }

  let cnt = 0;

  for (const frameGroup of Pages[currentPage - 1]) {
    let divElement = document.createElement("div");
    let hline_column = document.createElement("div");
    divElement.setAttribute("class", "result");
    hline_column.setAttribute("class", "hline_column");

    for (const [dir, frame_idx] of frameGroup) {
      cnt += 1;
      const segments = dir.split("/");
      const vid_name = segments[segments.length - 2];
      const keyframe_idx = segments[segments.length - 1].split(".")[0];
      let video_name = vid_name + "_" + keyframe_idx;

      // tạo Element chứa link dẫn tới vid của frame
      const linkElement = document.createElement("a");
      linkElement.setAttribute("target", "_blank");
      linkElement.setAttribute("rel", "noreferrer noopener");
      linkElement.setAttribute("tabindex", "0");
      linkElement.addEventListener("click", function (ev) { // CLick ảnh sẽ dẫn tới video
        ev.preventDefault();
        openWin(vid_name, frame_idx);
      });

      // Tạo ảnh lấy từ directory
      const imgElement = createImgElement(dir, frame_idx);

      // Video name và keyframe của mỗi ảnh for identification
      const name = document.createElement("p");
      name.innerHTML = video_name;

      linkElement.appendChild(imgElement);
      linkElement.appendChild(name);
      divElement.appendChild(linkElement);
    }

    if (colorGroup === "black") {
      divElement.style.borderLeft = `5px solid ${colorGroup}`;
      colorGroup = "yellow";
    } else {
      divElement.style.borderLeft = `5px solid ${colorGroup}`;
      colorGroup = "black";
    }

    imageContainer.appendChild(hline_column);
    imageContainer.appendChild(divElement);

    const targets = divElement.querySelectorAll("img");
    targets.forEach(lazyLoad);
  }

  const endLine = document.createElement("p");
  endLine.setAttribute("class", "endLine");
  endLine.innerHTML = `END OF PAGE ${currentPage}!`;
  contentGrid.appendChild(endLine);

  console.log(`The number of imgs of the current page ${currentPage}: ${cnt}`); // Trả về số ảnh mỗi page
}

export function SimilaritySearch(currentResult) {
  console.log("current Result from similarity search", currentResult);
  rejectedHashTable.clear();
  for (const dir of rejectImg) rejectedHashTable.add(dir); // Load các ảnh bị reject để apply border màu đỏ

  let contentGrid = document.querySelector("#content");
  contentGrid.innerHTML = "";

  let divElement = document.createElement("div");
  divElement.setAttribute("class", "result");

  let cnt = 0; // for counting the number of images of the current page through console.

  if(currentPage > maxLengthPage){
    console.log(`Error happens due to the current page index - Page ${currentPage} gets beyond the length of pages storage`);
    return;
  }

  for (let i = (currentPage - 1) * numElementPerPage; i < Math.min(currentPage * numElementPerPage, currentResult.length); i++) {
    cnt += 1;
    if(i >= currentResult.length) break;

    // Lấy path img của mỗi directory
    const [directory, frame_idx] = currentResult[i];
    const segments = directory.split("/");
    const vid_name = segments[segments.length - 2];
    const keyframe_idx = segments[segments.length - 1].split(".")[0];
    let video_name = vid_name + "_" + keyframe_idx;

    // tạo Element chứa link dẫn tới vid của frame
    const linkElement = document.createElement("a");
    linkElement.setAttribute("target", "_blank");
    linkElement.setAttribute("rel", "noreferrer noopener");

    linkElement.addEventListener("click", function (ev) { // CLick ảnh sẽ dẫn tới video
      ev.preventDefault();
      openWin(vid_name, frame_idx);
    });

    // Tạo element ảnh từ directory
    const imgElement = createImgElement(directory, frame_idx);

    // Video name và keyframe của mỗi ảnh for identification
    const name = document.createElement("p");
    name.innerHTML = video_name;

    linkElement.appendChild(imgElement);
    linkElement.appendChild(name);
    divElement.appendChild(linkElement);
  }
  contentGrid.appendChild(divElement);

  const targets = divElement.querySelectorAll("img");
  targets.forEach(lazyLoad);

  const endLine = document.createElement("p");
  endLine.setAttribute("class", "endLine");
  endLine.innerHTML = `END OF PAGE ${currentPage}!`;
  contentGrid.appendChild(endLine);

  console.log(`The number of imgs of the current page ${currentPage}: ${cnt}`); // Trả về số ảnh mỗi page
}

export function searchMode(StateOfTemporal){
  if (StateOfTemporal === 1){
    // Search theo video group hoặc similarity
      if (currentMode === "video group") VideoGroupSearch(Pages);
      else if (currentMode === "similarity search") SimilaritySearch(currentResult);
    }
    else{
      if (currentMode === "video group") VideoGroupSearch(Pages2);
      else if (currentMode === "similarity search") SimilaritySearch(currentResult2);
    }
}

function storePage(path, frame_idx){
  let currentResultX = [];
  let PageX = [[]];

  path.forEach((directory, index) => {
    // console.log(directory);
    directory = "http://localhost:3031"+ directory 
    currentResultX.push([directory, frame_idx[index]]);
  });


  // Prepare Pages array for 5 pages of Video Group Search Mode 
  let sortedDirPath = new DefaultDict(Array);

  for (const [directory, frame_index] of currentResultX) { // Sort and group the results based on the video name
    let splited = directory.split("/");
    let key_videoName = splited[splited.length - 2];
    sortedDirPath[key_videoName].push([directory, frame_index]);
  }

  let cntElement = 0;
  let cntPage = 0;

  // Chia Page
  for(const [keyVideoName, value] of Object.entries(sortedDirPath)) {
    let frameGroup = []; // frames that have the same video Name
    cntElement += value.length;
    frameGroup = value;
    PageX[cntPage].push(frameGroup);
    if(cntElement >= numElementPerPage) {
      cntElement = 0;
      cntPage += 1;
      maxLengthPage = Math.min(cntPage + 1, 5);
      PageX.push([]);
    }
  }
  
  return {PageX, currentResultX};
}


function createResult(response){

// Reset page counter whenever new search :D
  currentPage = 1;
  document.querySelector(".pagination p").innerHTML = currentPage; // hiển thị  StateOfTemporal = 1;
  StateOfTemporal = 1;
  Pages2 = [[]];
  currentResult2.length = 0;
  Pages = [[]];
  currentResult.length = 0;

  const { PageX, currentResultX } = storePage(response.path, response.frame_idx);
  Pages = PageX;
  currentResult = currentResultX;


  if(response.path2){
    // For temporal only 
    const { PageX, currentResultX } = storePage(response.path2, response.frame_idx2);
    Pages2 = PageX;
    currentResult2 = currentResultX;
  }

  for (const dir of rejectImg) { // Rejected imgs
    if(document.querySelector(`[src = "${dir}"]`)) document.querySelector(`[src = "${dir}"]`).style.border = "4px solid red";
  }
  
  window.scrollTo({top: 0, behavior: 'instant'});

  searchMode(StateOfTemporal);

  for (const dir of rejectImg) { // Rejected imgs
    if(document.querySelector(`[src = "${dir}"]`)) document.querySelector(`[src = "${dir}"]`).style.border = "4px solid red";
  }

  for (const directory of queueImg) {
    hashTable.add(directory);
  }
}


export function post(data, api) {
  fetch(api, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
    body: data,
  })
  .then((res) => {
    if (res.ok) {
      console.log("SUCCESS");
      res.json().then((response) => {
        // response là biến kqua đã được json.parse() return từ function post_item bên hàm main.py ở backend
        console.log("response from backend: ", response); 
        console.log("Length of the response: ", response.path.length);

        createResult(response);
      });
    } else {
      console.log("Not successful");
      console.log("Status: " + res.status);
      console.log("Status Text: " + res.statusText);
      res.text().then((text) => console.log("Response Body: " + text));
    }
  })
  .catch((error) => console.log("Fetch error: ", error));
}
  

export async function fetchImageSearch(imgElement) {
  const src = imgElement.getAttribute("src") || imgElement.getAttribute("data-lazy");
  if (src) {
    let data = {
      query: [
        {
          textual: "",
          objects: "",
          colors: "",
          ocr: "",
          imgPath: src,
          asr: "",
          metadata: "",
          collection : currentCollection,
        }
      ]
    };
    let jsonData = JSON.stringify(data);
    post(jsonData, api);
  }
}

// Page move indexing
let leftPageBtn = document.querySelector(".forward");
let rightPageBtn = document.querySelector(".backward");

export function pageMove(direction) {
  prePage = currentPage; 
  if(direction === "left") currentPage = (currentPage - 1) < 1 ? 1 : currentPage - 1;
  else currentPage = (currentPage + 1) > maxLengthPage ? maxLengthPage : currentPage + 1;

  let PageIndex = document.querySelector(".pagination p"); // Display Page index on the website!!!
  PageIndex.innerHTML = currentPage;

  if(prePage != currentPage){ 
    window.scrollTo({top: 0, behavior: 'instant'});
    searchMode(StateOfTemporal);
  }
}

leftPageBtn.addEventListener("click", () => pageMove("left"));
rightPageBtn.addEventListener("click", () => pageMove("right"));

// Switch collection - Beit or Clip
export const collectionSwitchBtn = document.getElementById('collection-switch');
export function switching_Collection(){
  // currentCollection = (currentCollection == "beit") ? "clip": "beit";
  if(currentCollection === "beit") currentCollection = "merge";
  else if (currentCollection === "merge") currentCollection = "clip";
  else currentCollection = "beit"
  console.log("Current used collection:", currentCollection);
  collectionSwitchBtn.innerHTML = currentCollection;
  document.getElementById(`inputBlock0`).focus();
}

// random pic intialization
document.getElementById('random-pic').addEventListener("click",function(e){
  post("",random_pic_api);
})

// Switch State
export function SwitchStateOfTemporal (){
  StateOfTemporal = (StateOfTemporal === 1) ? 2 : 1;
  document.querySelector("#StateOfTemporal").innerHTML = "State " + StateOfTemporal;
  searchMode(StateOfTemporal);
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

    if(hashTable.has(imgElement.src) && !rejectedHashTable.has(imgElement.src)){
      imgElement.style.border = "4px solid yellow";
    }

    if(rejectedHashTable.has(imgElement.src)){
      console.log(imgElement.src);
      imgElement.style.border = "4px solid red";
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
  for (const dir of rejectImg) {
    if(!rejectedHashTable.has(dir)) rejectedHashTable.add(dir); // Load các ảnh bị reject để apply border màu đỏ
  }
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
