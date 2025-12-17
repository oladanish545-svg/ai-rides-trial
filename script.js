let pickupAuto, dropAuto;

function initAutocomplete() {
  pickupAuto = new google.maps.places.Autocomplete(
    document.getElementById("pickup")
  );
  dropAuto = new google.maps.places.Autocomplete(
    document.getElementById("drop")
  );
}

google.maps.event.addDomListener(window, "load", initAutocomplete);

function compareRides() {
  let pickup = document.getElementById("pickup").value;
  let drop = document.getElementById("drop").value;
  let pref = document.getElementById("preference").value;

  if (!pickup || !drop) {
    alert("Enter pickup & drop");
    return;
  }

  let service = new google.maps.DistanceMatrixService();
  service.getDistanceMatrix(
    {
      origins: [pickup],
      destinations: [drop],
      travelMode: "DRIVING"
    },
    function (res, status) {
      if (status !== "OK") return;

      let e = res.rows[0].elements[0];
      let km = e.distance.value / 1000;
      let baseTime = Math.ceil(e.duration.value / 60);

      document.getElementById("distanceInfo").innerHTML =
        `📍 ${km.toFixed(1)} km • ${baseTime} min`;

      calculateAndShow(km, baseTime, pref);
    }
  );
}

function calculateAndShow(km, time, pref) {

  let rides = [
    { name: "Ola", rate: 12, base: 30, extra: 2, link: "https://play.google.com/store/apps/details?id=com.olacabs.customer" },
    { name: "Uber", rate: 13, base: 25, extra: 3, link: "https://play.google.com/store/apps/details?id=com.ubercab" },
    { name: "Rapido", rate: 8, base: 20, extra: 0, link: "https://play.google.com/store/apps/details?id=com.rapido.passenger" },
    { name: "inDrive", rate: 10, base: 25, extra: 1, link: "https://play.google.com/store/apps/details?id=sinet.startup.indrive" }
  ];

  rides.forEach(r => {
    r.fare = Math.round(r.base + km * r.rate);
    r.eta = time + r.extra;
  });

  // AI decision
  if (pref === "cheap") rides.sort((a,b)=>a.fare-b.fare);
  if (pref === "fast") rides.sort((a,b)=>a.eta-b.eta);
  if (pref === "comfort") rides.sort((a,b)=>a.name==="Uber"?-1:1);

  let box = document.getElementById("results");
  box.innerHTML = "";

  rides.forEach((r,i)=>{
    box.innerHTML += `
      <div class="row ${i===0?'ai':''}">
        <div>
          <div class="app">${r.name} ${i===0?'<span class="badge">AI PICK</span>':''}</div>
          <div class="meta">₹${r.fare} • ${r.eta} min</div>
        </div>
        <a class="open" href="${r.link}" target="_blank">Open</a>
      </div>
    `;
  });
}
