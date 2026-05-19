/* ================================================================
   ACCEPTI CONTADORES — FORMULARIO CFDI 4.0 (INTERNO)
   app-interno.js v1.0

   Mejoras sobre la versión inline original:
     · Extraído a archivo independiente (mejor caché y mantenimiento)
     · localStorage — borrador automático, restauración con banner
     · IEPS completo: 53% licores + Cuota $/unidad combustibles
     · Ret. IVA completa: + 10% arrendamiento (PF a PM)
     · Payload de enviar() con montos calculados por impuesto
================================================================ */

var WEBHOOK    = 'https://hook.us2.make.com/vt0rgi8awaj7rizm5gzjcqpg50t4skz5';
var WORKER_SAT = 'https://accepti.kuryaky.workers.dev/?keyword=';
var STORAGE_KEY = 'accepti_interno_v1';

var paso      = 1;
var tipoDoc   = '';
var itemCount = 0;

/* ================================================================
   ESTILOS DINÁMICOS
================================================================ */
(function injectStyles() {
  var s = document.createElement('style');
  s.textContent =
    '.cuota-row-i{display:none;margin-top:6px;padding:8px 10px;' +
      'background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.3);border-radius:6px}' +
    '.cuota-row-i.visible{display:block}' +
    '.cuota-row-i label{color:var(--yellow)!important}' +
    '.restore-banner{position:fixed;top:0;left:0;right:0;background:var(--teal2);color:#fff;' +
      'padding:10px 20px;display:flex;justify-content:space-between;align-items:center;' +
      'z-index:9999;font-family:"Plus Jakarta Sans",sans-serif;font-size:12px;font-weight:600}' +
    '.restore-banner button{background:none;border:1px solid rgba(255,255,255,.5);color:#fff;' +
      'font-size:11px;cursor:pointer;padding:3px 10px;border-radius:3px;font-weight:700;margin-left:8px}';
  document.head.appendChild(s);
})();

/* ================================================================
   MEMORIA LOCAL — Guardar / Restaurar / Limpiar
================================================================ */
function saveToStorage() {
  try {
    var draft = { tipo: tipoDoc, campos: {}, items: [] };

    var fields = [
      'plataforma','rfc_emisor','razon_emisor','cp_emisor','regimen_emisor',
      'email_emisor','wa_emisor','rfc_receptor','razon_receptor','cp_receptor',
      'uso_cfdi','regimen_receptor','uuid_factura','fecha_pago','monto_pago',
      'forma_pago','notas'
    ];
    fields.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) draft.campos[id] = el.value;
    });

    document.querySelectorAll('.item-row').forEach(function(row) {
      var n = row.id.replace('item-', '');
      draft.items.push({
        clave_sat:  g('clave_sat-'  + n),
        clave_code: g('clave_sat_code-' + n),
        desc:       g('desc-'       + n),
        cant:       g('cant-'       + n),
        precio:     g('precio-'     + n),
        iva:        g('iva-'        + n),
        ret_iva:    g('ret_iva-'    + n),
        ret_isr:    g('ret_isr-'    + n),
        ieps:       g('ieps-'       + n),
        cuota:      g('cuota-'      + n) || ''
      });
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch(e) {}
}

function restoreFromStorage() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    var draft = JSON.parse(raw);

    if (draft.tipo) { tipoDoc = draft.tipo; selTipo(draft.tipo); }

    var campos = draft.campos || {};
    Object.keys(campos).forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.value = campos[id];
    });

    if (draft.items && draft.items.length > 0) {
      document.getElementById('items-container').innerHTML = '';
      itemCount = 0;
      draft.items.forEach(function(it) {
        addItem();
        var n = itemCount;

        if (it.clave_sat) {
          var si = document.getElementById('clave_sat-' + n);
          if (si) si.value = it.clave_sat;
        }
        if (it.clave_code) {
          var sc = document.getElementById('clave_sat_code-' + n);
          if (sc) sc.value = it.clave_code;
        }

        var map = {desc:'desc', cant:'cant', precio:'precio',
                   iva:'iva', ret_iva:'ret_iva', ret_isr:'ret_isr', ieps:'ieps'};
        Object.keys(map).forEach(function(k) {
          var el = document.getElementById(map[k] + '-' + n);
          if (el && it[k] !== undefined) el.value = it[k];
        });

        if (it.cuota) {
          var ce = document.getElementById('cuota-' + n);
          if (ce) ce.value = it.cuota;
        }
        toggleCuotaI(n);
        calcItem(n);
      });
    }
    return true;
  } catch(e) { return false; }
}

