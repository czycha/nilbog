import Nilbog from './index'

function ready (fn) {
  if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

ready(() => {
  document.querySelectorAll('.keep').forEach((el) => {
    el.addEventListener('click', function () { console.log('a') })
  })
  Nilbog.preventDelete('.keep')
  Nilbog.protectText('.text')
  Nilbog.protectAttributes('.attr')
  Nilbog.preventCreate('.created')
  Nilbog.all('.freeze')
  Nilbog.protectClasses('div')

  function create () {
    var created = document.createElement('div')
    var createdText = document.createTextNode('Created')
    created.classList.add('created')
    created.appendChild(createdText)
    console.log('Appending child:', created)
    document.body.appendChild(created)
  }
  setInterval(create, 30000)
})
