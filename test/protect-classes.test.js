const checkClasses = async (selector) => {
	const classes = await page.$eval(selector, (a) => ({
		classList: Array.from(a.classList),
		shouldAlwaysBe: $(a).data('should-always-be'),
		shouldAlwaysHave: $(a).data('should-always-have'),
		shouldNeverHave: $(a).data('should-never-have')
	}))
	if(classes.shouldAlwaysBe !== undefined)
		unorderedMatch(classes.classList, classes.shouldAlwaysBe)
	if(classes.shouldAlwaysHave !== undefined)
		expect(classes.classList).toEqual(expect.arrayContaining(classes.shouldAlwaysHave))
	if(classes.shouldNeverHave !== undefined)
		expect(classes.classList).not.toEqual(expect.arrayContaining(classes.shouldNeverHave))
	return classes
}

describe('Nilbog#protectClasses', () => {
	const selector = '#protect-classes'
	describe('default: prevent all creation, prevent all deletion', () => {
		beforeAll(async () => {
			await navigate(PATHS.blank)
			await page.evaluate(() => {
				$(document.body).append(
					`<div id="protect-classes" class="protect-classes class-a class-b class-c"></div>`
				)
				$('#protect-classes').data('should-always-be', ["protect-classes", "class-a", "class-b", "class-c"])
				nilbog.protectClasses('#protect-classes')
			})
		})
		test('initial state', async () => {
			await checkClasses(selector)
		})
		test('prevent creation', async () => {
			await page.$eval(selector, (a) => {
				a.classList.add('class-dddd')
			})
			await checkClasses(selector)
		})
		test('prevent deletion', async () => {
			await page.$eval(selector, (a) => {
				a.classList.remove('class-a')
			})
			await checkClasses(selector)
		})
		test('handle synchronous actions', async () => {
			await page.$eval(selector, (a) => {
				a.classList.remove('class-a')
				a.classList.add('class-dddd')
				a.classList.add('class-eeee')
				a.classList.remove('class-b')
			})
			await checkClasses(selector)
		})
	})
	describe('allow most: allow everything with exceptions', () => {
		beforeAll(async () => {
			await navigate(PATHS.blank)
			await page.evaluate(() => {
				$(document.body).append(
					`<div id="protect-classes" class="protect-classes class-a class-b class-c"></div>`
				)
				const alwaysHave = ["class-a", "class-b"]
				const neverHave = ["class-dddd", "class-eeee"]
				$('#protect-classes')
					.data('should-always-have', alwaysHave)
					.data('should-never-have', neverHave)
				nilbog.protectClasses('#protect-classes', {
					rules: {
						allow: true,
						prevent: {
							create: neverHave,
							delete: alwaysHave
						}
					}
				})
			})
		})
		test('initial state', async () => {
			await checkClasses(selector)
		})
		test('prevent creation', async () => {
			await page.$eval(selector, (a) => {
				a.classList.add('class-dddd')
			})
			await checkClasses(selector)
		})
		test('prevent deletion', async () => {
			await page.$eval(selector, (a) => {
				a.classList.remove('class-a')
			})
			await checkClasses(selector)
		})
		test('allow creation', async () => {
			await page.$eval(selector, (a) => {
				a.classList.add('class-zzzz')
			})
			const { classList } = await checkClasses(selector)
			expect(classList).toContain('class-zzzz')
		})
		test('allow deletion', async () => {
			await page.$eval(selector, (a) => {
				a.classList.remove('class-c')
			})
			const { classList } = await checkClasses(selector)
			expect(classList).not.toContain('class-c')
		})
	})
	describe('prevent most: prevent everything with exceptions', () => {
		beforeAll(async () => {
			await navigate(PATHS.blank)
			await page.evaluate(() => {
				$(document.body).append(
					`<div id="protect-classes" class="protect-classes class-a class-b class-c"></div>`
				)
				$('#protect-classes').data('should-always-have', ['protect-classes', 'class-a', 'class-b'])
				nilbog.protectClasses('#protect-classes', {
					rules: {
						prevent: true,
						allow: {
							create: ['class-dddd', 'class-c'],
							delete: ['class-dddd', 'class-c']
						}
					}
				})
			})
		})
		test('initial state', async () => {
			await checkClasses(selector)
		})
		test('allow creation', async () => {
			await page.$eval(selector, (a) => {
				a.classList.add('class-dddd')
			})
			const { classList } = await checkClasses(selector)
			expect(classList).toContain('class-dddd')
		})
		test('allow deletion', async () => {
			await page.$eval(selector, (a) => {
				a.classList.remove('class-c')
			})
			const { classList } = await checkClasses(selector)
			expect(classList).not.toContain('class-c')
		})
		test('prevent creation', async () => {
			await page.$eval(selector, (a) => {
				a.classList.add('class-yyyy')
			})
			const { classList } = await checkClasses(selector)
			expect(classList).not.toContain('class-yyyy')
		})
		test('prevent deletion', async () => {
			await page.$eval(selector, (a) => {
				a.classList.remove('class-a')
			})
			await checkClasses(selector)
		})
	})
	describe('conflicts', () => {
		beforeAll(async () => {
			await navigate(PATHS.blank)
			await page.evaluate(() => {
				$(document.body).append(
					`<div id="protect-classes" class="protect-classes class-a class-b class-c"></div>`
				)
				const alwaysHave = ['class-a', 'class-b']
				const neverHave = ['class-d', 'class-e']
				$('#protect-classes')
					.data('should-always-have', alwaysHave)
					.data('should-never-have', neverHave)
				nilbog.protectClasses('#protect-classes', {
					rules: {
						allow: true,
						prevent: {
							create: ['class-d', 'class-e'],
							delete: ['class-a']
						}
					}
				})
				nilbog.protectClasses('#protect-classes', {
					rules: {
						allow: true,
						prevent: {
							create: ['class-d', 'class-f'],
							delete: ['class-a', 'class-b']
						}
					}
				})
			})
		})
		test('unshared changes', async () => {
			await page.$eval(selector, (a) => {
				a.classList.remove('class-b')
				a.classList.add('class-e')
			})
			await checkClasses(selector)
		})
		test('shared changes', async () => {
			await page.$eval(selector, (a) => {
				a.classList.add('class-d')
				a.classList.remove('class-a')
			})
			await checkClasses(selector)
		})
	})
})