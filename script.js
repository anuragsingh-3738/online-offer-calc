const SHEET_API =
"https://script.google.com/macros/s/AKfycbw4mxhBfzXjFVB_dBm4_7vo2_iNuFXThaLuuP0s9TBerqgnFjfRJ3UcE6SYQzz36yI/exec";

document.addEventListener("DOMContentLoaded", () => {

let products = [];
let cart = [];


// ================= AUTOSAVE SALES =================
const salesInput = document.getElementById("salesPerson");
if (salesInput) {
  salesInput.value = localStorage.getItem("salesPerson") || "";
  salesInput.oninput = () =>
    localStorage.setItem("salesPerson", salesInput.value);
}


// ================= MOBILE LIMIT =================
const mobile = document.getElementById("customerMobile");
if (mobile) {
  mobile.oninput = () =>
    mobile.value = mobile.value.replace(/\D/g,'').slice(0,10);
}


// ================= FETCH =================
fetch(SHEET_API)
  .then(r=>r.json())
  .then(d=>products=d);


// ================= SEARCH =================
modelSearch.addEventListener("input", ()=>{
  const val = modelSearch.value.toLowerCase();
  suggestions.innerHTML="";

  if(!val){ suggestions.style.display="none"; return; }

  products
    .filter(p=>p.model.toLowerCase().includes(val))
    .slice(0,20)
    .forEach(p=>{
      const div=document.createElement("div");
      div.className="suggItem";
      div.innerText=`${p.model} - ₹${p.price}`;
      div.onclick=()=>{
        cart.push({model:p.model,price:p.price,qty:1,combo:false});
        modelSearch.value="";
        suggestions.style.display="none";
        render();
      };
      suggestions.appendChild(div);
    });

  suggestions.style.display="block";
});


// ================= RENDER =================
function render(){
  cartBody.innerHTML="";

  const comboSelected = cart.filter(p=>p.combo).length;

  cart.forEach((p,i)=>{

    let cb = "";
    if(comboEnable.checked && p.price>=5000){
      const disabled = comboSelected>=2 && !p.combo;
      cb = `<input type="checkbox" ${p.combo?'checked':''}
            ${disabled?'disabled':''}
            onchange="toggleCombo(${i},this.checked)">`;
    }

    cartBody.innerHTML+=`
      <tr>
        <td>${cb} ${p.model}</td>
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

window.updateQty=(i,v)=>{cart[i].qty=+v;calculate();};
window.removeItem=(i)=>{cart.splice(i,1);render();};
window.toggleCombo=(i,v)=>{cart[i].combo=v;render();};


// ================= SLAB =================
function slab(total){
  if(total>=20000) return {web:1000,upi:500};
  if(total>=15000) return {web:700,upi:300};
  if(total>=13000) return {web:500,upi:300};
  if(total>=10000) return {web:500,upi:200};
  if(total>=5000) return {web:200,upi:100};
  return {web:0,upi:0};
}


// ================= CALCULATE =================
function calculate(){

  const originalTotal = cart.reduce((s,p)=>s+p.price*p.qty,0);

  // COMBO FIRST
  let comboDisc = 0;
  if(comboEnable.checked){
    cart.forEach(p=>{
      if(p.combo) comboDisc += p.price*p.qty*0.03;
    });
  }

  const afterCombo = originalTotal - comboDisc;

  // SLAB
  const s = slab(afterCombo);
  const upi = paymentMode.value==="UPI" ? s.upi : 0;

  // SPECIAL
  const special = specialEnable.checked ? +specialAmt.value||0 : 0;

  const save = comboDisc + s.web + upi + special;

  orderValue.innerText="₹"+originalTotal.toFixed(0);
  webDisc.innerText="₹"+s.web;
  upiDisc.innerText="₹"+upi;
  totalSavings.innerText="₹"+save.toFixed(0);
  finalPay.innerText="₹"+Math.max(0,originalTotal-save).toFixed(0);

  // hide UPI row
  upiDisc.parentElement.style.display =
    paymentMode.value==="UPI"?"flex":"none";
}


// ================= HOOKS =================
paymentMode.onchange=calculate;
comboEnable.onchange=render;
specialEnable.onchange=()=>{
  specialAmt.disabled=!specialEnable.checked;
  calculate();
};


// ================= SCREENSHOT =================
document.getElementById("copyScreenshot").onclick=()=>{
  html2canvas(document.querySelector(".card")).then(canvas=>{
    const a=document.createElement("a");
    a.download="offer.png";
    a.href=canvas.toDataURL();
    a.click();
  });
};


// ================= COPY SUMMARY =================
document.getElementById("copySummary").onclick=()=>{
  const text=
`Sales: ${salesInput.value}
Customer: ${customerName.value}
Mobile: ${mobile.value}

Order: ${orderValue.innerText}
Website: ${webDisc.innerText}
UPI: ${upiDisc.innerText}
Savings: ${totalSavings.innerText}
Pay: ${finalPay.innerText}`;

  navigator.clipboard.writeText(text);
  alert("Copied");
};


// ================= CLEAR =================
document.getElementById("clearCart").onclick=()=>{
  cart=[];
  render();
};

document.getElementById("clearAll").onclick=()=>location.reload();

});
