// Global State variables
let currentTheme = 'dark';
let voiceActive = true;
let isUserLoggedIn = false;
let webcamStream = null;
let speechRecognition = null;
let synth = window.speechSynthesis;

$(function () {
    // 1. Check user login status and load dashboard details on startup
    loadDashboardDetails();

    // 2. Register Service Worker for PWA installation support
    registerPWAServiceWorker();

    // 3. Configure file select predictions
    $("#btn-predict").click(function () {
        var fileInput = $("#imageUpload")[0];
        if (!fileInput.files || !fileInput.files[0]) {
            alert("Please choose a skin image first.");
            return;
        }
        var formData = new FormData($("#upload-file")[0]);
        executePrediction(formData);
    });
});

// --- SPA Tab Switcher ---
function switchView(viewId) {
    $(".app-view").removeClass("active");
    $("#" + viewId).addClass("active");
    
    // Update navigation sidebar active highlights
    $(".nav-link").removeClass("active");
    $(`.nav-link[data-view="${viewId}"]`).addClass("active");

    // Handle special webcam streams toggling
    if (viewId !== 'scanner-view') {
        stopWebcam();
    }
    
    // Read status via voice synthesis if active
    if (voiceActive) {
        let pageName = viewId.replace('-view', '');
        speak(`Navigating to ${pageName}`);
    }
}

// --- PWA Service Worker ---
function registerPWAServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered successfully!', reg.scope))
            .catch(err => console.warn('Service Worker registration failed:', err));
    }
}

// --- Loading Dashboard Data from SQLite ---
function loadDashboardDetails() {
    $.ajax({
        type: "GET",
        url: "/dashboard-data",
        success: function (res) {
            if (res.success) {
                isUserLoggedIn = true;
                
                // Update navigation visual styles
                $("#history-nav").show();
                $("#sidebar-profile").show();
                $("#sidebar-username").text(res.username);
                $("#dash-username").text(res.username);
                $("#settings-auth-container").show();
                $("#sidebar-auth-btn").html('<i class="fa-solid fa-right-from-bracket"></i><span>Log Out</span>');
                $("#sidebar-auth-btn").attr("onclick", "handleLogout()");
                
                // Checkboxes
                $("#chk-spf").prop("checked", res.checklist.spf === 1);
                $("#chk-cleanse").prop("checked", res.checklist.cleanse === 1);
                $("#chk-hydrate").prop("checked", res.checklist.hydrate === 1);
                
                // Stat Counts
                $("#stat-scan-count").text(res.scans.length);
                let score = 0;
                if (res.checklist.spf === 1) score += 33;
                if (res.checklist.cleanse === 1) score += 33;
                if (res.checklist.hydrate === 1) score += 34;
                $("#stat-checklist-score").text(score + "%");
                
                // Latest scan result
                if (res.scans.length > 0) {
                    $("#stat-last-condition").text(res.scans[0].result);
                } else {
                    $("#stat-last-condition").text("None");
                }
                
                // History Grid Compilation
                let tbody = $("#history-table-body");
                tbody.empty();
                if (res.scans.length === 0) {
                    tbody.append('<tr><td colspan="6" style="text-align:center; color:var(--text-secondary);">No clinical assessments stored yet. Run your first AI Scan!</td></tr>');
                } else {
                    res.scans.forEach(scan => {
                        let severityClass = "badge-low";
                        if (scan.severity.toLowerCase() === 'medium') severityClass = "badge-medium";
                        if (scan.severity.toLowerCase() === 'high') severityClass = "badge-high";
                        
                        let date = scan.created_at.substring(0, 16).replace('T', ' ');
                        
                        let row = `
                        <tr>
                            <td><img class="history-thumb" src="/uploads/${scan.filename}" alt="Scan thumb" onerror="this.src='https://img.icons8.com/color/48/ffffff/image.png'"></td>
                            <td><span style="font-weight:500;">${date}</span></td>
                            <td><span style="font-weight:700; color:var(--accent-color);">${scan.result}</span></td>
                            <td><span class="badge ${severityClass}">${scan.severity}</span></td>
                            <td><span style="font-size:0.85rem; font-weight:600; color:var(--text-secondary);"><i class="fa-solid fa-user-doctor" style="margin-right:6px;"></i>${scan.doctor.split('(')[0]}</span></td>
                            <td>
                                <a class="btn btn-secondary" style="padding:0.4rem 0.8rem; font-size:0.8rem;" href="/download_report/${scan.id}">
                                    <i class="fa-solid fa-file-pdf"></i> PDF
                                </a>
                            </td>
                        </tr>
                        `;
                        tbody.append(row);
                    });
                }
            }
        },
        error: function () {
            // Guest default setup
            isUserLoggedIn = false;
            $("#history-nav").hide();
            $("#sidebar-profile").hide();
            $("#settings-auth-container").hide();
            $("#sidebar-auth-btn").html('<i class="fa-solid fa-right-to-bracket"></i><span>Sign In</span>');
            $("#sidebar-auth-btn").attr("onclick", "switchView('auth-view')");
            $("#dash-username").text("Guest");
            $("#stat-scan-count").text("0");
            $("#stat-checklist-score").text("0%");
            $("#stat-last-condition").text("N/A");
        }
    });
}

