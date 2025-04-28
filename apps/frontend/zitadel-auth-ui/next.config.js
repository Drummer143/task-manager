//@ts-check

const { composePlugins, withNx } = require("@nx/next");

const secureHeaders = [
	{
		key: "Strict-Transport-Security",
		value: "max-age=63072000; includeSubDomains; preload"
	},
	{
		key: "Referrer-Policy",
		value: "origin-when-cross-origin"
	},
	{
		key: "X-Frame-Options",
		value: "SAMEORIGIN"
	},
	{
		key: "X-Content-Type-Options",
		value: "nosniff"
	},
	{
		key: "X-XSS-Protection",
		value: "1; mode=block"
	},
	// img-src vercel.com needed for deploy button,
	// script-src va.vercel-scripts.com for analytics/vercel scripts
	{
		key: "Content-Security-Policy",
		value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; connect-src 'self'; child-src; style-src 'self' 'unsafe-inline'; font-src 'self'; object-src 'none'; img-src 'self' https://vercel.com;"
	}
];

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
	reactStrictMode: true,
	experimental: {
		// dynamicIO: true,
		useCache: true
	},
	async headers() {
		return [
			{
				source: "/:path*",
				headers: secureHeaders
			}
		];
	},
	nx: {
		// Set this to true if you would like to to use SVGR
		// See: https://github.com/gregberge/svgr
		svgr: false
	}
};

const plugins = [
	// Add more Next.js plugins to this list if needed.
	withNx
];

module.exports = composePlugins(...plugins)(nextConfig);

