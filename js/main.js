var session = Cookies.getJSON("session");
var codicescuola = Cookies.get("codicescuola");
var alunno;

$(function(){
  updateMain();
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
  window.location.replace("/login.html");
}

function logoutDialog() {
  logoutDialogElement.showModal();
}

var logoutDialogElement = document.querySelector('#logoutDialog');
if (!logoutDialogElement.showModal) {
  dialogPolyfill.registerDialog(logoutDialogElement);
}
logoutDialogElement.querySelector('.close').addEventListener('click', function() {
  logoutDialogElement.close();
});
logoutDialogElement.querySelector('.yes').addEventListener('click', function() {
  logoutDialogElement.close();
  logout();
});
