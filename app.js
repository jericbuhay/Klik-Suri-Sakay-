/* ============================================================================
   KLIK, SURI, SAKAY! — MAPA, PAGHAHANAP, OSRM ROUTING, AT UI RENDERING
   ============================================================================ */

const LUCENA_CENTER = [13.9358, 121.6129];

const state = {
  pickup: null,
  destination: null,
  roadDistanceKm: null,
  routeStatus: "idle",
  routeErrorMsg: "",
  mapMode: "pickup",
  listAssignTarget: "pickup",
  tricycleTripType: "regular",
  tricycleStudentDiscount: false,
  breakdownOpen: false,
  routeAbortController: null
};

const el = {
  tabSearchBtn: document.getElementById("tabSearchBtn"),
  tabListBtn: document.getElementById("tabListBtn"),
  tabMapHintBtn: document.getElementById("tabMapHintBtn"),
  panelSearch: document.getElementById("panelSearch"),
  panelList: document.getElementById("panelList"),
  panelMapInfo: document.getElementById("panelMapInfo"),

  pickupInput: document.getElementById("pickupInput"),
  destInput: document.getElementById("destInput"),
  pickupSuggestions: document.getElementById("pickupSuggestions"),
  destSuggestions: document.getElementById("destSuggestions"),
  pickupSelectedChip: document.getElementById("pickupSelectedChip"),
  destSelectedChip: document.getElementById("destSelectedChip"),

  assignPickupBtn: document.getElementById("assignPickupBtn"),
  assignDestBtn: document.getElementById("assignDestBtn"),
  directoryFilterInput: document.getElementById("directoryFilterInput"),
  directoryList: document.getElementById("directoryList"),

  swapBtn: document.getElementById("swapBtn"),
  resetBtn: document.getElementById("resetBtn"),
  mapModePickupBtn: document.getElementById("mapModePickupBtn"),
  mapModeDestBtn: document.getElementById("mapModeDestBtn"),
  centerLucenaBtn: document.getElementById("centerLucenaBtn"),
  mapStatusHint: document.getElementById("mapStatusHint"),

  distanceStatusBanner: document.getElementById("distanceStatusBanner"),
  routeSummaryText: document.getElementById("routeSummaryText"),
  distanceDisplay: document.getElementById("distanceDisplay"),
  retryRouteWrap: document.getElementById("retryRouteWrap"),
  retryRouteBtn: document.getElementById("retryRouteBtn"),

  tripRegularLabel: document.getElementById("tripRegularLabel"),
  tripSpecialLabel: document.getElementById("tripSpecialLabel"),
  studentDiscountLabel: document.getElementById("studentDiscountLabel"),
  studentDiscountToggle: document.getElementById("studentDiscountToggle"),

  cardTricycle: document.getElementById("cardTricycle"),
  cardMaxim: document.getElementById("cardMaxim"),
  cardJoyride: document.getElementById("cardJoyride"),
  badgeTricycle: document.getElementById("badgeTricycle"),
  badgeMaxim: document.getElementById("badgeMaxim"),
  badgeJoyride: document.getElementById("badgeJoyride"),
  tricyclePriceWrap: document.getElementById("tricyclePriceWrap"),
  maximPriceWrap: document.getElementById("maximPriceWrap"),
  joyridePriceWrap: document.getElementById("joyridePriceWrap"),
  metaTrikeTrip: document.getElementById("metaTrikeTrip"),
  metaTrikeDiscount: document.getElementById("metaTrikeDiscount"),

  savingsSection: document.getElementById("savingsSection"),
  savingsHeadline: document.getElementById("savingsHeadline"),
  savingsSub: document.getElementById("savingsSub"),

  toggleBreakdownBtn: document.getElementById("toggleBreakdownBtn"),
  breakdownPanel: document.getElementById("breakdownPanel"),
  breakdownGrid: document.getElementById("breakdownGrid")
};

function formatPeso(amount) {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "—";
  const rounded = Math.round(amount * 100) / 100;
  return Number.isInteger(rounded) ? `₱${rounded}` : `₱${rounded.toFixed(2)}`;
}

