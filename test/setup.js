global.navigate = async (where) => {
	await page.goto(where, { waitUntil: 'load' })
}
global.unorderedMatch = (a, b) => expect(a.sort()).toEqual(b.sort())
