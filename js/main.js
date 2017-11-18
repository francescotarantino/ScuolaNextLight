var session = Cookies.getJSON("session");
var codicescuola = Cookies.get("codicescuola");
var alunno;

$(function(){
  updateMain();
  settingsInit();
});

function updateMain(){
  if (!Cookies.get("alunno")) {
    updateAlunno(session.token, codicescuola);
  }
  alunno = Cookies.getJSON("alunno");
  fillProfessori();
  fillVoti();
}

function fillVoti() {

}

function fillProfessori() {
  request("docenticlasse", { 'x-cod-min': codicescuola, 'x-auth-token': session.token, 'x-prg-alunno': alunno[0].prgAlunno, 'x-prg-scheda': alunno[0].prgScheda, 'x-prg-scuola': alunno[0].prgScuola }, function () {
    var professori = JSON.parse(this.responseText);
    var professori_ul = $("#professori ul");
    var icon_html = '<i class="material-icons mdl-list__item-icon">person</i>';
    professori.forEach(function (element) {
      var row = '<li class="mdl-list__item mdl-list__item--two-line"><span class="mdl-list__item-primary-content">' + icon_html +' ' + element.docente.nome + ' ' + element.docente.cognome + '<span class="mdl-list__item-sub-title">' + element.materie + '</span></span></li>';
      professori_ul.append(row);
    });
  });
}

function logout() {
  Cookies.remove('session');
  window.location.replace("login.html");
}

function settingsInit() {
  if (Cookies.get('view-source-hidden')) {
    $("#switch-view-source-hidden").attr("checked", true);
  }
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