function formatKm(km) {
  if (typeof km !== "number" || Number.isNaN(km)) return "—";
  return `${km.toFixed(2)} km`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

let map = null;
let pickupMarker = null;
let destMarker = null;
let routePolyline = null;

function createPinIcon(colorHex, labelText) {
  return L.divIcon({
    className: "custom-map-pin",
    html: `<div style="
      background:${colorHex};
      color:#ffffff;
      font-weight:800;
      font-size:12px;
      width:30px;
      height:30px;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:3px solid #ffffff;
      box-shadow:0 3px 8px rgba(0,0,0,0.35);
      display:flex;
      align-items:center;
      justify-content:center;
    "><span style="transform:rotate(45deg);">${labelText}</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28]
  });
}

function initMap() {
  const mapEl = document.getElementById("map");
  if (typeof L === "undefined") {
    mapEl.innerHTML =
      '<div style="padding:24px; text-align:center; color:#b91c1c; font-weight:700;">Hindi na-load ang interactive map (suriin ang iyong internet connection). Maaari ka pa ring maghanap sa beripikadong listahan sa kaliwa.</div>';
    return;
  }

  map = L.map("map", {
    center: LUCENA_CENTER,
    zoom: 13
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  map.on("click", async (e) => {
    const { lat, lng } = e.latlng;
    const targetType = state.mapMode;
    const coordLabel = `Napiling Punto sa Mapa (${lat.toFixed(5)}, ${lng.toFixed(5)})`;

    setLocationPoint(targetType, {
      name: coordLabel,
      address: `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      lat,
      lng
    });

    if (targetType === "pickup" && !state.destination) {
      setMapMode("destination");
    }

    const placeName = await reverseGeocodeNominatim(lat, lng);
    if (placeName) {
      const current = targetType === "pickup" ? state.pickup : state.destination;
      if (current && Math.abs(current.lat - lat) < 1e-6 && Math.abs(current.lng - lng) < 1e-6) {
        current.name = placeName;
        current.address = `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        if (targetType === "pickup") el.pickupInput.value = placeName;
        else el.destInput.value = placeName;
        renderSelectedChips();
        updateMarkerPopup(targetType);
        renderAllResults();
      }
    }
  });
}

function updateMarkerPopup(type) {
  if (type === "pickup" && pickupMarker && state.pickup) {
    pickupMarker.bindPopup(`<strong>Pinanggalingan:</strong><br>${escapeHtml(state.pickup.name)}`);
  }
  if (type === "destination" && destMarker && state.destination) {
    destMarker.bindPopup(`<strong>Destinasyon:</strong><br>${escapeHtml(state.destination.name)}`);
  }
}

function syncMapMarkers() {
  if (!map || typeof L === "undefined") return;

  if (state.pickup) {
    const pos = [state.pickup.lat, state.pickup.lng];
    if (!pickupMarker) {
      pickupMarker = L.marker(pos, {
        draggable: true,
        icon: createPinIcon("#1d4ed8", "A")
      }).addTo(map);

      pickupMarker.on("dragend", async () => {
        const { lat, lng } = pickupMarker.getLatLng();
        state.pickup = {
          name: `Inilipat na Pinanggalingan (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
          address: `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          lat,
          lng
        };
        el.pickupInput.value = state.pickup.name;
        renderSelectedChips();
        calculateRouteAndFares();

        const placeName = await reverseGeocodeNominatim(lat, lng);
        if (placeName && state.pickup) {
          state.pickup.name = placeName;
          el.pickupInput.value = placeName;
          renderSelectedChips();
          updateMarkerPopup("pickup");
          renderAllResults();
        }
      });
    } else {
      pickupMarker.setLatLng(pos);
    }
    updateMarkerPopup("pickup");
  } else if (pickupMarker) {
    map.removeLayer(pickupMarker);
    pickupMarker = null;
  }

  if (state.destination) {
    const pos = [state.destination.lat, state.destination.lng];
    if (!destMarker) {
      destMarker = L.marker(pos, {
        draggable: true,
        icon: createPinIcon("#eab308", "B")
      }).addTo(map);

      destMarker.on("dragend", async () => {
        const { lat, lng } = destMarker.getLatLng();
        state.destination = {
          name: `Inilipat na Destinasyon (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
          address: `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          lat,
          lng
        };
        el.destInput.value = state.destination.name;
        renderSelectedChips();
        calculateRouteAndFares();

        const placeName = await reverseGeocodeNominatim(lat, lng);
        if (placeName && state.destination) {
          state.destination.name = placeName;
          el.destInput.value = placeName;
          renderSelectedChips();
          updateMarkerPopup("destination");
          renderAllResults();
        }
      });
    } else {
      destMarker.setLatLng(pos);
    }
    updateMarkerPopup("destination");
  } else if (destMarker) {
    map.removeLayer(destMarker);
    destMarker = null;
  }

  if (state.pickup && state.destination) {
    const bounds = L.latLngBounds(
      [state.pickup.lat, state.pickup.lng],
      [state.destination.lat, state.destination.lng]
    );
    map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15 });
  } else if (state.pickup) {
    map.panTo([state.pickup.lat, state.pickup.lng]);
  } else if (state.destination) {
    map.panTo([state.destination.lat, state.destination.lng]);
  }
}

function drawRoutePolyline(geojsonCoords) {
  if (!map || typeof L === "undefined") return;
  if (routePolyline) {
    map.removeLayer(routePolyline);
    routePolyline = null;
  }
  if (Array.isArray(geojsonCoords) && geojsonCoords.length > 0) {
    const latLngs = geojsonCoords.map(([lng, lat]) => [lat, lng]);
    routePolyline = L.polyline(latLngs, {
      color: "#1d4ed8",
      weight: 5,
      opacity: 0.85
    }).addTo(map);
    map.fitBounds(routePolyline.getBounds(), { padding: [45, 45] });
  }
}

function clearRoutePolyline() {
  if (map && routePolyline) {
    map.removeLayer(routePolyline);
    routePolyline = null;
  }
}

let lastNominatimCall = 0;

async function searchNominatimPlaces(query) {
  const now = Date.now();
  if (now - lastNominatimCall < 1000) return [];
  lastNominatimCall = now;

  const url =
    "https://nominatim.openstreetmap.org/search?" +
    new URLSearchParams({
      q: `${query}, Lucena City, Quezon, Philippines`,
      format: "json",
      addressdetails: "1",
      limit: "5",
      viewbox: "121.47,14.03,121.72,13.85",
      bounded: "1"
    }).toString();

  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item) => ({
      id: `osm-${item.place_id}`,
      name: item.name || item.display_name.split(",")[0],
      address: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      isOsmResult: true
    }));
  } catch {
    return [];
  }
}

async function reverseGeocodeNominatim(lat, lng) {
  const now = Date.now();
  if (now - lastNominatimCall < 1000) return null;
  lastNominatimCall = now;

  const url =
    "https://nominatim.openstreetmap.org/reverse?" +
    new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      format: "json",
      zoom: "17"
    }).toString();

  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.display_name) {
      return data.display_name.split(",").slice(0, 3).join(", ");
    }
    return null;
  } catch {
    return null;
  }
}

async function calculateRouteAndFares() {
  if (state.routeAbortController) {
    state.routeAbortController.abort();
  }

  if (!state.pickup || !state.destination) {
    state.roadDistanceKm = null;
    state.routeStatus = "idle";
    state.routeErrorMsg = "";
    clearRoutePolyline();
    renderAllResults();
    return;
  }

  const sameSpot =
    Math.abs(state.pickup.lat - state.destination.lat) < 0.00015 &&
    Math.abs(state.pickup.lng - state.destination.lng) < 0.00015;

  if (sameSpot) {
    state.roadDistanceKm = null;
    state.routeStatus = "same";
    state.routeErrorMsg =
      "Magkapareho ang iyong Pinanggalingan at Destinasyon. Pumili ng ibang lugar upang makalkula ang distansya at pamasahe.";
    clearRoutePolyline();
    renderAllResults();
    return;
  }

  state.routeStatus = "loading";
  state.roadDistanceKm = null;
  renderAllResults();

  const controller = new AbortController();
  state.routeAbortController = controller;
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const url = `https://router.project-osrm.org/route/v1/driving/${state.pickup.lng},${state.pickup.lat};${state.destination.lng},${state.destination.lat}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.code !== "Ok" || !data.routes || !data.routes.length) {
      throw new Error("Walang nahanap na ruta sa kalsada.");
    }

    const route = data.routes[0];
    const distanceKm = route.distance / 1000;

    state.roadDistanceKm = distanceKm;
    state.routeStatus = "ready";
    state.routeErrorMsg = "";
    drawRoutePolyline(route.geometry && route.geometry.coordinates);
    renderAllResults();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError" && state.routeAbortController !== controller) {
      return;
    }
    state.roadDistanceKm = null;
    state.routeStatus = "error";
    state.routeErrorMsg =
      "Hindi makakonekta sa routing service (OSRM) upang makuha ang eksaktong road distance. Hindi nanghuhula ng distansya ang website. Suriin ang iyong koneksyon at pindutin ang 'Subukan Muli ang Ruta'.";
    clearRoutePolyline();
    renderAllResults();
  }
}

function setLocationPoint(type, locationObj) {
  const normalized = {
    name: locationObj.name,
    address: locationObj.address || "",
    lat: Number(locationObj.lat),
    lng: Number(locationObj.lng)
  };

  if (type === "pickup") {
    state.pickup = normalized;
    el.pickupInput.value = normalized.name;
    hideSuggestions("pickup");
  } else {
    state.destination = normalized;
    el.destInput.value = normalized.name;
    hideSuggestions("destination");
  }

  renderSelectedChips();
  syncMapMarkers();
  calculateRouteAndFares();
}

function renderSelectedChips() {
  if (state.pickup) {
    el.pickupSelectedChip.hidden = false;
    el.pickupSelectedChip.innerHTML = `
      <span><strong>Napili:</strong> ${escapeHtml(state.pickup.name)} <small>(${state.pickup.lat.toFixed(4)}, ${state.pickup.lng.toFixed(4)})</small></span>
      <button type="button" class="btn btn-sm btn-subtle" style="min-height:30px; padding:2px 8px;" id="clearPickupChipBtn" aria-label="Burahin ang Pinanggalingan">Alisin</button>
    `;
    document.getElementById("clearPickupChipBtn").addEventListener("click", () => {
      state.pickup = null;
      el.pickupInput.value = "";
      renderSelectedChips();
      syncMapMarkers();
      calculateRouteAndFares();
    });
  } else {
    el.pickupSelectedChip.hidden = true;
    el.pickupSelectedChip.innerHTML = "";
  }

  if (state.destination) {
    el.destSelectedChip.hidden = false;
    el.destSelectedChip.innerHTML = `
      <span><strong>Napili:</strong> ${escapeHtml(state.destination.name)} <small>(${state.destination.lat.toFixed(4)}, ${state.destination.lng.toFixed(4)})</small></span>
      <button type="button" class="btn btn-sm btn-subtle" style="min-height:30px; padding:2px 8px;" id="clearDestChipBtn" aria-label="Burahin ang Destinasyon">Alisin</button>
    `;
    document.getElementById("clearDestChipBtn").addEventListener("click", () => {
      state.destination = null;
      el.destInput.value = "";
      renderSelectedChips();
      syncMapMarkers();
      calculateRouteAndFares();
    });
  } else {
    el.destSelectedChip.hidden = true;
    el.destSelectedChip.innerHTML = "";
  }
}

function hideSuggestions(type) {
  const listEl = type === "pickup" ? el.pickupSuggestions : el.destSuggestions;
  listEl.hidden = true;
  listEl.innerHTML = "";
}

function getLocalMatches(query) {
  const q = query.trim().toLowerCase();
  if (!q) return VERIFIED_LOCATIONS.slice(0, 10);

  const startsWith = [];
  const contains = [];
  for (const loc of VERIFIED_LOCATIONS) {
    const nameLower = loc.name.toLowerCase();
    const addrLower = loc.address.toLowerCase();
    const catLower = loc.category.toLowerCase();
    if (nameLower.startsWith(q)) {
      startsWith.push(loc);
    } else if (nameLower.includes(q) || addrLower.includes(q) || catLower.includes(q)) {
      contains.push(loc);
    }
  }
  return [...startsWith, ...contains].slice(0, 10);
}

function renderSuggestions(type, localItems, osmItems = []) {
  const listEl = type === "pickup" ? el.pickupSuggestions : el.destSuggestions;
  listEl.innerHTML = "";

  if (localItems.length === 0 && osmItems.length === 0) {
    const li = document.createElement("li");
    li.innerHTML = `<div style="padding:10px 12px; color:var(--gray-600); font-size:0.9rem;">Walang tugmang lugar sa listahan. Maaari mo ring i-click ang eksaktong lugar sa mapa.</div>`;
    listEl.appendChild(li);
    listEl.hidden = false;
    return;
  }

  if (localItems.length > 0) {
    const div = document.createElement("li");
    div.className = "suggestion-divider";
    div.textContent = "Mga Beripikadong Lugar sa Lucena City";
    listEl.appendChild(div);

    localItems.forEach((loc) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "suggestion-item";
      btn.setAttribute("role", "option");
      btn.innerHTML = `
        <span class="suggestion-title">${escapeHtml(loc.name)}</span>
        <span class="suggestion-meta">${escapeHtml(loc.category)} • ${escapeHtml(loc.address)}</span>
      `;
      btn.addEventListener("click", () => setLocationPoint(type, loc));
      li.appendChild(btn);
      listEl.appendChild(li);
    });
  }

  if (osmItems.length > 0) {
    const div = document.createElement("li");
    div.className = "suggestion-divider";
    div.textContent = "Karagdagang Mungkahi mula sa OpenStreetMap";
    listEl.appendChild(div);

    osmItems.forEach((loc) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "suggestion-item";
      btn.setAttribute("role", "option");
      btn.innerHTML = `
        <span class="suggestion-title">${escapeHtml(loc.name)}</span>
        <span class="suggestion-meta">${escapeHtml(loc.address)}</span>
      `;
      btn.addEventListener("click", () => setLocationPoint(type, loc));
      li.appendChild(btn);
      listEl.appendChild(li);
    });
  }

  listEl.hidden = false;
}

