/* =====================================================
   ACCEPTI CONTADORES - FORMULARIO DE FACTURA
   app.js - Archivo JavaScript independiente
   
   ANTES DE SUBIR reemplaza:
   1. WEBHOOK_CSF    -> URL del escenario "Lector CSF" en Make
   2. WEBHOOK_FORM   -> URL del escenario "Formulario Factura" en Make
===================================================== */

var WEBHOOK_CSF  = 'https://hook.us2.make.com/TU_WEBHOOK_LECTOR_CSF';
var WEBHOOK_FORM = 'https://hook.us2.make.com/TU_WEBHOOK_FORMULARIO';

/* =====================================================
   CATÁLOGO SAT
===================================================== */
var SAT = [
  {c:"84111506",d:"Servicios de contabilidad",k:"Servicios profesionales"},
  {c:"84111507",d:"Servicios de auditoria",k:"Servicios profesionales"},
  {c:"84111508",d:"Asesoria fiscal y tributaria",k:"Servicios profesionales"},
  {c:"84111509",d:"Administracion financiera",k:"Servicios profesionales"},
  {c:"80141600",d:"Contabilidad general",k:"Servicios profesionales"},
  {c:"80141601",d:"Servicios de nomina",k:"Servicios profesionales"},
  {c:"80141602",d:"Declaraciones fiscales",k:"Servicios profesionales"},
  {c:"80111500",d:"Consultoria empresarial",k:"Servicios profesionales"},
  {c:"80111501",d:"Consultoria en administracion de empresas",k:"Servicios profesionales"},
  {c:"80101500",d:"Servicios juridicos y legales",k:"Servicios profesionales"},
  {c:"80101501",d:"Asesoria legal corporativa",k:"Servicios profesionales"},
  {c:"80101801",d:"Servicios notariales",k:"Servicios profesionales"},
  {c:"86101500",d:"Servicios de recursos humanos",k:"Servicios profesionales"},
  {c:"86101501",d:"Reclutamiento y seleccion de personal",k:"Servicios profesionales"},
  {c:"81111500",d:"Tecnologias de la informacion TI",k:"Tecnologia"},
  {c:"81111501",d:"Desarrollo de software",k:"Tecnologia"},
  {c:"81111502",d:"Soporte tecnico informatico",k:"Tecnologia"},
  {c:"81111504",d:"Servicios de programacion",k:"Tecnologia"},
  {c:"81111507",d:"Consultoria en tecnologia TI",k:"Tecnologia"},
  {c:"81111800",d:"Servicios de redes informaticas",k:"Tecnologia"},
  {c:"81111801",d:"Internet y conectividad",k:"Tecnologia"},
  {c:"81111900",d:"Alojamiento web hosting",k:"Tecnologia"},
  {c:"81112000",d:"Servicios en la nube cloud computing",k:"Tecnologia"},
  {c:"81161500",d:"Ciberseguridad",k:"Tecnologia"},
  {c:"81161501",d:"Licencias de software",k:"Tecnologia"},
  {c:"82101500",d:"Publicidad y marketing",k:"Publicidad"},
  {c:"82101501",d:"Diseno grafico",k:"Publicidad"},
  {c:"82101502",d:"Diseno de paginas web",k:"Publicidad"},
  {c:"82101503",d:"Branding e imagen corporativa",k:"Publicidad"},
  {c:"82111500",d:"Servicios de fotografia",k:"Publicidad"},
  {c:"82111501",d:"Videografia y produccion audiovisual",k:"Publicidad"},
  {c:"82141500",d:"Gestion de redes sociales",k:"Publicidad"},
  {c:"82141501",d:"Marketing digital y SEO",k:"Publicidad"},
  {c:"72101500",d:"Construccion general",k:"Construccion"},
  {c:"72101501",d:"Servicios de arquitectura",k:"Construccion"},
  {c:"72101502",d:"Ingenieria civil",k:"Construccion"},
  {c:"72101503",d:"Remodelacion y acabados",k:"Construccion"},
  {c:"72101504",d:"Instalaciones electricas",k:"Construccion"},
  {c:"72101505",d:"Instalaciones hidraulicas y sanitarias",k:"Construccion"},
  {c:"72141500",d:"Mantenimiento de inmuebles",k:"Construccion"},
  {c:"78101800",d:"Transporte terrestre de carga",k:"Transporte"},
  {c:"78101801",d:"Mensajeria y paqueteria",k:"Transporte"},
  {c:"78101802",d:"Logistica y almacenaje",k:"Transporte"},
  {c:"78101803",d:"Servicio de flete",k:"Transporte"},
  {c:"78111500",d:"Transporte de pasajeros",k:"Transporte"},
  {c:"78121500",d:"Servicios de mudanza",k:"Transporte"},
  {c:"56101500",d:"Arrendamiento de bienes inmuebles",k:"Arrendamiento"},
  {c:"56101501",d:"Arrendamiento de oficinas",k:"Arrendamiento"},
  {c:"56101502",d:"Arrendamiento de locales comerciales",k:"Arrendamiento"},
  {c:"56101503",d:"Arrendamiento de bodegas",k:"Arrendamiento"},
  {c:"56101504",d:"Arrendamiento de casa habitacion",k:"Arrendamiento"},
  {c:"56101601",d:"Arrendamiento de vehiculos",k:"Arrendamiento"},
  {c:"56101602",d:"Arrendamiento de equipo de computo",k:"Arrendamiento"},
  {c:"50101500",d:"Alimentos y productos alimenticios",k:"Alimentos"},
  {c:"50101501",d:"Frutas y verduras frescas",k:"Alimentos"},
  {c:"50101502",d:"Carnes y productos carnicos",k:"Alimentos"},
  {c:"50171500",d:"Panaderia y reposteria",k:"Alimentos"},
  {c:"50181500",d:"Bebidas sin alcohol",k:"Alimentos"},
  {c:"50181501",d:"Agua embotellada",k:"Alimentos"},
  {c:"90101501",d:"Servicio de catering y banquetes",k:"Alimentos"},
  {c:"85101500",d:"Servicios medicos y hospitalarios",k:"Salud"},
  {c:"85101501",d:"Consulta medica general",k:"Salud"},
  {c:"85101502",d:"Servicios odontologicos y dentales",k:"Salud"},
  {c:"85101503",d:"Servicios medicos especializados",k:"Salud"},
  {c:"51101500",d:"Medicamentos y productos farmaceuticos",k:"Salud"},
  {c:"85151600",d:"Servicios de psicologia",k:"Salud"},
  {c:"85161500",d:"Servicios de fisioterapia",k:"Salud"},
  {c:"86111500",d:"Servicios educativos y de capacitacion",k:"Educacion"},
  {c:"86111501",d:"Cursos y talleres de capacitacion",k:"Educacion"},
  {c:"86111502",d:"Ensenanza de idiomas",k:"Educacion"},
  {c:"86111503",d:"Asesoria y tutoria academica",k:"Educacion"},
  {c:"86111504",d:"E-learning educacion en linea",k:"Educacion"},
  {c:"80131500",d:"Servicios de bienes raices",k:"Bienes raices"},
  {c:"80131501",d:"Compraventa de inmuebles",k:"Bienes raices"},
  {c:"80131502",d:"Avaluos de inmuebles",k:"Bienes raices"},
  {c:"43211500",d:"Equipo de computo laptops",k:"Electronica"},
  {c:"43211501",d:"Servidores y equipo de red",k:"Electronica"},
  {c:"43211502",d:"Perifericos e impresoras",k:"Electronica"},
  {c:"43191500",d:"Telefonos celulares smartphones",k:"Electronica"},
  {c:"39121500",d:"Aparatos electrodomesticos",k:"Electronica"},
  {c:"44101500",d:"Papeleria y articulos de escritorio",k:"Oficina"},
  {c:"44101501",d:"Papel bond y de oficina",k:"Oficina"},
  {c:"44101502",d:"Tintas toners y cartuchos",k:"Oficina"},
  {c:"44101600",d:"Muebles de oficina",k:"Oficina"},
  {c:"53101500",d:"Ropa y prendas de vestir",k:"Ropa"},
  {c:"53101501",d:"Uniformes de trabajo",k:"Ropa"},
  {c:"53101502",d:"Calzado y zapatos",k:"Ropa"},
  {c:"30102500",d:"Cemento block y materiales de construccion",k:"Materiales"},
  {c:"30102501",d:"Pinturas y recubrimientos",k:"Materiales"},
  {c:"30102503",d:"Madera y carpinteria",k:"Materiales"},
  {c:"30102504",d:"Plomeria y tuberias",k:"Materiales"},
  {c:"30102505",d:"Materiales electricos",k:"Materiales"},
  {c:"76101500",d:"Servicios de limpieza y aseo",k:"Limpieza"},
  {c:"76101501",d:"Limpieza de oficinas y establecimientos",k:"Limpieza"},
  {c:"76101502",d:"Servicios de jardineria",k:"Limpieza"},
  {c:"76121500",d:"Control de plagas",k:"Limpieza"},
  {c:"84131500",d:"Servicios financieros",k:"Finanzas"},
  {c:"84131501",d:"Seguros y fianzas",k:"Finanzas"},
  {c:"90101600",d:"Organizacion de eventos",k:"Eventos"},
  {c:"90101601",d:"Renta de salones para eventos",k:"Eventos"},
  {c:"90101604",d:"Servicios de DJ y sonido",k:"Eventos"},
  {c:"90111500",d:"Servicios hoteleros y hospedaje",k:"Eventos"},
  {c:"25101500",d:"Automoviles y vehiculos",k:"Automotriz"},
  {c:"78181500",d:"Servicios de taller mecanico",k:"Automotriz"},
  {c:"23271500",d:"Refacciones y accesorios para vehiculos",k:"Automotriz"},
  {c:"15111500",d:"Gasolina y combustibles",k:"Automotriz"},
  {c:"83111500",d:"Servicios de telecomunicaciones",k:"Telecomunicaciones"},
  {c:"76121601",d:"Instalacion de paneles solares",k:"Energia"},
  {c:"55121501",d:"Redaccion y copywriting",k:"Editorial"},
  {c:"55121502",d:"Traduccion e interpretacion",k:"Editorial"},
  {c:"10101500",d:"Productos agricolas",k:"Agropecuario"},
  {c:"10101501",d:"Granos y cereales",k:"Agropecuario"},
  {c:"10151501",d:"Leche y productos lacteos",k:"Agropecuario"},
  {c:"10151502",d:"Huevo",k:"Agropecuario"},
  {c:"01010101",d:"No existe en catalogo del SAT",k:"Otros"},
  {c:"92121500",d:"Servicios gubernamentales y tramites",k:"Otros"}
];

