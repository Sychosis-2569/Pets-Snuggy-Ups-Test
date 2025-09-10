import React, { useMemo, useState, useEffect } from "react";

// --- Selection-based Order System as a Single File ---
// All components are defined in this file to avoid missing imports

// --- Configuration ---
const STORE_WHATSAPP_NUMBER = "27726589482";
const STORE_EMAIL = "yourstore@example.com";

const formatZAR = (n) => new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", minimumFractionDigits: 2 }).format(n);
const uid = () => Math.random().toString(36).slice(2, 10).toUpperCase();

const CATALOG = [
  {
    id: "oval-bed-cover",
    name: "Oval Bed Cover",
    category: "Covers",
    price: 250,
    options: [
      { name: "Type", type: "single", choices: [ { label: "Standard", priceDelta: 0 }, { label: "Luxury", priceDelta: 150 } ] },
      { name: "Size", type: "single", choices: [ { label: "Small (600x400)", priceDelta: 0 }, { label: "Medium (820x540)", priceDelta: 200 }, { label: "Large (1000x640)", priceDelta: 400 } ] },
      { name: "Fabric", type: "single", choices: [ { label: "Denim", priceDelta: 0 }, { label: "Canvas", priceDelta: 0 }, { label: "Upholstery", priceDelta: 100 }, { label: "Fleece", priceDelta: 120 } ] },
    ],
    image: "https://via.placeholder.com/600x400.png?text=Oval+Bed+Cover",
    description: "High-quality oval bed cover available in Standard or Luxury finishes, three sizes, and multiple fabric choices.",
  },
];

const DELIVERY_FEES = { pickup: 0, local: 35, national: 95 };

// --- Header Component ---
function Header({ cartCount, onCheckout, onHome }) {
  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="font-bold cursor-pointer" onClick={onHome}>SBOS Store</h1>
      <button onClick={onCheckout} className="bg-blue-600 text-white px-4 py-2 rounded">Cart ({cartCount})</button>
    </header>
  );
}

// --- Catalog Component ---
function Catalog({ categories, category, setCategory, query, setQuery, products, onAdd }) {
  return (
    <div>
      <div className="my-4 flex gap-2">
        {categories.map(c => <button key={c} onClick={() => setCategory(c)} className={`px-2 py-1 rounded ${category===c?'bg-blue-500 text-white':'bg-gray-200'}`}>{c}</button>)}
      </div>
      <input className="border p-2 w-full mb-4" placeholder="Search..." value={query} onChange={e => setQuery(e.target.value)} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map(p => <ProductCard key={p.id} product={p} onAdd={onAdd} />)}
      </div>
    </div>
  );
}

// --- ProductCard Component ---
function ProductCard({ product, onAdd }) {
  const [qty, setQty] = useState(1);
  const [selections, setSelections] = useState({});
  const [extraFabricChoices, setExtraFabricChoices] = useState("");

  const handleSelect = (group, choice) => {
    const val = { ...choice };
    if(group==='Fabric' && (choice.label==='Upholstery'||choice.label==='Fleece')) {
      val.extraChoices = extraFabricChoices;
    }
    setSelections(prev => ({ ...prev, [group]: [val] }));
  };

  useEffect(() => {
    const fabric = selections.Fabric?.[0];
    if(fabric && (fabric.label==='Upholstery'||fabric.label==='Fleece')) {
      fabric.extraChoices = extraFabricChoices;
      setSelections(prev => ({ ...prev, Fabric: [fabric] }));
    }
  }, [extraFabricChoices]);

  return (
    <div className="bg-white p-4 rounded shadow">
      <img src={product.image} alt={product.name} className="mb-2" />
      <h2 className="font-bold mb-1">{product.name}</h2>
      <p className="text-sm mb-2">{product.description}</p>
      {product.options.map(opt => (
        <div key={opt.name} className="mb-2">
          <label className="font-semibold">{opt.name}</label>
          <select className="border w-full p-1 mt-1" onChange={e => handleSelect(opt.name, opt.choices[e.target.selectedIndex])}>
            <option value="">Select {opt.name}</option>
            {opt.choices.map(c => <option key={c.label}>{c.label}</option>)}
          </select>
          {(opt.name==='Fabric' && (selections.Fabric?.[0]?.label==='Upholstery'||selections.Fabric?.[0]?.label==='Fleece')) && (
            <input type="text" className="border w-full p-1 mt-1" placeholder="Enter up to 3 choices separated by OR" value={extraFabricChoices} onChange={e=>setExtraFabricChoices(e.target.value)} />
          )}
        </div>
      ))}
      <div className="flex gap-2 items-center mt-2">
        <input type="number" min="1" value={qty} onChange={e=>setQty(Number(e.target.value))} className="border p-1 w-16" />
        <button className="bg-green-600 text-white px-2 py-1 rounded" onClick={() => onAdd(product, selections, qty)}>Add</button>
      </div>
    </div>
  );
}

