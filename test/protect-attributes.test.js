const checkAttrs = async (selector) => {
  const attrs = await page.$eval(selector, (a) => ({
    attributes: Array.from(a.attributes)
      .reduce((acc, { name, value }) => {
        acc[name] = value
        return acc
      }, {}),
    shouldAlwaysBeExactly: $(a).data('should-always-be-exactly'),
    shouldAlwaysHave: $(a).data('should-always-have'),
    shouldNeverHave: $(a).data('should-never-have'),
    shouldAlwaysEqual: $(a).data('should-always-equal')
  }))
  if (attrs.shouldAlwaysBeExactly !== undefined) { expect(attrs.attributes).toEqual(attrs.shouldAlwaysBeExactly) }
  if (attrs.shouldAlwaysHave !== undefined) { expect(Array.from(Object.keys(attrs.attributes))).toEqual(expect.arrayContaining(attrs.shouldAlwaysHave)) }
  if (attrs.shouldNeverHave !== undefined) { expect(Array.from(Object.keys(attrs.attributes))).not.toEqual(expect.arrayContaining(attrs.shouldNeverHave)) }
  if (attrs.shouldAlwaysEqual !== undefined) { expect(attrs.attributes).toEqual(expect.objectContaining(attrs.shouldAlwaysEqual)) }
  return attrs
}

