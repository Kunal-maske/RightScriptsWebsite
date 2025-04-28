

const sectionNames = [
  "Script Title",
  "Script Introduction",
  "Script Objectives",
  "Script Content",
  "Script Reflections",
  "Script Summary",
  "Script Finalization"
];

let storedData = {}; 

document.addEventListener("DOMContentLoaded", function () {
    const sidebarButtons = document.querySelectorAll(".sidebar-btn");
    const textArea = document.querySelector(".content textarea");
    const nextBtn = document.querySelector(".Next");
    const prevBtn = document.querySelector(".Previous");
    const heading = document.querySelector(".content h2");
    const countDisplay = document.getElementById("count");
    const finalizationContent = document.getElementById("finalization-content");
    const finalizationButtons = document.querySelector(".finalization-buttons");

    let currentIndex = 0; 
    let completedSections = Array(sectionNames.length).fill(false);

    // Function to handle auto-numbering in Objectives section
    function handleObjectiveEnter(e) {
        if (e.key === "Enter") {
            e.preventDefault(); // Prevent default new line
            const lines = textArea.value.split("\n");
            const nextNumber = lines.length + 1;
            textArea.value += `\n${nextNumber}. `;
        }
    }

    function updateSection(index) {
        // Save the current section's text before switching
        storedData[sectionNames[currentIndex]] = textArea.value;

        // Load saved text
        textArea.value = storedData[sectionNames[index]] || "";

        // ✅ Dynamically update placeholder text based on section
        const sectionLabel = sectionNames[index].replace("Script ", "").toLowerCase();
        textArea.placeholder = `Enter script ${sectionLabel} here...`;

        heading.textContent = sectionNames[index];  
        countDisplay.textContent = `${index + 1}/7`;

        // Update sidebar button styles
        sidebarButtons.forEach((btn, idx) => {
            btn.style.background = idx < index ? "rgba(8, 81, 117, 0.6)" : idx === index ? "#085175" : "white";
            btn.style.color = idx <= index ? "white" : "black";
        });

        // Handle Finalization section
        if (index === sectionNames.length - 1) {  
            finalizationContent.classList.add("finalization-active");
            finalizationButtons.style.display = "flex"; // Show buttons
            
            // Generate a formatted preview of all sections
            let previewText = "";
            for (let i = 0; i < sectionNames.length - 1; i++) {
                previewText += `${sectionNames[i].replace("Enter ", "").replace(" here", "")}:\n${storedData[sectionNames[i]] || "Not provided"}\n\n`;
            }
            textArea.value = previewText; 
            textArea.readOnly = false; // Allow editing

        } else {
            finalizationContent.classList.remove("finalization-active");
            finalizationButtons.style.display = "none"; // Hide buttons
            textArea.readOnly = false; // Normal editing
        }

        // Remove previous keydown event (to avoid duplicates)
        textArea.removeEventListener("keydown", handleObjectiveEnter);

        // Add special behavior for Objectives section
        if (sectionNames[index] === "Script Objectives") {
            // If starting fresh, prefill with "1. "
            if (!textArea.value.trim()) {
                textArea.value = "1. ";
            }
            textArea.addEventListener("keydown", handleObjectiveEnter);
        }

        currentIndex = index;
    }

    nextBtn.addEventListener("click", function () {
        if (textArea.value.trim() === "") {
            alert("Please complete this section before moving forward.");
            return;
        }
        completedSections[currentIndex] = true;
        if (currentIndex < sectionNames.length - 1) {
            updateSection(currentIndex + 1);
        }
    });

    prevBtn.addEventListener("click", function () {
        if (currentIndex > 0) {
            updateSection(currentIndex - 1);
        }
    });

    sidebarButtons.forEach((btn, index) => {
        btn.addEventListener("click", function () {
            if (completedSections[index] || index === 0) {
                updateSection(index);
            } else {
                alert("You must complete the previous sections before accessing this one.");
            }
        });
    });

    updateSection(0); // Load first section
});


// -------------------- Download & Preview Buttons --------------------

