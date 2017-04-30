
function restoreOptions() {

  chrome.storage.sync.get({ token: null, endpoint: null, send_what: 'counts' }, function(config){
    document.getElementById('endpoint').value = config.endpoint;
    document.getElementById('token').value = config.token;
    document.getElementById('send_what').value = config.send_what;
  });

}

function saveOptions(e) {

  var config = {
    endpoint: document.getElementById('endpoint').value,
    token: document.getElementById('token').value,
    send_what: document.getElementById('send_what').value
  };

  chrome.storage.sync.set(config, function(){
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.innerHTML = '&nbsp;';
    }, 750);
  });

}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
