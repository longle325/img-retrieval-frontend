import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";
import { createToast } from "./notification.js";
import { isModalShown } from "./carousel.js"
// ***----------------------------------------------Public variables------------------------------------***

export let queueImg = [];
export let rejectImg = [];
export let submitImg = "";
export let whole_query = "";
// Web socket variables
const socket = io("http://localhost:5053");

// ***----------------------------------------------Functions------------------------------------***
export function notifyStatus() {
    createToast("primary", `There are currently ${queueImg.length} images on queue, ${rejectImg.length} images are being rejected.`);
    if (submitImg)
        createToast("primary", `Submitted image: ${submitImg.split("/").slice(-2)[0]}_${submitImg.split("/").slice(-1)[0].split(".")[0]}`);
}

export function emitQueueImg(img) {
    socket.emit("queue-image", img.getAttribute("src"), img.getAttribute('frame_idx'));
}

// export function needingQuery(temp_query) {
//     whole_query = temp_query;
//     socket.emit("update-query", temp_query)
// }

export function update_query(query) {
    socket.emit("update-query", query);
}

function imgQueue() {
    const accordion = document.getElementsByClassName("accordion")[0];
    let accor_body = accordion.querySelector(".accordion-body");
};

function updateBorder(type, imgSrc) {
    switch (type) {
        case "submit":
            // console.log(submittedImg);
            let submittedImg = document.querySelector(".contentGrid").querySelector(`img[src="${imgSrc}"]`);
            if (submittedImg) {
                submittedImg.style.border = "4px solid lightgreen";
                submittedImg.style["border-radius"] = "4px";
            }
            submitImg = document.querySelector(".nearest-keyframes").querySelector(`img[src="${imgSrc}"]`);
            if (submittedImg) {
                submittedImg.style.border = "4px solid lightgreen";
                submittedImg.style["border-radius"] = "4px";
            }
            break;
        case "queue":
            let updatedImg = document.querySelector(".contentGrid").querySelector(`img[src="${imgSrc}"]`);
            if (updatedImg) {
                updatedImg.style.border = "4px solid yellow";
                updatedImg.style["border-radius"] = "4px";
            }
            updatedImg = document.querySelector(".nearest-keyframes").querySelector(`img[src="${imgSrc}"]`);
            if (updatedImg) {
                updatedImg.style.border = "4px solid yellow";
                updatedImg.style["border-radius"] = "4px";
            }
            break;
        case "reject":
            let rejectedImg = document.querySelector(".contentGrid").querySelector(`img[src="${imgSrc}"]`);
            if (rejectedImg) {
                rejectedImg.style.border = "4px solid red";
                rejectedImg.style["border-radius"] = "4px";
            }
            rejectedImg = document.querySelector(".nearest-keyframes").querySelector(`img[src="${imgSrc}"]`);
            if (rejectedImg) {
                rejectedImg.style.border = "4px solid red";
                rejectedImg.style["border-radius"] = "4px";
            }
            break;
    }

}

function resetBorder() {
    queueImg.forEach((src) => {
        let currentImg = document.querySelector(".contentGrid").querySelector(`img[src="${src}"]`);
        if (currentImg) {
            currentImg.style.border = "2px solid black";
            currentImg.style["border-radius"] = "4px";
        }
        currentImg = document.querySelector(".nearest-keyframes").querySelector(`img[src="${src}"]`);
        if (currentImg) {
            currentImg.style.border = "2px solid black";
            currentImg.style["border-radius"] = "4px";
        }
    });

    rejectImg.forEach((src) => {
        let currentImg = document.querySelector(".contentGrid").querySelector(`img[src="${src}"]`);
        if (currentImg) {
            currentImg.style.border = "2px solid black";
            currentImg.style["border-radius"] = "4px";
        }
        currentImg = document.querySelector(".nearest-keyframes").querySelector(`img[src="${src}"]`);
        if (currentImg) {
            currentImg.style.border = "2px solid black";
            currentImg.style["border-radius"] = "4px";
        }
    });

    let currentImg = document.querySelector(".contentGrid").querySelector(`img[src="${submitImg}"]`);
    if (currentImg) {
        currentImg.style.border = "2px solid black";
        currentImg.style["border-radius"] = "4px";
    }
}

// ***------------------------------------Socket Events-----------------------------------------------***
socket.on("connect", () => {
    console.log("CONNECTED");

});

socket.on("get-query", (query) => {
    whole_query = query;
});

socket.on("connect_error", (err) => {
    console.log(err);
    console.log(`connect_error due to ${err.message}`);
});

socket.on("display-noti", (id, message) => {
    console.log("Recieved");
    createToast(id, message);
});

socket.on("get-queue", (queue, queue2) => {
    queueImg = queue;
    rejectImg = queue2;
    notifyStatus();
    imgQueue();
});

socket.on("queue-update", (type, imgSrc) => {
    switch (type) {
        case "submit":
            queueImg.splice(queueImg.indexOf(imgSrc), 1);
            submitImg = imgSrc;
            updateBorder(type, imgSrc);
            break;
        case "queue":
            queueImg.push(imgSrc);
            updateBorder(type, imgSrc);
            if (isModalShown && imgSrc === document.querySelector(".modal-body img").getAttribute("src")) {
                document.querySelector(".modal-body img").style['border'] = '4px solid yellow';
            }
            break;
        case "reject":
            queueImg.splice(queueImg.indexOf(imgSrc), 1);
            rejectImg.push(imgSrc);
            updateBorder(type, imgSrc);
            if (isModalShown && imgSrc === document.querySelector(".modal-body img").getAttribute("src")) {
                document.querySelector(".modal-body img").style['border'] = '4px solid red';
            }
            break;
        case "empty":
            for (const dir of queueImg) {
                document.querySelector(".modal-body img").style['border'] = '4px solid black';
            }
            for (const dir of rejectImg) {
                document.querySelector(".modal-body img").style['border'] = '4px solid black';
            }
            console.log("Empty");
            resetBorder();
            queueImg = [];
            rejectImg = [];
            submitImg = "";
            break;
    }
    imgQueue();
    console.log('update');
});
socket.on("updated-query-box", (query) => {
    whole_query = query;
    console.log('query-box-updated');
});