document.getElementById("download-btn").addEventListener("click", async function () {
    const { jsPDF } = window.jspdf;
    const editor = document.getElementById("finalization-content");

    const content = editor.innerHTML.trim();
    if (!content) {
        alert("No content to download.");
        return;
    }

    // Extract the title from storedData (entered in first section)
    const titleKey = "Enter Video Title here";
    let fileName = storedData[titleKey] || "Final_Script";

    // Remove illegal characters from filename
    fileName = fileName.trim().replace(/[\/\\:*?"<>|]/g, "") || "Final_Script";

    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    doc.text(content, 10, 10, { maxWidth: 180 });

    // Open the file save dialog using the File System Access API
    try {
        const handle = await window.showSaveFilePicker({
            suggestedName: fileName + ".pdf", // Suggested filename
            types: [{
                description: 'PDF Files',
                accept: { 'application/pdf': ['.pdf'] },
            }],
        });

        // Create a writable stream and write the PDF data
        const writableStream = await handle.createWritable();
        const pdfData = doc.output('arraybuffer');
        await writableStream.write(pdfData);
        await writableStream.close();

        console.log("File saved successfully!");
    } catch (err) {
        console.error("Error saving file:", err);
    }
});



///---------------------------refine button----------------------------//



document.addEventListener("DOMContentLoaded", () => {
  const refineButton = document.getElementById("refine-btn");
  const textarea = document.querySelector(".content textarea");

  refineButton.addEventListener("click", async () => {
      const inputText = textarea.value.trim();
      const videoLength = document.getElementById("minuteInput").value;

      if (!inputText) {
          alert("Please write something to refine.");
          return;
      }

      // Optional UX update
      refineButton.disabled = true;
      refineButton.innerText = "Refining...";
      textarea.disabled = true;

      try {
          const response = await fetch("/refine", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({ 
                  text: inputText, 
                  videoLength: videoLength
              })
          });

          const result = await response.json();

          if (result.refined) {
              textarea.value = result.refined;
          } else {
              textarea.value = "Refinement failed.";
              console.error(result);
          }
      } catch (err) {
          console.error("Error refining:", err);
          textarea.value = "Something went wrong.";
      } finally {
          refineButton.disabled = false;
          refineButton.innerText = "Refine";
          textarea.disabled = false;
      }
  });
});



////-----------------------words count------------------//



document.addEventListener("DOMContentLoaded", function () {
  const textarea = document.querySelector("textarea");
  const wordCountDisplay = document.getElementById("word-count");
  const durationDisplay = document.getElementById("duration");
  const sectionButtons = document.querySelectorAll(".sidebar-btn");

  const sectionTexts = {};
  let currentSection = "Title";

  sectionTexts[currentSection] = textarea.value;

  function updateCounts() {
      sectionTexts[currentSection] = textarea.value.trim();

      const allText = Object.values(sectionTexts).join(" ").trim();
      const words = allText.split(/\s+/).filter(Boolean);
      const wordCount = words.length;

      // Duration = wordCount / 2 (2 words per second)
      const totalSeconds = Math.round(wordCount / 2);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      wordCountDisplay.textContent = `Words: ${wordCount}`;
      durationDisplay.textContent = `Duration: ${minutes} min ${seconds} sec`;
  }

  textarea.addEventListener("input", updateCounts);

  sectionButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
          sectionTexts[currentSection] = textarea.value.trim();

          sectionButtons.forEach(b => b.classList.remove("active"));
          this.classList.add("active");

          currentSection = this.textContent.trim();
          textarea.value = sectionTexts[currentSection] || "";

          updateCounts();
      });
  });

  updateCounts();
});




//------------------Help and Example------------------//



// ==================== HELP & EXAMPLE CONTENT ====================

// Help and Example texts for each section
const helpTexts = {
    "Title": "Give a short and meaningful title to your video. The title should be written in such a way that it is precise and clear and should tell your learners what to expect in the video.",

    "Introduction": "- Write a short introductory line about the video. Begin with a greeting. But please ensure that you do not use any time stamp such as good morning, good afternoon or good evening etc. You are going to create a recorded video that means your learners can watch it anytime of the day. Instead, you can use the words such as Hello/ Namaste/ Welcome etc to greet your learners.\n\n" +
                    "- After that, introduce your learners to the video. Tell them what the video is about.\n\n" +
                    "- You can also use the introduction to connect to prior content, for example - In the last video, we have seen... Here we take forward from the last video, where....",

    "Objectives": "- The third part of your script is to inform the learners of the objectives. Please note that we are dealing with adult learners. So they need to know, at the beginning itself, why they are watching this video. Your objectives should answer the question - What's in it for me in this video?\n\n" +
                  "- Please use measurable verbs as per Bloom's taxonomy to write the objectives. By writing learning outcomes using measurable verbs, you indicate clearly what the learner must do in order to demonstrate his/her learning.\n\n" +
                  "- Important Note: Know, Understand, and Learn are NOT measurable objectives. DO NOT USE THEM!",

    "Content": "Please insure to create shorter videos. The video should NOT be of more than 7 to 8 minutes. For that you need to identify the breakpoints i.e., the points in your lecture where you would pause. The possible breakpoints could be an example, the switch from one sub-topic to another, when you go deeper into a sub-topic, ask a question to students, give an activity, and so on.",

    "Reflection Spot": "Reflection spots (RS) are in-video activities for learners to express prior conceptions, reflect, articulate their reasoning and receive feedback from the instructor. At the RS, the instructor poses a question such as a multiple choice question, true -false questions, fill in the blanks, short answer question or provides a brief activity to be performed. The learner is expected to pause the video and respond to the question or activity before resuming the video. Thus, learners express their thinking and articulate their reasoning while interacting with the video. After the RS activity, the instructor continues with the video addressing the common expected responses for the RS, and summarizes the correct answer with feedback. The instructor then continues with the rest of the video content, which may contain additional RSs.",

    "Summary": "The last part of your video is the summary. In order to consolidate the learning, summarize the video lecture in a couple of sentences. A summary is an overview of your video's most essential parts and the main points. It ensures retention of knowledge. Finally end the video by thanking the learners for watching your video. You can also use this section to announce your next video.",

    "Finalization": "Preview the entire script and make any necessary adjustments. Ensure that all sections are coherent and flow well together. You can also add any final notes or reminders for yourself."
};

