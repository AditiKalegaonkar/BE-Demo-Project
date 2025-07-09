let uploadedFile = null;
let chatHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]");
const historyPanel = document.getElementById("chatHistory");

document.getElementById("pdfInput").addEventListener("change", (e) => {
  uploadedFile = e.target.files[0];
});

document.getElementById("toggleBtn").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("hidden");
});

function appendMessage(role, text) {
  const chatBox = document.getElementById("chatBox");
  const msg = document.createElement("div");
  msg.className = "message " + role;
  if (role === "bot") {
    msg.innerHTML = `<span class="bot"><strong>Wagon Bot:</strong></span><div>${marked.parse(text)}</div>`;
  } else {
    msg.innerHTML = `<span class="user">You:</span> ${text}`;
  }
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function updateHistorySidebar() {
  historyPanel.innerHTML = "";
  chatHistory.forEach((entry, index) => {
    const div = document.createElement("div");
    div.textContent = `# ${entry.question}`;
    div.onclick = () => loadChat(index);
    historyPanel.appendChild(div);
  });
}

function loadChat(index) {
  const entry = chatHistory[index];
  if (entry) {
    document.getElementById("chatBox").innerHTML = "";
    appendMessage("user", entry.question);
    appendMessage("bot", entry.answer);
  }
}

async function submitQuestion() {
  const question = document.getElementById("questionInput").value.trim();
  if (!uploadedFile) {
    alert("Please upload a PDF before asking a question.");
    return;
  }
  if (!question) return;

  appendMessage("user", question);
  document.getElementById("questionInput").value = "";
  document.getElementById("loadingSpinner").style.display = "block";

  const formData = new FormData();
  formData.append("file", uploadedFile);
  formData.append("question", question);

  try {
    const res = await fetch("http://localhost:5000/process", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    const answer = data.answer || "Sorry, I don’t know the answer to that based on the document.";
    appendMessage("bot", answer);

    chatHistory.push({ question, answer });
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    updateHistorySidebar();
  } catch (err) {
    console.error(err);
    appendMessage("bot", "Error connecting to server.");
  } finally {
    document.getElementById("loadingSpinner").style.display = "none";
  }
}

updateHistorySidebar();