function setupAutocomplete(inputEl, type) {
  let osmDebounceTimer = null;

  inputEl.addEventListener("focus", () => {
    const local = getLocalMatches(inputEl.value);
    renderSuggestions(type, local, []);
  });

  inputEl.addEventListener("input", () => {
    const val = inputEl.value;
    const local = getLocalMatches(val);
    renderSuggestions(type, local, []);

    clearTimeout(osmDebounceTimer);
    if (val.trim().length >= 3) {
      osmDebounceTimer = setTimeout(async () => {
        const osm = await searchNominatimPlaces(val.trim());
        if (document.activeElement === inputEl && inputEl.value === val) {
          renderSuggestions(type, local, osm);
        }
      }, 550);
    }
  });

  document.addEventListener("click", (e) => {
    const group = inputEl.closest(".input-group");
    if (group && !group.contains(e.target)) {
      hideSuggestions(type);
    }
  });
}

function renderDirectoryList(filterText = "") {
  const q = filterText.trim().toLowerCase();
  const filtered = VERIFIED_LOCATIONS.filter(
    (loc) =>
      !q ||
      loc.name.toLowerCase().includes(q) ||
      loc.category.toLowerCase().includes(q) ||
      loc.address.toLowerCase().includes(q)
  );

  if (filtered.length === 0) {
    el.directoryList.innerHTML =
      '<p style="padding:12px; color:var(--gray-600); margin:0;">Walang nahanap na lugar sa beripikadong listahan.</p>';
    return;
  }

  const groups = new Map();
  filtered.forEach((loc) => {
    if (!groups.has(loc.category)) groups.set(loc.category, []);
    groups.get(loc.category).push(loc);
  });

  const targetLabel = state.listAssignTarget === "pickup" ? "Itakda: Pinanggalingan" : "Itakda: Destinasyon";
  el.directoryList.innerHTML = "";

  groups.forEach((items, category) => {
    const catHeading = document.createElement("div");
    catHeading.className = "category-title";
    catHeading.textContent = category;
    el.directoryList.appendChild(catHeading);

    items.forEach((loc) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "place-btn";
      btn.innerHTML = `
        <span>
          <span class="place-btn-name">${escapeHtml(loc.name)}</span>
          <span class="place-btn-sub">${escapeHtml(loc.address)}</span>
        </span>
        <span class="place-btn-action">${targetLabel}</span>
      `;
      btn.addEventListener("click", () => {
        setLocationPoint(state.listAssignTarget, loc);
        if (state.listAssignTarget === "pickup" && !state.destination) {
          setListAssignTarget("destination");
        }
      });
      el.directoryList.appendChild(btn);
    });
  });
}