const exampleTexts = {
    "Title": "For example, the title of the intro video is 'Tips for writing learner-centric video scripts'. It is clear and precise and tells the viewers what to expect in this video.",

    "Introduction": "Hello and Welcome. In this video, we will look at some tips for writing learner-centric video scripts.",

    "Objectives": "Here's a list of some measurable objectives that you can use.\n\n" +
                  "Blooms Taxonomy:\n"+
                  "Level 1: Remember\n" +
                  "level 2: Understand\n" +
                  "level 3: Apply\n" +
                  "level 4: Analyze\n" +
                  "level 5: Evaluate\n" +
                  "level 6: Create\n\n",

    "Content": "If you are teaching Newton's First Law of Motion, in the first video you can explain the Law and in the next video you can give examples of of that Law.",

    "Reflection Spot": "Reflection Spot : What according to you should be the ideal duration of a video?\n\n" +
                       "Discussion: Welcome back. I am sure your answers vary from 5 to 50 minutes, i.e; some of you are in the favour of creating shorter videos while others favour longer videos. However it is very important that you create shorter videos. Although we as teachers are used to delivering a lecture of 40 to 60 minutes in classrooms, creating videos is different. You will agree with me that the attention span of our students is getting lesser day by day. Therefore, no use of creating lengthy videos. The research has shown that the average attention span of a learner is 7 minutes. So it is necessary that we too create videos that are less than 10 minutes long.",

    "Summary": "You can use the wordings such as - This brings us to the end of this video. Let's summarize what we have discussed so far...",

    "Finalization": "refine the script to ensure clarity and coherence. Make sure all sections are well-connected and the script flows logically. You can also add any final notes or reminders for yourself."
};

let isPopupOpen = false;

// ==================== FUNCTIONS ====================

// Get the name of the active sidebar section based on background color
function getActiveSectionByColor() {
    const sidebarButtons = document.querySelectorAll('.sidebar-btn');
    let activeSection = null;

    sidebarButtons.forEach(button => {
        if (button.style.backgroundColor === 'rgb(8, 81, 117)') {  // #085175 in RGB
            activeSection = button.innerText.trim();
        }
    });

    return activeSection;
}

// Show Popup with given type (help or example)
function showPopup(type) {
    const popupBox = document.getElementById('popup-box');
    const popupText = document.getElementById('popup-text');
    const section = getActiveSectionByColor();

    if (!section) {
        popupText.innerText = "Please select a section first.";
    } else if (type === 'help') {
        popupText.innerText = helpTexts[section] || "No help content available.";
    } else if (type === 'example') {
        popupText.innerText = exampleTexts[section] || "No example content available.";
    }

    popupBox.style.display = 'flex';
    isPopupOpen = true;
}

// Hide Popup
function hidePopup() {
    const popupBox = document.getElementById('popup-box');
    popupBox.style.display = 'none';
    isPopupOpen = false;
}

// Toggle popup depending on current state
function togglePopup(type) {
    if (isPopupOpen) {
        hidePopup();
    } else {
        showPopup(type);
    }
}

// ==================== EVENT LISTENERS ====================

document.addEventListener('DOMContentLoaded', function() {
    const helpButton = document.querySelector('.help');
    const exampleButton = document.querySelector('.Example');
    const closeButton = document.getElementById('popup-close');
    const sidebarButtons = document.querySelectorAll('.sidebar-btn');

    // Set active section when clicking on sidebar buttons
    sidebarButtons.forEach(button => {
        button.addEventListener('click', function() {
            sidebarButtons.forEach(b => b.style.backgroundColor = "white");  // Reset all to white
            button.style.backgroundColor = "#085175"; // Set clicked button as active
            button.style.color = "white"; // Adjust color to white for active button
        });
    });

    // Attach event listeners to Help and Example buttons
    if (helpButton) {
        helpButton.addEventListener('click', function() {
            togglePopup('help');
        });
    }

    if (exampleButton) {
        exampleButton.addEventListener('click', function() {
            togglePopup('example');
        });
    }

    // Close the popup when close button is clicked
    if (closeButton) {
        closeButton.addEventListener('click', hidePopup);
    }
});
