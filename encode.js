const { Server } = require('ws');
const ffmpeg = require('fluent-ffmpeg')
const wsStream = require('websocket-stream')

const server = new Server({port: process.env.PORT || 8000, perMessageDeflate: false});

server.on('connection', function(websocket, req) {
	const name = req.url.replace('/', '');
	console.log(`New connection with ${name}`);
	if (!name) {
		return websocket.terminate();
	}
	const stream = wsStream(websocket);
	const encoder = ffmpeg()
		.input(stream)
		.videoCodec('libx264')
		.audioCodec('libmp3lame')
		.outputFPS(24)
		.addOption('-preset:v', 'ultrafast')
		.videoBitrate('500k')
		.audioBitrate('128k')
		.size('?x480')
		.addOption('-f', 'flv')
		.on('error', function(err) {
			console.log(`Error: ${ err.message }`);
		})
		.save(`rtmp://a.rtmp.youtube.com/live2/${ name }`, function(stdout) {
			console.log(`Convert complete${ stdout }`);
		});

	websocket.on('error', (err) => {
		console.log('error', err)
	});

	websocket.on('close', () => {
		console.log(name, 'close')
	});
});


console.log(`Listening on port ${process.env.PORT || 8000}`);