function setListAssignTarget(target) {
  state.listAssignTarget = target;
  el.assignPickupBtn.className = target === "pickup" ? "btn btn-sm btn-primary" : "btn btn-sm btn-secondary";
  el.assignDestBtn.className = target === "destination" ? "btn btn-sm btn-primary" : "btn btn-sm btn-secondary";
  renderDirectoryList(el.directoryFilterInput.value);
}

function setMapMode(mode) {
  state.mapMode = mode;
  el.mapModePickupBtn.className = mode === "pickup" ? "btn btn-sm btn-primary" : "btn btn-sm btn-secondary";
  el.mapModeDestBtn.className = mode === "destination" ? "btn btn-sm btn-primary" : "btn btn-sm btn-secondary";
  el.mapStatusHint.textContent =
    mode === "pickup"
      ? "Kasalukuyang mode: Pindutin ang mapa para ilagay ang Pinanggalingan (Asul). Maaari ring i-drag ang mga pin."
      : "Kasalukuyang mode: Pindutin ang mapa para ilagay ang Destinasyon (Dilaw). Maaari ring i-drag ang mga pin.";
}

function renderAllResults() {
  el.distanceStatusBanner.className = "status-banner";
  el.retryRouteWrap.hidden = true;

  if (state.routeStatus === "idle") {
    el.routeSummaryText.textContent =
      "Pumili ng pinanggalingan at destinasyon upang awtomatikong makalkula ang road distance.";
    el.distanceDisplay.textContent = "— km";
  } else if (state.routeStatus === "loading") {
    el.routeSummaryText.textContent = "Kinukuha ang aktuwal na road distance mula sa mapa...";
    el.distanceDisplay.textContent = "Kinakalkula...";
  } else if (state.routeStatus === "same") {
    el.distanceStatusBanner.classList.add("warning");
    el.routeSummaryText.textContent = state.routeErrorMsg;
    el.distanceDisplay.textContent = "— km";
  } else if (state.routeStatus === "error") {
    el.distanceStatusBanner.classList.add("error");
    el.routeSummaryText.textContent = state.routeErrorMsg;
    el.distanceDisplay.textContent = "Hindi available";
    el.retryRouteWrap.hidden = false;
  } else if (state.routeStatus === "ready") {
    el.distanceStatusBanner.classList.add("ready");
    el.routeSummaryText.textContent = `Ruta: ${state.pickup.name} → ${state.destination.name}`;
    el.distanceDisplay.textContent = `Road Distance: ${formatKm(state.roadDistanceKm)}`;
  }

  const d = state.routeStatus === "ready" ? state.roadDistanceKm : null;
  const trike = calculateTricycleFare(d, {
    tripType: state.tricycleTripType,
    isStudent: state.tricycleStudentDiscount
  });
  const maxim = calculateMaximFare(d);
  const joyride = calculateJoyRideFare(d);

  document.querySelectorAll(".meta-dist").forEach((node) => {
    node.textContent = d !== null ? formatKm(d) : "—";
  });
  el.metaTrikeTrip.textContent =
    state.tricycleTripType === "special" ? "Special Trip" : "Regular Trip";
  el.metaTrikeDiscount.textContent = state.tricycleStudentDiscount
    ? "May 20% Student Discount"
    : "Hindi nakalapat";

  [el.cardTricycle, el.cardMaxim, el.cardJoyride].forEach((c) => c.classList.remove("cheapest"));
  [el.badgeTricycle, el.badgeMaxim, el.badgeJoyride].forEach((b) => (b.hidden = true));

  renderFareCardPrice(el.tricyclePriceWrap, trike);
  renderFareCardPrice(el.maximPriceWrap, maxim);
  renderFareCardPrice(el.joyridePriceWrap, joyride);

  const validFares = [
    { key: "tricycle", card: el.cardTricycle, badge: el.badgeTricycle, ...trike },
    { key: "maxim", card: el.cardMaxim, badge: el.badgeMaxim, ...maxim },
    { key: "joyride", card: el.cardJoyride, badge: el.badgeJoyride, ...joyride }
  ].filter((item) => item.available && typeof item.fare === "number");

  if (validFares.length >= 2) {
    const minVal = Math.min(...validFares.map((x) => x.fare));
    const maxVal = Math.max(...validFares.map((x) => x.fare));

    const cheapestOptions = validFares.filter((x) => x.fare === minVal);
    const highestOptions = validFares.filter((x) => x.fare === maxVal);

    cheapestOptions.forEach((opt) => {
      opt.card.classList.add("cheapest");
      opt.badge.hidden = false;
    });

    const savings = Math.round((maxVal - minVal) * 100) / 100;
    el.savingsSection.hidden = false;

    if (savings <= 0) {
      el.savingsHeadline.textContent = "₱0 — Magkapareho ang Tinatayang Pamasahe";
      el.savingsSub.textContent = "Pareho ang tinatayang halaga ng mga serbisyo para sa rutang ito.";
    } else {
      const cheapestNames = cheapestOptions.map((o) => o.serviceName).join(" / ");
      const highestNames = highestOptions.map((o) => o.serviceName).join(" / ");
      el.savingsHeadline.textContent = `${formatPeso(savings)} ANG TANTYANG MATITIPID MO!`;
      el.savingsSub.textContent = `Mas makatitipid ka kung pipiliin mo ang ${cheapestNames} (${formatPeso(minVal)}) kumpara sa ${highestNames} (${formatPeso(maxVal)}) sa rutang ito.`;
    }
  } else {
    el.savingsSection.hidden = true;
  }

  renderBreakdown(d, trike, maxim, joyride);
}

