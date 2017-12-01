var session = Cookies.getJSON("session");
var codicescuola = Cookies.get("codicescuola");
var current_date;
var alunno;

$(function(){
  updateMain();

  MaterialDatePicker.locales.weekStart = 1;
  MaterialDatePicker.locales.weekDays = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  MaterialDatePicker.locales.weekDaysShort = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  MaterialDatePicker.locales.weekDaysLetter = ['D', 'L', 'M', 'M', 'G', 'V', 'S'];
  MaterialDatePicker.locales.months = [
    'Gennaio', 'Febbraio', 'Marzo',
    'Aprile', 'Maggio', 'Giugno', 'Luglio',
    'Agosto', 'Settembre', 'Ottobre',
    'Novembre', 'Dicembre'
  ];
  MaterialDatePicker.locales.monthsShort = [
    'Gen', 'Feb', 'Mar', 'Apr', 'Mag',
    'Giu', 'Lug', 'Ago', 'Set', 'Ott',
    'Nov', 'Dic'
  ];
  MaterialDatePicker.locales.actions.cancel = "Annulla";

  var oggiPicker = document.querySelector('#oggi-datepicker');
  oggiPicker.MaterialDatePicker.setRange(null, new Date());
  oggiPicker.addEventListener('change', function(e) {
    oggiDatepickerDialogElement.close();
    var selectedDate = oggiPicker.MaterialDatePicker.getSelectedDate();
    current_date = $.format.date(selectedDate, "yyyy-MM-dd");
    fillOggi(current_date);
  });
  oggiPicker.addEventListener('cancel', function() {
    oggiDatepickerDialogElement.close();
  });
});

function updateMain(){
  var fill = function () {
    alunno = Cookies.getJSON("alunno");
    current_date = $.format.date(new Date(), "yyyy-MM-dd");
    fillOggi(current_date);
  }
  if (!Cookies.get("alunno")) {
    updateAlunno(session.token, codicescuola).then(fill);
  } else {
    fill();
  }
}

function fillOggi(day) {
  var argomenti_ul = $("#argomenti-lezione");
  var compiti_ul = $("#compiti-assegnati");
  var voti_ul = $("#voti-giornalieri");
  $("#oggi-date-text").text("Aggiornamento...");
  argomenti_ul.empty();
  $("#argomenti-loading").show();
  compiti_ul.empty();
  $("#compiti-loading").show();
  voti_ul.empty();
  $("#voti-loading").show();

  var i_argomenti = 0, i_compiti = 0, i_voti = 0;
  request("oggi", { 'x-cod-min': codicescuola, 'x-auth-token': session.token, 'x-prg-alunno': alunno[0].prgAlunno, 'x-prg-scheda': alunno[0].prgScheda, 'x-prg-scuola': alunno[0].prgScuola }, function () {
    var oggi = JSON.parse(this.responseText);
    oggi.dati.forEach(function (element) {
      if (element.tipo == "ARG") {
        i_argomenti++;
        var row = '<div class="oggi-text"><span class="materia">' + element.dati.desMateria + '</span><span class="info">' + element.dati.desArgomento + '<br />' + element.dati.docente + '</span></div>';
        argomenti_ul.append(row);
      } else if (element.tipo == "COM") {
        i_compiti++;
        var row = '<div class="oggi-text"><span class="materia">' + element.dati.desMateria + '</span><span class="info">' + element.dati.desCompiti + '<br />' + element.dati.docente + '</span></div>';
        compiti_ul.append(row);
      } else if (element.tipo == "VOT") {
        i_voti++;
        var tipo;
        if (element.dati.desCommento == "" && element.dati.desProva == "") {
          element.dati.desCommento = "Nessun commento.";
        }
        if (element.dati.codVotoPratico == "N") {
          tipo = " (orale)";
        } else if (element.dati.codVotoPratico == "S") {
          tipo = " (scritto)";
        } else {
          voto = "";
        }
        if (element.dati.decValore >= 8.5) {
          var colore = "green";
        } else if (element.dati.decValore < 8.5 && element.dati.decValore >= 6) {
          var colore = "orange";
        } else {
          var colore = "red";
        }
        var row = '<div class="oggi-text"><span class="materia">' + element.dati.desMateria + tipo + ' <span class="mdl-chip chip-voto mdl-color--' + colore + ' mdl-color-text--white"><span class="mdl-chip__text">' + element.dati.codVoto + '</span></span></span><span class="info">' + element.dati.desProva + ' ' + element.dati.desCommento + '<br />' + element.dati.docente + '</span></div>';
        voti_ul.append(row);
      }
    });

    if (i_voti == 0) {
      voti_ul.append("<h6>Nessun voto.</h5>");
    }
    if (i_argomenti == 0) {
      argomenti_ul.append("<h6>Nessun argomento.</h5>");
    }
    if (i_compiti == 0) {
      compiti_ul.append("<h6>Nessun compito.</h5>");
    }

    $("#argomenti-loading").hide();
    $("#compiti-loading").hide();
    $("#voti-loading").hide();

    $("#oggi-date-text").text($.format.date(Date.parse(day), "dd/MM/yyyy"));
  }, { 'datGiorno': day });
}