function clearStorage() {
  try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
}

function showRestoreBanner() {
  var b = document.createElement('div');
  b.className = 'restore-banner';
  b.innerHTML =
    '<span>✅ Se restauró tu borrador anterior — puedes continuar donde lo dejaste.</span>' +
    '<span>' +
      '<button onclick="limpiarBorrador()">Empezar de nuevo</button>' +
      '<button onclick="this.closest(\'.restore-banner\').remove()">Cerrar</button>' +
    '</span>';
  document.body.insertBefore(b, document.body.firstChild);
  setTimeout(function() { if (b.parentNode) b.remove(); }, 6000);
}

function limpiarBorrador() {
  clearStorage();
  window.location.reload();
}

/* ================================================================
   TOGGLE CUOTA IEPS
================================================================ */
function toggleCuotaI(n) {
  var iepsEl   = document.getElementById('ieps-' + n);
  var cuotaRow = document.getElementById('cuota-row-i-' + n);
  if (!iepsEl || !cuotaRow) return;
  if (iepsEl.value === 'cuota') cuotaRow.classList.add('visible');
  else                          cuotaRow.classList.remove('visible');
}

/* ================================================================
   INIT
================================================================ */
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('btn-next-1').onclick = function(){ goNext(1); };
  document.getElementById('btn-next-2').onclick = function(){ goNext(2); };
  document.getElementById('btn-next-3').onclick = function(){ goNext(3); };
  document.getElementById('btn-next-4').onclick = function(){ goNext(4); };
  document.getElementById('btn-prev-2').onclick = function(){ goPrev(2); };
  document.getElementById('btn-prev-3').onclick = function(){ goPrev(3); };
  document.getElementById('btn-prev-4').onclick = function(){ goPrev(4); };
  document.getElementById('btn-prev-5').onclick = function(){ goPrev(5); };
  document.getElementById('btn-enviar').onclick  = enviar;

  /* Mayúsculas automáticas */
  ['rfc_emisor','razon_emisor','rfc_receptor','razon_receptor'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', function(){
      this.value = this.value.toUpperCase();
      saveToStorage();
    });
  });

  /* Auto-save campos estáticos */
  [
    'plataforma','cp_emisor','regimen_emisor','email_emisor','wa_emisor',
    'cp_receptor','uso_cfdi','regimen_receptor','uuid_factura',
    'fecha_pago','monto_pago','forma_pago','notas'
  ].forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input',  saveToStorage);
    el.addEventListener('change', saveToStorage);
  });

  /* Cerrar dropdowns SAT al hacer click fuera */
  document.addEventListener('click', function(e){
    document.querySelectorAll('[id^="sat-drop-"]').forEach(function(d){
      if (!d.contains(e.target)) d.style.display = 'none';
    });
  });

  /* Restaurar borrador o iniciar limpio */
  var restored = restoreFromStorage();
  if (!restored) {
    var hoy = new Date().toISOString().split('T')[0];
    var fp  = document.getElementById('fecha_pago');
    if (fp) fp.value = hoy;
    addItem();
  }
  if (restored) showRestoreBanner();
});

