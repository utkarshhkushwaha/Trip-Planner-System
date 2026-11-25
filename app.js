const $ = (id) => document.getElementById(id);
let activeRole = "traveller";
let currentUser = null;
let currentTrip = null;

const getTrips = () => JSON.parse(localStorage.getItem("wayfarerTrips") || "[]");
const saveTrips = (trips) => localStorage.setItem("wayfarerTrips", JSON.stringify(trips));
const today = new Date();
const dateText = today.toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
$("todayStamp").textContent = dateText.toUpperCase();
$("partnerStamp").textContent = dateText.toUpperCase();

document.querySelectorAll(".role-tab").forEach(tab => tab.addEventListener("click", () => {
  document.querySelectorAll(".role-tab").forEach(t => t.classList.remove("active"));
  tab.classList.add("active");
  activeRole = tab.dataset.role;
}));

$("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  currentUser = { name: $("loginName").value.trim(), email: $("loginEmail").value.trim() };
  $("authView").classList.add("hidden");
  if (activeRole === "traveller") {
    $("travellerView").classList.remove("hidden");
    $("travellerName").textContent = currentUser.name;
    $("travellerAvatar").textContent = currentUser.name.charAt(0).toUpperCase();
    $("travellerHeading").textContent = `Hello, ${currentUser.name.split(" ")[0]}.`;
    showTravellerPage("planner");
  } else {
    $("partnerView").classList.remove("hidden");
    $("partnerName").textContent = currentUser.name;
    renderAdmin();
  }
});

function logout() {
  currentUser = null;
  currentTrip = null;
  $("travellerView").classList.add("hidden");
  $("partnerView").classList.add("hidden");
  $("authView").classList.remove("hidden");
  $("loginForm").reset();
}
$("travellerLogout").addEventListener("click", logout);
$("partnerLogout").addEventListener("click", logout);

document.querySelectorAll(".side-link[data-page]").forEach(link => link.addEventListener("click", () => showTravellerPage(link.dataset.page)));
function showTravellerPage(page) {
  $("plannerPage").classList.toggle("hidden", page !== "planner");
  $("savedPage").classList.toggle("hidden", page !== "saved");
  document.querySelectorAll(".side-link[data-page]").forEach(link => link.classList.toggle("active", link.dataset.page === page));
  if (page === "saved") renderSaved();
}
$("partnerTripsLink").addEventListener("click", () => $("partnerTripList").scrollIntoView({behavior:"smooth", block:"start"}));

$("tripForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const start = new Date($("startDate").value + "T12:00:00");
  const end = new Date($("endDate").value + "T12:00:00");
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    alert("Please choose a valid end date (same day or after the start date).");
    return;
  }
  const trip = {
    id: Date.now(), owner: currentUser.name, email: currentUser.email,
    destination: $("destination").value.trim(), startDate: $("startDate").value,
    endDate: $("endDate").value, travellers: $("travellers").value,
    budget: $("budget").value, style: $("travelStyle").value,
    transport: $("transport").value, interests: $("interests").value.trim(),
    createdAt: new Date().toISOString()
  };
  trip.days = buildDays(trip);
  const trips = getTrips();
  trips.unshift(trip);
  saveTrips(trips);
  currentTrip = trip;
  renderItinerary(trip);
});

function buildDays(trip) {
  const start = new Date(trip.startDate + "T12:00:00");
  const end = new Date(trip.endDate + "T12:00:00");
  const count = Math.max(1, Math.min(14, Math.round((end - start) / 86400000) + 1));
  const themes = {
    "Sightseeing": ["Arrival & local highlights", "Landmarks and famous sights", "Explore the old town", "A relaxed final day"],
    "Adventure": ["Arrival & easy exploration", "Outdoor adventure day", "Scenic trails and local life", "Slow morning and departure"],
    "Relaxation": ["Arrive and unwind", "A day at your own pace", "Local cafés and calm corners", "Leisurely departure"],
    "Food & culture": ["Arrival and local flavours", "Food walk and cultural stops", "Markets, crafts and regional food", "One last local breakfast"],
    "Nature": ["Arrival and nearby nature", "A full day outdoors", "Scenic spots and slow travel", "Easy morning and departure"],
    "Mixed experience": ["Arrival & neighbourhood walk", "Top attractions and experiences", "Local food, culture and free time", "A relaxed final day"]
  };
  const descriptions = [
    "Check in, get oriented and explore the neighbourhood. Keep the evening light with a local dinner.",
    "Start after breakfast, visit the main highlights and leave time for a long lunch and unplanned discoveries.",
    "Mix one planned activity with time to explore at your own pace. Try a well-reviewed local place for dinner.",
    "Enjoy a slow breakfast, pick up any last-minute souvenirs and allow enough time for your return journey."
  ];
  const names = themes[trip.style] || themes["Mixed experience"];
  return Array.from({length: count}, (_, i) => {
    const d = new Date(start); d.setDate(start.getDate() + i);
    return { date: d.toLocaleDateString("en-IN", {day:"numeric",month:"short"}), title: names[Math.min(i, names.length - 1)], description: descriptions[Math.min(i, descriptions.length - 1)] };
  });
}

