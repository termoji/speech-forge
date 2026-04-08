const startBtn = document.getElementById("startBtn");
const stepContainer = document.getElementById("stepContainer");
const stepTitle = document.getElementById("stepTitle");
const stepHint = document.getElementById("stepHint");
const stepInput = document.getElementById("stepInput");
const nextBtn = document.getElementById("nextBtn");
const outlineDisplay = document.getElementById("outlineDisplay");
const timerModeSelect = document.getElementById("timerMode");
const darkModeToggle = document.getElementById("darkModeToggle");
const downloadOutlineToggle = document.getElementById("downloadOutlineToggle");
const categorySelect = document.getElementById("speechCategory");
const outlineTimerToggle = document.getElementById("outlineTimerToggle");
const outlineTimerSecondsInput = document.getElementById("outlineTimerSeconds");
const outlineTimerDisplay = document.getElementById("outlineTimerDisplay");

// Step definitions
const steps = [
  { title: "Speech Title", hint: "What impression does your title create?" },
  { title: "Opening Statement", hint: "Key Statement of Interest. Hook the audience. Set the promise." },
  { title: "Purpose", hint: "What is the ONE core message? Single Purpose." },
  { title: "Point 1", hint: "First supporting idea" },
  { title: "Point 2 *optional", hint: "Second supporting idea" },
	{ title: "Point 3 *optional", hint: "Third supporting idea" },
  { title: "Summary", hint: "Reinforce your message" },
  { title: "Call to Action", hint: "What should the audience do?" },
  { title: "Closing Statement", hint: "End with impact—not 'thank you'" }
];

let timerMode = "structure";
let darkMode = false;
let currentStep = 0;
let responses = [];
let speechActive = false;
let currentTopic = "";
let speechesCompleted = 0;
let downloadOutlineEnabled = false;
let speechSessionSerial = 0;
let outlineTimerEnabled = false;
let outlineTimerSeconds = 60;

document.addEventListener("DOMContentLoaded", () => {
  const savedDarkMode = localStorage.getItem("darkMode");
  const savedTimerMode = localStorage.getItem("timerMode");
  const savedCategory = localStorage.getItem("speechCategory");
  const savedSpeeches = localStorage.getItem("speechesCompleted");
  const savedDownloadOutline = localStorage.getItem("downloadOutlineEnabled");
  const savedSpeechSessionSerial = localStorage.getItem("speechSessionSerial");
	const savedOutlineTimerEnabled = localStorage.getItem("outlineTimerEnabled");
	const savedOutlineTimerSeconds = localStorage.getItem("outlineTimerSeconds");


  if (savedSpeeches !== null) {
    speechesCompleted = parseInt(savedSpeeches);
  }

  if (savedSpeechSessionSerial !== null) {
    speechSessionSerial = parseInt(savedSpeechSessionSerial);
  }

  if (savedCategory) {
    categorySelect.value = savedCategory;
  }

  if (savedDarkMode !== null) {
    darkMode = (savedDarkMode === "true");
    darkModeToggle.checked = darkMode;
  }

  if (savedTimerMode !== null) {
    timerMode = savedTimerMode;
    timerModeSelect.value = timerMode;
  }

  if (savedDownloadOutline !== null) {
    downloadOutlineEnabled = (savedDownloadOutline === "true");
  }

	if (savedOutlineTimerEnabled !== null) {
		outlineTimerEnabled = (savedOutlineTimerEnabled === "true");
		outlineTimerToggle.checked = outlineTimerEnabled;
	}

	if (savedOutlineTimerSeconds !== null) {
		outlineTimerSeconds = parseInt(savedOutlineTimerSeconds);
		outlineTimerSecondsInput.value = outlineTimerSeconds;
	}


  const downloadOutlineToggle = document.getElementById("downloadOutlineToggle");
  if (downloadOutlineToggle) {
    downloadOutlineToggle.checked = downloadOutlineEnabled;
  }

  applyDarkMode();
  updateSpeechCounterDisplay();
});

