describe('Nilbog#protectText', () => {
	beforeAll(async () => {
		await navigate(PATHS.blank)
		await page.evaluate(() => {
			nilbog.protectText('.protect-text')
		})
	})
	describe('on text content', () => {
		const selector = '#on-text-node'
		const checkText = async () => {
			const text = await page.$eval(selector, (a) => {
				return a.innerText
			})
			expect(text).toEqual('123456')
			return text
		}
		beforeAll(async () => {
			await page.evaluate(() => {
				$(document.body).append(`<div class="protect-text" id="on-text-node">123456</div>`)
			})
		})
		test('initial state', async () => {
			await checkText()
		})
		test('modified', async () => {
			await page.$eval(selector, (a) => {
				a.childNodes[0].textContent = 'modified'
			})
			await checkText()
		})
		test('delete', async () => {
			await page.$eval(selector, (a) => {
				a.childNodes[0].textContent = ''
			})
			await checkText()
		})
		test('handle sequential actions', async () => {
			await page.$eval(selector, (a) => {
				a.childNodes[0].textContent = 'modified'
				a.childNodes[0].textContent = 'modified again'
			})
			await checkText()
		})
	})
	describe('on innerText', () => {
		const selector = '#on-inner-text'
		const checkText = async () => {
			const text = await page.$eval(selector, (a) => {
				return a.innerText
			})
			expect(text).toEqual('123456')
		}
		beforeAll(async () => {
			await page.evaluate(() => {
				$(document.body).append(`<div class="protect-text" id="on-inner-text">123456</div>`)
			})
		})
		test('initial state', async () => {
			await checkText()
		})
		test('change', async () => {
			await page.$eval(selector, (a) => {
				a.innerText = '654321'
			})
			await checkText()
		})
		test('delete', async () => {
			await page.$eval(selector, (a) => {
				a.innerText = ''
			})
			await checkText()
		})
		test('handle sequential actions', async () => {
			await page.$eval(selector, (a) => {
				a.innerText = 'modified'
				a.innerText = 'modified again'
			})
			await checkText()
		})
	})
})