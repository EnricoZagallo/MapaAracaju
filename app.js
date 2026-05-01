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

var map = L.map('map').setView([-10.9472, -37.0731], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

var latLngSelecionado = null;
var marcadorTemp = null; // 🔥 novo

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
    L.marker(latLngSelecionado)
      .bindPopup(`${tipo.icone} ${tipo.nome}`)
      .addTo(map)
      .openPopup();

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