/* ================================================================
   TIPO DOC
================================================================ */
function selTipo(tipo) {
  tipoDoc = tipo;
  ['ingreso','pago'].forEach(function(t){
    document.getElementById('t-'+t).classList.remove('sel');
  });
  document.getElementById('t-'+tipo).classList.add('sel');
  saveToStorage();
}

/* ================================================================
   MOSTRAR CAMPOS COMPLEMENTO DE PAGO
================================================================ */
function mostrarCamposPago() {
  var esPago = tipoDoc === 'pago';
  ['f-uuid','f-fecha-pago','f-monto-pago','f-forma-pago'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.classList.toggle('hide', !esPago);
  });
  document.getElementById('card4-title').textContent = esPago ? 'Datos del Pago'           : 'Conceptos';
  document.getElementById('card4-sub').textContent   = esPago ? 'Información del pago recibido' : 'Detalle de productos o servicios';
  var itemWrap  = document.getElementById('f-conceptos-wrap');
  var itemsCont = document.getElementById('items-container');
  if (esPago) {
    itemWrap.style.display  = 'none';
    itemsCont.style.display = 'none';
  } else {
    itemWrap.style.display  = 'block';
    itemsCont.style.display = 'block';
  }
}

/* ================================================================
   ITEMS / CONCEPTOS
================================================================ */
function addItem() {
  itemCount++;
  var n    = itemCount;
  var cont = document.getElementById('items-container');

  var row = document.createElement('div');
  row.className = 'item-row';
  row.id = 'item-' + n;

  /* Número de concepto */
  var badge = document.createElement('div');
  badge.className = 'item-num';
  badge.textContent = 'Concepto ' + n;
  row.appendChild(badge);

  /* Botón eliminar (solo desde el 2° concepto) */
  if (n > 1) {
    var delBtn = document.createElement('button');
    delBtn.className = 'btn-del';
    delBtn.title = 'Eliminar';
    delBtn.innerHTML = '&#x2715;';
    delBtn.setAttribute('onclick', 'removeItem(' + n + ')');
    row.appendChild(delBtn);
  }

  var grid = document.createElement('div');
  grid.className = 'item-fields';
  grid.style.marginTop = '8px';

  /* Helper para agregar campos */
  function addField(parentEl, cls, labelHTML, inputHTML) {
    var f = document.createElement('div');
    f.className = 'f' + (cls ? ' ' + cls : '');
    f.innerHTML = labelHTML + inputHTML;
    parentEl.appendChild(f);
    return f;
  }

  /* ── Clave SAT ── */
  var fSat = document.createElement('div');
  fSat.className = 'f full';
  fSat.innerHTML = '<label>Clave SAT <span class="req">*</span></label>';
  var satWrap = document.createElement('div');
  satWrap.style.position = 'relative';
  var satInput = document.createElement('input');
  satInput.type = 'text';
  satInput.id = 'clave_sat-' + n;
  satInput.placeholder = 'Buscar por nombre o clave...';
  satInput.autocomplete = 'off';
  (function(nn){
    satInput.addEventListener('input', function(){ buscarClaveSAT(nn); saveToStorage(); });
  })(n);
  var satDrop = document.createElement('div');
  satDrop.id = 'sat-drop-' + n;
  satDrop.style.cssText = 'display:none;position:absolute;top:100%;left:0;right:0;background:#fff;' +
    'border:1.5px solid var(--teal);border-top:none;border-radius:0 0 7px 7px;' +
    'max-height:200px;overflow-y:auto;z-index:50;box-shadow:0 8px 20px rgba(0,0,0,.12)';
  var satCode = document.createElement('input');
  satCode.type = 'hidden';
  satCode.id = 'clave_sat_code-' + n;
  var satHint = document.createElement('div');
  satHint.className = 'hint';
  satHint.textContent = 'Mínimo 3 caracteres para buscar en el catálogo SAT';
  satWrap.appendChild(satInput);
  satWrap.appendChild(satDrop);
  fSat.appendChild(satWrap);
  fSat.appendChild(satCode);
  fSat.appendChild(satHint);
  grid.appendChild(fSat);

  /* ── Descripción ── */
  addField(grid, 'full',
    '<label>Descripción <span class="req">*</span></label>',
    '<input type="text" id="desc-' + n + '" placeholder="Descripción del producto o servicio">');

  /* ── Cantidad ── */
  addField(grid, '',
    '<label>Cantidad <span class="req">*</span></label>',
    '<input type="number" id="cant-' + n + '" placeholder="1" min="0.01" step="0.01" value="1">');

  /* ── Precio unitario ── */
  addField(grid, '',
    '<label>Precio unitario <span class="req">*</span></label>',
    '<input type="number" id="precio-' + n + '" placeholder="0.00" min="0" step="0.01">');

  /* ── IVA ── */
  addField(grid, '',
    '<label>IVA</label>',
    '<select id="iva-' + n + '">' +
      '<option value="0.16">16% — General</option>' +
      '<option value="0.08">8% — Zona fronteriza</option>' +
      '<option value="0">0% — Alimentos / Medicamentos</option>' +
      '<option value="exento">Exento — Serv. médicos, educación</option>' +
    '</select>');

  /* ── Retención IVA — con 10% arrendamiento ── */
  addField(grid, '',
    '<label>Ret. IVA</label>',
    '<select id="ret_iva-' + n + '">' +
      '<option value="0">Sin retención</option>' +
      '<option value="0.1067">10.67% — Honorarios (PF a PM)</option>' +
      '<option value="0.10">10% — Arrendamiento (PF a PM)</option>' +
      '<option value="0.04">4% — Autotransporte (PF a PM)</option>' +
    '</select>');

  /* ── Retención ISR ── */
  addField(grid, '',
    '<label>Ret. ISR</label>',
    '<select id="ret_isr-' + n + '">' +
      '<option value="0">Sin retención</option>' +
      '<option value="0.10">10% — Honorarios / Arrendamiento</option>' +
      '<option value="0.0125">1.25% — Caso específico</option>' +
    '</select>');

  /* ── IEPS — completo: 53% licores + cuota combustibles ── */
  addField(grid, '',
    '<label>IEPS</label>',
    '<select id="ieps-' + n + '">' +
      '<option value="0">Sin IEPS</option>' +
      '<option value="0.08">8% — Alimentos chatarra (&gt;275 kcal)</option>' +
      '<option value="0.265">26.5% — Cerveza / Pulque</option>' +
      '<option value="0.30">30% — Vinos (14°-20° GL)</option>' +
      '<option value="0.53">53% — Licores (&gt;20° GL)</option>' +
      '<option value="cuota">Cuota $/unidad — Combustibles</option>' +
    '</select>');

  /* ── Campo cuota IEPS (visible solo cuando se elige "cuota") ── */
  var cuotaRowI = document.createElement('div');
  cuotaRowI.className = 'cuota-row-i'; cuotaRowI.id = 'cuota-row-i-' + n;
  cuotaRowI.innerHTML =
    '<div class="f full">' +
      '<label>Cuota IEPS ($ por unidad — litro, kg, etc.)</label>' +
      '<input type="number" id="cuota-' + n + '" placeholder="6.25" min="0" step="0.0001">' +
      '<span class="hint">Consulta la cuota vigente en el SAT cada mes (varía). Ej. gasolina magna ≈ $6.25/L</span>' +
    '</div>';
  grid.appendChild(cuotaRowI);

  /* ── Total concepto (readonly) ── */
  addField(grid, '',
    '<label>Total a pagar</label>',
    '<input type="text" id="total-' + n + '" readonly ' +
      'style="background:#f0faf9;font-family:monospace;font-size:13px;font-weight:600;color:#007F76" ' +
      'placeholder="$0.00">');

  row.appendChild(grid);
  cont.appendChild(row);

  /* ── Event listeners ── */
  (function(nn) {
    setTimeout(function() {
      ['cant','precio'].forEach(function(field) {
        var el = document.getElementById(field + '-' + nn);
        if (el) {
          el.addEventListener('input',  function(){ calcItem(nn); saveToStorage(); });
          el.addEventListener('change', function(){ calcItem(nn); saveToStorage(); });
        }
      });
      ['iva','ret_iva','ret_isr'].forEach(function(field) {
        var el = document.getElementById(field + '-' + nn);
        if (el) el.addEventListener('change', function(){ calcItem(nn); saveToStorage(); });
      });
      var iepsEl = document.getElementById('ieps-' + nn);
      if (iepsEl) iepsEl.addEventListener('change', function(){
        toggleCuotaI(nn); calcItem(nn); saveToStorage();
      });
      var cuotaEl = document.getElementById('cuota-' + nn);
      if (cuotaEl) cuotaEl.addEventListener('input', function(){ calcItem(nn); saveToStorage(); });
      var descEl = document.getElementById('desc-' + nn);
      if (descEl) descEl.addEventListener('input', saveToStorage);
      var satEl = document.getElementById('clave_sat-' + nn);
      if (satEl) satEl.addEventListener('input', saveToStorage);
    }, 0);
  })(n);
}