// --- Checklist submission ---
function submitChecklist() {
    if (!isUserLoggedIn) {
        alert("Please Sign In first to track your skincare checklist goals!");
        $("#chk-spf, #chk-cleanse, #chk-hydrate").prop("checked", false);
        switchView("auth-view");
        return;
    }
    
    let payload = {
        spf: $("#chk-spf").is(":checked") ? 1 : 0,
        cleanse: $("#chk-cleanse").is(":checked") ? 1 : 0,
        hydrate: $("#chk-hydrate").is(":checked") ? 1 : 0
    };
    
    $.ajax({
        type: "POST",
        url: "/checklist",
        data: JSON.stringify(payload),
        contentType: "application/json",
        success: function () {
            loadDashboardDetails(); // Recalculate stats
        }
    });
}

// --- Settings Theme Toggle ---
function toggleThemePalette() {
    let html = $("html");
    let text = $("#theme-btn-text");
    if (html.attr("data-theme") === 'dark') {
        html.attr("data-theme", "light");
        text.text("Light Mode");
        currentTheme = 'light';
    } else {
        html.attr("data-theme", "dark");
        text.text("Dark Mode");
        currentTheme = 'dark';
    }
    
    // Save theme to SQLite database if logged in
    if (isUserLoggedIn) {
        $.ajax({
            type: "POST",
            url: "/theme",
            data: JSON.stringify({theme: currentTheme}),
            contentType: "application/json"
        });
    }
}

// --- Authentication Operations ---
function toggleAuthMode() {
    let isLogin = $("#auth-title").text().includes("Welcome");
    if (isLogin) {
        $("#auth-title").text("Create Skincare Profile");
        $("#email-group").show();
        $("#auth-submit-btn").text("Sign Up");
        $("#auth-toggle-text").html('Already have an account? <span onclick="toggleAuthMode()">Sign In</span>');
    } else {
        $("#auth-title").text("Welcome to DermShield AI");
        $("#email-group").hide();
        $("#auth-submit-btn").text("Sign In");
        $("#auth-toggle-text").html('Don\'t have an account? <span onclick="toggleAuthMode()">Sign Up</span>');
    }
}

function handleAuthSubmit(e) {
    e.preventDefault();
    let isLogin = $("#auth-submit-btn").text() === 'Sign In';
    let url = isLogin ? "/login" : "/register";
    let payload = {
        username: $("#auth-username").val(),
        password: $("#auth-password").val()
    };
    if (!isLogin) {
        payload.email = $("#auth-email").val();
    }
    
    $.ajax({
        type: "POST",
        url: url,
        data: JSON.stringify(payload),
        contentType: "application/json",
        success: function (res) {
            alert(res.message);
            if (isLogin) {
                loadDashboardDetails();
                switchView("dashboard-view");
            } else {
                toggleAuthMode(); // Switch back to login page
            }
            // Clear inputs
            $("#auth-username, #auth-password, #auth-email").val("");
        },
        error: function (xhr) {
            let msg = xhr.responseJSON ? xhr.responseJSON.message : "Authentication failed.";
            alert(msg);
        }
    });
}