/* =====================================================
   ESTADO
===================================================== */
var paso = 1;
var nc = 0;

/* =====================================================
   INIT - Todo con addEventListener, sin onclick en HTML
===================================================== */
document.addEventListener('DOMContentLoaded', function() {

  // Logo fallback
  var img = document.getElementById('logo-img');
  if (img) {
    img.onerror = function() {
      img.style.display = 'none';
      document.getElementById('logo-fallback').style.display = 'grid';
    };
  }

  // CSF uploader
  var csfInput = document.getElementById('csf-input');
  if (csfInput) {
    csfInput.addEventListener('change', function() { leerCSF(this); });
  }

  // Navegación - botones
  document.getElementById('btn-next-1').addEventListener('click', function() { goNext(1); });
  document.getElementById('btn-next-2').addEventListener('click', function() { goNext(2); });
  document.getElementById('btn-next-3').addEventListener('click', function() { goNext(3); });
  document.getElementById('btn-prev-2').addEventListener('click', function() { goPrev(2); });
  document.getElementById('btn-prev-3').addEventListener('click', function() { goPrev(3); });
  document.getElementById('btn-prev-4').addEventListener('click', function() { goPrev(4); });
  document.getElementById('btn-enviar').addEventListener('click', function() { enviar(); });
  document.getElementById('btn-add-conc').addEventListener('click', function() { addConc(); });

  // Campos con validación
  document.getElementById('rfc').addEventListener('input', function() {
    this.value = this.value.toUpperCase();
    clrE('rfc');
  });
  document.getElementById('razon').addEventListener('input', function() { clrE('razon'); });
  document.getElementById('cp').addEventListener('input', function() { clrE('cp'); });
  document.getElementById('regimen').addEventListener('change', function() { clrE('regimen'); });
  document.getElementById('uso').addEventListener('change', function() { clrE('uso'); });
  document.getElementById('email').addEventListener('input', function() { clrE('email'); });

  // Moneda tipo de cambio
  document.getElementById('usd').addEventListener('change', function() {
    document.getElementById('tcwrap').style.display = 'flex';
  });
  document.getElementById('mxn').addEventListener('change', function() {
    document.getElementById('tcwrap').style.display = 'none';
  });

  // Cerrar dropdowns SAT al click fuera
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.satwrap')) {
      var drops = document.querySelectorAll('.satdrop.open');
      for (var i = 0; i < drops.length; i++) {
        drops[i].classList.remove('open');
      }
    }
  });

  // Primer concepto
  addConc();
});