function removeItem(n) {
  var el = document.getElementById('item-' + n);
  if (el) el.remove();
  saveToStorage();
}

/* ================================================================
   BUSCADOR CLAVE SAT (Worker Cloudflare)
================================================================ */
var satTimers = {};

function buscarClaveSAT(n) {
  var q    = document.getElementById('clave_sat-' + n).value.trim();
  var drop = document.getElementById('sat-drop-' + n);
  clearTimeout(satTimers[n]);
  if (q.length < 3) { drop.style.display = 'none'; return; }
  drop.innerHTML = '<div style="padding:8px 12px;font-size:11px;color:var(--muted)">Buscando...</div>';
  drop.style.display = 'block';
  satTimers[n] = setTimeout(function(){
    fetch(WORKER_SAT + encodeURIComponent(q))
      .then(function(r){ return r.json(); })
      .then(function(data){
        var items = data.data || data || [];
        if (!items.length) {
          drop.innerHTML = '<div style="padding:8px 12px;font-size:11px;color:var(--muted)">Sin resultados</div>';
          return;
        }
        drop.innerHTML = '';
        items.slice(0, 10).forEach(function(item){
          var code = item.Value || item.value || item.code || '';
          var desc = item.Name  || item.name  || item.description || '';
          var div  = document.createElement('div');
          div.style.cssText = 'padding:8px 12px;font-size:12px;cursor:pointer;border-bottom:1px solid #E4E8F0';
          div.innerHTML = '<span style="font-family:monospace;font-weight:700;color:#007F76;font-size:11px">'+code+'</span> '+desc;
          div.addEventListener('mouseover', function(){ this.style.background = '#F0FAF9'; });
          div.addEventListener('mouseout',  function(){ this.style.background = '#fff'; });
          div.addEventListener('click', function(){ selClaveSAT(n, code, desc); });
          drop.appendChild(div);
        });
      })
      .catch(function(){
        drop.innerHTML = '<div style="padding:8px 12px;font-size:11px;color:var(--red)">Error al buscar. Verifica la conexión.</div>';
      });
  }, 350);
}

