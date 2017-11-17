var x_version = "2.0.2";
var x_key_app = "ax6542sdru3217t4eesd9";

function request(req, headers, callback){
  var request = new XMLHttpRequest();
  request.open('GET', 'https://www.portaleargo.it/famiglia/api/rest/'+req, true);
  request.setRequestHeader("x-key-app", x_key_app);
  request.setRequestHeader("x-version", x_version);
  Object.keys(headers).forEach(function(key){
    request.setRequestHeader(key, headers[key]);
  });
  request.onreadystatechange = function () {
    if (request.readyState == 4) {
      callback.apply(request);
    }
  }
  request.send(null);
}

function updateAlunno (token, codicescuola){
  request("schede", { 'x-cod-min': codicescuola, 'x-auth-token': token }, function () {
    Cookies.set("alunno", this.responseText);
  });
}