function renderFareCardPrice(container, result) {
  if (state.routeStatus === "error") {
    container.innerHTML =
      '<div class="fare-unavailable">Hindi available ang pagtataya ng pamasahe sa ngayon.</div>';
    return;
  }
  if (!result.available) {
    container.innerHTML =
      '<div class="fare-unavailable">Pumili ng ruta upang makita ang tinatayang pamasahe.</div>';
    return;
  }
  container.innerHTML = `<div class="fare-price">${formatPeso(result.fare)}</div>`;
}

function renderBreakdown(d, trike, maxim, joyride) {
  if (d === null || !trike.available || !maxim.available || !joyride.available) {
    el.breakdownGrid.innerHTML =
      '<p style="grid-column:1/-1; color:var(--gray-600); margin:0;">Pumili muna ng balidong pinanggalingan at destinasyon upang makita ang detalyadong pagkalkula ng bawat pamasahe.</p>';
    return;
  }

  const trikeHtml = `
    <div class="breakdown-card" id="breakdown-tricycle">
      <h4>Traysikel (${escapeHtml(trike.tripTypeLabel)})</h4>
      <ul>
        <li>Distansya: <strong>${formatKm(d)}</strong></li>
        <li>Unang ${trike.baseKm} km: <strong>${formatPeso(trike.baseFare)}</strong></li>
        <li>Karagdagang distansya (${trike.additionalDistance.toFixed(2)} km × ${formatPeso(trike.perAdditionalKm)}): <strong>${formatPeso(trike.additionalCharge)}</strong></li>
        <li>Subtotal bago ang diskwento: <strong>${formatPeso(trike.computedFareBeforeDiscount)}</strong></li>
        ${
          trike.isStudent
            ? `<li>Student Discount (20%): <strong>−${formatPeso(trike.discountAmount)}</strong></li>`
            : `<li>Student Discount: <strong>Hindi inilapat</strong></li>`
        }
        <li>Tinatayang pamasahe: <strong>${formatPeso(trike.fare)}</strong></li>
      </ul>
      <div class="breakdown-source">
        <strong>Batayan:</strong> ${escapeHtml(trike.source)}<br/>
        <strong>Huling pagberipika:</strong> ${escapeHtml(trike.lastVerified)}
      </div>
    </div>
  `;

  const maximHtml = `
    <div class="breakdown-card" id="breakdown-maxim">
      <h4>Maxim MotoTaxi</h4>
      <ul>
        <li>Distansya: <strong>${formatKm(d)}</strong></li>
        <li>Minimum fare (0.0 km included): <strong>${formatPeso(maxim.minimumFare)}</strong></li>
        <li>Unang 1 km bracket (${maxim.kmUnder1.toFixed(2)} km × ₱20): <strong>${formatPeso(maxim.chargeUnder1)}</strong></li>
        <li>1 km hanggang 7 km (${maxim.km1To7.toFixed(2)} km × ₱8): <strong>${formatPeso(maxim.charge1To7)}</strong></li>
        <li>7 km pataas (${maxim.km7Plus.toFixed(2)} km × ₱12): <strong>${formatPeso(maxim.charge7Plus)}</strong></li>
        <li>Additional compensation (₱10): <strong>Hindi idinagdag</strong> (ordinaryong biyahe)</li>
        <li>Tinatayang pamasahe (${escapeHtml(maxim.calculationMode)}): <strong>${formatPeso(maxim.fare)}</strong></li>
      </ul>
      <div class="breakdown-source">
        <strong>Batayan:</strong> ${escapeHtml(maxim.source)}<br/>
        <strong>Huling pagberipika:</strong> ${escapeHtml(maxim.lastVerified)}
      </div>
    </div>
  `;

  const joyrideHtml = `
    <div class="breakdown-card" id="breakdown-joyride">
      <h4>JoyRide MC Taxi</h4>
      <ul>
        <li>Distansya: <strong>${formatKm(d)}</strong></li>
        <li>Estimated starting component: <strong>${formatPeso(joyride.startingComponent)}</strong></li>
        <li>Additional distance charge (${d.toFixed(2)} km × ${formatPeso(joyride.perKmCharge)}): <strong>${formatPeso(joyride.additionalDistanceCharge)}</strong></li>
        <li>Kinuwenta (45 + 5d): <strong>${formatPeso(joyride.linearEstimate)}</strong></li>
        <li>Minimum fare floor: <strong>${formatPeso(joyride.minimumFare)}</strong> ${joyride.minimumFloorApplied ? "(Nagamit ang ₱50 minimum)" : ""}</li>
        <li>Tinatayang pamasahe (rounded): <strong>${formatPeso(joyride.fare)}</strong></li>
      </ul>
      <div class="breakdown-source">
        <strong>Batayan:</strong> ${escapeHtml(joyride.source)}<br/>
        <strong>Huling pagberipika:</strong> ${escapeHtml(joyride.lastVerified)}
      </div>
    </div>
  `;

  el.breakdownGrid.innerHTML = trikeHtml + maximHtml + joyrideHtml;
}