function selClaveSAT(n, code, desc) {
  document.getElementById('clave_sat-'      + n).value = code + ' — ' + desc;
  document.getElementById('clave_sat_code-' + n).value = code;
  var descEl = document.getElementById('desc-' + n);
  if (descEl && !descEl.value) descEl.value = desc;
  document.getElementById('sat-drop-' + n).style.display = 'none';
  saveToStorage();
}

/* ================================================================
   CÁLCULO POR CONCEPTO (con soporte IEPS cuota)
================================================================ */
function calcItem(n) {
  var cant    = parseFloat(g('cant-'    + n)) || 0;
  var precio  = parseFloat(g('precio-' + n)) || 0;
  var ivaStr  = g('iva-' + n) || '0.16';
  var iva     = ivaStr === 'exento' ? 0 : (parseFloat(ivaStr) || 0);
  var retIVA  = parseFloat(g('ret_iva-' + n)) || 0;
  var retISR  = parseFloat(g('ret_isr-' + n)) || 0;
  var iepsVal = g('ieps-' + n) || '0';

  var subtotal  = cant * precio;
  var montoIEPS = iepsVal === 'cuota'
    ? cant * (parseFloat(g('cuota-' + n)) || 0)
    : subtotal * (parseFloat(iepsVal) || 0);

  var total = subtotal
    + (subtotal * iva)
    + montoIEPS
    - (subtotal * retIVA)
    - (subtotal * retISR);

  var el = document.getElementById('total-' + n);
  if (el) el.value = '$' + total.toFixed(2);
}

