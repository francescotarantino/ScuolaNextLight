var session = Cookies.getJSON("session");
var codicescuola = Cookies.get("codicescuola");
var current_date;
var alunno;
var materie_container;

$(function(){
  updateMain();
  updateCache(function () {
    var notification = $('.mdl-js-snackbar')[0];
    notification.MaterialSnackbar.showSnackbar({
      message: 'Aggiornamento completato',
      timeout: 10000,
      actionHandler: function (event) {
        window.location.reload();
      },
      actionText: 'Ricarica'
    });
  }, function () {
    var notification = $('.mdl-js-snackbar')[0];
    notification.MaterialSnackbar.showSnackbar({
      message: 'L\'applicazione è stata salvata sul dispositivo per velocizzarne l\'uso.',
      timeout: 5000
    });
  });

  $("#oggi-datepicker").addClass("mdl-datepicker mdl-js-datepicker mdl-datepicker--inline is-visible");
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
  componentHandler.upgradeDom();

  var oggiPicker = $('#oggi-datepicker')[0];
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
  if(nav_loading.MaterialSpinner) nav_loading.MaterialSpinner.start();
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

  var oggi_fill_f = function (data) {
    var oggi = JSON.parse(data);
    oggi.dati.forEach(function (element) {
      if (element.tipo == "ARG") {
        i_argomenti++;
        $('<div/>', {
          "class": "oggi-text",
          html: [$('<span/>', {
            "class": "materia",
            text: element.dati.desMateria.charAt(0).toUpperCase() + element.dati.desMateria.slice(1).toLowerCase()
          }), $('<span/>', {
            "class": "info",
              html: element.dati.desArgomento + '<br />' + toTitleCase(element.dati.docente)
          })]
        }).appendTo(argomenti_ul);
      } else if (element.tipo == "COM") {
        i_compiti++;
        $('<div/>', {
          "class": "oggi-text",
          html: [$('<span/>', {
            "class": "materia",
            text: element.dati.desMateria.charAt(0).toUpperCase() + element.dati.desMateria.slice(1).toLowerCase()
          }), $('<span/>', {
            "class": "info",
            html: element.dati.desCompiti + '<br />' + toTitleCase(element.dati.docente)
          })]
        }).appendTo(compiti_ul);
      } else if (element.tipo == "VOT") {
        i_voti++;
        if (element.dati.desCommento == "" && element.dati.desProva == "") {
          element.dati.desCommento = "Nessun commento.";
        }
        if (element.dati.codVotoPratico == "N") {
          var tipo = " (orale)";
        } else if (element.dati.codVotoPratico == "S") {
          var tipo = " (scritto)";
        } else if (element.dati.codVotoPratico == "P"){
          var tipo = " (pratico)";
        }
        $('<div/>', {
          "class": "oggi-text",
          html: [$('<span/>', {
            "class": "materia",
            html: element.dati.desMateria.charAt(0).toUpperCase() + element.dati.desMateria.slice(1).toLowerCase() + tipo + ' <span class="mdl-chip chip-voto mdl-color--' + colore_voto(element.dati.decValore) + ' mdl-color-text--white"><span class="mdl-chip__text">' + element.dati.codVoto + '</span></span>'
          }), $('<span/>', {
            "class": "info",
            html: element.dati.desProva + ' ' + element.dati.desCommento + '<br />' + toTitleCase(element.dati.docente)
          })]
        }).appendTo(voti_ul);
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
  };

  var i_argomenti = 0, i_compiti = 0, i_voti = 0;
  request("oggi", { 'x-cod-min': codicescuola, 'x-auth-token': session.token, 'x-prg-alunno': alunno[0].prgAlunno, 'x-prg-scheda': alunno[0].prgScheda, 'x-prg-scuola': alunno[0].prgScuola },  { 'datGiorno': day }, function () {
    oggi_fill_f(this.responseText);
    if (Storage) {
      localStorage.setItem("cache_oggi_" + day, this.responseText);
      localStorage.setItem("cache_oggi_date_" + day, $.format.date(new Date(), "HH:mm dd/MM/yyyy"));
    }
  }, function () {
    if (localStorage.getItem("cache_oggi_date_" + day)) {
      oggi_fill_f(localStorage.getItem("cache_oggi_" + day));
      var notification = $('.mdl-js-snackbar')[0];
      notification.MaterialSnackbar.showSnackbar({
          message: 'Errore di rete. Ultimo aggiornamento: ' + localStorage.getItem("cache_oggi_date_" + day),
          timeout: 4000
      });
    } else {
      var notification = $('.mdl-js-snackbar')[0];
      notification.MaterialSnackbar.showSnackbar({
          message: 'Errore di rete',
          timeout: 10000,
          actionHandler: function (event) {
            fillOggi(current_date);
            notification.MaterialSnackbar.hideSnackbar();
          },
          actionText: 'Riprova'
      });

      $("#argomenti-loading").hide();
      $("#compiti-loading").hide();
      $("#voti-loading").hide();
      nav_loading.MaterialSpinner.stop();
      voti_ul.append("<h6>Errore di rete.</h5>");
      argomenti_ul.append("<h6>Errore di rete.</h5>");
      compiti_ul.append("<h6>Errore di rete.</h5>");
    }
  }, function () {
    var notification = $('.mdl-js-snackbar')[0];
    notification.MaterialSnackbar.showSnackbar({
        message: 'Errore. Prova ad effettuare il lougut e a rientrare.',
        timeout: 10000,
        actionHandler: function (event) {
          logoutDialogElement.showModal();
          notification.MaterialSnackbar.hideSnackbar();
        },
        actionText: 'Logout'
    });

    $("#argomenti-loading").hide();
    $("#compiti-loading").hide();
    $("#voti-loading").hide();
    nav_loading.MaterialSpinner.stop();
    voti_ul.append("<h6>Errore di rete.</h5>");
    argomenti_ul.append("<h6>Errore di rete.</h5>");
    compiti_ul.append("<h6>Errore di rete.</h5>");
  });
}

function fillMaterie() {
  var nav_loading = $("#nav-loading")[0];
  nav_loading.MaterialSpinner.start();
  $(".voti-materia").empty();
  $(".argomenti-materia").empty();
  $(".compiti-materia").empty();

  //Voti
  var voti_fill_f = function (data) {
    var voti = JSON.parse(data);
    voti.dati.forEach(function (element) {
      createMaterieDiv(element.prgMateria, element.desMateria);

      if (element.desCommento == "" && element.desProva == "") {
        element.desCommento = "Nessun commento.";
      }
      if (element.codVotoPratico == "N") {
        var tipo = " (orale)";
      } else if (element.codVotoPratico == "S") {
        var tipo = " (scritto)";
      } else if (element.codVotoPratico == "P") {
        var tipo = " (pratico)";
      }
      $('<div/>', {
        "class": "oggi-text",
        html: [$('<span/>', {
          "class": "materia",
          html: $.format.date(Date.parse(element.datGiorno), "dd/MM/yyyy") + tipo + ' <span class="mdl-chip chip-voto mdl-color--' + colore_voto(element.decValore) + ' mdl-color-text--white"><span class="mdl-chip__text">' + element.codVoto + '</span></span>'
        }), $('<span/>', {
          "class": "info",
          html: element.desProva + ' ' + element.desCommento + '<br />' + toTitleCase(element.docente)
        })]
      }).appendTo($("#voti-materia-"+element.prgMateria));
    });
  };
  var f_voti = function () {
    var dfd = $.Deferred();
    request("votigiornalieri", { 'x-cod-min': codicescuola, 'x-auth-token': session.token, 'x-prg-alunno': alunno[0].prgAlunno, 'x-prg-scheda': alunno[0].prgScheda, 'x-prg-scuola': alunno[0].prgScuola }, {}, function () {
      voti_fill_f(this.responseText);
      if (Storage) {
        localStorage.setItem("cache_voti", this.responseText);
        localStorage.setItem("cache_voti_date", $.format.date(new Date(), "HH:mm dd/MM/yyyy"));
      }
      dfd.resolve();
    }, function () {
      dfd.reject(1);
    }, function () {
      dfd.reject(2);
    });
    return dfd.promise();
  }

  //Argomenti
  var argomenti_fill_f = function (data) {
    var argomenti = JSON.parse(data);
    argomenti.dati.forEach(function (element) {
      createMaterieDiv(element.prgMateria, element.desMateria);
      $('<div/>', {
        "class": "oggi-text",
        html: [$('<span/>', {
          "class": "materia",
          text: $.format.date(Date.parse(element.datGiorno), "dd/MM/yyyy")
        }), $('<span/>', {
          "class": "info",
          html: element.desArgomento + '<br />' + toTitleCase(element.docente)
        })]
      }).appendTo($("#argomenti-materia-"+element.prgMateria));
    });
  };
  var f_argomenti = function () {
    var dfd = $.Deferred();
    request("argomenti", { 'x-cod-min': codicescuola, 'x-auth-token': session.token, 'x-prg-alunno': alunno[0].prgAlunno, 'x-prg-scheda': alunno[0].prgScheda, 'x-prg-scuola': alunno[0].prgScuola }, {}, function () {
      argomenti_fill_f(this.responseText);
      if (Storage) {
        localStorage.setItem("cache_argomenti", this.responseText);
        localStorage.setItem("cache_argomenti_date", $.format.date(new Date(), "HH:mm dd/MM/yyyy"));
      }
      dfd.resolve();
    }, function () {
      dfd.reject(1);
    }, function () {
      dfd.reject(2);
    });
    return dfd.promise();
  }

  //Compiti
  var compiti_fill_f = function (data) {
    var compiti = JSON.parse(data);
    compiti.dati.forEach(function (element) {
      createMaterieDiv(element.prgMateria, element.desMateria);
      $('<div/>', {
        "class": "oggi-text",
        html: [$('<span/>', {
          "class": "materia",
          text: $.format.date(Date.parse(element.datGiorno), "dd/MM/yyyy")
        }), $('<span/>', {
          "class": "info",
          html: element.desCompiti + '<br />' + toTitleCase(element.docente)
        })]
      }).appendTo($("#compiti-materia-"+element.prgMateria));
    });
  };
  var f_compiti = function () {
    var dfd = $.Deferred();
    request("compiti", { 'x-cod-min': codicescuola, 'x-auth-token': session.token, 'x-prg-alunno': alunno[0].prgAlunno, 'x-prg-scheda': alunno[0].prgScheda, 'x-prg-scuola': alunno[0].prgScuola }, {}, function () {
      compiti_fill_f(this.responseText);
      if (Storage) {
        localStorage.setItem("cache_compiti", this.responseText);
        localStorage.setItem("cache_compiti_date", $.format.date(new Date(), "HH:mm dd/MM/yyyy"));
      }
      dfd.resolve();
    }, function () {
      dfd.reject(1);
    }, function () {
      dfd.reject(2);
    });
    return dfd.promise();
  }

  f_voti().then(f_argomenti).then(f_compiti).then(function () {
    materie_container = $('#materie-container').masonry({
      itemSelector: '.mdl-cell'
    });
    $(".reload-mc-masonry").click(function () {
      materie_container.masonry();
    });
    nav_loading.MaterialSpinner.stop();
    $(".voti-materia:empty").append("<h6>Nessun voto.</h6>");
    $(".argomenti-materia:empty").append("<h6>Nessun argomento.</h6>");
    $(".compiti-materia:empty").append("<h6>Nessun compito.</h6>");
  }).fail(function (e) {
    switch (e) {
      case 1:
        if (localStorage.getItem("cache_voti_date")) {
          voti_fill_f(localStorage.getItem("cache_voti"));
          var date_cache = localStorage.getItem("cache_voti_date");
        }
        if (localStorage.getItem("cache_argomenti_date")) {
          argomenti_fill_f(localStorage.getItem("cache_argomenti"));
          var date_cache = localStorage.getItem("cache_argomenti_date");
        }
        if (localStorage.getItem("cache_compiti_date")) {
          compiti_fill_f(localStorage.getItem("cache_compiti"));
          var date_cache = localStorage.getItem("cache_compiti_date");
        }
        if (date_cache) {
          var notification = $('.mdl-js-snackbar')[0];
          notification.MaterialSnackbar.showSnackbar({
              message: 'Errore di rete. Ultimo aggiornamento: ' + date_cache,
              timeout: 4000
          });
          materie_container = $('#materie-container').masonry({
            itemSelector: '.mdl-cell'
          });
          $(".reload-mc-masonry").click(function () {
            materie_container.masonry();
          });
          nav_loading.MaterialSpinner.stop();
          $(".voti-materia:empty").append("<h6>Nessun voto.</h6>");
          $(".argomenti-materia:empty").append("<h6>Nessun argomento.</h6>");
          $(".compiti-materia:empty").append("<h6>Nessun compito.</h6>");
        } else {
          var notification = $('.mdl-js-snackbar')[0];
          notification.MaterialSnackbar.showSnackbar({
              message: 'Errore di rete',
              timeout: 10000,
              actionHandler: function (event) {
                fillMaterie();
                notification.MaterialSnackbar.hideSnackbar();
              },
              actionText: 'Riprova'
          });
        }
        break;
      case 2:
        var notification = $('.mdl-js-snackbar')[0];
        notification.MaterialSnackbar.showSnackbar({
            message: 'Errore. Prova ad effettuare il lougut e a rientrare.',
            timeout: 10000,
            actionHandler: function (event) {
              logoutDialogElement.showModal();
              notification.MaterialSnackbar.hideSnackbar();
            },
            actionText: 'Logout'
        });
        break;
    }
    $(".materie-container").empty();
    nav_loading.MaterialSpinner.stop();
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
              "class": "mdl-tabs__tab is-active reload-mc-masonry",
              "href": "#voti-materia-" + id,
              text: "Voti"
            }), $('<a/>', {
              "class": "mdl-tabs__tab reload-mc-masonry",
              "href": "#argomenti-materia-" + id,
              text: "Argomenti"
            }), $('<a/>', {
              "class": "mdl-tabs__tab reload-mc-masonry",
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
  var professori_fill_f = function (data) {
    var professori = JSON.parse(data);
    var icon_html = '<i class="material-icons mdl-list__item-icon">person</i>';
    professori.forEach(function (element) {
      $('<li/>', {
        "class": "mdl-list__item mdl-list__item--two-line",
        html: $('<span/>', {
          "class": "mdl-list__item-primary-content",
          html: icon_html +' ' + toTitleCase(element.docente.nome) + ' ' + toTitleCase(element.docente.cognome) + '<span class="mdl-list__item-sub-title">' + parseMaterieName(element.materie) + '</span>'
        })
      }).appendTo(professori_ul);
    });
    $("#professori-loading").hide();
  };
  $("#professori-loading").show();
  request("docenticlasse", { 'x-cod-min': codicescuola, 'x-auth-token': session.token, 'x-prg-alunno': alunno[0].prgAlunno, 'x-prg-scheda': alunno[0].prgScheda, 'x-prg-scuola': alunno[0].prgScuola }, {}, function () {
    professori_fill_f(this.responseText);
    if (Storage) {
      localStorage.setItem("cache_professori", this.responseText);
      localStorage.setItem("cache_professori_date", $.format.date(new Date(), "HH:mm dd/MM/yyyy"));
    }
  }, function () {
    if (localStorage.getItem("cache_professori")) {
      professori_fill_f(localStorage.getItem("cache_professori"));
      var notification = $('.mdl-js-snackbar')[0];
      notification.MaterialSnackbar.showSnackbar({
          message: 'Errore di rete. Ultimo aggiornamento: ' + localStorage.getItem("cache_professori_date"),
          timeout: 4000
      });
    } else {
      $("#professori-loading").hide();
      professori_ul.append("<h6>Errore di rete.</h6>");
    }
  }, function () {
    $("#professori-loading").hide();
    professori_ul.append("<h6>Errore.</h6>");
  });
}

function colore_voto (voto) {
  if (voto >= 9) {
    return "green";
  } else if (voto >= 8 && voto < 9) {
    return "light-green";
  } else if (voto >= 7 && voto < 8) {
    return "lime";
  } else if (voto >= 6 && voto < 7) {
    return "amber";
  } else if (voto > 5 && voto < 6) {
    return "orange";
  } else if (voto >= 4 && voto <= 5) {
    return "deep-orange";
  } else if (voto < 4) {
    return "red";
  }
}

function logout() {
  Cookies.remove('session');
  localStorage.clear();
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
      $("#update").attr("onclick","fillOggi(current_date);");
      current_date = $.format.date(new Date(), "yyyy-MM-dd");
      fillOggi(current_date);
      break;
    case 'materie':
      $("#home-div").hide();
      $("#classe-div").hide();
      $("#materie-div").show();
      $(".home-navigation").hide();
      $("#update").show().attr("onclick","fillMaterie();");
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