/* =====================================================
   LEER CSF CON IA (via Make)
===================================================== */
function leerCSF(input) {
  var file = input.files[0];
  if (!file) return;

  var status  = document.getElementById('csf-status');
  var spinner = document.getElementById('csf-spinner');
  var msg     = document.getElementById('csf-msg');

  status.className = 'csf-status loading';
  spinner.style.display = 'block';
  msg.textContent = 'Leyendo tu constancia con IA...';

  var reader = new FileReader();
  reader.onload = function(e) {
    var base64 = e.target.result.split(',')[1];

    fetch(WEBHOOK_CSF, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pdf_base64: base64 })
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      if (!d || (!d.rfc && !d.razon_social)) {
        throw new Error('Sin datos');
      }
      if (d.rfc)          { document.getElementById('rfc').value   = d.rfc.toUpperCase(); clrE('rfc'); }
      if (d.razon_social) { document.getElementById('razon').value = d.razon_social;      clrE('razon'); }
      if (d.cp)           { document.getElementById('cp').value    = d.cp;                clrE('cp'); }
      if (d.regimen_codigo) {
        var sel = document.getElementById('regimen');
        var nombre = (d.regimen_nombre || '').toLowerCase();
        var esMoral = nombre.indexOf('moral') >= 0 || nombre.indexOf('coordinad') >= 0 || nombre.indexOf('cooperativ') >= 0;
        var codigoBuscar = (d.regimen_codigo === '626' && esMoral) ? '626pm' : d.regimen_codigo;
        for (var i = 0; i < sel.options.length; i++) {
          if (sel.options[i].value === codigoBuscar) {
            sel.selectedIndex = i; clrE('regimen'); break;
          }
        }
      }
      spinner.style.display = 'none';
      status.className = 'csf-status ok';
      msg.innerHTML = '<strong>Datos extraidos correctamente.</strong> Verifica y completa el correo y uso del CFDI.';
      document.getElementById('card1-sub').textContent = 'Datos cargados desde tu CSF. Verifica y completa el correo y uso del CFDI.';
    })
    .catch(function() {
      spinner.style.display = 'none';
      status.className = 'csf-status error';
      msg.textContent = 'No se pudo leer el PDF automaticamente. Por favor llena los campos manualmente.';
    });
  };
  reader.readAsDataURL(file);
}

