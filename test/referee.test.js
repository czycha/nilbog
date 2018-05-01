import Referee from '../dist/referee'

describe('Referee', () => {
	test('#normalize', () => {
		const t = Referee.normalize(true)
		const f = Referee.normalize(false)
		const m = Referee.normalize({ create: true, modify: ['a'] })
		expect(t.create).toBe(true)
		expect(t.delete).toBe(true)
		expect(t.modify).toBe(true)
		expect(f.create).toEqual([])
		expect(f.delete).toEqual([])
		expect(f.modify).toEqual([])
		expect(m.create).toBe(true)
		expect(m.delete).toEqual([])
		expect(m.modify).toEqual(['a'])
	})

	test('#filter', () => {
		const t = Referee.normalize(true)
		const f = Referee.normalize(false)
		const m = Referee.normalize({ modify: ['a'], create: ['b', 'c'] })
		expect(Referee.filter({ allow: f, prevent: t })).toBeUndefined()  // Watch all
		expect(Referee.filter({ allow: t, prevent: m }).sort()).toEqual(['a', 'b', 'c'])
		expect(Referee.filter({ allow: m, prevent: t })).toBeUndefined()
	})

	test('#deliberate', () => {
		const t = Referee.normalize(true)
		const f = Referee.normalize(false)
		const m = Referee.normalize({ modify: ['a'], create: ['b', 'c'] })
		const ch1 = { added: ['c', 'd'], modified: ['e', 'a'], removed: ['f', 'g', 'h'] }
		expect(Referee.deliberate({ allow: t, prevent: f }, ch1))  // Allow everything, prevent nothing
			.toEqual({ create: [], delete: [], modify: [] })
		expect(Referee.deliberate({ allow: t, prevent: t }, ch1))  // Conflict, do nothing
			.toEqual({ create: [], delete: [], modify: [] })
		expect(Referee.deliberate({ allow: t, prevent: m }, ch1))  // Allow everything, with some exceptions
			.toEqual({ create: ['c'], delete: [], modify: ['a'] })
		expect(Referee.deliberate({ allow: m, prevent: t }, ch1))  // Prevent everything, with some exceptions
			.toEqual({ create: ['d'], delete: ['f', 'g', 'h'], modify: ['e'] })
	})
})
