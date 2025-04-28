
const { jsPDF } = window.jspdf;


document.addEventListener("DOMContentLoaded", function () {
    const scriptsContainer = document.getElementById("scripts-container");
    const showMoreBtn = document.getElementById("show-more-btn");

    // Example scripts data (Replace this with real script titles)
    const scripts = [
        "Marketing Strategy for 2024",
        "AI in Education",
        "Sustainable Business Practices",
        "Effective Video Tutorials",
        "Design Thinking for Startups",
        "Blockchain in Healthcare",
        "User Experience in Web Design",
        "Psychology of Learning",
        "The Future of Remote Work",
        "Best Practices for Script Writing"
    ];

    let visibleScripts = 8; // Number of scripts shown initially

    function displayScripts() {
        scriptsContainer.innerHTML = ""; // Clear previous content
        scripts.slice(0, visibleScripts).forEach(script => {
            const scriptDiv = document.createElement("div");
            scriptDiv.classList.add("script-item");
            scriptDiv.innerText = script;
            scriptsContainer.appendChild(scriptDiv);
        });

        // Hide the button if all scripts are visible
        if (visibleScripts >= scripts.length) {
            showMoreBtn.style.display = "none";
        } else {
            showMoreBtn.style.display = "block";
        }
    }

    // Load initial scripts
    displayScripts();

    // Show More functionality
    showMoreBtn.addEventListener("click", function () {
        visibleScripts += 4; // Load 4 more scripts each time
        displayScripts();
    });
});


// Scroll to the Guide section
document.querySelector(".guide-script").addEventListener("click", function () {
    document.querySelector(".guide").scrollIntoView({ behavior: "smooth" });
});

// Scroll to the Previous Scripts section
document.querySelector(".prev-scripts").addEventListener("click", function () {
    document.querySelector(".previous-scripts").scrollIntoView({ behavior: "smooth" });
});

// Redirect to the New Script page
document.querySelector(".new-script").addEventListener("click", function () {
    window.location.href = "title.html"; // Update with the actual page URL
});




//-------------to start the videos of guide---------------//

function playVideo(id) {
    // Find the iframe element
    var iframe = document.getElementById(id);
    
    // Get the src of the iframe (the YouTube link)
    var src = iframe.src;
    
    // Remove the mute=1 and autoplay=0 parameters for autoplay
    src = src.replace('mute=1', 'mute=0').replace('autoplay=0', 'autoplay=1');
    
    // Set the updated src to start the video
    iframe.src = src;

    // Optionally, hide the play button overlay after clicking
    document.querySelector(`#${id} ~ .play-button-overlay`).style.display = 'none';
}