function handleLogout() {
    $.ajax({
        type: "POST",
        url: "/logout",
        success: function (res) {
            alert(res.message);
            isUserLoggedIn = false;
            loadDashboardDetails();
            switchView("dashboard-view");
        }
    });
}

// --- Webcam Scanning Implementation ---
function toggleScannerSource(source) {
    if (source === 'camera') {
        $("#scanner-file-container").hide();
        $(".image-section").hide();
        $("#scanner-camera-container").show();
        startWebcam();
    } else {
        $("#scanner-camera-container").hide();
        stopWebcam();
        $("#scanner-file-container").show();
    }
}

function startWebcam() {
    let video = document.getElementById("webcam-feed");
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then(function (stream) {
                webcamStream = stream;
                video.srcObject = stream;
                video.play();
                if (voiceActive) speak("Webcam active. Position the skin spot in the target overlay.");
            })
            .catch(function (err) {
                console.error("Camera access failed:", err);
                alert("Camera permission denied. Please select manual upload instead.");
                toggleScannerSource('file');
            });
    }
}

function stopWebcam() {
    let video = document.getElementById("webcam-feed");
    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        webcamStream = null;
    }
    if (video) {
        video.srcObject = null;
    }
}

function captureWebcamFrame() {
    let video = document.getElementById("webcam-feed");
    if (!webcamStream) return;
    
    // Draw canvas snapshot
    let canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    let ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Stop camera feed after taking picture
    stopWebcam();
    $("#scanner-camera-container").hide();
    $("#scanner-file-container").show();
    
    // Convert to Blob and submit
    canvas.toBlob(function (blob) {
        let file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
        
        // Show file selection preview locally
        let reader = new FileReader();
        reader.onload = function (e) {
            $("#imagePreview").html('<img src="' + e.target.result + '" style="max-width:100%; max-height:280px;" alt="Captured preview"/>');
            $(".image-section").show();
        };
        reader.readAsDataURL(file);
        
        // Prepare multipart form payload
        let formData = new FormData();
        formData.append("image", file);
        
        // Automatically execute predictive diagnosis
        executePrediction(formData);
    }, "image/jpeg");
}

function handleFileSelect(input) {
    var file = input.files && input.files[0];
    if (!file) return;
    
    var reader = new FileReader();
    reader.onload = function (e) {
        $("#imagePreview").html('<img src="' + e.target.result + '" style="max-width:100%; max-height:280px;" alt="Preview"/>');
        $(".image-section").show();
    };
    reader.readAsDataURL(file);
}

// --- Predictive execution AJAX logic ---
function executePrediction(formData) {
    $(".loader").show();
    $(".image-section").hide();
    $("#no-result-placeholder").hide();
    $("#result-card").hide();
    $("#xai-panel").hide();
    
    $.ajax({
        type: "POST",
        url: "/predict",
        data: formData,
        contentType: false,
        cache: false,
        processData: false,
        success: function (res) {
            $(".loader").hide();
            if (res.success) {
                // Populate Diagnostic Output
                $("#res-title").text(res.result);
                
                let severityClass = "badge-low";
                if (res.severity.toLowerCase() === 'medium') severityClass = "badge-medium";
                if (res.severity.toLowerCase() === 'high') severityClass = "badge-high";
                $("#res-severity").text(res.severity).attr("class", `badge ${severityClass}`);
                
                $("#res-description").text(res.description);
                $("#res-doctor-specialist").text(res.doctor);
                
                // Populate advice checklist
                let adviceContainer = $("#res-advice");
                adviceContainer.empty();
                res.advice.forEach(step => {
                    adviceContainer.append(`<li><i class="fa-solid fa-circle-chevron-right" style="color:var(--accent-color); margin-right:8px;"></i>${step}</li>`);
                });
                
                // Populate Confidence SVG progress bars
                let barsContainer = $("#res-confidence-bars");
                barsContainer.empty();
                Object.keys(res.confidence).forEach(condition => {
                    let prob = res.confidence[condition];
                    let percent = (prob * 100).toFixed(2);
                    barsContainer.append(`
                        <div class="conf-row">
                            <div class="conf-meta">
                                <span>${condition}</span>
                                <span>${percent}%</span>
                            </div>
                            <div class="conf-bar-container">
                                <div class="conf-bar-fill" style="width: ${percent}%;"></div>
                            </div>
                        </div>
                    `);
                });
                
                // Display Grad-CAM side-by-side
                $("#xai-orig-img").attr("src", `/uploads/${res.filename}`);
                $("#xai-heatmap-img").attr("src", `/uploads/${res.heatmap_filename}`);
                $("#xai-panel").show();
                $("#result-card").show();
                
                // Display PDF report action if logged in
                let pdfDiv = $("#pdf-download-container");
                pdfDiv.empty();
                if (res.scan_id) {
                    pdfDiv.append(`
                        <a href="/download_report/${res.scan_id}" class="btn btn-primary" style="width:100%;">
                            <i class="fa-solid fa-file-pdf"></i> Download Official Assessment PDF
                        </a>
                    `);
                    // Reload histories
                    loadDashboardDetails();
                } else {
                    pdfDiv.append(`<p style="color:var(--text-secondary); font-size:0.8rem; text-align:center; font-style:italic;">Sign In to save records & compile downloadable PDF Medical Reports.</p>`);
                }
                
                // Speech Synthesizer callout
                if (voiceActive) {
                    speak(`Analysis complete! Identified Skin Condition: ${res.result}. Severity rating: ${res.severity}. Recommended checkup: ${res.doctor}.`);
                }
            } else {
                alert("Diagnostic failed: " + res.message);
                $("#no-result-placeholder").show();
            }
        },
        error: function (xhr) {
            $(".loader").hide();
            $("#no-result-placeholder").show();
            let msg = xhr.responseJSON ? xhr.responseJSON.message : "Diagnostics execution failed. Try again.";
            alert(msg);
        }
    });
}

