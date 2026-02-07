const SHEET_API =
"https://script.google.com/macros/s/AKfycbw4mxhBfzXjFVB_dBm4_7vo2_iNuFXThaLuuP0s9TBerqgnFjfRJ3UcE6SYQzz36yI/exec";

document.addEventListener("DOMContentLoaded", () => {

let products=[];
let cart=[];


// ===== autosave =====
salesPerson.value = localStorage.getItem("salesPerson")||"";
salesPerson.oninput=()=>localStorage.setItem("salesPerson",salesPerson.value);


// ===== mobile =====
customerMobile.oninput=()=>{
  customerMobile.value=customerMobile.value.replace(/\D/g,'').slice(0,10);
};


// ===== special enable =====
specialEnable.onchange=()=>{
  specialAmt.disabled=!specialEnable.checked;
  calculate();
};


// ===== fetch =====
fetch(SHEET_API).then(r=>r.json()).then(d=>products=d);


// ===== search =====
modelSearch.oninput=()=>{
  const v=modelSearch.value.toLowerCase();
  suggestions.innerHTML="";
  if(!v){suggestions.style.display="none";return;}

  products.filter(p=>p.model.toLowerCase().includes(v))
  .slice(0,20)
  .forEach(p=>{
    const d=document.createElement("div");
    d.className="suggItem";
    d.innerText=`${p.model} - ₹${p.price}`;
    d.onclick=()=>{
      cart.push({model:p.model,price:p.price,qty:1,combo:false});
      modelSearch.value="";
      suggestions.style.display="none";
      render();
    };
    suggestions.appendChild(d);
  });

  suggestions.style.display="block";
};


// ===== render =====
function render(){
  cartBody.innerHTML="";
  const sel=cart.filter(p=>p.combo).length;

  cart.forEach((p,i)=>{
    let cb="";
    if(comboEnable.checked && p.price>=5000){
      const dis = sel>=2 && !p.combo;
      cb=`<input type="checkbox" ${p.combo?'checked':''}
          ${dis?'disabled':''}
          onchange="toggleCombo(${i},this.checked)">`;
    }

    cartBody.innerHTML+=`
      <tr>
        <td>${cb} ${p.model}</td>
        <td>₹${p.price}</td>
        <td><input type="number" value="${p.qty}" min="1"
          onchange="updateQty(${i},this.value)"></td>
        <td>₹${p.price*p.qty}</td>
        <td><button onclick="removeItem(${i})">❌</button></td>
      </tr>`;
  });

  calculate();
}

window.updateQty=(i,v)=>{cart[i].qty=+v;calculate();};
window.removeItem=(i)=>{cart.splice(i,1);render();};
window.toggleCombo=(i,v)=>{cart[i].combo=v;render();};


// ===== slab =====
function slab(t){
  if(t>=20000) return {web:1000,upi:500};
  if(t>=15000) return {web:700,upi:300};
  if(t>=13000) return {web:500,upi:300};
  if(t>=10000) return {web:500,upi:200};
  if(t>=5000) return {web:200,upi:100};
  return {web:0,upi:0};
}


// ===== calc =====
function calculate(){

  const original = cart.reduce((s,p)=>s+p.price*p.qty,0);

  let combo=0;
  if(comboEnable.checked){
    cart.forEach(p=>{
      if(p.combo) combo+=p.price*p.qty*0.03;
    });
  }

  const afterCombo = original-combo;
  const s=slab(afterCombo);
  const upi=paymentMode.value==="UPI"?s.upi:0;
  const special=specialEnable.checked?+specialAmt.value||0:0;

  const save = combo+s.web+upi+special;

  orderValue.innerText="₹"+original.toFixed(0);
  webDisc.innerText="₹"+s.web;
  upiDisc.innerText="₹"+upi;
  totalSavings.innerText="₹"+save.toFixed(0);
  finalPay.innerText="₹"+Math.max(0,original-save).toFixed(0);

  comboRow.style.display = combo>0?"flex":"none";
  comboDisc.innerText="₹"+Math.round(combo);

  specialRow.style.display = special>0?"flex":"none";
  specialDisc.innerText="₹"+special;

  upiDisc.parentElement.style.display =
    paymentMode.value==="UPI"?"flex":"none";

  sSales.innerText=salesPerson.value;
  sCustomer.innerText=customerName.value;
  sMobile.innerText=customerMobile.value;
}


// ===== id =====
function idGen(){return "HH-"+Date.now().toString().slice(-6);}


// ===== screenshot =====
copyScreenshot.onclick=async()=>{
  offerId.innerText=idGen();
  validTill.innerText=new Date(Date.now()+86400000).toLocaleString();
  calculate();

  html2canvas(offerArea).then(async canvas=>{
    const blob=await new Promise(r=>canvas.toBlob(r));
    await navigator.clipboard.write([new ClipboardItem({"image/png":blob})]);
    alert("✅ Copied to clipboard");
  });
};


// ===== summary =====
copySummary.onclick=()=>{
  const txt=`📦 OFFER ${offerId.innerText}
🕒 Valid: ${validTill.innerText}

👨‍💼 Sales: ${salesPerson.value}
🧑 Customer: ${customerName.value}
📱 Mobile: ${customerMobile.value}

💰 Order: ${orderValue.innerText}
🌐 Website: ${webDisc.innerText}
🏦 UPI: ${upiDisc.innerText}
🎁 Combo: ${comboDisc.innerText}
⭐ Special: ${specialDisc.innerText}

🧾 Pay: ${finalPay.innerText}`;
  navigator.clipboard.writeText(txt);
  alert("✅ Summary copied");
};


// ===== clear =====
clearCart.onclick=()=>{cart=[];render();};
clearAll.onclick=()=>location.reload();

});