function fillProfessori() {
  var professori_ul = $("#professori");
  professori_ul.empty();
  $("#professori-loading").show();
  request("docenticlasse", { 'x-cod-min': codicescuola, 'x-auth-token': session.token, 'x-prg-alunno': alunno[0].prgAlunno, 'x-prg-scheda': alunno[0].prgScheda, 'x-prg-scuola': alunno[0].prgScuola }, function () {
    var professori = JSON.parse(this.responseText);
    var icon_html = '<i class="material-icons mdl-list__item-icon">person</i>';
    professori.forEach(function (element) {
      var row = '<li class="mdl-list__item mdl-list__item--two-line"><span class="mdl-list__item-primary-content">' + icon_html +' ' + element.docente.nome + ' ' + element.docente.cognome + '<span class="mdl-list__item-sub-title">' + element.materie + '</span></span></li>';
      professori_ul.append(row);
    });
    $("#professori-loading").hide();
  });
}

function logout() {
  Cookies.remove('session');
  window.location.replace("login.html");
}

function settingsInit() {
  if (Cookies.get('view-source-hidden')) {
    $("#switch-view-source-hidden-label")[0].MaterialSwitch.on();
  }
}

function switchDiv(div) {
  switch (div) {
    case 'home':
      $("#home-div").show();
      $("#classe-div").hide();
      $(".home-navigation").show();
      current_date = $.format.date(new Date(), "yyyy-MM-dd");
      fillOggi(current_date);
      break;
    case 'classe':
      $("#home-div").hide();
      $("#classe-div").show();
      $(".home-navigation").hide();
      fillProfessori();
      break;
    default:
      console.log("Errore.");
  }
  if($(".mdl-layout__drawer").hasClass("is-visible")) $('.mdl-layout')[0].MaterialLayout.toggleDrawer();
}

$('#switch-view-source-hidden').click(function() {
  if (this.checked) {
    Cookies.set("view-source-hidden", true, { expires: 365 });
  } else {
    Cookies.remove("view-source-hidden");
  }
  $("#view-source").attr("hidden", this.checked);
});

var logoutDialogElement = $('#logoutDialog')[0];
if (!logoutDialogElement.showModal) {
  dialogPolyfill.registerDialog(logoutDialogElement);
}
$('#logoutDialog .close')[0].addEventListener('click', function() {
  logoutDialogElement.close();
});
$('#logoutDialog .yes')[0].addEventListener('click', function() {
  logoutDialogElement.close();
  logout();
});

var settingsDialogElement = $('#settingsDialog')[0];
if (!settingsDialogElement.showModal) {
  dialogPolyfill.registerDialog(settingsDialogElement);
}
$('#settingsDialog .close')[0].addEventListener('click', function() {
  settingsDialogElement.close();
});

var oggiDatepickerDialogElement = $('#dateDialog')[0];
if (!oggiDatepickerDialogElement.showModal) {
  dialogPolyfill.registerDialog(oggiDatepickerDialogElement);
}