function switchTab(activeBtn, activePanel) {
  const tabs = [
    [el.tabSearchBtn, el.panelSearch],
    [el.tabListBtn, el.panelList],
    [el.tabMapHintBtn, el.panelMapInfo]
  ];
  tabs.forEach(([btn, panel]) => {
    const isActive = btn === activeBtn;
    btn.setAttribute("aria-selected", String(isActive));
    panel.hidden = !isActive;
  });
}

el.tabSearchBtn.addEventListener("click", () => switchTab(el.tabSearchBtn, el.panelSearch));
el.tabListBtn.addEventListener("click", () => switchTab(el.tabListBtn, el.panelList));
el.tabMapHintBtn.addEventListener("click", () => switchTab(el.tabMapHintBtn, el.panelMapInfo));

el.assignPickupBtn.addEventListener("click", () => setListAssignTarget("pickup"));
el.assignDestBtn.addEventListener("click", () => setListAssignTarget("destination"));
el.directoryFilterInput.addEventListener("input", (e) => renderDirectoryList(e.target.value));

el.mapModePickupBtn.addEventListener("click", () => setMapMode("pickup"));
el.mapModeDestBtn.addEventListener("click", () => setMapMode("destination"));
el.centerLucenaBtn.addEventListener("click", () => {
  if (map) map.setView(LUCENA_CENTER, 13);
});

