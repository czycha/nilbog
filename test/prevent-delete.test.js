describe('Nilbog#preventDelete', () => {
	describe('direct deletion', () => {
		const testDelete = async (selector) => {
			await page.$eval(selector, (a) => {
				a.remove()
			})
			await expect(page).toMatchElement(selector)
		}
		beforeEach(async () => {
			await navigate(PATHS.blank)
			await page.evaluate(() => {
				nilbog.preventDelete('.prevent-delete')
				$(document.body).append(
					`<div class="deep" id="level-1">
						<div class="deep id="level-2">
							<div class="prevent-delete" id="before"></div>
							<div class="deep" id="level-3-1">
								<div class="prevent-delete" id="only"></div>
							</div>
							<div class="deep" id="level-3-2">
								<div class="prevent-delete siblings" id="sibling-1"></div>
								<div class="prevent-delete siblings" id="sibling-2"></div>
							</div>
						</div>
						<div class="prevent-delete" id="after"></div>
					</div>`
				)
			})
		})
		test('initial state', async () => {
			await expect(page).toMatchElement('#before')
			await expect(page).toMatchElement('#only')
			await expect(page).toMatchElement('#after')
			await expect(page).toMatchElement('#sibling-1')
			await expect(page).toMatchElement('#sibling-2')
		})
		test('only child', async () => {
			await testDelete('#only')
		})
		test('beginning of parent', async () => {
			await testDelete('#before')
		})
		test('end of parent', async () => {
			await testDelete('#after')
		})
		test('handle synchronous actions', async () => {
			await page.evaluate(() => {
				$('.siblings').remove()
			})
			await expect(page).toMatchElement('#sibling-1')
			await expect(page).toMatchElement('#sibling-2')
		})
	})
	describe('indirect deletion', () => {
		beforeEach(async () => {
			await navigate(PATHS.blank)
			await page.evaluate(() => {
				$(document.body).append(
					`<div id="level-0">
						<div class="irrelevant" id="irrelevant-before"></div>
						<div class="deep" id="level-1">
							<div class="irrelevant"></div>
							<div class="deep" id="level-2">
								<div class="prevent-delete" id="before"></div>
								<div class="irrelevant"></div>
								<div class="deep" id="level-3-1">
									<div class="prevent-delete" id="only"></div>
								</div>
								<div class="irrelevant"><div class="irrelevant">irrelevant</div></div>
								<div class="deep" id="level-3-2">
									<div class="prevent-delete siblings" id="sibling-1"></div>
									<div class="prevent-delete siblings" id="sibling-2"></div>
								</div>
							</div>
							<div class="irrelevant"></div>
							<div class="prevent-delete" id="after"></div>
						</div>
						<div class="irrelevant" id="irrelevant-after"></div>
					</div>`
				)
			})
		})
		test('initial state', async () => {
			await expect(page).toMatchElement('#level-1 > .irrelevant')
			await expect(page).toMatchElement('#level-1 > #level-2')
			await expect(page).toMatchElement('#level-1 > #level-2 > #before')
			await expect(page).toMatchElement('#level-1 > #level-2 > .irrelevant')
			await expect(page).toMatchElement('#level-1 > #level-2 > #level-3-1')
			await expect(page).toMatchElement('#level-1 > #level-2 > #level-3-1 > #only')
			await expect(page).toMatchElement('#level-1 > #level-2 > .irrelevant > .irrelevant')
			await expect(page).toMatchElement('#level-1 > #level-2 > #level-3-2')
			await expect(page).toMatchElement('#level-1 > #level-2 > #level-3-2 > #sibling-1')
			await expect(page).toMatchElement('#level-1 > #level-2 > #level-3-2 > #sibling-2')
			await expect(page).toMatchElement('#level-1 > #after')
		})
		test('onTreeDeletion = false', async () => {
			await page.evaluate(() => {
				nilbog.preventDelete('.prevent-delete', { onTreeDeletion: false })
				$('#level-1').remove()
			})
			await expect(page).not.toMatchElement('.prevent-delete')
		})
		test('onTreeDeletion = place-at-top-level', async () => {
			await page.evaluate(() => {
				nilbog.preventDelete('.prevent-delete', { onTreeDeletion: 'place-at-top-level' })
				$('#level-1').remove()
			})
			await expect(page).not.toMatchElement('.deep')
			const survivors = await page.evaluate(() => {
				const map = []
				$('#level-0').children().each((el) => {
					map.push($(el).attr('id'))
				})
				return map
			})
			expect(survivors).toEqual([
				'irrelevant-before',
				'before',
				'only',
				'sibling-1',
				'sibling-2',
				'after',
				'irrelevant-after'
			])
		})
		test('onTreeDeletion = recreate-direct-path', async () => {
			await page.evaluate(() => {
				nilbog.preventDelete('.prevent-delete', { onTreeDeletion: 'recreate-direct-path' })
				$('#level-1').remove()
			})
			await expect(page).not.toMatchElement('#level-1 .irrelevant')
			await expect(page).toMatchElement('#level-1 > #level-2')
			await expect(page).toMatchElement('#level-1 > #level-2 > #before')
			await expect(page).toMatchElement('#level-1 > #level-2 > #level-3-1')
			await expect(page).toMatchElement('#level-1 > #level-2 > #level-3-1 > #only')
			await expect(page).toMatchElement('#level-1 > #level-2 > #level-3-2')
			await expect(page).toMatchElement('#level-1 > #level-2 > #level-3-2 > #sibling-1')
			await expect(page).toMatchElement('#level-1 > #level-2 > #level-3-2 > #sibling-2')
			await expect(page).toMatchElement('#level-1 > #after')
		})
		test('onTreeDeletion = recreate-full-tree', async () => {
			await page.evaluate(() => {
				nilbog.preventDelete('.prevent-delete', { onTreeDeletion: 'recreate-full-tree' })
				$('#level-1').remove()
			})
			await expect(page).toMatchElement('#level-1 > .irrelevant')
			await expect(page).toMatchElement('#level-1 > #level-2')
			await expect(page).toMatchElement('#level-1 > #level-2 > #before')
			await expect(page).toMatchElement('#level-1 > #level-2 > .irrelevant')
			await expect(page).toMatchElement('#level-1 > #level-2 > #level-3-1')
			await expect(page).toMatchElement('#level-1 > #level-2 > #level-3-1 > #only')
			await expect(page).toMatchElement('#level-1 > #level-2 > .irrelevant > .irrelevant')
			await expect(page).toMatchElement('#level-1 > #level-2 > #level-3-2')
			await expect(page).toMatchElement('#level-1 > #level-2 > #level-3-2 > #sibling-1')
			await expect(page).toMatchElement('#level-1 > #level-2 > #level-3-2 > #sibling-2')
			await expect(page).toMatchElement('#level-1 > #after')
		})
		test('reject invalid onTreeDeletion', async () => {
			const error = await page.evaluate(() => {
				try {
					nilbog.preventDelete('.prevent-delete', { onTreeDeletion: 'something' })
					return false
				} catch (e) {
					return e
				}
			})
			expect(error).not.toBeFalsy()
		})
	})
})