/* =====================================================
   NAVEGACIÓN
===================================================== */
function goNext(from) {
  if (!validar(from)) return;
  paso = from + 1;
  if (paso === 4) armarResumen();
  actualizarUI();
  window.scrollTo({top: 0, behavior: 'smooth'});
}

function goPrev(from) {
  paso = from - 1;
  actualizarUI();
  window.scrollTo({top: 0, behavior: 'smooth'});
}

function actualizarUI() {
  for (var i = 1; i <= 4; i++) {
    var card = document.getElementById('card' + i);
    if (i === paso) { card.classList.add('active'); }
    else            { card.classList.remove('active'); }
    var tab = document.getElementById('st' + i);
    var num = document.getElementById('sn' + i);
    tab.classList.remove('active', 'done');
    if (i === paso)     { tab.classList.add('active'); num.textContent = i; }
    else if (i < paso)  { tab.classList.add('done');   num.textContent = '\u2713'; }
    else                { num.textContent = i; }
  }
}

/* =====================================================
   VALIDACIÓN
===================================================== */
function validar(p) {
  var ok = true;
  if (p === 1) {
    if (document.getElementById('rfc').value.trim().length < 12)  { marcarErr('rfc');     ok = false; }
    if (document.getElementById('razon').value.trim().length < 2) { marcarErr('razon');   ok = false; }
    if (document.getElementById('cp').value.trim().length !== 5)  { marcarErr('cp');      ok = false; }
    if (!document.getElementById('regimen').value)                { marcarErr('regimen'); ok = false; }
    if (!document.getElementById('uso').value)                    { marcarErr('uso');     ok = false; }
    var em = document.getElementById('email').value.trim();
    if (!em || em.indexOf('@') < 1)                               { marcarErr('email');   ok = false; }
  }
  if (p === 2 && document.querySelectorAll('.conc').length === 0) {
    alert('Agrega al menos un concepto para continuar.');
    return false;
  }
  if (p === 4 && !document.getElementById('acepto').checked) {
    alert('Debes aceptar los terminos para continuar.');
    return false;
  }
  return ok;
}

