// script.js

document.addEventListener("DOMContentLoaded", () => {
  const uploadBtn = document.getElementById("uploadBtn");
  const fileInput = document.getElementById("fileInput");
  const status = document.getElementById("status");

  uploadBtn.addEventListener("click", async () => {
    // Check if a file is selected
    if (!fileInput.files.length) {
      status.innerText = "Please select a file first!";
      return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("document", file); // must match backend multer field name

    // Open a new window immediately to avoid popup blockers
    const newWindow = window.open("", "_blank");
    if (!newWindow) {
      alert("Popup blocked! Please allow popups for this site.");
      return;
    }

    newWindow.document.write("<h2>Loading...</h2>");
    status.innerText = "Uploading and extracting data...";

    try {
      const res = await fetch("http://localhost:3000/api/tax/calculate-tax", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed: " + res.status);

      const data = await res.json();

      // Build a table for the extracted data
      const keys = Object.keys(data);
      let tableHTML = `
        <table border="1" cellpadding="10" cellspacing="0" 
               style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
          <thead>
            <tr style="background-color:#0052cc; color:white;">
      `;
      keys.forEach(key => {
        tableHTML += `<th>${key.replace(/_/g, " ")}</th>`;
      });
      tableHTML += "</tr></thead><tbody><tr>";
      keys.forEach(key => {
        tableHTML += `<td>${data[key]}</td>`;
      });
      tableHTML += "</tr></tbody></table>";

      // Display table in the new window
      newWindow.document.body.innerHTML = `
        <h2 style="text-align:center; color:#0052cc;">Extracted Tax Data</h2>
        ${tableHTML}
      `;

      status.innerText = "Extraction complete!";
    } catch (err) {
      console.error(err);
      status.innerText = err.message;
      newWindow.document.body.innerHTML = `<h2>Error</h2><p>${err.message}</p>`;
    }
  });
});