// --- Checkout Component ---
function Checkout({ cart, totals, customer, setCustomer, updateQty, removeLine, onPlace, onBack }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Checkout</h2>
      <button onClick={onBack} className="mb-4 underline">Back to Shop</button>
      {cart.map(line => (
        <div key={line.id} className="border p-2 mb-2">
          <div className="flex justify-between items-center">
            <div>{line.name}</div>
            <div>
              <input type="number" value={line.qty} min="1" onChange={e => updateQty(line.id, Number(e.target.value))} className="border w-16 p-1" />
              <button onClick={()=>removeLine(line.id)} className="ml-2 text-red-600">Remove</button>
            </div>
          </div>
        </div>
      ))}
      <div className="my-4">
        <p>Subtotal: {formatZAR(totals.subtotal)}</p>
        <p>Delivery: {formatZAR(totals.delivery)}</p>
        <p>Total: {formatZAR(totals.grand)}</p>
      </div>
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={onPlace}>Place Order</button>
    </div>
  );
}

// --- Success Component ---
function Success({ refNo, onShopAgain }) {
  return (
    <div className="text-center mt-10">
      <h2 className="text-xl font-bold mb-4">Thank you for your order!</h2>
      <p>Order Ref: {refNo}</p>
      <button onClick={onShopAgain} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Shop Again</button>
    </div>
  );
}

// --- Footer Component ---
function Footer() {
  return <footer className="bg-gray-100 p-4 text-center mt-10">&copy; 2025 SBOS Store</footer>;
}

