const SHEET_API =
"https://script.google.com/macros/s/AKfycbw4mxhBfzXjFVB_dBm4_7vo2_iNuFXThaLuuP0s9TBerqgnFjfRJ3UcE6SYQzz36yI/exec";

document.addEventListener("DOMContentLoaded", () => {

let products = [];
let cart = [];

// ========= ELEMENTS =========
const modelSearch = document.getElementById("modelSearch");
const suggestions = document.getElementById("suggestions");
const cartBody = document.getElementById("cartBody");
const mobileInput = document.getElementById("customerMobile");


// ========= MOBILE LIMIT =========
if (mobileInput) {
  mobileInput.addEventListener("input", () => {
    mobileInput.value = mobileInput.value.replace(/\D/g,'').slice(0,10);
  });
}


// ========= FETCH =========
fetch(SHEET_API)
  .then(r => r.json())
  .then(data => {
    products = data;
    console.log("✅ Products:", products.length);
  });


// ========= SEARCH =========
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
        cart.push({ model: p.model, price: p.price, qty: 1, combo:false });
        suggestions.style.display = "none";
        modelSearch.value="";
        render();
      };

      suggestions.appendChild(div);
    });

    suggestions.style.display = match.length ? "block" : "none";
  });
}


// ========= RENDER =========
function render() {
  cartBody.innerHTML = "";

  cart.forEach((p, i) => {

    const comboCheck =
      p.price >= 5000
        ? `<input type="checkbox" ${p.combo?'checked':''}
            onchange="toggleCombo(${i},this.checked)">`
        : "";

    cartBody.innerHTML += `
      <tr>
        <td>${p.model}</td>
        <td>₹${p.price}</td>
        <td>${comboCheck}</td>
        <td>
          <input type="number" min="1" value="${p.qty}"
            onchange="updateQty(${i},this.value)">
        </td>
        <td>₹${p.price*p.qty}</td>
        <td><button onclick="removeItem(${i})">❌</button></td>
      </tr>
    `;
  });

  calculate();
}

window.updateQty = (i,v)=>{
  cart[i].qty = Number(v);
  calculate();
};

window.removeItem = (i)=>{
  cart.splice(i,1);
  render();
};

window.toggleCombo = (i,val)=>{
  cart[i].combo = val;
  calculate();
};


// ========= SLAB =========
function slabDiscount(total){
  if(total>=20000) return {web:1000,upi:500};
  if(total>=15000) return {web:700,upi:300};
  if(total>=13000) return {web:500,upi:300};
  if(total>=10000) return {web:500,upi:200};
  if(total>=5000) return {web:200,upi:100};
  return {web:0,upi:0};
}


// ========= CALC =========
function calculate(){
  const total = cart.reduce((s,p)=>s+p.price*p.qty,0);
  const slab = slabDiscount(total);

  const upi = paymentMode.value==="UPI" ? slab.upi : 0;

  const comboItems = cart.filter(p=>p.combo);
  const combo =
    comboEnable.checked &&
    comboItems.length === 2 &&
    comboItems.every(p=>p.price>=5000)
      ? total*0.03 : 0;

  const special =
    specialEnable.checked ? Number(specialAmt.value||0) : 0;

  const save = slab.web + upi + combo + special;

  orderValue.innerText = "₹"+total.toFixed(0);
  webDisc.innerText = "₹"+slab.web;
  upiDisc.innerText = "₹"+upi;
  totalSavings.innerText = "₹"+save.toFixed(0);
  finalPay.innerText = "₹"+Math.max(0,total-save).toFixed(0);

  // hide UPI row
  upiDisc.parentElement.style.display =
    paymentMode.value==="UPI" ? "flex" : "none";
}


// ========= CHECKBOX HOOK =========
paymentMode.onchange = calculate;
comboEnable.onchange = calculate;
specialEnable.onchange = ()=>{
  specialAmt.disabled = !specialEnable.checked;
  calculate();
};


// ========= SCREENSHOT =========
const screenshotBtn = document.querySelector(".btn-dark");
if (screenshotBtn) {
  screenshotBtn.onclick = () => {
    html2canvas(document.body).then(canvas=>{
      const link = document.createElement("a");
      link.download = "offer.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  };
}


// ========= COPY SUMMARY =========
const copyBtn = document.querySelectorAll(".btn-secondary")[1];
if(copyBtn){
  copyBtn.onclick = ()=>{
    const text =
`Order: ${orderValue.innerText}
Discount: ${totalSavings.innerText}
Pay: ${finalPay.innerText}`;
    navigator.clipboard.writeText(text);
    alert("Copied");
  };
}


// ========= CLEAR =========
const clearCartBtn = document.querySelectorAll(".btn-secondary")[2];
if(clearCartBtn){
  clearCartBtn.onclick = ()=>{
    cart=[];
    render();
  };
}

const clearAllBtn = document.querySelector(".btn-danger");
if(clearAllBtn){
  clearAllBtn.onclick = ()=> location.reload();
}

});
