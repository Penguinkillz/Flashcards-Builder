var topicEl = document.getElementById("topic");
var sourcesEl = document.getElementById("sources-text");
var filesEl = document.getElementById("source-files");
var generateBtn = document.getElementById("generate-btn");
var statusEl = document.getElementById("status");
var cardsSection = document.getElementById("cards-section");
var flashcardEl = document.getElementById("flashcard");
var cardFrontEl = document.getElementById("card-front");
var cardBackEl = document.getElementById("card-back");
var cardCounterEl = document.getElementById("card-counter");
var prevBtn = document.getElementById("prev-btn");
var nextBtn = document.getElementById("next-btn");
var cardsEmptyEl = document.getElementById("cards-empty");

var cards = [];
var currentIndex = 0;

function setLoading(on) {
  generateBtn.disabled = on;
}

function setStatus(msg, isError) {
  statusEl.textContent = msg;
  statusEl.className = "status" + (isError ? " error" : "");
}

function showCards(data) {
  cards = data.cards || [];
  currentIndex = 0;
  cardsSection.classList.add("visible");
  if (cards.length === 0) {
    cardFrontEl.textContent = "";
    cardBackEl.textContent = "";
    cardCounterEl.textContent = "0 / 0";
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    return;
  }
  flashcardEl.classList.remove("flipped");
  updateCardDisplay();
  prevBtn.disabled = true;
  nextBtn.disabled = cards.length <= 1;
}

function updateCardDisplay() {
  if (cards.length === 0) return;
  var card = cards[currentIndex];
  cardFrontEl.textContent = card.front || "";
  cardBackEl.textContent = card.back || "";
  cardCounterEl.textContent = (currentIndex + 1) + " / " + cards.length;
  flashcardEl.classList.remove("flipped");
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === cards.length - 1;
}

flashcardEl.addEventListener("click", function () {
  if (cards.length === 0) return;
  flashcardEl.classList.toggle("flipped");
});

prevBtn.addEventListener("click", function () {
  if (currentIndex <= 0) return;
  currentIndex--;
  updateCardDisplay();
});

nextBtn.addEventListener("click", function () {
  if (currentIndex >= cards.length - 1) return;
  currentIndex++;
  updateCardDisplay();
});

async function callApi() {
  var topic = topicEl.value.trim();
  var sourcesText = sourcesEl.value.trim();
  var files = filesEl.files;

  var hasFiles = files && files.length > 0;
  var hasSources = sourcesText.length > 0;

  if (!topic && !hasSources && !hasFiles) {
    throw new Error("Enter a topic, paste some text, or upload a file.");
  }

  if (topic && !hasFiles) {
    var res = await fetch("/api/flashcards/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: topic,
        sources_text: sourcesText || null,
      }),
    });
    if (!res.ok) {
      var err = await res.json().catch(function () { return {}; });
      throw new Error(err.detail || "Server error " + res.status);
    }
    return res.json();
  }

  var fd = new FormData();
  fd.append("topic_hint", topic);
  fd.append("sources_text", sourcesText);
  for (var i = 0; i < files.length; i++) {
    fd.append("files", files[i]);
  }

  var res2 = await fetch("/api/flashcards/generate-from-files", {
    method: "POST",
    body: fd,
  });
  if (!res2.ok) {
    var err2 = await res2.json().catch(function () { return {}; });
    throw new Error(err2.detail || "Server error " + res2.status);
  }
  return res2.json();
}

generateBtn.addEventListener("click", async function () {
  setLoading(true);
  setStatus("Generating flashcards...");
  showCards({ cards: [] });

  try {
    var data = await callApi();
    showCards(data);
    setStatus("");
  } catch (err) {
    setStatus(err.message || "Something went wrong.", true);
  } finally {
    setLoading(false);
  }
});