/* ================================================================
   NAVEGACIÓN
================================================================ */
function goNext(from) {
  if (!validar(from)) return;
  if (from === 1) mostrarCamposPago();
  paso = from + 1;
  if (paso === 5) armarResumen();
  actualizarUI();
  window.scrollTo({top:0, behavior:'smooth'});
}

function goPrev(from) {
  paso = from - 1;
  actualizarUI();
  window.scrollTo({top:0, behavior:'smooth'});
}

function actualizarUI() {
  for (var i = 1; i <= 5; i++) {
    var c  = document.getElementById('card' + i);
    var t  = document.getElementById('st'   + i);
    var sn = document.getElementById('sn'   + i);
    c.classList.toggle('active', i === paso);
    t.classList.remove('active','done');
    if      (i === paso) { t.classList.add('active'); sn.textContent = i; }
    else if (i <  paso)  { t.classList.add('done');   sn.textContent = '✓'; }
    else                 { sn.textContent = i; }
  }
}

/* ================================================================
   VALIDACIONES
================================================================ */
function validar(p) {
  var ok = true;
  if (p === 1) {
    if (!tipoDoc) { alert('Selecciona el tipo de comprobante.'); return false; }
    if (!g('plataforma')) { marcarErr('plataforma'); ok = false; } else clrE('plataforma');
  }
  if (p === 2) {
    if (!g('rfc_emisor') || g('rfc_emisor').length < 12) { marcarErr('rfc_emisor');   ok=false; } else clrE('rfc_emisor');
    if (!g('razon_emisor'))                               { marcarErr('razon_emisor'); ok=false; } else clrE('razon_emisor');
    if (!g('cp_emisor') || g('cp_emisor').length !== 5)  { marcarErr('cp_emisor');    ok=false; } else clrE('cp_emisor');
    if (!g('regimen_emisor'))                             { marcarErr('regimen_emisor');ok=false; } else clrE('regimen_emisor');
    var em = g('email_emisor');
    if (!em || em.indexOf('@') < 1) { marcarErr('email_emisor'); ok=false; } else clrE('email_emisor');
    if (!g('wa_emisor') || g('wa_emisor').length !== 10) { marcarErr('wa_emisor');    ok=false; } else clrE('wa_emisor');
  }
  if (p === 3) {
    if (!g('rfc_receptor') || g('rfc_receptor').length < 12) { marcarErr('rfc_receptor');   ok=false; } else clrE('rfc_receptor');
    if (!g('razon_receptor'))                                 { marcarErr('razon_receptor'); ok=false; } else clrE('razon_receptor');
    if (!g('cp_receptor') || g('cp_receptor').length !== 5)  { marcarErr('cp_receptor');    ok=false; } else clrE('cp_receptor');
    if (!g('uso_cfdi'))                                       { marcarErr('uso_cfdi');       ok=false; } else clrE('uso_cfdi');
    if (!g('regimen_receptor'))                               { marcarErr('regimen_receptor');ok=false; } else clrE('regimen_receptor');
    if (tipoDoc === 'pago') {
      if (!g('uuid_factura'))                                           { marcarErr('uuid_factura'); ok=false; } else clrE('uuid_factura');
      if (!g('fecha_pago'))                                             { marcarErr('fecha_pago');   ok=false; } else clrE('fecha_pago');
      if (!g('monto_pago') || parseFloat(g('monto_pago')) <= 0)        { marcarErr('monto_pago');   ok=false; } else clrE('monto_pago');
      if (!g('forma_pago'))                                             { marcarErr('forma_pago');   ok=false; } else clrE('forma_pago');
    }
  }
  if (p === 4 && tipoDoc !== 'pago') {
    var rows = document.querySelectorAll('.item-row');
    if (rows.length === 0) { alert('Agrega al menos un concepto.'); return false; }
    rows.forEach(function(row){
      var n = row.id.replace('item-', '');
      if (!g('desc-'+n) || !g('precio-'+n) || parseFloat(g('precio-'+n)) <= 0) ok = false;
    });
    if (!ok) alert('Completa todos los conceptos (descripción y precio requeridos).');
  }
  if (p === 5) {
    if (!document.getElementById('acepto').checked) { alert('Debes aceptar los términos.'); return false; }
  }
  return ok;
}

