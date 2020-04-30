function onOpen() {
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
      .createMenu('Trello')
      .addItem('Collega Trello', 'showPrompt')
      .addToUi();
}

function showPrompt() {
  var ui = SpreadsheetApp.getUi(); // Same variations.

  var result = ui.prompt(
      'Collegami a Trello!',
    'Le nuove form compilate apriranno in automatico una attività nella Bacheca specificata. Per favore inserisci l\'indirizzo email della tua Bacheca: (dal web browser: mostra menu -> preferenze email --> copia l\'email qui)',
      ui.ButtonSet.OK_CANCEL);

  // Process the user's response.
  var button = result.getSelectedButton();
  var email = result.getResponseText();
  if (button == ui.Button.OK) {
    // User clicked "OK".
    PropertiesService.getDocumentProperties().setProperty('email', email);
    init();
    ui.alert('L\'indirizzo email inserito è ' + email + '.');
  } else if (button == ui.Button.CANCEL) {
    // User clicked "Cancel".
    ui.alert('La procedura non è andata a buon fine.');
  }
}

function init() {

  var triggers = ScriptApp.getProjectTriggers();
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Delete all triggers before making a brand new one.
  for(var i in triggers) {
    ScriptApp.deleteTrigger(triggers[i]);
  }

  // Set up a new trigger
  ScriptApp.newTrigger('onFormSubmit')
           .forSpreadsheet(ss)
           .onFormSubmit()
           .create();

  Logger.log('Successful creation of new submitToTrello trigger.');
}
function onFormSubmit(e) {
//Call function to create the card
   sendEmail(e);
}
function sendEmail(e) {
    var dict = e.namedValues;
    var array_risposte = e.range.getValues()[0];
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0];
    var lastColumn = sheet.getLastColumn();
    var array_domande = sheet.getRange(1,1,1,lastColumn).getValues()[0];
    //var email = 'andreavitali17+aegxokxec85m7bosvtrb@boards.trello.com';
    var email = PropertiesService.getDocumentProperties().getProperty('email');
    if (email.len <= 0){
      console.log('email non trovata');
      return;
    }
    var title = dict["nome_e_cognome"];
    var desc = packOrder(array_domande, array_risposte);
    //var desc = [array_domande, array_risposte]
    MailApp.sendEmail(email, title, desc);
}  
  function packOrder(array_domande, array_risposte) {
    var ret = ""
    array_domande.forEach(function (domanda,index,ar){
      var risposta = String(array_risposte[index]);
      if (index==0){
        risposta = new Date(array_risposte[index]);
        risposta = risposta.toLocaleDateString('it-IT', {});
      }
      if (risposta.length > 0) {
          ret += (`${domanda}? ${risposta}\n`);
        }
    });
    return ret;
}