function marcarErr(id) {
  var el = document.getElementById(id); if (el) el.classList.add('err');
  var em = document.getElementById('e-' + id); if (em) em.style.display = 'block';
}

function clrE(id) {
  var el = document.getElementById(id); if (el) el.classList.remove('err');
  var em = document.getElementById('e-' + id); if (em) em.style.display = 'none';
}

/* =====================================================
   CONCEPTOS
===================================================== */
function addConc() {
  nc++;
  var n = nc;
  var div = document.createElement('div');
  div.className = 'conc';
  div.id = 'c' + n;
  div.innerHTML =
    '<div class="chead2">' +
      '<span class="cnum">Concepto ' + n + '</span>' +
      '<div class="cdesc"><input type="text" placeholder="Descripcion del producto o servicio"></div>' +
      '<button class="btnrm" data-n="' + n + '">&times;</button>' +
    '</div>' +
    '<div class="f" style="margin-bottom:12px">' +
      '<label>Clave SAT</label>' +
      '<div class="satwrap" id="sw' + n + '">' +
        '<span class="satico">&#128269;</span>' +
        '<input type="text" class="satinput" id="ss' + n + '" placeholder="Escribe el producto o servicio..." autocomplete="off">' +
        '<div class="satdrop" id="sd' + n + '"></div>' +
        '<div class="satmanual"><span>O escribe la clave:</span><input type="text" id="sm' + n + '" placeholder="84111506" maxlength="8"></div>' +
      '</div>' +
      '<div class="satsel" id="ssel' + n + '"><strong id="sco' + n + '"></strong><span id="sde' + n + '"></span><button class="satclr" data-n="' + n + '">&times;</button></div>' +
    '</div>' +
    '<div class="cgrid">' +
      '<div class="f"><label>Cantidad</label><input type="number" value="1" min="1" step="1"></div>' +
      '<div class="f"><label>Precio unitario</label><div class="pfx"><span class="pfxl">$</span><input type="number" placeholder="0.00" min="0" step="0.01"></div></div>' +
      '<div class="f"><label>Descuento %</label><input type="number" placeholder="0" min="0" max="100" step="0.01"></div>' +
    '</div>';

  document.getElementById('conc-list').appendChild(div);

  // Eventos del concepto
  div.querySelector('.btnrm').addEventListener('click', function() { rmConc(this.dataset.n); });
  div.querySelector('.satclr').addEventListener('click', function() { clearSAT(this.dataset.n); });
  div.querySelector('#ss' + n).addEventListener('input', function() { buscar(n); });
  div.querySelector('#sm' + n).addEventListener('input', function() { manualSAT(n); });
  div.querySelectorAll('input[type=number]').forEach(function(inp) {
    inp.addEventListener('input', recalc);
  });

  recalc();
}

