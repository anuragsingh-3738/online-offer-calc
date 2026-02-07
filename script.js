const SHEET_API =
"https://script.google.com/macros/s/AKfycbw4mxhBfzXjFVB_dBm4_7vo2_iNuFXThaLuuP0s9TBerqgnFjfRJ3UcE6SYQzz36yI/exec";

document.addEventListener("DOMContentLoaded", () => {

let products = [];
let cart = [];

// ========= ELEMENTS =========
const modelSearch = document.getElementById("modelSearch");
const suggestions = document.getElementById("suggestions");
const model = document.getElementById("model");
const price = document.getElementById("price");
const cartBody = document.getElementById("cartBody");


// ========= FETCH PRODUCTS =========
fetch(SHEET_API)
  .then(r => r.json())
  .then(data => {
    products = data;
    console.log("✅ Products Loaded:", products.length);
  })
  .catch(e => console.log("❌ Sheet error", e));


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
        model.value = p.model;
        price.value = p.price;
        modelSearch.value = p.model;
        suggestions.style.display = "none";
      };

      suggestions.appendChild(div);
    });

    suggestions.style.display = match.length ? "block" : "none";
  });
}


// ========= SPECIAL =========
if (specialEnable) {
  specialEnable.onchange = () => {
    specialAmt.disabled = !specialEnable.checked;
    calculate();
  };
}

if (paymentMode) paymentMode.onchange = calculate;
if (comboEnable) comboEnable.onchange = calculate;


// ========= ADD PRODUCT =========
if (addBtn) {
  addBtn.onclick = () => {
    if (!model.value || !price.value) return;

    cart.push({
      model: model.value,
      mrp: Number(price.value),
      qty: 1
    });

    model.value = "";
    price.value = "";
    render();
  };
}


// ========= RENDER =========
function render() {
  cartBody.innerHTML = "";

  const orderValue = cart.reduce((s,p)=>s+p.mrp*p.qty,0);
  const totalDiscount = getTotalDiscount(orderValue);

  cart.forEach((p,i)=>{
    const itemValue = p.mrp*p.qty;
    const share = orderValue ? itemValue/orderValue : 0;
    const itemDisc = totalDiscount*share;
    const unitOffer = p.mrp - (itemDisc/p.qty);
    const percent = itemValue ? (itemDisc/itemValue)*100 : 0;

    cartBody.innerHTML += `
      <tr>
        <td>${p.model}</td>
        <td>₹${p.mrp}</td>
        <td>₹${itemDisc.toFixed(0)} <div class="small">${percent.toFixed(1)}%</div></td>
        <td>₹${unitOffer.toFixed(0)}</td>
        <td>
          <input class="qty" type="number" min="1"
            value="${p.qty}"
            onchange="updateQty(${i}, this.value)">
        </td>
        <td>₹${(unitOffer*p.qty).toFixed(0)}</td>
        <td><button onclick="removeItem(${i})">❌</button></td>
      </tr>
    `;
  });

  calculate();
}

window.updateQty = (i,val)=>{
  cart[i].qty = Number(val);
  calculate();
};

window.removeItem = (i)=>{
  cart.splice(i,1);
  render();
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

function getTotalDiscount(total){
  const slab = slabDiscount(total);
  const upi = paymentMode.value==="UPI"?slab.upi:0;
  const combo = (comboEnable.checked && cart.length===2 && cart.every(p=>p.mrp>=5000))
    ? total*0.03 : 0;
  const special = specialEnable.checked ? Number(specialAmt.value||0) : 0;
  return slab.web + upi + combo + special;
}


// ========= CALC =========
function calculate(){
  const total = cart.reduce((s,p)=>s+p.mrp*p.qty,0);
  const disc = getTotalDiscount(total);

  orderVal.innerText = "₹"+total.toFixed(0);
  totalSave.innerText = "₹"+disc.toFixed(0);
  finalPay.innerText = "₹"+Math.max(0,total-disc).toFixed(0);
}

});
