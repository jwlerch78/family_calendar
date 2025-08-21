// index.js

let mode = "calendar";      // Current right-panel mode: calendar, camera, map
let FocusMode = "RightPanel"; // Either "RightPanel" or "LeftPanel"

const keyLog = document.getElementById("keyLog");
const rightIframe = document.getElementById("rightIframe");
const leftIframe = document.getElementById("leftIframe");

function sendToFocus(action) {
    if (FocusMode === "RightPanel") {
        rightIframe.contentWindow.postMessage({ action, mode }, "*");
    } else if (FocusMode === "LeftPanel") {
        leftIframe.contentWindow.postMessage({ action }, "*");
    }
}

function toggleBlack() {
    if (mode !== "black") {
        // Switch to black mode
        mode = "black";
        rightIframe.src = "black.html";
    } else {
        // Restore calendar mode by default
        mode = "calendar";
        rightIframe.src = "calendar.html";
    }
}

function toggleMode() {
    // Skip mode switch if in black mode
    if (mode === "black") return;

    if (mode === "calendar") {
        mode = "camera";
        rightIframe.src = "camera.html";
    } else if (mode === "camera") {
        mode = "map";
        rightIframe.src = "map.html";
    } else {
        mode = "calendar";
        rightIframe.src = "calendar.html";
    }
}

document.addEventListener("keydown", (event) => {
    event.preventDefault();
    event.stopPropagation();

    keyLog.textContent = `${event.keyCode}`;

    // --- Always allow toggle black on play/pause ---
    if (event.keyCode === 179) { 
        toggleBlack();
        return;
    }

    // --- Block all other actions in black mode ---
    if (mode === "black") return;

    switch (event.keyCode) {
        case 38: // Up arrow
            sendToFocus("Up");
            break;
        case 40: // Down arrow
            sendToFocus("Down");
            break;
        case 37: // Left arrow
            sendToFocus("Left");
            break;
        case 39: // Right arrow
            sendToFocus("Right");
            break;
        case 227: // Rewind (Fire TV)
        case 188: // < (comma) PC test
            sendToFocus("Prev");
            break;
        case 228: // Fast forward (Fire TV)
        case 190: // > (period) PC test
            if (FocusMode === "LeftPanel") {
                // Bounce back to RightPanel
                FocusMode = "RightPanel";
                // Reset right iframe to its first option (Weekly in calendar, etc.)
                rightIframe.contentWindow.postMessage(
                    { action: "boundaryNext", mode },
                    "*"
                );
            } else {
                sendToFocus("Next");
            }
            break;
        case 13: // Enter → cycle modes
            toggleMode();
            break;
    }
});

// --- Listen for focus handoff from right iframe ---
window.addEventListener("message", (event) => {
    if (event.data.action === "focusLeftPanel") {
        FocusMode = "LeftPanel";
    }
});
