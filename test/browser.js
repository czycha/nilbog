var Nilbog = require('../dist/')

function ready(fn) {
  if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

ready(function () {
  var nilbog = new Nilbog(true);
  nilbog.preventDelete('.prevent-delete')

  nilbog.preventCreate('.prevent-create')

  nilbog.protectText('.protect-text')

  nilbog.freeze('.freeze')

  nilbog.protectClasses('#protect-classes--default')
  nilbog.protectClasses('#protect-classes--allow-most', {
    rules: {
      allow: true,
      prevent: {
        create: ['class-d'],
        delete: ['class-a']
      }
    }
  })
  nilbog.protectClasses('#protect-classes--prevent-most', {
    rules: {
      prevent: true,
      allow: {
        create: ['class-d', 'class-b'], // Won't be able to delete class-d
        delete: ['class-a', 'class-b']  // Won't be able to recreate class-a
      }
    }
  })
  nilbog.protectClasses('#protect-classes--conflict', {
    rules: {
      allow: true,
      prevent: {
        create: ['class-d', 'class-e'],
        delete: ['class-a']
      }
    }
  })
  nilbog.protectClasses('#protect-classes--conflict', {
    rules: {
      allow: true,
      prevent: {
        create: ['class-d', 'class-f'],
        delete: ['class-a', 'class-b']
      }
    }
  })

  nilbog.protectAttributes('.protect-attributes--default')
  nilbog.protectAttributes('.protect-attributes--allow-most', {
    rules: {
      allow: true,
      prevent: {
        create: ['attr4'],
        delete: ['attr1'],
        modify: ['attr2']
      }
    }
  })
  nilbog.protectAttributes('.protect-attributes--prevent-most', {
    rules: {
      prevent: true,
      allow: {
        create: ['attr4', 'attr3'],
        delete: ['attr1', 'attr3'],
        modify: ['attr2']
      }
    }
  })
  nilbog.protectAttributes('.protect-attributes--conflict', {
    rules: {
      allow: true,
      prevent: {
        create: ['attr4', 'attr5'],
        delete: ['attr1'],
        modify: ['attr2']
      }
    }
  })
  nilbog.protectAttributes('.protect-attributes--conflict', {
    rules: {
      allow: true,
      prevent: {
        create: ['attr4', 'attr6'],
        delete: ['attr1', 'attr2'],
        modify: ['attr2']
      }
    }
  })

  // Should retain events on recreate
  document.querySelectorAll('.prevent-delete').forEach(function (el) {
    el.addEventListener('click', function () {
      console.log('Click event')
    });
  });

  function create() {
    var created = document.createElement('div')
    var createdText = document.createTextNode('Created')
    created.classList.add('prevent-create')
    created.appendChild(createdText)
    console.log('Appending child:', created)
    document.body.appendChild(created)
  }
  create()
  setInterval(create, 30000)
});