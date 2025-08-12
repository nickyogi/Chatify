const socket = io();

const clientsTotal = document.querySelector("#client-total");

const messageContainer = document.getElementById("message-container");
const nameInput = document.getElementById("name-input");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");

const messageTone = new Audio("/message-tone.mp3");

if ('Notification' in window && navigator.serviceWorker) {
  console.log('Notifications and service workers supported');
} else {
  console.log('Not supported on this device/browser');
}


if (Notification.permission === "default") {
  Notification.requestPermission().then((permission) => {
    console.log("Notification permission:", permission);
  });
}

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage();
});

socket.on("clients-total", (data) => {
  clientsTotal.textContent = `Total Online Users : ${data}`;
});

function sendMessage() {
  if (messageInput.value.replace(/\s+/g, "") === "") return;

  const data = {
    name: nameInput.value,
    message: messageInput.value,
    dateTime: new Date(),
  };

  socket.emit("message", data);

  addMessageToUI(true, data);

  messageInput.value = "";
}

socket.on("chat-message", (data) => {
  messageTone.play();
  addMessageToUI(false, data);

  // if (document.hidden && Notification.permission === "granted") {
  //   new Notification(`💬 ${data.name}`, {
  //     body: data.message,
  //   });
  // }

  navigator.serviceWorker.register('/sw.js').then(reg => {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        reg.showNotification('💬 ' + data.name, {
          body: data.message,
          // icon: '/icon.png'
        });
      }
    });
  });

  
});

function addMessageToUI(isOwnMessage, data) {
  document
    .querySelectorAll(".animate")
    .forEach((element) => element.classList.remove("animate"));
  clearFeedback();
  const element = `
        <li class="${
          isOwnMessage ? "message-right animate" : "message-left animate"
        }">
          <p class="message">
            ${data.message}
            <span><span>${data.name}</span> <span>⏰ ${moment(
    data.dateTime
  ).fromNow()}</span></span>
          </p>
        </li>
    `;
  messageContainer.innerHTML += element;

  scrollToBottom();
}

function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

messageInput.addEventListener("focus", (e) => {
  socket.emit("feedback", {
    feedback: `📝 ${nameInput.value} is typing a message`,
  });
});

messageInput.addEventListener("keypress", (e) => {
  socket.emit("feedback", {
    feedback: `📝 ${nameInput.value} is typing a message....`,
  });
});

messageInput.addEventListener("blur", (e) => {
  socket.emit("feedback", {
    feedback: ``,
  });
});

socket.on("feedback", (data) => {
  clearFeedback();
  document
    .querySelectorAll(".animate")
    .forEach((element) => element.classList.remove("animate"));
  const element = `<li class="message-feedback">
    <p class="feedback" id="feedback">${data.feedback}</p>
  </li>`;
  messageContainer.innerHTML += element;
});

function clearFeedback() {
  document
    .querySelectorAll(`li.message-feedback`)
    .forEach((element) => element.parentNode.removeChild(element));
}
