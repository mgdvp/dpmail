let btkn;

const api = 'https://api.mail.tm';
const domain = 'eurokool.com';

const ls = localStorage;

//DOM integration
const tempadrs = document.getElementById('tempadrs');
const inbox = document.getElementById('inbox');

//auth account and get messages
function auth(){
	fetch(`${api}/token`,{
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			address: ls.getItem('mailaddress'),
			password: ls.getItem('pass'),
		})
	}).then(res => res.json()).then(data => {

		btkn = data.token;

	});
} auth();

setTimeout(getMessages, 900);

function getMessages(){
	inbox.innerHTML = 'LOADING...';
	fetch(`${api}/messages/`,{
		method: 'GET',
		headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + btkn},
	}).then(res => res.json())
	.then(data => {
		inbox.innerHTML = '';
		const ms = data['hydra:member'];
		if(ms.length == 0){
			inbox.innerHTML = 'Inbox is empty.';
		}

		for(let m = 0; m < ms.length; m++){
			const msgpreview = document.createElement('div');
			msgpreview.classList.add('msg-preview');
			msgpreview.id = ms[m].id;
			inbox.appendChild(msgpreview);

			const lt = document.createElement('div');
			const rt = document.createElement('div');

			lt.classList.add('lt');
			rt.classList.add('rt');

			msgpreview.append(lt, rt);

			const subject = document.createElement('h3');
			const intro = document.createElement('p');
			const sender = document.createElement('p');
			const senderadd = document.createElement('p');
			const senttime = document.createElement('p');

			subject.innerHTML = ms[m].subject;
			intro.innerHTML = ms[m].intro;
			sender.innerHTML = ms[m].from.name;
			senderadd.innerHTML = ms[m].from.address;
			senttime.innerHTML = new Date(ms[m].createdAt).toLocaleString();

			lt.append(subject, intro);
			rt.append(sender, senderadd, senttime);

			msgpreview.addEventListener('click', getMessageById, false);

		}

	});
}

function getMessageById(){
	fetch(`${api}/messages/${this.id}`,{
		method: 'GET',
		headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + btkn},
	}).then(res => res.json()).then(data => {
		inbox.innerHTML = data.html[0];
	});
}

//if user has no mail, crate new one.
function createNewMail(){
	const accountName = Math.floor(Math.random() * 10000000).toString(24);
	const accountPass = Math.random().toString().slice(2);

	fetch(`${api}/accounts`,{
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			address: `${accountName}@${domain}`,
			password: accountPass,
		})
	}).then(res => res.json()).then(data => {

		const adrs = data.address;
		const id = data.id;

		tempadrs.innerHTML = `Your temp. mail address is <span style="color: #9DC08B">${adrs}</span> `;
		ls.setItem('mailaddress', adrs);
		ls.setItem('id', id);
		ls.setItem('pass', accountPass);
		location.reload();

	});
}

//if user hadn't created mail address before, call createNewMail function.
if(!ls.getItem('mailaddress')){
	createNewMail();
} else {
	tempadrs.innerHTML = `Your temp. mail address is <span style="color: #9DC08B">${ls.getItem('mailaddress')}</span> `
}
