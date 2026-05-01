

var tipos = [
  { nome: 'Buraco na via',   icone: '🕳️' },
  { nome: 'Rua alagada',     icone: '🌊' },
  { nome: 'Árvore caída',    icone: '🌳' },
  { nome: 'Fio caído',       icone: '⚡' },
  { nome: 'Obras na rua',    icone: '🚧' },
  { nome: 'Bloqueio de via', icone: '🚫' },
  { nome: 'Deslizamento',    icone: '⛰️' },
  { nome: 'Área perigosa',   icone: '⚠️' },
];
var ocorrencias = [];

var map = L.map('map').setView([-10.9472, -37.0731], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

var latLngSelecionado = null;
var marcadorTemp = null; // 🔥 novo

// FIX: declarar camadas antes de usar
var camadaDetalhada = L.layerGroup().addTo(map);
var camadaGeral = L.layerGroup().addTo(map);

// Criar botões
var lista = document.getElementById('lista-icones');

tipos.forEach(function(tipo) {
  var btn = document.createElement('button');
  btn.className = 'icone-btn';
  btn.innerHTML = `<span>${tipo.icone}</span><span>${tipo.nome}</span>`;

  btn.addEventListener('click', function() {

    if (!latLngSelecionado) return;

    // Remove marcador temporário
    if (marcadorTemp) {
      map.removeLayer(marcadorTemp);
      marcadorTemp = null;
    }

    // Cria marcador definitivo
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
    box-shadow: 0 0 5px rgba(0,0,0,0.3);
    border: 2px solid black;
  ">
    ${tipo.icone}
  </div>
`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

var marker = L.marker(latLngSelecionado, {
  icon: iconeEmoji
}).bindPopup(`${tipo.icone} ${tipo.nome}`).addTo(camadaDetalhada);



// salvar ocorrência
salvarOcorrencia(
  latLngSelecionado.lat,
  latLngSelecionado.lng,
  tipo.nome,
  tipo.icone
);

    document.getElementById('painel').style.display = 'none';
  });

  lista.appendChild(btn);
});

// Clique no mapa
map.on('click', function(e) {
  latLngSelecionado = e.latlng;

  // Remove marcador anterior
  if (marcadorTemp) {
    map.removeLayer(marcadorTemp);
  }

  // Cria marcador
  marcadorTemp = L.marker(latLngSelecionado, {
  }).addTo(map);

  marcadorTemp.bindPopup("Selecione o tipo de problema").openPopup();

  document.getElementById('painel').style.display = 'block';
});

// Fechar painel
document.getElementById('fechar-painel').addEventListener('click', function() {
  document.getElementById('painel').style.display = 'none';

  // Remove marcador temporário ao cancelar
  if (marcadorTemp) {
    map.removeLayer(marcadorTemp);
    marcadorTemp = null;
  }

  
});

// Botão de localização
document.getElementById('btn-localizacao').addEventListener('click', function() {

  if (!navigator.geolocation) {
    alert("Geolocalização não é suportada pelo seu navegador.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function(pos) {
      var lat = pos.coords.latitude;
      var lng = pos.coords.longitude;

      var userLatLng = [lat, lng];

      // Centraliza o mapa
      map.setView(userLatLng, 16);

      // Marca a localização
      L.marker(userLatLng)
        .addTo(map)
        .bindPopup("📍 Você está aqui")
        .openPopup();
    },
    function(err) {
      alert("Erro ao obter localização: " + err.message);
    }
  );
});

function atualizarVisaoGeral() {
  camadaGeral.clearLayers();

  var grupos = {};

  ocorrencias.forEach(function(o) {
    // agrupar por região simples (arredondamento)
    var chave = o.latitude.toFixed(2) + "," + o.longitude.toFixed(2);

    if (!grupos[chave]) {
      grupos[chave] = {
        lat: o.latitude,
lng: o.longitude,
        total: 0
      };
    }

    grupos[chave].total++;
  });

  for (var key in grupos) {
    var g = grupos[key];

    var cor = "green";

    if (g.total > 5) cor = "red";
    else if (g.total > 2) cor = "orange";

    L.circle([g.lat, g.lng], {
      radius: 900,
      color: cor,
      fillOpacity: 0.5
    })
    .bindPopup(`Área com ${g.total} problemas`)
    .addTo(camadaGeral);
  }
}
function atualizarCamadas() {
  var zoom = map.getZoom();

  if (zoom < 14) {
    map.removeLayer(camadaDetalhada);
    map.addLayer(camadaGeral);
    atualizarVisaoGeral();
  } else {
    map.addLayer(camadaDetalhada);
    map.removeLayer(camadaGeral);
  }
}
map.on('zoomend', atualizarCamadas);

document.addEventListener("DOMContentLoaded", function() {
  carregarOcorrencias();
  atualizarCamadas();
});
window.onload = function() {
  carregarOcorrencias();

  map.setZoom(13); // força mostrar marcadores
  atualizarCamadas();
};