/* ================================================================
   RESUMEN
================================================================ */
function armarResumen() {
  var nTipo = {ingreso:'Factura de Ingreso', pago:'Complemento de Pago'};
  var plat  = {facturama:'Facturama (sistema Accepti)', sat:'Portal del SAT', otro:'Otra plataforma'};
  var filas = [
    {l:'Tipo de CFDI', v:nTipo[tipoDoc]||tipoDoc, big:true, full:true},
    {l:'Plataforma',   v:plat[g('plataforma')]||g('plataforma')},
    {l:'RFC Emisor',   v:g('rfc_emisor'),   mono:true},
    {l:'Emisor',       v:g('razon_emisor')},
    {l:'RFC Receptor', v:g('rfc_receptor'), mono:true},
    {l:'Receptor',     v:g('razon_receptor')},
    {l:'Uso CFDI',     v:g('uso_cfdi')},
    {l:'Correo',       v:g('email_emisor')},
    {l:'WhatsApp',     v:g('wa_emisor')},
  ];
  if (tipoDoc === 'pago') {
    filas.push({l:'UUID factura', v:g('uuid_factura'), mono:true, full:true});
    filas.push({l:'Fecha pago',   v:g('fecha_pago')});
    filas.push({l:'Monto',        v:'$'+parseFloat(g('monto_pago')||0).toFixed(2)});
  }
  var html = '';
  filas.forEach(function(d){
    if (!d.v || d.v === '') return;
    html += '<div class="ri'+(d.full?' full':'')+'"><div class="ril">'+d.l+'</div>' +
            '<div class="riv'+(d.big?' mov':'')+(d.mono?' mono':'')+'">'+d.v+'</div></div>';
  });
  document.getElementById('resumen').innerHTML = html;
}