// DARK MODE TOGGLE
darkModeToggle.addEventListener("change", () => {
  darkMode = darkModeToggle.checked;

  // Save instantly
  localStorage.setItem("darkMode", darkMode);

  applyDarkMode();
});



// OUTLINE TIMER TOGGLE
outlineTimerToggle.addEventListener("change", () => {
  outlineTimerEnabled = outlineTimerToggle.checked;
  localStorage.setItem("outlineTimerEnabled", outlineTimerEnabled);
});

outlineTimerSecondsInput.addEventListener("change", () => {
  const value = parseInt(outlineTimerSecondsInput.value);

  if (!isNaN(value) && value > 0) {
    outlineTimerSeconds = value;
    localStorage.setItem("outlineTimerSeconds", outlineTimerSeconds);
  }
});



// DOWNLOAD OUTLINE TOGGLE
downloadOutlineToggle.addEventListener("change", () => {
  downloadOutlineEnabled = downloadOutlineToggle.checked;
  localStorage.setItem("downloadOutlineEnabled", downloadOutlineEnabled);
});

// TIMER MODE TOGGLE (SEPARATE!)
timerModeSelect.addEventListener("change", () => {
  timerMode = timerModeSelect.value;

  // Save instantly
  localStorage.setItem("timerMode", timerMode);
});


categorySelect.addEventListener("change", () => {
	localStorage.setItem("speechCategory", categorySelect.value);
});

// Start session
startBtn.addEventListener("click", () => {

  timerMode = timerModeSelect.value;
  darkMode = darkModeToggle.checked;

  localStorage.setItem("darkMode", darkMode);
  localStorage.setItem("timerMode", timerMode);
	outlineTimerEnabled = outlineTimerToggle.checked;
	outlineTimerSeconds = parseInt(outlineTimerSecondsInput.value) || 60;

  applyDarkMode();

  startBtn.style.display = "none";
  document.getElementById("settings").style.display = "none";
  document.getElementById("appTitle").style.display = "none";

  stepContainer.style.display = "block";
  window.scrollTo(0, 0);
	
	const selectedCategory = categorySelect.value;
	let filteredTopics;

	if (selectedCategory === "Mixed") {
		filteredTopics = topicBank;
	} else {
		filteredTopics = topicBank.filter(topic =>
			topic.categories.includes(selectedCategory)
		);
	}

	const randomTopic = filteredTopics[
		Math.floor(Math.random() * filteredTopics.length)
	];

	currentTopic = randomTopic.text;	
  loadStep();
});

// SPEECH COUNTER RESET
document.addEventListener("click", (event) => {
  if (event.target && event.target.id === "resetCounterBtn") {
    speechesCompleted = 0;
    localStorage.setItem("speechesCompleted", 0);
    updateSpeechCounterDisplay();
  }
});

// DARK MODE
function applyDarkMode() {
  if (darkMode) {
    document.body.style.backgroundColor = "black";
    document.body.style.color = "white";
  } else {
    document.body.style.backgroundColor = "";
    document.body.style.color = "";
  }
}

// SPEECH COUNTER
function updateSpeechCounterDisplay() {
  const counterEl = document.getElementById("speechCounter");
  if (counterEl) {
    counterEl.textContent = speechesCompleted;
  }
}

// Load step
function loadStep() {
  const step = steps[currentStep];
	stepTitle.innerHTML = `
		<div style="font-size:20px; margin-bottom:6px;">
			<strong>Topic:</strong> ${currentTopic}
		</div>

		<div style="font-size:15px; font-weight:600; margin-bottom:10px;">
			${step.title}:
			<span style="font-weight:400; opacity:0.5;">
				&nbsp;${step.hint}
			</span>
		</div>
	`;

	stepHint.innerHTML = ""; // no longer needed
		stepInput.value = "";
		startOutlineTimer();
		
	if (outlineTimerEnabled) {
		outlineTimerDisplay.style.display = "block";
		outlineTimerDisplay.textContent = outlineTimerSeconds;
	} else {
		outlineTimerDisplay.style.display = "none";
	}		
		
	}