function renderItinerary(trip) {
  const result = $("itineraryResult");
  result.classList.remove("hidden");
  result.innerHTML = `
    <div class="itinerary-top"><div><div class="eyebrow dark">YOUR FIRST DRAFT</div><h3>${escapeHtml(trip.destination)}</h3><div class="itinerary-meta">${formatDate(trip.startDate)} — ${formatDate(trip.endDate)} &nbsp;·&nbsp; ${escapeHtml(trip.travellers)} traveller(s)<br>${escapeHtml(trip.budget)} budget &nbsp;·&nbsp; ${escapeHtml(trip.style)} &nbsp;·&nbsp; ${escapeHtml(trip.transport)}</div></div><button class="secondary-btn" id="printTrip">Print itinerary ↗</button></div>
    <div>${trip.days.map((day, i) => `<div class="day-row"><div class="day-label">DAY ${String(i+1).padStart(2,"0")}<br><span style="color:#9aa197;font-weight:400;letter-spacing:0">${day.date}</span></div><div><h4>${escapeHtml(day.title)}</h4><p>${escapeHtml(day.description)}</p></div></div>`).join("")}</div>
    ${trip.interests ? `<p class="itinerary-meta"><strong>Your notes:</strong> ${escapeHtml(trip.interests)}</p>` : ""}
    <div class="itinerary-actions"><button class="secondary-btn" id="newTrip">Create another trip</button></div>`;
  $("printTrip").addEventListener("click", () => window.print());
  $("newTrip").addEventListener("click", () => { result.classList.add("hidden"); $("tripForm").reset(); window.scrollTo({top:0,behavior:"smooth"}); });
  result.scrollIntoView({behavior:"smooth", block:"start"});
}

function renderSaved() {
  const list = $("savedList");
  const mine = getTrips().filter(t => t.email === currentUser.email);
  if (!mine.length) { list.innerHTML = '<div class="empty-state">No itineraries yet. Start by creating your first trip.</div>'; return; }
  list.innerHTML = mine.map(t => `<div class="saved-card"><div><h4>${escapeHtml(t.destination)}</h4><p>${formatDate(t.startDate)} — ${formatDate(t.endDate)} · ${escapeHtml(t.travellers)} traveller(s) · ${escapeHtml(t.style)}</p></div><div><button class="view-btn" data-view="${t.id}">View plan</button><button class="delete-btn" data-delete="${t.id}">Delete</button></div></div>`).join("");
  list.querySelectorAll("[data-view]").forEach(btn => btn.addEventListener("click", () => { const trip = getTrips().find(t => t.id === Number(btn.dataset.view)); if (trip) { showTravellerPage("planner"); renderItinerary(trip); } }));
  list.querySelectorAll("[data-delete]").forEach(btn => btn.addEventListener("click", () => { saveTrips(getTrips().filter(t => t.id !== Number(btn.dataset.delete))); renderSaved(); }));
}

function renderAdmin() {
  const trips = getTrips();
  $("totalTrips").textContent = trips.length;
  $("totalPlaces").textContent = new Set(trips.map(t => t.destination.toLowerCase())).size;
  $("totalPeople").textContent = trips.reduce((sum, t) => sum + (parseInt(t.travellers, 10) || 1), 0);
  const list = $("partnerTripList");
  if (!trips.length) { list.innerHTML = '<div class="empty-state">No trip plans have been created yet. Traveller submissions will appear here.</div>'; return; }
  list.innerHTML = trips.map(t => `<article class="partner-trip-card"><div><h4>${escapeHtml(t.destination)}</h4><p>By ${escapeHtml(t.owner)} (${escapeHtml(t.email)})<br>${formatDate(t.startDate)} — ${formatDate(t.endDate)} · ${escapeHtml(t.travellers)} traveller(s) · ${escapeHtml(t.budget)} budget</p></div><button class="view-btn" data-admin-view="${t.id}">View details</button></article>`).join("");
  list.querySelectorAll("[data-admin-view]").forEach(btn => btn.addEventListener("click", () => {
    const t = getTrips().find(x => x.id === Number(btn.dataset.adminView));
    if (t) alert(`TRIP REQUEST\\n\\nDestination: ${t.destination}\\nTraveller: ${t.owner}\\nEmail: ${t.email}\\nDates: ${formatDate(t.startDate)} – ${formatDate(t.endDate)}\\nGroup: ${t.travellers}\\nStyle: ${t.style}\\nTransport: ${t.transport}\\nNotes: ${t.interests || "None"}`);
  }));
}

function formatDate(value) {
  return new Date(value + "T12:00:00").toLocaleDateString("en-IN", {day:"numeric",month:"short",year:"numeric"});
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));
}
