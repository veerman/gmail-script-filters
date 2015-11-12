// the purpose of this script is to delete SPAM sent to a catch-all email for a personal domain (which uses Gmail as email service)

function batchDeleteSPAM(){
	var queue_threads = [];
	var queue_delete = false; // delete immediately or after having read all threads
	var base_domain = 'domain.com'; // base catch-all domain (eg. domain.com)
	var threads = GmailApp.search('in:spam newer_than:3d'); // only check last 3 days
	var threads_length = threads.length;
	//threads_length = 100; // testing
	for (var i = 0; i < threads_length; i++){
		var thread = threads[i];
		if (thread === undefined){ // rate limit exceeded?
			break;
		}
		var message = thread.getMessages()[0]; // get first message

		// check if To has a number, otherwise it is a valid looking email prefix
		var tos = message.getTo().split(','); // possible to have multiple To(s)
		var spam = false;
		for (var j = 0; j < tos.length; j++){
			tos[j] = getEmail(tos[j]);
			to_email = tos[j].split('@');
			details = getDetails(to_email[0]);
			if (details.hasNumber && to_email[1] === base_domain){
				spam = true;
			}
		}

		if (spam === false){
			var get_from = message.getFrom();
			var name = getEmailName(get_from);
			if (name.indexOf(base_domain) !== -1){ // base domain was found in the senders from name
				spam = true;
			}
			if (spam === false){
				var from = getEmail(get_from);
				from_email = from.split('@');
				if (from_email[0].indexOf(to_email[0]) !== -1){ // prefix is contained within the from prefix eg. user123@domain.com and user123999@domain.com, 'user123' is in 'user123999'
					spam = true;
				}
				if (spam === false){
					details = getDetails(from_email[0]); // check if from has hex prefix
					if (details.hasNumber && details.isHex){ // email prefix is made up of only hex chars
						spam = true;
					}
				}
			}
		}
		Logger.log('SPAM? ' + spam);
		if (spam){
			if (queue_delete){
				queue_threads.push(threads[i]);
			}
			else{
				GmailApp.moveThreadToTrash(threads[i]);
			}
		}
		if (i%10 === 0){ // sleep every 10
			Utilities.sleep(2000); // ms to sleep
		}
	}

	if (queue_delete){
		var batchSize = 100; // Process up to 100 threads at once
		for (j = 0; j < queue_threads.length; j+=batchSize){
			GmailApp.moveThreadsToTrash(queue_threads.slice(j, j+batchSize));
		}
	}
	Logger.log('batchDeleteSPAM has finished execution');
}

function getEmail(str){
	var regex = /<([^>]+)>/i;
	var match = regex.exec(str);
	var email = '';
	if (match !== null){ // match found
		email = match[1];
	}
	else{ // no match found
		email = str;
	}
	Logger.log(email);
	return email;
}

function getEmailName(str){
	var name = '';
	if (str.indexOf('<') !== -1){
		name = str.split('<')[0];
	}
	Logger.log('Name: ' + name);
	return name;
}

function getDetails(str){
	var result = {};
	var regex = /[0-9]+/i;
	result.hasNumber = regex.test(str);
	if (result.hasNumber){
		var regex = /^[a-f0-9]+$/i;
		result.isHex = regex.test(str);
	}
	return result;
}