function startOutlineTimer() {
  if (!outlineTimerEnabled) return;

  clearInterval(outlineTimerInterval);

  outlineTimeRemaining = outlineTimerSeconds;
  outlineTimerDisplay.textContent = outlineTimeRemaining;

  outlineTimerDisplay.style.color = "white";

  outlineTimerInterval = setInterval(() => {
    outlineTimeRemaining--;

    outlineTimerDisplay.textContent = outlineTimeRemaining;

    // COLOR LOGIC
    if (outlineTimeRemaining <= 0) {
      outlineTimerDisplay.style.color = "red";
      clearInterval(outlineTimerInterval);
    } 
    else if (outlineTimeRemaining <= 10) {
      outlineTimerDisplay.style.color = "yellow";
    } 
    else {
      outlineTimerDisplay.style.color = "white";
    }

  }, 1000);
}



// ENTER KEY FOR INPUT
stepInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    nextBtn.click();
  }
});

// Next button
nextBtn.addEventListener("click", () => {
	clearInterval(outlineTimerInterval);
  const value = stepInput.value.trim();

  if (value === "") return;

  responses.push(value);

  // Add to visible outline
  const step = steps[currentStep];
  const entry = document.createElement("p");
	entry.innerHTML = `
		<div style="opacity: 0.6; font-size: 14px;">${step.title}</div>
		<div style="font-size: 18px; margin-bottom: 10px;">${value}</div>
	`;
	
  outlineDisplay.appendChild(entry);
	currentStep++;

  if (currentStep < steps.length) {
    loadStep();
  } else {
    endOutline();
  }
});

// End outline phase
function endOutline() {
  outlineDisplay.innerHTML = ""; // 👈 clears old outline
  stepContainer.style.display = "none";

  // Create speech phase container
	const speechDiv = document.createElement("div");
	
	speechDiv.style.marginTop = "0px";
	speechDiv.style.paddingTop = "10px";	

	speechDiv.innerHTML = `
		<div style="
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			background: inherit;
			z-index: 1000;
			padding-top: 10px;
		">
			<p style="margin: 0;">Speech starting in <span id="countdown">5</span>...</p>

			<div id="timerDisplay" style="
				font-size: 150px;
				font-weight: bold;
				margin: 0;
			">
				00:00
			</div>
		</div>

		<div id="scrollArea" style="
			margin-top: 220px;
			height: calc(100vh - 220px);
			overflow-y: auto;
			padding-bottom: 40px;
		">
			<div id="finalOutline"></div>

			<p style="margin-top: 10px;">
				Press "H" to hand it back to the chair
			</p>
		</div>
	`;

  document.body.appendChild(speechDiv);

  // Reprint outline
  const finalOutline = document.getElementById("finalOutline");

  steps.forEach((step, index) => {
    const p = document.createElement("p");
		
		p.innerHTML = `
			<div style="opacity: 0.6; font-size: 14px;">${step.title}</div>
			<div style="font-size: 20px; margin-bottom: 12px;">${responses[index]}</div>
		`;
		
    finalOutline.appendChild(p);
  });

  startCountdown();
}

let timerInterval;
let seconds = 0;
let outlineTimerInterval;
let outlineTimeRemaining = 0;


// Countdown before speech
function startCountdown() {
  let count = 5;
  const countdownEl = document.getElementById("countdown");

  const countdownInterval = setInterval(() => {
    count--;
    countdownEl.textContent = count;

    if (count === 0) {
      clearInterval(countdownInterval);
      startTimer();
    }
  }, 1000);
}

