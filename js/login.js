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
  request('login', { 'x-user-id': username, 'x-pwd': userpass, 'x-cod-min': codicescuola }, function () {
    if (this.status == 200) {
      Cookies.set('codicescuola', codicescuola, { expires: 365 });
      var json = JSON.parse(this.responseText);
      if (this.status === 200) {
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
      } else {
        $("#loginbtn").prop("disabled",false);
        $("#p1").hide();
        dialog.showModal();
      }
    } else {
      $("#loginbtn").prop("disabled",false);
      $("#p1").hide();
      dialog.showModal();
    }
  });
}

var dialog = $('dialog')[0];
if (!dialog.showModal) {
  dialogPolyfill.registerDialog(dialog);
}
dialog.querySelector('.close').addEventListener('click', function() {
  dialog.close();
});
