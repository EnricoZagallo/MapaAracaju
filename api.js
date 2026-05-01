function salvarOcorrencia(lat, lng, tipo,icone) {
  fetch("http://localhost:8080/api/ocorrencias", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
  latitude: lat,
  longitude: lng,
  tipo: tipo,
  icone: icone
})
  })
  .then(res => res.json())
.then(novaOcorrencia => {
  adicionarMarker(novaOcorrencia);
})
  .catch(err => console.error("Erro:", err));
}

function carregarOcorrencias() {
  camadaDetalhada.clearLayers();

  fetch("http://localhost:8080/api/ocorrencias")
    .then(res => res.json())
    .then(data => {

      ocorrencias = data;

      data.forEach(adicionarMarker);

      

      atualizarVisaoGeral(); // FIX: atualiza só os círculos, sem mexer nas camadas
    });
}
function adicionarMarker(o) {
  var iconeEmoji = L.divIcon({
    html: `
      <div style="
        font-size: 20px;
        background: yellow;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid black;
      ">
        ${o.icone}
      </div>
    `,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });

  L.marker([o.latitude, o.longitude], {
    icon: iconeEmoji
  }).addTo(camadaDetalhada)
    .bindPopup(o.tipo);
}