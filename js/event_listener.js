import { currentResult, targetImg, fetchImageSearch, pageMove, openWin, switching_Collection, collectionSwitchBtn, SwitchStateOfTemporal, post,isShownNearKeyFrameWindow  } from "./request.js";
import { createToast } from "./notification.js";
import { myModal, myOffcanvas, myCarousel, activeKeyFrameView, isOffcanvasShown, offcanvasImg } from "./carousel.js";
import { queueImg, rejectImg, submitImg, notifyStatus, emitQueueImg, whole_query, update_query } from "./client.js";

// ***----------------------------------------------Standard Events---------------------------------------------***
let temp_query = ''
let api = "http://localhost:8053/";
let query_box = document.querySelector(".query-box");
let query_text = query_box.querySelector("textarea");
// Chuột phải
document.addEventListener("contextmenu", function (e) {
  // Nếu element là hình keyframe: Hiện Offcanvas + Modal
  if (e.target.classList.contains("keyframeImg")) {
    e.preventDefault();
    activeKeyFrameView(e.target.getAttribute("src"));
  }
});

// Switch State of temporal search
document.getElementById('StateOfTemporal').addEventListener("click", function  (e)  {
  SwitchStateOfTemporal();
})

// Khi nhấn phím
document.addEventListener("keydown", (e) => {
  if (isOffcanvasShown) {
    if (e.key == "d") {
      myCarousel.next();
    }
    if (e.key == "a") {
      myCarousel.prev();

    }
    if (e.key == "c" || (e.key == "g" && e.ctrlKey)) {
      myOffcanvas.hide();
      myModal.hide();
    }
    if (e.key == "z") {
      myModal.toggle();
    }
  }

  if (e.ctrlKey) {
    if (e.altKey && !e.shiftKey)  {
      e.preventDefault();
      SwitchStateOfTemporal();
    }

    if (e.key === "`" && !isOffcanvasShown)  {
      e.preventDefault();
      switch_searchTab();
    }

    if (e.key === "," && !isOffcanvasShown) {
      e.preventDefault();
      pageMove("left");
    }

    if (e.key === "." && !isOffcanvasShown) {
      e.preventDefault();
      pageMove("right");
    }

    // Open video
    if  (e.key === "v" && isOffcanvasShown)  {
      console.log("ctrl + v and turn on video");
      e.preventDefault();
      const src = document.querySelector(".modal-body").querySelector("img").src;
      const segments = src.split("/");
      const vid_name = segments[segments.length - 2];
      const frameidx = segments[segments.length - 1].split(".")[0];
      openWin(vid_name, frameidx);
    }

    if (e.key == "b") { // Similarity search
      e.preventDefault();
      
      if (isOffcanvasShown) {
        let ModalImg = document.querySelector(".modal-body img");
        myOffcanvas.hide();
        myModal.hide();

        currentResult.length = 0;
        fetchImageSearch(ModalImg);
        window.scrollTo({  top: 0, behavior: 'instant'  });
      }

      if (targetImg) {
        currentResult.length = 0;
        fetchImageSearch(targetImg);
        window.scrollTo({  top: 0, behavior: 'instant'  });
      }
    }

    if (e.key == "e") {
      e.preventDefault();
      if (document.activeElement.tagName.toLowerCase() != "textarea")  {
        let chosenImg = "";
        if (isOffcanvasShown) {
          chosenImg = document.querySelector(".modal-body img");
        } else {
          chosenImg = targetImg;
        }

        if (chosenImg) {
          const session = 'node01wt0egi6zh7rhi15j1ctt3hd249'; // Tự set đi bro
          let data = chosenImg.getAttribute("src");
          let item = data.split('/').slice(-2)[0];
          let frame = data.split('/').slice(-1)[0].split('.')[0];

          fetch(`http://192.168.20.164:5002/api/v1/submit?item=${item}&frame=${frame}&session=${session}`)
          createToast("success", `Submitted: ${item}_${frame}`);
        }
      }
    }

    if (e.key == '/') {
      e.preventDefault();

      if (query_box.style.display == 'block') {
        query_box.style.display = 'none';
      }

      else {
        query_text.value = whole_query;
        query_box.style.display = 'block';
      }

      console.log('yes');
    }

    if (e.key == "x" && document.activeElement.tagName.toLowerCase() != "textarea") { // Queue img for admin check
      let chosenImg = "";

      if (isOffcanvasShown) {
        chosenImg = document.querySelector(".modal-body img");
      } else {
        chosenImg = targetImg;
        targetImg.style.border = "4px solid yellow";
        queueImg.push(targetImg.src);
      }

      if (chosenImg) {
        if (rejectImg.includes(chosenImg.getAttribute("src")))
          createToast("danger", "Oops, this image was rejected before!");
        else if (queueImg.includes(chosenImg.getAttribute("src")))
          createToast("danger", "Oops, this image has already been queued!");
        else if (chosenImg.getAttribute("src") == submitImg)
          createToast("danger", "Oops, this image has already been submitted!");
        else {
          document.querySelector(".modal-body img").style['border'] = '4px solid yellow';
          emitQueueImg(chosenImg);
        }
      }
    }
  }

  if (e.altKey) {
    let sectionNum = '1';
    if (document.activeElement.tagName.toLocaleLowerCase() == "textarea"){
      sectionNum = document.activeElement.getAttribute("id").slice(-1);
    }
    switch (e.key) {
      case "`": // Switch between textaread field of the "current scene" or the "next scene"
        document.getElementById(`inputBlock${sectionNum == '0' ? '1' : '0'}`).focus();
        break;
      case "1": // Clear the input of the current focused textarea field
        document.getElementById(`inputBlock${sectionNum}`).value = "";
        break;
      case "2": // Clear all the input of the filters area
        document.getElementById(`object${sectionNum}`).value = "";
        document.getElementById(`color${sectionNum}`).value = "";
        document.getElementById(`ocr${sectionNum}`).value = "";
        break;
      case "3": // Clear all the input of every textarea field
        console.log('im here mtfk');
        document.getElementById(`inputBlock0`).value = "";
        document.getElementById(`object0`).value = "";
        document.getElementById(`color0`).value = "";
        document.getElementById(`ocr0`).value = "";
        document.getElementById(`inputBlock1`).value = "";
        document.getElementById(`object1`).value = "";
        document.getElementById(`color1`).value = "";
        document.getElementById(`ocr1`).value = "";
    }
  }
});

