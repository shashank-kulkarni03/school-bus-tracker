function updateLocationOnMap() {
  if (marker) map.removeLayer(marker);
  marker = L.marker([selectedLat, selectedLng]).addTo(map);
  map.setView([selectedLat, selectedLng], 15);

  document.getElementById("latDisplay").textContent = selectedLat.toFixed(5);
  document.getElementById("lngDisplay").textContent = selectedLng.toFixed(5);
  document.getElementById("lat").value = selectedLat;
  document.getElementById("lng").value = selectedLng;

  // 👇 Show map and location info when location is selected
  document.getElementById("map").style.display = "block";
  document.getElementById("locationInfo").style.display = "block";
}
