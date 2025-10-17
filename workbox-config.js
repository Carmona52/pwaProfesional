module.exports = {
	globDirectory: 'src/',
	globPatterns: [
		'**/*.{css,tsx,svg,ts}'
	],
	swDest: 'src/sw.ts',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};