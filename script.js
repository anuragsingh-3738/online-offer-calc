const SHEET_API =
"https://script.google.com/macros/s/AKfycbw4mxhBfzXjFVB_dBm4_7vo2_iNuFXThaLuuP0s9TBerqgnFjfRJ3UcE6SYQzz36yI/exec";

document.addEventListener("DOMContentLoaded", () => {

let products = [];
let cart = [];

// ===== ELEMENTS FROM YOUR ORIGINAL UI =====
const modelSearch = document.getElementById("modelSearch");
const suggestions = document.getElementById("suggestions");
const cartBody = document.getElementById("cartBody");


// ===== FETCH =====
fetch(SHEET_API)
  .then(r => r.json())
  .then(data => {
    products = data;
    console.log("✅ Products:", products.length);
  })
  .catch(e => console.log("Sheet error", e));


// ===== SEARCH =====
if (modelSearch) {
  modelSearch.addEventListener("input", () => {
    const val = modelSearch.value.toLowerCase();
    suggestions.innerHTML = "";

    if (!val) {
      suggestions.style.display = "none";
      return;
    }

    const match = products.filter(p =>
      p.model.toLowerCase().includes(val)
    );

    match.slice(0, 20).forEach(p => {
      const div = document.createElement("div");
      div.className = "suggItem";
      div.innerText = `${p.model} - ₹${p.price}`;

      div.onclick = () => {
        modelSearch.value = p.model;
        suggestions.style.display = "none";
        addFromSearch(p.model, p.price);
      };

      suggestions.appendChild(div);
    });

    suggestions.style.display = match.length ? "block" : "none";
  });
}


// ===== ADD PRODUCT =====
window.addFromSearch = (model, price) => {
  cart.push({ model, price, qty: 1 });
  render();
};


// ===== RENDER CART =====
function render() {
  cartBody.innerHTML = "";

  cart.forEach((p, i) => {
    cartBody.innerHTML += `
      <tr>
        <td>${p.model}</td>
        <td>₹${p.price}</td>
        <td>
          <input type="number" value="${p.qty}" min="1"
            onchange="updateQty(${i}, this.value)">
        </td>
        <td>₹${p.price * p.qty}</td>
        <td>
          <button onclick="removeItem(${i})">❌</button>
        </td>
      </tr>
    `;
  });

  calculate();
}

window.updateQty = (i, val) => {
  cart[i].qty = Number(val);
  calculate();
};

window.removeItem = (i) => {
  cart.splice(i, 1);
  render();
};


// ===== SLAB =====
function slabDiscount(total){
  if(total>=20000) return {web:1000,upi:500};
  if(total>=15000) return {web:700,upi:300};
  if(total>=13000) return {web:500,upi:300};
  if(total>=10000) return {web:500,upi:200};
  if(total>=5000) return {web:200,upi:100};
  return {web:0,upi:0};
}


// ===== CALCULATE =====
function calculate(){
  const total = cart.reduce((s,p)=>s+p.price*p.qty,0);
  const slab = slabDiscount(total);

  const upi = paymentMode.value==="UPI" ? slab.upi : 0;

  const combo =
    comboEnable.checked &&
    cart.length === 2 &&
    cart.every(p => p.price >= 5000)
      ? total * 0.03 : 0;

  const special =
    specialEnable.checked ? Number(specialAmt.value||0) : 0;

  const save = slab.web + upi + combo + special;

  orderValue.innerText = "₹" + total.toFixed(0);
  webDisc.innerText = "₹" + slab.web;
  upiDisc.innerText = "₹" + upi;
  totalSavings.innerText = "₹" + save.toFixed(0);
  finalPay.innerText = "₹" + Math.max(0,total-save).toFixed(0);
}


// ===== HOOK CHECKBOXES =====
paymentMode.onchange = calculate;
comboEnable.onchange = calculate;
specialEnable.onchange = () => {
  specialAmt.disabled = !specialEnable.checked;
  calculate();
};

});
