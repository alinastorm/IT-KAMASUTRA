"use strict";
import http from 'node:http';
import { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import fs from 'node:fs';

let requestsCount = 0

// Starting the http server
http
	.createServer(async (req: IncomingMessage, res: ServerResponse) => {
		const sendText = (msg: string) => {
			res.setHeader('Content-Type', 'text/html;charset=utf-8')
			res.write(msg)
			res.end()
		}
		const sendStream = (fileStream: fs.ReadStream) => {
			res.setHeader('Content-Type', 'text/plain')
			fileStream.pipe(res)
			fileStream.on('open', () => console.log('fileStream-open'))
			fileStream.on('close', () => console.log('fileStream-close'))//при обрыве соединения нужно fileStream закрыть самому
			res.on('close', () => { console.log('res-close'); fileStream.destroy() })
			res.on('finish', () => console.log('res-finish'))//при штатном окончании file stream сам закрывается
		}
		const sendFavicon = () => {
			// Location of your favicon in the filesystem.
			const __dirname = path.resolve();
			const faviconPath = path.join(__dirname, 'public/icons', 'favicon.ico')
			const readFavicon = fs.createReadStream(faviconPath)
			//send favicon
			res.setHeader('Content-Type', 'image/x-icon')
			readFavicon.pipe(res)
		}
		//get url from req
		const url = req.url ?? "undefined"
		//routs and handlers
		const routes: { [key: string]: any } = {
			'/': () => sendText(`IT-CAMASUTRA ${requestsCount++}`),
			'/favicon.ico': sendFavicon,
			'/fileStream': () => {
				const fileStream = fs.createReadStream('test.txt')
				sendStream(fileStream)
			},
			"/students": () => sendText('STUDENTS'),
			"notFound": () => { },
			"undefined": () => { },
		}
		//select handler by url		
		let handler = routes[url]
		if (!handler) handler = routes["notFound"]
		//start the selected handler
		try {
			handler()
		} catch (error) {
			console.error('handler error:', error)
		}
	}).listen(process.env.SERVERPORT)

//logging start
console.log(`\x1b[34mHTTP-server started http://localhost:${process.env.SERVERPORT}`)