// Start speech timer
function startTimer() {
  speechActive = true;
  seconds = 0;
  const timerDisplay = document.getElementById("timerDisplay");

	timerInterval = setInterval(() => {
	  seconds++;

	  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
	  const secs = String(seconds % 60).padStart(2, '0');

	  timerDisplay.textContent = `${mins}:${secs}`;
		// COLOR LOGIC (Mode-Based)

		if (timerMode === "structure") {

			// STRUCTURE MODE
			if (seconds < 60) {
				document.body.style.backgroundColor = darkMode ? "#003366" : "lightblue";
			} 
			else if (seconds < 240) {
				document.body.style.backgroundColor = darkMode ? "#014d1f" : "lightgreen";
			} 
			else if (seconds < 300) {
				document.body.style.backgroundColor = darkMode ? "#4b006e" : "plum";
			} 
			else {
				document.body.style.backgroundColor = darkMode ? "#660000" : "lightcoral";
			}
		} else if (timerMode === "toastmasters") {

			// TOASTMASTERS MODE (5–7 min standard)
			if (seconds < 300) {
				// BEFORE 5 MIN → NO COLOR (use base mode)
				applyDarkMode();
			} 
			else if (seconds < 360) {
				// 5–6 MIN → GREEN
				document.body.style.backgroundColor = darkMode ? "#014d1f" : "lightgreen";
			} 
			else if (seconds < 420) {
				// 6–7 MIN → YELLOW
				document.body.style.backgroundColor = darkMode ? "#665c00" : "khaki";
			} 
			else {
				// 7+ MIN → RED
				document.body.style.backgroundColor = darkMode ? "#660000" : "lightcoral";
			}
		}		
}, 1000);

} // closes startTimer()

document.addEventListener("keydown", (event) => {
	if (speechActive && event.key.toLowerCase() === "h") {
    endSpeech();
  }
});

function endSpeech() {
  if (!speechActive) return;

  speechActive = false;
  clearInterval(timerInterval);

  // ✅ CLEAR SCREEN
  document.body.innerHTML = "";

  // ✅ APPLY DARK MODE AGAIN (so background stays correct)
  applyDarkMode();

  // ✅ CENTER LAYOUT
  document.body.style.textAlign = "center";
  document.body.style.paddingTop = "100px";

  // ✅ CREATE RESULT
	// CHECK IF SUCCESSFUL SPEECH (5 min = 300 sec)
	if (seconds >= 300) {
		speechesCompleted++;
		localStorage.setItem("speechesCompleted", speechesCompleted);
	}

	if (downloadOutlineEnabled) {
		exportOutlineTextFile();
	}

	const endDiv = document.createElement("div");

	endDiv.innerHTML = `
		<div style="font-size: 32px; font-weight: 600; margin-bottom: 20px;">
			Speech Ended
		</div>
			
    <div style="font-size: 20px; margin-bottom: 30px;">
      Total Time: ${formatTime(seconds)}
    </div>

    <button id="restartBtn">Start New Session</button>
  `;
  document.body.appendChild(endDiv);
  document.getElementById("restartBtn").addEventListener("click", resetApp);
}

// helper
function formatTime(totalSeconds) {
  const mins = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const secs = String(totalSeconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function formatSerialNumber(num) {
  return String(num).padStart(3, '0');
}

function sanitizeFileName(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

function exportOutlineTextFile() {
  speechSessionSerial++;
  localStorage.setItem("speechSessionSerial", speechSessionSerial);

  const serial = formatSerialNumber(speechSessionSerial);
  const now = new Date();
  const dateString = now.toLocaleDateString();
  const timeString = now.toLocaleTimeString();
  const speechTitle = responses[0] || "untitled-speech";
  const safeTitle = sanitizeFileName(speechTitle) || "untitled-speech";
  const filename = `speech_${serial}_${safeTitle}.txt`;
  let fileContent = `Speech Forge Export

Session ID: ${serial}
Date: ${dateString}
Time: ${timeString}

Topic:
${currentTopic}

Title / Theme:
${responses[0] || ""}

Outline:
`;

  steps.forEach((step, index) => {
    fileContent += `
${step.title}:
${responses[index] || ""}
`;
  });

  fileContent += `

Total Time:
${formatTime(seconds)}
`;

  downloadTextFile(filename, fileContent);
}

function resetApp() {
  location.reload();
}