"use strict";
import http from 'node:http';
import { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import fs from 'node:fs';

let requestsCount = 0
const __dirname = path.resolve();

// Starting the http server
http
	.createServer(async (req: IncomingMessage, res: ServerResponse) => {
		//get url from req
		const url = req.url ?? "undefined"
		//routs and handlers
		const routes: { [key: string]: any } = {
			'/': () => res.write(`IT-CAMASUTRA ${requestsCount++}`),
			'/favicon.ico': () => {
				res.setHeader('Content-Type', 'image/x-icon');
				// Location of your favicon in the filesystem.
				const favicon = path.join(__dirname, 'public/icons','favicon.ico');
				const readFavicon = fs.createReadStream(favicon)
				readFavicon.pipe(res);
			},
			"students": () => res.write('STUDENTS'),
			"courses": () => res.write('FRONT + BACK'),
			"notFound": () => res.write(`404 NOT FOUND ${url}`),
			"undefined": () => res.write('404 NO URL'),
		}
		//select handler by url		
		let handler = routes[url]
		if (!handler) handler = routes["notFound"]
		//let's start the selected handler
		try {
			handler()
		} catch (error) {
			console.error('index error:', error);
		}
		//send response
		res.end()
	}).listen(process.env.SERVERPORT);
//logging start
console.log(`\x1b[34mHTTP-server started port: ${process.env.SERVERPORT}`);

