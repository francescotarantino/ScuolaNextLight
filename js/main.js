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
  var nav_loading = $("#nav-loading")[0];
  nav_loading.MaterialSpinner.start();
  var argomenti_ul = $("#argomenti-lezione");
  var compiti_ul = $("#compiti-assegnati");
  var voti_ul = $("#voti-giornalieri");
  $("#oggi-date-text").text("");
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

    nav_loading.MaterialSpinner.stop();
    $("#oggi-date-text").text($.format.date(Date.parse(day), "dd/MM/yyyy"));
  }, { 'datGiorno': day });
}

function fillMaterie() {
  var nav_loading = $("#nav-loading")[0];
  nav_loading.MaterialSpinner.start();
  $(".voti-materia").empty();
  $(".argomenti-materia").empty();
  $(".compiti-materia").empty();

  //Voti
  var f_voti = function () {
    var dfd = $.Deferred();
    request("votigiornalieri", { 'x-cod-min': codicescuola, 'x-auth-token': session.token, 'x-prg-alunno': alunno[0].prgAlunno, 'x-prg-scheda': alunno[0].prgScheda, 'x-prg-scuola': alunno[0].prgScuola }, function () {
      var voti = JSON.parse(this.responseText);
      voti.dati.forEach(function (element) {
        createMaterieDiv(element.prgMateria, element.desMateria);

        if (element.desCommento == "" && element.desProva == "") {
          element.desCommento = "Nessun commento.";
        }
        if (element.codVotoPratico == "N") {
          var tipo = " (orale)";
        } else if (element.codVotoPratico == "S") {
          var tipo = " (scritto)";
        } else {
          var voto = "";
        }
        if (element.decValore >= 8.5) {
          var colore = "green";
        } else if (element.decValore < 8.5 && element.decValore >= 6) {
          var colore = "orange";
        } else {
          var colore = "red";
        }
        var row = '<div class="oggi-text"><span class="materia">' + $.format.date(Date.parse(element.datGiorno), "dd/MM/yyyy") + tipo + ' <span class="mdl-chip chip-voto mdl-color--' + colore + ' mdl-color-text--white"><span class="mdl-chip__text">' + element.codVoto + '</span></span></span><span class="info">' + element.desProva + ' ' + element.desCommento + '<br />' + element.docente + '</span></div>';
        $("#voti-materia-"+element.prgMateria).append(row);
      });
      dfd.resolve();
    });
    return dfd.promise();
  }

  //Argomenti
  var f_argomenti = function () {
    var dfd = $.Deferred();
    request("argomenti", { 'x-cod-min': codicescuola, 'x-auth-token': session.token, 'x-prg-alunno': alunno[0].prgAlunno, 'x-prg-scheda': alunno[0].prgScheda, 'x-prg-scuola': alunno[0].prgScuola }, function () {
      var argomenti = JSON.parse(this.responseText);
      argomenti.dati.forEach(function (element) {
        createMaterieDiv(element.prgMateria, element.desMateria);
        var row = '<div class="oggi-text"><span class="materia">' + $.format.date(Date.parse(element.datGiorno), "dd/MM/yyyy") + '</span><span class="info">' + element.desArgomento + '<br />' + element.docente + '</span></div>';
        $("#argomenti-materia-"+element.prgMateria).append(row);
        dfd.resolve();
      });
    });
    return dfd.promise();
  }

  //Compiti
  var f_compiti = function () {
    var dfd = $.Deferred();
    request("compiti", { 'x-cod-min': codicescuola, 'x-auth-token': session.token, 'x-prg-alunno': alunno[0].prgAlunno, 'x-prg-scheda': alunno[0].prgScheda, 'x-prg-scuola': alunno[0].prgScuola }, function () {
      var compiti = JSON.parse(this.responseText);
      compiti.dati.forEach(function (element) {
        createMaterieDiv(element.prgMateria, element.desMateria);
        var row = '<div class="oggi-text"><span class="materia">' + $.format.date(Date.parse(element.datGiorno), "dd/MM/yyyy") + '</span><span class="info">' + element.desCompiti + '<br />' + element.docente + '</span></div>';
        $("#compiti-materia-"+element.prgMateria).append(row);
      });
      dfd.resolve();
    });
    return dfd.promise();
  }

  f_voti().then(f_argomenti).then(f_compiti).then(function () {
    nav_loading.MaterialSpinner.stop();
    $(".voti-materia:empty").append("<h6>Nessun voto.</h6>");
    $(".argomenti-materia:empty").append("<h6>Nessun argomento.</h6>");
    $(".compiti-materia:empty").append("<h6>Nessun compito.</h6>");
  });
}

function createMaterieDiv(id, nome){
  if (!$("#cell-materia-"+id).length) {
    $('<div/>', {
      "class": "mdl-cell mdl-cell--4-col",
      "id": "cell-materia-" + id,
      html: $('<div/>', {
        "class": "mdl-card mdl-shadow--2dp home-cards",
        html: [$('<div/>', {
          "class": "mdl-card__title",
          css: {
            "color": "#fff",
            "background": "#3E4EB8"
          },
          html: $('<h2/>', {
            "class": "mdl-card__title-text",
            text: nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase()
          })
        }), $('<div/>', {
          "class": "mdl-tabs mdl-js-tabs mdl-js-ripple-effect",
          html: [$('<div/>', {
            "class": "mdl-tabs__tab-bar",
            html: [$('<a/>', {
              "class": "mdl-tabs__tab is-active",
              "href": "#voti-materia-" + id,
              text: "Voti"
            }), $('<a/>', {
              "class": "mdl-tabs__tab",
              "href": "#argomenti-materia-" + id,
              text: "Argomenti"
            }), $('<a/>', {
              "class": "mdl-tabs__tab",
              "href": "#compiti-materia-" + id,
              text: "Compiti"
            })]
          }), $('<div/>', {
            "class": "mdl-tabs__panel is-active voti-materia",
            "id": "voti-materia-" + id
          }), $('<div/>', {
            "class": "mdl-tabs__panel argomenti-materia",
            "id": "argomenti-materia-" + id
          }), $('<div/>', {
            "class": "mdl-tabs__panel compiti-materia",
            "id": "compiti-materia-" + id
          })]
        })]
      })
    }).appendTo($("#materie-container"));
    componentHandler.upgradeDom();
  }
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
      $("#materie-div").hide();
      $(".home-navigation").show();
      current_date = $.format.date(new Date(), "yyyy-MM-dd");
      fillOggi(current_date);
      break;
    case 'materie':
      $("#home-div").hide();
      $("#classe-div").hide();
      $("#materie-div").show();
      $(".home-navigation").hide();
      fillMaterie();
      break;
    case 'classe':
      $("#home-div").hide();
      $("#classe-div").show();
      $("#materie-div").hide();
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
