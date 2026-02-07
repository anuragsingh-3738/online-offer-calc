const SHEET_API = "https://script.google.com/macros/s/AKfycbw4mxhBfzXjFVB_dBm4_7vo2_iNuFXThaLuuP0s9TBerqgnFjfRJ3UcE6SYQzz36yI/exec";

let sheetData = [];

async function loadModels() {
  try {
    const res = await fetch(SHEET_API);
    sheetData = await res.json();

    const dropdown = document.getElementById("modelNo");
    dropdown.innerHTML = '<option value="">Select Model</option>';

    sheetData.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item.model;
      opt.textContent = item.model;
      dropdown.appendChild(opt);
    });

  } catch (err) {
    console.error("Sheet not loading", err);
  }
}

function getPriceByModel(model) {
  const item = sheetData.find(x => x.model === model);
  return item ? item.price : 0;
}

document.getElementById("modelNo").addEventListener("change", function () {
  const model = this.value;
  const price = getPriceByModel(model);
  document.getElementById("mrp").value = price;
});

loadModels();
