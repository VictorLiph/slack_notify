const SLACK_TOKEN = "XXXX"; 

function monitorarEscala() {
  var aba = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]; 
  var dados = aba.getDataRange().getDisplayValues(); 
  var agora = new Date();
  
  var horaAgora = Utilities.formatDate(agora, "GMT-3", "HH:mm");
  var partesA = horaAgora.split(":");
  var minAgora = (parseInt(partesA[0]) * 60) + parseInt(partesA[1]);

  console.log("⌚ Verificando escala às: " + horaAgora);

  for (var i = 1; i < dados.length; i++) {
    var nome    = dados[i][0];
    var email   = dados[i][1];
    var horario = dados[i][2];
    var pausa   = dados[i][3];
    var status  = dados[i][4];

    if (!horario || !email || !horario.includes(":")) continue;

    try {
      var match = horario.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        var minPausa = (parseInt(match[1]) * 60) + parseInt(match[2]);
        var diff = minPausa - minAgora;

        // REGRA: Se faltar 5 min E ainda não tiver sido enviado hoje
        if (diff === 5 && status !== "✅ Enviado") {
          console.log(`🎯 Disparando para ${nome}...`);
          
          // Tenta enviar e guarda o resultado
          var sucesso = enviarDM(email, nome, pausa);
          
          if (sucesso) {
            aba.getRange(i + 1, 5).setValue("✅ Enviado às " + horaAgora);
            aba.getRange(i + 1, 5).setBackground("#d9ead3");
          } else {
            aba.getRange(i + 1, 5).setValue("❌ Erro no Slack");
            aba.getRange(i + 1, 5).setBackground("#f4cccc");
          }
        }
      }
    } catch(e) {
      console.log("Erro no agente " + nome + ": " + e.message);
    }
  }
}

function enviarDM(email, nome, pausa) {
  try {
    var emailLimpo = email.trim();
    var res = UrlFetchApp.fetch("https://slack.com/api/users.lookupByEmail?email=" + encodeURIComponent(emailLimpo), {
      "method": "get",
      "headers": {"Authorization": "Bearer " + SLACK_TOKEN},
      "muteHttpExceptions": true
    });
    
    var userJson = JSON.parse(res.getContentText());

    if (userJson.ok) {
      var userId = userJson.user.id;
      var payload = {
        "channel": userId,
        "text": `🔔 *Oi ${nome}!* Sua pausa de *${pausa}* começa em 5 minutos.`
      };
      
      var resMsg = UrlFetchApp.fetch("https://slack.com/api/chat.postMessage", {
        "method": "post",
        "contentType": "application/json",
        "headers": {"Authorization": "Bearer " + SLACK_TOKEN},
        "payload": JSON.stringify(payload),
        "muteHttpExceptions": true
      });
      
      return JSON.parse(resMsg.getContentText()).ok; 
    }
    return false;
  } catch (e) {
    return false;
  }
}