// --- Voice Synthesis (TTS) Helper ---
function speak(text) {
    if (!synth) return;
    // Cancel active readings
    synth.cancel();
    
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.0;
    utterance.rate = 1.05;
    
    // Choose appropriate clinical voice if available
    let voices = synth.getVoices();
    let engVoice = voices.find(v => v.lang.includes("en-US") || v.lang.includes("en-GB"));
    if (engVoice) utterance.voice = engVoice;
    
    synth.speak(utterance);
}

function toggleSpeechSynthesis() {
    voiceActive = !voiceActive;
    if (voiceActive) {
        $("#speech-reading-toggle").removeClass("btn-secondary").addClass("btn-primary");
        $("#speech-toggle-text").text("Voice Reading: On");
        speak("Voice feedback activated.");
    } else {
        if (synth) synth.cancel();
        $("#speech-reading-toggle").removeClass("btn-primary").addClass("btn-secondary");
        $("#speech-toggle-text").text("Voice Reading: Off");
    }
}

// --- Voice Recognition Assistant (STT) ---
function toggleVoiceAssistant() {
    let btn = $("#voice-assistant-btn");
    let statusText = $("#voice-status-text");
    
    let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Your current web browser does not support HTML5 Speech Recognition APIs. Use Chrome/Edge/Safari.");
        return;
    }
    
    if (speechRecognition) {
        // Listening already, shut down
        speechRecognition.stop();
        speechRecognition = null;
        btn.removeClass("listening");
        statusText.text("Offline (Click to Speak)");
        return;
    }
    
    speechRecognition = new SpeechRecognition();
    speechRecognition.continuous = false;
    speechRecognition.lang = 'en-US';
    speechRecognition.interimResults = false;
    
    speechRecognition.onstart = function () {
        btn.addClass("listening");
        statusText.text("Listening for command...");
        speak("How can I help you?");
    };
    
    speechRecognition.onerror = function (e) {
        console.error("Speech error:", e);
        statusText.text("Recognition error.");
        btn.removeClass("listening");
        speechRecognition = null;
    };
    
    speechRecognition.onend = function () {
        btn.removeClass("listening");
        statusText.text("Offline (Click to Speak)");
        speechRecognition = null;
    };
    
    speechRecognition.onresult = function (event) {
        let resultText = event.results[0][0].transcript.toLowerCase().trim();
        console.log("Voice Command Recognized:", resultText);
        statusText.text(`Command: "${resultText}"`);
        
        // Command route matching
        if (resultText.includes("scan") || resultText.includes("diagnose")) {
            switchView("scanner-view");
            speak("Opening clinical scanner portal.");
        } else if (resultText.includes("dashboard") || resultText.includes("home")) {
            switchView("dashboard-view");
            speak("Returning to patient dashboard.");
        } else if (resultText.includes("history")) {
            if (isUserLoggedIn) {
                switchView("history-view");
                speak("Accessing your diagnostic archives.");
            } else {
                speak("Please register and sign in first to access history scans.");
                switchView("auth-view");
            }
        } else if (resultText.includes("chat") || resultText.includes("bot") || resultText.includes("advisor")) {
            switchView("chatbot-view");
            speak("Opening AI care advisor.");
        } else if (resultText.includes("dark mode") || resultText.includes("dark theme")) {
            if ($("html").attr("data-theme") !== 'dark') toggleThemePalette();
            speak("Deep cool-slate theme applied.");
        } else if (resultText.includes("light mode") || resultText.includes("light theme")) {
            if ($("html").attr("data-theme") !== 'light') toggleThemePalette();
            speak("Sleek white theme applied.");
        } else if (resultText.includes("capture") || resultText.includes("take photo") || resultText.includes("predict")) {
            if ($("#scanner-camera-container").is(":visible")) {
                captureWebcamFrame();
            } else if ($("#btn-predict").is(":visible")) {
                $("#btn-predict").click();
            } else {
                speak("Please open webcam scanner or select image file first.");
            }
        } else if (resultText.includes("spf") || resultText.includes("sunscreen")) {
            $("#chk-spf").click();
            speak("Sunscreen checklists toggled.");
        } else if (resultText.includes("cleanse") || resultText.includes("wash")) {
            $("#chk-cleanse").click();
            speak("Face wash checklists toggled.");
        } else if (resultText.includes("hydrate") || resultText.includes("water")) {
            $("#chk-hydrate").click();
            speak("Hydration targets checklist toggled.");
        } else {
            // General Chatbot input transfer fallback
            switchView("chatbot-view");
            $("#chat-user-input").val(resultText);
            $("#chat-form").submit();
            speak("Processing voice query inside care bot.");
        }
    };
    
    speechRecognition.start();
}