el.swapBtn.addEventListener("click", () => {
  const temp = state.pickup;
  state.pickup = state.destination;
  state.destination = temp;

  el.pickupInput.value = state.pickup ? state.pickup.name : "";
  el.destInput.value = state.destination ? state.destination.name : "";

  renderSelectedChips();
  syncMapMarkers();
  calculateRouteAndFares();
});

el.resetBtn.addEventListener("click", () => {
  state.pickup = null;
  state.destination = null;
  state.roadDistanceKm = null;
  state.routeStatus = "idle";
  state.routeErrorMsg = "";
  el.pickupInput.value = "";
  el.destInput.value = "";
  hideSuggestions("pickup");
  hideSuggestions("destination");
  renderSelectedChips();
  syncMapMarkers();
  clearRoutePolyline();
  setMapMode("pickup");
  if (map) map.setView(LUCENA_CENTER, 13);
  renderAllResults();
});

el.retryRouteBtn.addEventListener("click", () => {
  calculateRouteAndFares();
});

document.querySelectorAll('input[name="tricycleTripType"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    state.tricycleTripType = e.target.value;
    el.tripRegularLabel.classList.toggle("active", state.tricycleTripType === "regular");
    el.tripSpecialLabel.classList.toggle("active", state.tricycleTripType === "special");
    renderAllResults();
  });
});