/* ================================================================
   ENVIAR — Payload completo con montos calculados por impuesto
================================================================ */
function enviar() {
  if (!document.getElementById('acepto').checked) {
    alert('Debes aceptar los términos.');
    return;
  }
  var folio = 'FAC-' + new Date().getFullYear() + '-' + (Math.floor(Math.random()*90000)+10000);

  var conceptos = [];
  document.querySelectorAll('.item-row').forEach(function(row){
    var n       = row.id.replace('item-', '');
    var cant    = parseFloat(g('cant-'   + n)) || 0;
    var precio  = parseFloat(g('precio-' + n)) || 0;
    var ivaStr  = g('iva-'    + n) || '0.16';
    var iva     = ivaStr === 'exento' ? 0 : (parseFloat(ivaStr) || 0);
    var retIVA  = parseFloat(g('ret_iva-'+ n)) || 0;
    var retISR  = parseFloat(g('ret_isr-'+ n)) || 0;
    var iepsVal = g('ieps-'   + n) || '0';
    var cuota   = parseFloat(g('cuota-'  + n)) || 0;

    var sub     = cant * precio;
    var mIeps   = iepsVal === 'cuota' ? cant * cuota : sub * (parseFloat(iepsVal) || 0);
    var mIva    = sub * iva;
    var mRetIva = sub * retIVA;
    var mRetIsr = sub * retISR;
    var total   = sub + mIva + mIeps - mRetIva - mRetIsr;

    conceptos.push({
      clave_sat:             document.getElementById('clave_sat_code-'+n).value || g('clave_sat-'+n),
      descripcion:           g('desc-'    + n),
      cantidad:              cant,
      precio_unitario:       parseFloat(precio.toFixed(2)),
      iva:                   ivaStr,
      iva_tasa:              iva,
      iva_monto:             parseFloat(mIva.toFixed(2)),
      retencion_iva:         retIVA,
      retencion_iva_monto:   parseFloat(mRetIva.toFixed(2)),
      retencion_isr:         retISR,
      retencion_isr_monto:   parseFloat(mRetIsr.toFixed(2)),
      ieps_tipo:             iepsVal === 'cuota' ? 'cuota' : 'porcentaje',
      ieps_tasa:             iepsVal === 'cuota' ? null : parseFloat(iepsVal),
      ieps_cuota_por_unidad: iepsVal === 'cuota' ? cuota : null,
      ieps_monto:            parseFloat(mIeps.toFixed(2)),
      total:                 parseFloat(total.toFixed(2))
    });
  });

  var data = {
    folio:     folio,
    timestamp: new Date().toISOString(),
    tipo_cfdi: tipoDoc,
    plataforma: g('plataforma'),
    emisor: {
      rfc:          g('rfc_emisor'),
      razon_social: g('razon_emisor'),
      cp:           g('cp_emisor'),
      regimen:      g('regimen_emisor'),
      email:        g('email_emisor'),
      whatsapp:     g('wa_emisor')
    },
    receptor: {
      rfc:          g('rfc_receptor'),
      razon_social: g('razon_receptor'),
      cp:           g('cp_receptor'),
      uso_cfdi:     g('uso_cfdi'),
      regimen:      g('regimen_receptor')
    },
    complemento_pago: tipoDoc === 'pago' ? {
      uuid_factura: g('uuid_factura'),
      fecha:        g('fecha_pago'),
      monto:        parseFloat(g('monto_pago') || 0).toFixed(2),
      forma:        g('forma_pago')
    } : null,
    conceptos: conceptos,
    notas:     g('notas')
  };

  fetch(WEBHOOK, {
    method:  'POST',
    headers: {'Content-Type':'application/json'},
    body:    JSON.stringify(data)
  }).catch(function(){ console.warn('Webhook pendiente de configurar'); });

  /* Mostrar pantalla de éxito */
  for (var i = 1; i <= 5; i++) document.getElementById('card'+i).classList.remove('active');
  document.getElementById('success').classList.add('active');
  document.getElementById('folio-num').textContent = folio;
  window.scrollTo({top:0, behavior:'smooth'});

  /* Limpiar borrador */
  clearStorage();
}

/* ================================================================
   HELPERS
================================================================ */
function g(id)        { var el=document.getElementById(id); return el ? el.value.trim() : ''; }
function marcarErr(id){ var el=document.getElementById(id); if(el)el.classList.add('err');    var em=document.getElementById('e-'+id); if(em)em.style.display='block'; }
function clrE(id)     { var el=document.getElementById(id); if(el)el.classList.remove('err'); var em=document.getElementById('e-'+id); if(em)em.style.display='none';  }
