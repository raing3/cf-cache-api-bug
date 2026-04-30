const populateAndQueryCacheWithConstructedRedirectResponse = async (
	cacheKey: string,
	url: string,
	location: string
): Promise<any> => {
	const parsedUrl = new URL(url);
	const reqWithCacheKey = new Request(parsedUrl.toString(), {
		cf: {
			cacheKey,
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
		req: {
			cacheKey,
			url,
			location,
		},
		storedRsp: {
			body: await rspToInspect?.text(),
			status: rspToInspect?.status,
			headers: rspToInspect?.headers ? Array.from(rspToInspect.headers) : [],
		},
		retrievedRsp: cachedRsp ? {
			body: await cachedRsp.text(),
			status: cachedRsp.status,
			headers: Array.from(cachedRsp.headers),
		} : null
	};
};

const populateAndQueryCacheWithConstructedSuccessResponse = async (
	cacheKey: string,
	url: string,
): Promise<any> => {
	const reqWithCacheKey = new Request(url, {
		cf: {
			cacheKey,
		},
		redirect: 'manual',
	});
	const rsp = new Response('hello world', {
		status: 200,
		headers: {
			'surrogate-control': 'max-age=86400',
		}
	});
	const rspToInspect = rsp.clone();

	// Delete the cache in case it was previously populated, then repopulate.
	await caches.default.delete(reqWithCacheKey);
	await caches.default.put(reqWithCacheKey, rsp);
	const cachedRsp = await caches.default.match(reqWithCacheKey);

	return {
		req: {
			cacheKey,
			url,
		},
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
			// [WORKING] When accessed via worker route on domain: response can be stored and retrieved using the worker cache API
			successWithQuery: await populateAndQueryCacheWithConstructedSuccessResponse(
				'eg1',
				'https://squiz2.net/?foo=bar',
			),

			// [WORKING] When accessed via workers.dev: response can be stored and retrieved using the worker cache API
			// [WORKING] When accessed via worker route on domain: response can be stored and retrieved using the worker cache API
			successWithoutQuery: await populateAndQueryCacheWithConstructedSuccessResponse(
				'eg2',
				'https://squiz2.net/',
			),

			// [WORKING] When accessed via workers.dev: response can be stored and retrieved using the worker cache API
			// [BROKEN] When accessed via worker route on domain: response CANNOT be retrieved using the worker cache API
			redirectWithQuery: await populateAndQueryCacheWithConstructedRedirectResponse(
				'eg3',
				'https://squiz.net/?foo=bar',
				'https://squiz.net/?foo=bar'
			),

			// [WORKING] When accessed via workers.dev: response can be stored and retrieved using the worker cache API
			// [WORKING] When accessed via worker route on domain: response can be stored and retrieved using the worker cache API
			redirectWithoutQuery: await populateAndQueryCacheWithConstructedRedirectResponse(
				'eg4',
				'https://squiz.net/',
				'https://squiz.net'
			),

			// [WORKING] When accessed via workers.dev: response can be stored and retrieved using the worker cache API
			// [WORKING] When accessed via worker route on domain: response can be stored and retrieved using the worker cache API
			redirectWithQueryToNoQuery: await populateAndQueryCacheWithConstructedRedirectResponse(
				'eg5',
				'https://squiz.net/?foo=bar',
				'https://squiz.net/'
			),

			// [WORKING] When accessed via workers.dev: response can be stored and retrieved using the worker cache API
			// [WORKING] When accessed via worker route on domain: response can be stored and retrieved using the worker cache API
			redirectWithoutQueryToQuery: await populateAndQueryCacheWithConstructedRedirectResponse(
				'eg6',
				'https://squiz.net/',
				'https://squiz.net/?foo=bar'
			),
		})
	},
} satisfies ExportedHandler<Env>;
