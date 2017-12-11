$(function(){
  var codicescuolaCookie = Cookies.get('codicescuola');
  if (codicescuolaCookie) {
    $("#codicescuola").parent().addClass('is-dirty');
    $("#codicescuola").val(codicescuolaCookie);
  }
});

function doLogin(){
  $("#loginbtn").prop("disabled",true);
  $("#p1").show();
  var codicescuola = $("#codicescuola").val();
  var username = $("#username").val();
  var userpass = $("#userpass").val();
  var rememberme = $("#rememberme").is(':checked');
  request('login', { 'x-user-id': username, 'x-pwd': userpass, 'x-cod-min': codicescuola }, {}, function () {
    Cookies.set('codicescuola', codicescuola, { expires: 365 });
    var json = JSON.parse(this.responseText);
      var session = {
        token: json.token,
        username: username
      };
      if (rememberme) {
        Cookies.set('session', session, { expires: 365 });
      } else {
        Cookies.set('session', session);
      }
      window.location.replace("main.html");
  }, function () {
    var notification = $('.mdl-js-snackbar')[0];
    notification.MaterialSnackbar.showSnackbar({
        message: 'Errore di rete',
        timeout: 10000,
        actionHandler: function (event) {
          notification.MaterialSnackbar.hideSnackbar();
        },
        actionText: 'Ok'
    });
    $("#loginbtn").prop("disabled",false);
    $("#p1").hide();
  }, function () {
    $("#loginbtn").prop("disabled",false);
    $("#p1").hide();
    dialog.showModal();
  });
}

var dialog = $('dialog')[0];
if (!dialog.showModal) {
  dialogPolyfill.registerDialog(dialog);
}
dialog.querySelector('.close').addEventListener('click', function() {
  dialog.close();
});
