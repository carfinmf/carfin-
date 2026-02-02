// ✅ Set your WhatsApp number here (no +, no spaces)
const YOUR_WHATSAPP = "971544417665";

const form = document.getElementById("valuationForm");
const photosInput = document.getElementById("photos");
const preview = document.getElementById("preview");

photosInput?.addEventListener("change", () => {
  preview.innerHTML = "";
  const files = Array.from(photosInput.files || []);
  files.slice(0, 24).forEach(file => {
    const img = document.createElement("img");
    img.alt = file.name;
    img.src = URL.createObjectURL(file);
    preview.appendChild(img);
  });
});

// Signature pad (simple)
const canvas = document.getElementById("signaturePad");
const clearBtn = document.getElementById("clearSig");
const undoBtn = document.getElementById("undoSig");

let ctx, drawing = false;
let strokes = [];
let currentStroke = [];

function resizeCanvasForDPI(){
  if(!canvas) return;
  const ratio = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth;
  const cssHeight = Math.round(cssWidth * (220/900));
  canvas.style.height = cssHeight + "px";
  canvas.width = Math.floor(cssWidth * ratio);
  canvas.height = Math.floor(cssHeight * ratio);

  ctx = canvas.getContext("2d");
  ctx.setTransform(ratio,0,0,ratio,0,0);
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#d4af37";
  redraw();
}

function getPos(e){
  const rect = canvas.getBoundingClientRect();
  const t = e.touches && e.touches[0];
  const x = (t ? t.clientX : e.clientX) - rect.left;
  const y = (t ? t.clientY : e.clientY) - rect.top;
  return {x,y};
}
function start(e){ drawing=true; currentStroke=[]; currentStroke.push(getPos(e)); e.preventDefault?.(); }
function move(e){
  if(!drawing) return;
  e.preventDefault?.();
  const p = getPos(e);
  const last = currentStroke[currentStroke.length-1];
  currentStroke.push(p);
  ctx.beginPath(); ctx.moveTo(last.x,last.y); ctx.lineTo(p.x,p.y); ctx.stroke();
}
function end(){ if(!drawing) return; drawing=false; if(currentStroke.length>1) strokes.push(currentStroke); currentStroke=[]; }

function redraw(){
  if(!ctx) return;
  ctx.clearRect(0,0,canvas.clientWidth,canvas.clientHeight);
  strokes.forEach(s=>{
    for(let i=1;i<s.length;i++){
      const a=s[i-1], b=s[i];
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    }
  });
}

clearBtn?.addEventListener("click", ()=>{ strokes=[]; redraw(); });
undoBtn?.addEventListener("click", ()=>{ strokes.pop(); redraw(); });

canvas?.addEventListener("mousedown", start);
canvas?.addEventListener("mousemove", move);
window.addEventListener("mouseup", end);

canvas?.addEventListener("touchstart", start, {passive:false});
canvas?.addEventListener("touchmove", move, {passive:false});
canvas?.addEventListener("touchend", end);

window.addEventListener("resize", resizeCanvasForDPI);
resizeCanvasForDPI();

form?.addEventListener("submit", (e)=>{
  e.preventDefault();

  if(strokes.length===0){
    alert("Please add signature before sending.");
    return;
  }

  const fd = new FormData(form);

  const msg =
`*CARFIN — Vehicle Evaluation Request*
*Customer*
Name: ${fd.get("name")}
Phone: ${fd.get("phone")}
Email: ${fd.get("email") || "-"}
Location: ${fd.get("location")}

*Vehicle*
Make/Model: ${fd.get("make")} ${fd.get("model")}
Year: ${fd.get("year")}
Trim: ${fd.get("trim") || "-"}
VIN: ${fd.get("vin") || "-"}
Mileage: ${fd.get("mileage")} km
Condition: ${fd.get("condition")}
Expected Price: ${fd.get("price") || "-"} AED

Notes: ${fd.get("notes") || "-"}

*Photos selected:* ${(photosInput.files && photosInput.files.length) ? photosInput.files.length : 0}
*Signature:* Added

(Please attach the selected photos in WhatsApp and send.)`;

  const url = `https://wa.me/${YOUR_WHATSAPP}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
});
