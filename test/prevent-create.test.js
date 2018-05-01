describe('Nilbog#preventCreate', () => {
	describe('on load', () => {
		test('destroy pre-existing elements', async () => {
			await navigate(PATHS.index)
			expect(await page.$('.prevent-create[data-should-be="gone"]')).toBeNull()
		})
	})
	describe('after load', () => {
		beforeAll(async () => {
			await navigate(PATHS.blank)
			await page.evaluate(() => {
				nilbog.preventCreate('.prevent-create')
			})
		})
		test('destroy added elements', async () => {
			await page.evaluate(() => {
				$(document.body).append(`<div class="prevent-create" id="prevent-create-1"></div>`)
			})
			await expect(page).not.toMatchElement('div#prevent-create-1')
		})
		test('destroy only matched elements', async () => {
			await page.evaluate(() => {
				$(document.body).append(`<div class="allow-create" id="allow-create-1"></div>`)
			})
			await expect(page).toMatchElement('div#allow-create-1')
		})
		test('handle synchronous actions', async () => {
			await page.evaluate(() => {
				$(document.body).append(`<div class="prevent-create" id="prevent-create-2"></div><div class="prevent-create" id="prevent-create-3"></div>`)
			})
			await expect(page).not.toMatchElement('div#prevent-create-2')
			await expect(page).not.toMatchElement('div#prevent-create-3')
		})
	})
})