function rmConc(n) {
  var el = document.getElementById('c' + n);
  if (el) el.remove();
  recalc();
}

/* =====================================================
   BUSCADOR SAT
===================================================== */
function buscar(n) {
  var q    = document.getElementById('ss' + n).value.toLowerCase().trim();
  var drop = document.getElementById('sd' + n);
  if (q.length < 2) { drop.classList.remove('open'); return; }

  var hits = [];
  for (var i = 0; i < SAT.length; i++) {
    var it = SAT[i];
    if (it.d.toLowerCase().indexOf(q) >= 0 || it.c.indexOf(q) >= 0 || it.k.toLowerCase().indexOf(q) >= 0) {
      hits.push(it);
      if (hits.length >= 12) break;
    }
  }

  if (hits.length === 0) {
    drop.innerHTML = '<div class="nores">Sin resultados - escribe la clave manualmente</div>';
    drop.classList.add('open');
    return;
  }

  drop.innerHTML = '';
  for (var j = 0; j < hits.length; j++) {
    var item = hits[j];
    var row  = document.createElement('div');
    row.className = 'satitem';
    row.innerHTML = '<span class="satcode">' + item.c + '</span><span>' + item.d + '<br><span class="satcat">' + item.k + '</span></span>';
    (function(id, code, desc) {
      row.addEventListener('click', function(e) {
        e.stopPropagation();
        selSAT(id, code, desc);
      });
    }(n, item.c, item.d));
    drop.appendChild(row);
  }
  drop.classList.add('open');
}

function selSAT(n, code, desc) {
  document.getElementById('sd'  + n).classList.remove('open');
  document.getElementById('ss'  + n).value = '';
  document.getElementById('sm'  + n).value = code;
  document.getElementById('sco' + n).textContent = code;
  document.getElementById('sde' + n).textContent = ' · ' + desc;
  document.getElementById('ssel'+ n).classList.add('show');
}

function manualSAT(n) {
  var code = document.getElementById('sm' + n).value.trim();
  if (code.length >= 6) {
    var found = null;
    for (var i = 0; i < SAT.length; i++) { if (SAT[i].c === code) { found = SAT[i]; break; } }
    document.getElementById('sco' + n).textContent = code;
    document.getElementById('sde' + n).textContent = found ? ' · ' + found.d : ' · Clave manual';
    document.getElementById('ssel'+ n).classList.add('show');
  }
}

function clearSAT(n) {
  document.getElementById('ssel'+ n).classList.remove('show');
  document.getElementById('sm'  + n).value = '';
  document.getElementById('ss'  + n).value = '';
}

