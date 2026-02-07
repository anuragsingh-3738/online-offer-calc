const SHEET_API =
"https://script.google.com/macros/s/AKfycbw4mxhBfzXjFVB_dBm4_7vo2_iNuFXThaLuuP0s9TBerqgnFjfRJ3UcE6SYQzz36yI/exec";

document.addEventListener("DOMContentLoaded", () => {

let products = [];
let cart = [];


// ================= SALES PERSON AUTOSAVE =================
const salesInput = document.getElementById("salesPerson");
if (salesInput) {
  salesInput.value = localStorage.getItem("salesPerson") || "";
  salesInput.addEventListener("input", () => {
    localStorage.setItem("salesPerson", salesInput.value);
  });
}


// ================= MOBILE LIMIT =================
const mobileInput = document.getElementById("customerMobile");
if (mobileInput) {
  mobileInput.addEventListener("input", () => {
    mobileInput.value = mobileInput.value.replace(/\D/g,'').slice(0,10);
  });
}


// ================= FETCH =================
fetch(SHEET_API)
  .then(r => r.json())
  .then(data => products = data);


// ================= SEARCH =================
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

  match.slice(0,20).forEach(p => {
    const div = document.createElement("div");
    div.className = "suggItem";
    div.innerText = `${p.model} - ₹${p.price}`;

    div.onclick = () => {
      cart.push({ model:p.model, price:p.price, qty:1, combo:false });
      modelSearch.value="";
      suggestions.style.display="none";
      render();
    };

    suggestions.appendChild(div);
  });

  suggestions.style.display = match.length ? "block" : "none";
});


// ================= RENDER =================
function render() {
  cartBody.innerHTML = "";

  const eligible = cart.filter(p=>p.price>=5000);

  cart.forEach((p,i)=>{

    let comboBox = "";
    if (eligible.length >= 2 && p.price >= 5000) {
      comboBox =
        `<input type="checkbox" ${p.combo?'checked':''}
          onchange="toggleCombo(${i},this.checked)">`;
    }

    cartBody.innerHTML += `
      <tr>
        <td>${comboBox} ${p.model}</td>
        <td>₹${p.price}</td>
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
  const selected = cart.filter(p=>p.combo).length;
  if(val && selected>=2){
    alert("Only 2 products allowed for combo");
    return;
  }
  cart[i].combo = val;
  calculate();
};


// ================= SLAB =================
function slabDiscount(total){
  if(total>=20000) return {web:1000,upi:500};
  if(total>=15000) return {web:700,upi:300};
  if(total>=13000) return {web:500,upi:300};
  if(total>=10000) return {web:500,upi:200};
  if(total>=5000) return {web:200,upi:100};
  return {web:0,upi:0};
}


// ================= CALC =================
function calculate(){

  let total = cart.reduce((s,p)=>s+p.price*p.qty,0);

  // combo first
  let comboDiscount = 0;
  if(comboEnable.checked){
    cart.forEach(p=>{
      if(p.combo) comboDiscount += p.price*p.qty*0.03;
    });
  }

  total -= comboDiscount;

  // slab on remaining
  const slab = slabDiscount(total);
  const upi = paymentMode.value==="UPI" ? slab.upi : 0;

  // special
  const special =
    specialEnable.checked ? Number(specialAmt.value||0) : 0;

  const save = comboDiscount + slab.web + upi + special;

  orderValue.innerText = "₹"+(cart.reduce((s,p)=>s+p.price*p.qty,0)).toFixed(0);
  webDisc.innerText = "₹"+slab.web;
  upiDisc.innerText = "₹"+upi;
  totalSavings.innerText = "₹"+save.toFixed(0);
  finalPay.innerText =
    "₹"+Math.max(0,orderValue.innerText.replace("₹","")-save);
}


// ================= CHECKBOXES =================
paymentMode.onchange = calculate;
comboEnable.onchange = calculate;
specialEnable.onchange = ()=>{
  specialAmt.disabled = !specialEnable.checked;
  calculate();
};


// ================= SCREENSHOT =================
const screenshotBtn = document.querySelector(".btn-dark");
if (screenshotBtn) {
  screenshotBtn.onclick = () => {
    html2canvas(document.querySelector(".card")).then(canvas=>{
      const link = document.createElement("a");
      link.download = "offer.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  };
}


// ================= COPY SUMMARY =================
const copyBtn = document.querySelectorAll(".btn-secondary")[1];
if(copyBtn){
  copyBtn.onclick = ()=>{
    const txt =
`Order: ${orderValue.innerText}
Savings: ${totalSavings.innerText}
Pay: ${finalPay.innerText}`;
    navigator.clipboard.writeText(txt);
    alert("Copied");
  };
}


// ================= CLEAR =================
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
