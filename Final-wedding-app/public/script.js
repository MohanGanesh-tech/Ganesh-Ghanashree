let currentAudio = null;
window.onload = function() {
    document.getElementById("myAudio").play();
    document.getElementById("myAudio").volume = 0.5;
  };

document.getElementById("startSpeech").addEventListener("click", function () {
    document.getElementById("myAudio").pause();
    document.querySelector("#ask").disabled = true;
    document.querySelector("#userInputText").innerText = "";
    document.querySelector("#aiResponse").innerText = "";
    document.querySelector("#status").innerText = "Loading...";
    document.querySelector(".songvideo").muted = true;
    fetch("https://final-wedding-app.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "userText":"Hi, love story in one line and warm invite me for wedding in one line and what else you can help me today" }),
    })
        .then(response => response.json())
        .then(data => {
            let aiResponse = data.aiResponse;
            console.log(aiResponse);
            getVoiceFromBackend(aiResponse);
            document.querySelector("#ask").disabled = false;
        })
        .catch(error => console.error("Error fetching AI response:", error));
});

document.getElementById("ask").addEventListener("click", function () {
    document.getElementById("myAudio").pause();
    document.querySelector(".songvideo").muted = true;
    document.querySelector("#ask").disabled = true;
    document.querySelector("#userInputText").innerText = "";
    document.querySelector("#aiResponse").innerText = "";
    document.querySelector("#status").innerText = "Listening...";
    if (currentAudio && !currentAudio.paused) {
        currentAudio.pause();
        currentAudio.currentTime = 0; // Reset to the beginning
    }
    let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onstart = function () {
        console.log("Speech recognition started...");
    };

    recognition.onresult = function (event) {
        let userText = event.results[0][0].transcript;
        console.log("User said:", userText);
        document.querySelector("#ask").disabled = true;
        document.querySelector("#userInputText").innerText = userText;
        document.querySelector("#status").innerText = "Loading...";
        
        // Stop recognition after capturing input
        recognition.stop();

        fetch("https://final-wedding-app.onrender.com/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userText }),
        })
            .then(response => response.json())
            .then(data => {
                let aiResponse = data.aiResponse;
                console.log(aiResponse);
                getVoiceFromBackend(aiResponse);
                document.querySelector("#ask").disabled = false;
            })
            .catch(error => console.error("Error fetching AI response:", error));
    };

    recognition.onerror = function (event) {
        console.error("Speech recognition error:", event.error);
        recognition.stop();
    };

    recognition.onend = function () {
        console.log("Speech recognition ended.");
    };
});

function getVoiceFromBackend(text) {
    fetch("https://final-wedding-app.onrender.com/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
    })
        .then(response => response.blob())
        .then(blob => {
            let audioUrl = URL.createObjectURL(blob);
            let audio = new Audio(audioUrl);
            audio.onloadeddata = function () {
                // Stop previously playing audio
                if (currentAudio && !currentAudio.paused) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0; // Reset to the beginning
                }

                document.querySelector("#status").innerText = "";
                document.querySelector("#aiResponse").innerText = text;
                console.log("Audio loaded. Playing now...");

                currentAudio = audio; // Update current playing audio
                audio.play();
                document.querySelector("#ask").disabled = false;
            };

            audio.onerror = function () {
                console.error("Error playing generated speech.");
            };
        })
        .catch(error => console.error("Error generating speech:", error));
}

function updateCountdown() {
    const weddingDate = new Date("February 23, 2025 10:50:00 GMT+0530").getTime();
    const marriedMessage = document.querySelector(".countdown .wearemarried");
    let videoAdded = false; // Ensure video is added only once

    function updateTime() {
        const now = new Date().getTime();
        let timeLeft = weddingDate - now;
        let isMarried = timeLeft < 0;
        timeLeft = Math.abs(timeLeft); // Convert to positive for elapsed time

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        document.querySelector(".time-box:nth-child(1) span").innerText = (isMarried ? "+" : "") + days;
        document.querySelector(".time-box:nth-child(2) span").innerText = hours;
        document.querySelector(".time-box:nth-child(3) span").innerText = minutes;
        document.querySelector(".time-box:nth-child(4) span").innerText = seconds;

        if (isMarried && !videoAdded) {
            marriedMessage.innerHTML = `
                <h3>We are Married! 🎉</h3>
                <div class="container" style="display: flex; justify-content: center; align-items: center; padding-top: 10px;">
                    <video class="songvideo" src="assets/Ganesh + Ghanashree Song Compressed.mp4" width="100%" height="auto" autoplay controls loop muted style="display: block; border-radius: 10px;"></video>
                </div>
            `;
            videoAdded = true;
        }
    }

    updateTime(); // Initial call
    setInterval(updateTime, 1000);
}

updateCountdown();



// Open Google Maps on Click (Exact Location)
document.querySelectorAll(".map-btn").forEach(button => {
    button.addEventListener("click", function () {
        window.open("https://www.google.com/maps/place/Bandimane+Kalyana+Mantapa/@13.3165182,77.0418957,15z/data=!4m6!3m5!1s0x3bb02e8b3befd963:0x59e04ef63c5c42d0!8m2!3d13.3165182!4d77.0418957!16s%2Fg%2F11c5k23z1m", "_blank");
    });
});


function openPopup() {
    document.getElementById("popup").style.display = "block";
    document.getElementById("overlay").style.display = "block";
}

function closePopup() {
    document.getElementById("popup").style.display = "none";
    document.getElementById("overlay").style.display = "none";
    if (currentAudio && !currentAudio.paused) {
        currentAudio.pause();
        currentAudio.currentTime = 0; // Reset to the beginning
    }
    document.getElementById("myAudio").play(); 
}

document.addEventListener("DOMContentLoaded", function () {
    const video = document.querySelector(".songvideo");
    video.volume = 0.5; // Set volume to 50%
    video.muted = true;  // Keep it muted
  });