describe('Nilbog#protectAttributes', () => {
  const selector = '.protect-attributes'
  describe('default: prevent all creation, deletion, modification', () => {
    beforeAll(async () => {
      await navigate(PATHS.blank)
      await page.evaluate(() => {
        $(document.body).append(
          `<div class="protect-attributes" attr1="a" attr2="b" attr3="c" hidden></div>`
        )
        $('.protect-attributes').data('should-always-be-exactly', {
          class: 'protect-attributes', // Not protected
          attr1: 'a',
          attr2: 'b',
          attr3: 'c',
          hidden: ''
        })
        nilbog.protectAttributes('.protect-attributes')
      })
    })
    test('initial state', async () => {
      await checkAttrs(selector)
    })
    test('prevent creation', async () => {
      await page.$eval(selector, (a) => {
        $(a).attr('attr4', 'd')
      })
      await checkAttrs(selector)
    })
    test('prevent deletion', async () => {
      await page.$eval(selector, (a) => {
        $(a).removeAttr('attr1')
      })
      await checkAttrs(selector)
    })
    test('prevent modification', async () => {
      await page.$eval(selector, (a) => {
        $(a).attr('attr1', 'modified')
      })
      await checkAttrs(selector)
    })
    test('handle sequential actions', async () => {
      await page.$eval(selector, (a) => {
        const $a = $(a)
        $a.attr('attr1', 'modified')
        $a.attr('attr1', 'modified again')
        $a.removeAttr('attr2')
        $a.attr('attr2', 'added')
        $a.attr('attr4', 'd')
        $a.attr('attr4', 'dd')
        $a.attr('hidden', false)
        $a.removeAttr('hidden')
      })
      await checkAttrs(selector)
    })
  })
  describe('allow most: allow everything with exceptions', () => {
    beforeAll(async () => {
      await navigate(PATHS.blank)
      await page.evaluate(() => {
        $(document.body).append(
          `<div class="protect-attributes" attr1="a" attr2="b" attr3="c" hidden></div>`
        )
        $('.protect-attributes')
          .data('should-always-have', ['attr1', 'hidden'])
          .data('should-never-have', ['attr4', 'attr5'])
          .data('should-always-equal', { hidden: '' })
        nilbog.protectAttributes('.protect-attributes', {
          rules: {
            allow: true,
            prevent: {
              delete: ['attr1', 'hidden'],
              modify: ['hidden'],
              create: ['attr4', 'attr5']
            }
          }
        })
      })
    })
    test('initial state', async () => {
      await checkAttrs(selector)
    })
    test('allow creation', async () => {
      await page.$eval(selector, (a) => {
        $(a).attr('attr6', 'added')
      })
      const { attributes } = await checkAttrs(selector)
      expect(attributes).toHaveProperty('attr6', 'added')
    })
    test('allow deletion', async () => {
      await page.$eval(selector, (a) => {
        $(a).removeAttr('attr2')
      })
      const { attributes } = await checkAttrs(selector)
      expect(attributes).not.toHaveProperty('attr2')
    })
    test('allow modification', async () => {
      await page.$eval(selector, (a) => {
        $(a).attr('attr3', 'modified')
      })
      const { attributes } = await checkAttrs(selector)
      expect(attributes).toHaveProperty('attr3', 'modified')
    })
    test('prevent creation', async () => {
      await page.$eval(selector, (a) => {
        $(a).attr('attr4', 'added')
      })
      await checkAttrs(selector)
    })
    test('prevent deletion', async () => {
      await page.$eval(selector, (a) => {
        $(a).removeAttr('hidden')
      })
      await checkAttrs(selector)
    })
    test('prevent modification', async () => {
      await page.$eval(selector, (a) => {
        $(a).attr('hidden', 'modified')
      })
      await checkAttrs(selector)
    })
  })
  describe('prevent most: prevent everything with exceptions', () => {
    beforeAll(async () => {
      await navigate(PATHS.blank)
      await page.evaluate(() => {
        $(document.body).append(
          `<div class="protect-attributes" attr1="a" attr2="b" attr3="c" hidden></div>`
        )
        $('.protect-attributes')
          .data('should-always-have', ['attr2', 'attr3'])
          .data('should-always-equal', {
            attr2: 'b',
            attr3: 'c'
          })
        nilbog.protectAttributes('.protect-attributes', {
          rules: {
            prevent: true,
            allow: {
              delete: ['attr1', 'hidden'],
              modify: ['hidden'],
              create: ['attr4', 'attr5']
            }
          }
        })
      })
    })
    test('allow creation', async () => {
      await page.$eval(selector, (a) => {
        $(a).attr('attr4', 'added')
      })
      const { attributes } = await checkAttrs(selector)
      expect(attributes).toHaveProperty('attr4', 'added')
    })
    test('allow deletion', async () => {
      await page.$eval(selector, (a) => {
        $(a).removeAttr('attr1')
      })
      const { attributes } = await checkAttrs(selector)
      expect(attributes).not.toHaveProperty('attr1')
    })
    test('allow modification', async () => {
      await page.$eval(selector, (a) => {
        $(a).attr('hidden', 'modified')
      })
      const { attributes } = await checkAttrs(selector)
      expect(attributes).toHaveProperty('hidden', 'modified')
    })
    test('prevent creation', async () => {
      await page.$eval(selector, (a) => {
        $(a).attr('attr6', 'added')
      })
      const { attributes } = await checkAttrs(selector)
      expect(attributes).not.toHaveProperty('attr6')
    })
    test('prevent deletion', async () => {
      await page.$eval(selector, (a) => {
        $(a).removeAttr('attr2')
      })
      await checkAttrs(selector)
    })
    test('prevent modification', async () => {
      await page.$eval(selector, (a) => {
        $(a).attr('attr3', 'modified')
      })
      await checkAttrs(selector)
    })
  })
  describe('conflicts', () => {
    beforeAll(async () => {
      await navigate(PATHS.blank)
      await page.evaluate(() => {
        $(document.body).append(
          `<div class="protect-attributes" attr1="a" attr2="b" attr3="c" hidden></div>`
        )
        $('.protect-attributes')
          .data('should-always-have', ['attr1', 'attr2'])
          .data('should-always-equal', {
            attr1: 'a',
            hidden: ''
          })
          .data('should-never-have', ['attr4', 'attr5'])
        nilbog.protectAttributes('.protect-attributes', {
          rules: {
            allow: true,
            prevent: {
              delete: ['attr1'],
              modify: ['hidden'],
              create: ['attr4', 'attr5']
            }
          }
        })
        nilbog.protectAttributes('.protect-attributes', {
          rules: {
            allow: true,
            prevent: {
              delete: ['attr1', 'attr2'],
              modify: ['hidden', 'attr1'],
              create: ['attr4']
            }
          }
        })
      })
    })
    test('unshared changes', async () => {
      await page.$eval(selector, (a) => {
        const $a = $(a)
        $a.removeAttr('attr2')
        $a.attr('attr5', 'e')
        $a.attr('attr1', 'modified')
      })
      await checkAttrs(selector)
    })
    test('shared changes', async () => {
      await page.$eval(selector, (a) => {
        const $a = $(a)
        $a.removeAttr('attr1')
        $a.attr('attr4', 'd')
        $a.attr('hidden', 'modified')
      })
      await checkAttrs(selector)
    })
  })
})