el.studentDiscountToggle.addEventListener("change", (e) => {
  state.tricycleStudentDiscount = e.target.checked;
  el.studentDiscountLabel.classList.toggle("active", state.tricycleStudentDiscount);
  renderAllResults();
});

function openBreakdown(focusServiceId = null) {
  state.breakdownOpen = true;
  el.breakdownPanel.hidden = false;
  el.toggleBreakdownBtn.setAttribute("aria-expanded", "true");
  el.toggleBreakdownBtn.textContent = "ITAGO ANG DETALYE NG PAMASAHE";

  const targetEl = focusServiceId
    ? document.getElementById(`breakdown-${focusServiceId}`) || el.breakdownPanel
    : el.breakdownPanel;
  targetEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

el.toggleBreakdownBtn.addEventListener("click", () => {
  state.breakdownOpen = !state.breakdownOpen;
  el.breakdownPanel.hidden = !state.breakdownOpen;
  el.toggleBreakdownBtn.setAttribute("aria-expanded", String(state.breakdownOpen));
  el.toggleBreakdownBtn.textContent = state.breakdownOpen
    ? "ITAGO ANG DETALYE NG PAMASAHE"
    : "TINGNAN ANG DETALYE NG PAMASAHE";
});

document.querySelectorAll(".view-breakdown-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    openBreakdown(btn.getAttribute("data-service"));
  });
});

setupAutocomplete(el.pickupInput, "pickup");
setupAutocomplete(el.destInput, "destination");
renderDirectoryList();
initMap();
renderAllResults();