// --- AI Skincare Chatbot Operations ---
function handleChatSubmit(e) {
    if (e) e.preventDefault();
    let input = $("#chat-user-input");
    let msg = input.val().trim();
    if (!msg) return;
    
    appendChatMessage(msg, "user");
    input.val("");
    
    // Add typing loader state
    let typingId = "typing-" + Date.now();
    $("#chat-messages-container").append(`
        <div class="chat-bubble chat-bubble-bot" id="${typingId}" style="display:flex; align-items:center; gap:6px;">
            <i class="fa-solid fa-circle fa-bounce" style="font-size:0.5rem; color:var(--text-secondary);"></i>
            <i class="fa-solid fa-circle fa-bounce" style="font-size:0.5rem; color:var(--text-secondary); animation-delay: 0.2s;"></i>
            <i class="fa-solid fa-circle fa-bounce" style="font-size:0.5rem; color:var(--text-secondary); animation-delay: 0.4s;"></i>
        </div>
    `);
    scrollChatToBottom();
    
    $.ajax({
        type: "POST",
        url: "/chatbot",
        data: JSON.stringify({message: msg}),
        contentType: "application/json",
        success: function (res) {
            $(`#${typingId}`).remove();
            appendChatMessage(res.reply, "bot");
            if (voiceActive) speak(res.reply);
        },
        error: function () {
            $(`#${typingId}`).remove();
            appendChatMessage("Sorry, I had some trouble fetching skincare recommendations. Please try again.", "bot");
        }
    });
}

function askPresetChatbot(presetQuery) {
    $("#chat-user-input").val(presetQuery);
    $("#chat-form").submit();
}

function appendChatMessage(text, sender) {
    let container = $("#chat-messages-container");
    let bubbleClass = sender === "user" ? "chat-bubble-user" : "chat-bubble-bot";
    container.append(`<div class="chat-bubble ${bubbleClass}">${text}</div>`);
    scrollChatToBottom();
}

function scrollChatToBottom() {
    let container = document.getElementById("chat-messages-container");
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}