/* =====================================================
   TOTALES
===================================================== */
function recalc() {
  var sub = 0, des = 0;
  var concs = document.querySelectorAll('.conc');
  for (var i = 0; i < concs.length; i++) {
    var nums  = concs[i].querySelectorAll('input[type=number]');
    var cant  = parseFloat(nums[0] ? nums[0].value : 0) || 0;
    var price = parseFloat(nums[1] ? nums[1].value : 0) || 0;
    var disc  = parseFloat(nums[2] ? nums[2].value : 0) || 0;
    var base  = cant * price;
    sub += base;
    des += base * (disc / 100);
  }
  var iva   = (sub - des) * 0.16;
  var total = sub - des + iva;
  document.getElementById('t-sub').textContent = fmt(sub);
  document.getElementById('t-des').textContent = fmt(des);
  document.getElementById('t-iva').textContent = fmt(iva);
  document.getElementById('t-tot').textContent = fmt(total);
}

function fmt(n) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/* =====================================================
   RESUMEN
===================================================== */
function armarResumen() {
  var mp  = document.querySelector('input[name=mp]:checked');
  var mon = document.querySelector('input[name=mon]:checked');
  var datos = [
    {l:'RFC Receptor',       v: val('rfc')},
    {l:'Razon Social',       v: val('razon')},
    {l:'CP Fiscal',          v: val('cp')},
    {l:'Regimen Fiscal',     v: val('regimen')},
    {l:'Uso del CFDI',       v: val('uso')},
    {l:'Correo electronico', v: val('email')},
    {l:'Metodo de pago',     v: mp  ? mp.value  : ''},
    {l:'Forma de pago',      v: val('forma')},
    {l:'Moneda',             v: mon ? mon.value : ''},
    {l:'Total a facturar',   v: document.getElementById('t-tot').textContent, big: true, full: true}
  ];
  var html = '';
  for (var i = 0; i < datos.length; i++) {
    var d = datos[i];
    html += '<div class="ri' + (d.full ? ' full' : '') + '">' +
              '<div class="ril">' + d.l + '</div>' +
              '<div class="riv' + (d.big ? ' big' : '') + '">' + (d.v || '\u2014') + '</div>' +
            '</div>';
  }
  document.getElementById('resumen').innerHTML = html;
}

function val(id) {
  var el = document.getElementById(id);
  return el ? el.value : '';
}

/* =====================================================
   ENVIAR
===================================================== */
function enviar() {
  if (!document.getElementById('acepto').checked) {
    alert('Debes aceptar los terminos para continuar.');
    return;
  }
  var folio = 'FAC-' + new Date().getFullYear() + '-' + (Math.floor(Math.random() * 90000) + 10000);
  var mp    = document.querySelector('input[name=mp]:checked');
  var mon   = document.querySelector('input[name=mon]:checked');
  var data  = {
    folio: folio,
    timestamp: new Date().toISOString(),
    receptor: {
      rfc:          val('rfc'),
      razon_social: val('razon'),
      cp_fiscal:    val('cp'),
      regimen:      val('regimen'),
      uso_cfdi:     val('uso'),
      email:        val('email'),
      tel:          val('tel')
    },
    pago: {
      metodo:      mp  ? mp.value  : '',
      forma:       val('forma'),
      moneda:      mon ? mon.value : '',
      tipo_cambio: val('tc'),
      referencia:  val('ref'),
      notas:       val('notas')
    },
    totales: {
      subtotal:  document.getElementById('t-sub').textContent,
      descuento: document.getElementById('t-des').textContent,
      iva:       document.getElementById('t-iva').textContent,
      total:     document.getElementById('t-tot').textContent
    }
  };

  fetch(WEBHOOK_FORM, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  }).catch(function() {
    console.warn('Webhook no configurado');
  });

  for (var i = 1; i <= 4; i++) {
    document.getElementById('card' + i).classList.remove('active');
  }
  document.getElementById('success').classList.add('active');
  document.getElementById('folio-num').textContent = folio;
  window.scrollTo({top: 0, behavior: 'smooth'});
}
