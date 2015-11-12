// the purpose of this script is to delete promotional emails older than 180 days

function batchDeletePromotions(){
	// add your promotional email senders here
	var senders = [
		'info@email.shoppersoptimum.ca',
		'ebay@reply.ebay.ca',
		'oldnavy@email.oldnavy.ca',
		'bananarepublic@email.bananarepublic.ca',
		'lechateau@e.lechateau.com',
		'news@ncixnews.com',
		'hotwire@e.hotwire.com',
		'email@deals.priceline.com',
		'reminder@mail.jetsetter.com'
	];

	var batchSize = 100; // Process up to 100 threads at once
	for (i = 0; i < senders.length; i++){
		var threads = GmailApp.search('from:'+senders[i]+' older_than:180d');
		for (j = 0; j < threads.length; j+=batchSize){
			GmailApp.moveThreadsToTrash(threads.slice(j, j+batchSize));
		}
	}
}