// --- Main App ---
export default function App() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState(() => { try { return JSON.parse(localStorage.getItem("sbos-cart")||"[]"); } catch { return []; } });
  const [view, setView] = useState("catalog");
  const [orderRef, setOrderRef] = useState("");
  const [customer, setCustomer] = useState({ fullName:"", email:"", phone:"", deliveryMethod:"pickup", address:{line1:"",line2:"",city:"",province:"",postalCode:""}, paymentMethod:"card", notes:"" });

  useEffect(()=>{ localStorage.setItem("sbos-cart", JSON.stringify(cart)); },[cart]);

  const categories = useMemo(()=>["All", ...Array.from(new Set(CATALOG.map(p=>p.category)))],[]);
  const filtered = useMemo(()=>{ const q=query.toLowerCase(); return CATALOG.filter(p=>(category==="All"||p.category===category)&&(p.name.toLowerCase().includes(q)||p.category.toLowerCase().includes(q))); },[query,category]);
  const totals = useMemo(()=>{ const subtotal=cart.reduce((s,i)=>s+i.total,0); const delivery=DELIVERY_FEES[customer.deliveryMethod]??0; const grand=subtotal+delivery; return {subtotal,delivery,grand}; },[cart,customer.deliveryMethod]);

  const addToCart = (product,selections,qty)=>{ const optionsTotal=Object.values(selections).flat().reduce((s,opt)=>s+(opt?.priceDelta||0),0); const unitPrice=product.price+optionsTotal; const total=unitPrice*qty; setCart(c=>[...c,{id:uid(),productId:product.id,name:product.name,selections,qty,unitPrice,total}]); };
  const updateQty=(id,qty)=>setCart(c=>c.map(l=>l.id===id?{...l,qty,total:qty*l.unitPrice}:l));
  const removeLine=id=>setCart(c=>c.filter(l=>l.id!==id));
  const clearCart=()=>setCart([]);

  const buildOrderText = order => {
    let text=`Order Ref: ${order.ref}\nName: ${order.customer.fullName}\nPhone: ${order.customer.phone}\n`;
    if(order.customer.email) text+=`Email: ${order.customer.email}\n`;
    text+=`Delivery: ${order.customer.deliveryMethod}\n`;
    if(order.customer.deliveryMethod!="pickup"){ const a=order.customer.address; text+=`Address: ${a.line1}, ${a.line2}, ${a.city}, ${a.province}, ${a.postalCode}\n`; }
    text+=`Payment: ${order.customer.paymentMethod}\n`;
    if(order.customer.notes) text+=`Notes: ${order.customer.notes}\n`;
    text+=`--- Items ---\n`;
    order.items.forEach(i=>{ text+=`${i.qty} × ${i.name} \n`; Object.entries(i.selections||{}).forEach(([group,opts])=>{ if(!opts?.length) return; const labels=opts.map(o=>(o.label==="Upholstery"||o.label==="Fleece")&&o.extraChoices?`${o.label} [${o.extraChoices}]`:o.label).join(", "); text+=`  • ${group}: ${labels}\n`; }); text+=`  Unit: ${formatZAR(i.unitPrice)} — Line Total: ${formatZAR(i.total)}\n`; });
    text+=`Subtotal: ${formatZAR(order.totals.subtotal)}\nDelivery: ${formatZAR(order.totals.delivery)}\nTOTAL: ${formatZAR(order.totals.grand)}\n`;
    return text;
  };

  const placeOrder = ()=>{
    if(!cart.length) return alert("Your cart is empty.");
    if(!customer.fullName||!customer.phone) return alert("Please provide your name and phone number.");
    if(customer.deliveryMethod!="pickup"){ const {line1,city,province,postalCode}=customer.address; if(!line1||!city||!province||!postalCode) return alert("Please complete the shipping address."); }
    for(const line of cart){ const fabricSel=line.selections?.Fabric?.[0]; if(fabricSel&&(fabricSel.label==="Upholstery"||fabricSel.label==="Fleece")){ if(!fabricSel.extraChoices.trim()) return alert(`Please enter choices for ${fabricSel.label} fabric.`); const count=fabricSel.extraChoices.split(/\s*OR\s*/).filter(Boolean).length; if(count>3) return alert(`You can enter at most 3 choices for ${fabricSel.label} fabric.`); } }
    const ref=`SBOS-${uid()}`;
    const order={ref,timestamp:new Date().toISOString(),customer,items:cart,totals};
    try{ const history=JSON.parse(localStorage.getItem("sbos-orders")||"[]"); history.push(order); localStorage.setItem("sbos-orders",JSON.stringify(history)); }catch{}
    const message=encodeURIComponent(buildOrderText(order));
    window.open(`https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${message}`,"_blank");
    const mailUrl=`mailto:${customer.email||STORE_EMAIL}?subject=${encodeURIComponent(`Order Confirmation ${ref}`)}&body=${encodeURIComponent(buildOrderText(order))}`;
    window.open(mailUrl);
    setOrderRef(ref);
    clearCart();
    setView("success");
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Header cartCount={cart.length} onCheckout={()=>setView("checkout")} onHome={()=>setView("catalog")}/>
      <main className="max-w-6xl mx-auto px-4 pb-24">
        {view==="catalog"&&<Catalog categories={categories} category={category} setCategory={setCategory} query={query} setQuery={setQuery} products={filtered} onAdd={addToCart}/>} 
        {view==="checkout"&&<Checkout cart={cart} totals={totals} customer={customer} setCustomer={setCustomer} updateQty={updateQty} removeLine={removeLine} onPlace={placeOrder} onBack={()=>setView("catalog")}/>} 
        {view==="success"&&<Success refNo={orderRef} onShopAgain={()=>setView("catalog")}/>}
      </main>
      <Footer />
    </div>
  );
}
