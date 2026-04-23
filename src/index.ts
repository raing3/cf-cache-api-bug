const populateAndQueryCacheWithConstructedResponse = async (url: string, location: string): Promise<any> => {
	const reqWithCacheKey = new Request(url, {
		cf: {
			cacheKey: url,
		},
		redirect: 'manual',
	});
	const rsp = new Response('', {
		status: 301,
		headers: {
			'surrogate-control': 'max-age=86400',
			location: location,
		}
	});
	const rspToInspect = rsp.clone();

	// Delete the cache in case it was previously populated, then repopulate.
	await caches.default.delete(reqWithCacheKey);
	await caches.default.put(reqWithCacheKey, rsp);
	const cachedRsp = await caches.default.match(reqWithCacheKey);

	return {
		storedRsp: {
			body: await rspToInspect?.text(),
			status: rspToInspect?.status,
			headers: rspToInspect?.headers ? Array.from(rspToInspect.headers) : [],
		},
		retrievedRsp: {
			body: await cachedRsp?.text(),
			status: cachedRsp?.status,
			headers: cachedRsp?.headers ? Array.from(cachedRsp.headers) : [],
		}
	};
};

export default {
	async fetch(): Promise<Response> {
		return Response.json({
			// [WORKING] When accessed via workers.dev: response can be stored and retrieved using the worker cache API
			// [BROKEN] When accessed via worker route on domain: response CANNOT be retrieved using the worker cache API
			redirectWithQuery: await populateAndQueryCacheWithConstructedResponse(
				'https://squiz.net/?foo=bar',
				'https://squiz.net?foo=bar'
			),

			// [WORKING] When accessed via workers.dev: response can be stored and retrieved using the worker cache API
			// [WORKING] When accessed via worker route on domain: response can be stored and retrieved using the worker cache API
			redirectWithoutQuery: await populateAndQueryCacheWithConstructedResponse(
				'https://squiz.net/',
				'https://squiz.net'
			),
		})
	},
} satisfies ExportedHandler<Env>;