document
  .getElementById("carouselExampleControls")
  .addEventListener("slid.bs.carousel", (_) => {
    let imgSrc = document.querySelector(".active").querySelector("img").getAttribute("src");

    let modalImg = document.querySelector(".modal-body img");

    modalImg.style['border'] = "4px solid black";

    for (const dir of queueImg) {
      if (dir === imgSrc) {
        modalImg.style['border'] = "4px solid yellow";
      }
    }

    for (const dir of rejectImg) {
      if (dir === imgSrc) {
        modalImg.style['border'] = "4px solid red";
      }
    }
  });

document.getElementById("gallery-modal").addEventListener("shown.bs.modal", (_) => {
  let imgSrc = document.querySelector(".active").querySelector("img").getAttribute("src");

  let modalImg = document.querySelector(".modal-body img");

  modalImg.style['border'] = "4px solid black";

  for (const dir of queueImg) {
    if (dir === imgSrc) {
      modalImg.style['border'] = "4px solid yellow";
      break;
    }
  }

  for (const dir of rejectImg) {
    if (dir === imgSrc) {
      modalImg.style['border'] = "4px solid red";
      break;
    }
  }
});

function switch_searchTab()  {
  let searchTab = document.getElementById('searchTab');
  let searchTextarea = document.getElementById("inputBlock0");
  let transcriptTab = document.getElementById('transcriptTab');
  let imageDropage = document.getElementById('image-search');

  let transcriptTextarea = document.getElementById("inputBlock3");

  if (searchTab.style.display === "none") {
    transcriptTab.style.display = "none";
    imageDropage.style.display = "none";
    transcriptTextarea.value = "";
    searchTab.style.display = "block";
    searchTextarea.focus()
  }
  else {
    searchTab.style.display = "none";
    searchTextarea.value = "";
    transcriptTab.style.display = "block";
    imageDropage.style.display = "block";
    transcriptTextarea.focus();
  }
}

// switch collection
collectionSwitchBtn.addEventListener("click",  function  (e)  {
  switching_Collection();
})

document.addEventListener("keydown", function (e) {
  if (e.code === "Space" && e.ctrlKey) {
    e.preventDefault();
    switching_Collection();
  }
})

export function update_query_box(query){
  query_text.value = query;
}

query_box.addEventListener('keydown',function(e){
  if (query_box.style.display == 'block'){

    update_query(query_text.value)
  
  }
})
 

