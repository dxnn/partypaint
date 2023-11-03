const el = document.getElementById.bind(document)
const can = el('cancan')
const ctx = can.getContext('2d', {willReadFrequently: true})
const w = can.width
const h = can.height
const types = new Uint8Array(w*h)
let vals = {party: 1, lift: 0}
let bnum = 0
let loadout = []
let pardfun = noop
let brush

// hey, start here!
// - experiment with second array for choosing effect?
// - party mode: random brush change every ten seconds? presses random buttons? maybe it's a brush? 'surprise me!' brush...
// - multiplayer? how?
// - drawing prompts?
// - it's like a game engine you can plug into a game...

// AUDIO BRUSHES!!!
// no default vals
// highlight brush vals (by action? that could be cool...)
// prolly need a second array... (but could do clear for instead for lightning/miniflood over other things...)
// make up down pynt etc all first class, and brush switch also (change their inputs to be simpler, combine e + v... (eg v.x, v.y...))
// mirror brush
// auto brush
// surprise me brush
// sandbags + sandflood brushes

// when you save the loadout in the png save the current vals also
// if we allow arbitrary brushes in the loadout that opens up security issues:
// - once an image is loaded you have to reload the page to load a new one (to prevent interface highjacking)
// - no localstorage, no twin access creds, etc
// - keep it pure and simple, have a different interface for social aspects, load the viewer as a new window
// - can try using iframes etc but probably not enough

// - maze brush
// - dots brush: syz colour density clustering
// - random syz brush
// - random colour brush
// save brush set + types
// load them as well
// alpha to types for older images

let brushes = [
  { 'name': 'pard paint'
  , 'vals': {syz: 10, hue: 30, sat: 90, lig: 60}
  , 'upup': v => v.syz += 1
  , 'down': v => v.syz -= 1
  , 'left': v => v.hue = (v.hue + 10) % 101
  , 'righ': v => v.lig = (v.lig + 10) % 101
  , 'pynt': v => {ctx.fillStyle = filler(v.hue, v.sat, v.lig, 255); ctx.fillRect(v.x, v.y, v.syz, v.syz)}
  , 'pard': (terms, types, v) => {
              const l = types.length
              for(let i = 0; i < l; i++) {
                let n = i*4
                if(terms[n] || terms[n + 1] || terms[n + 2]) {
                // if(types[0]) { // this doesn't work unless we change the types of everything... (dots etc)
                  terms[n + 0] = (terms[n + 0] + 1) % 256 // red
                  terms[n + 1] = (terms[n + 1] + 1) % 256 // green
                  terms[n + 2] = (terms[n + 2] + 1) % 256 // blue
                }
              }}
  },
  { 'name': 'basic black'
  , 'vals': {syz: 10}
  , 'upup': v => v.syz += 1
  , 'down': v => v.syz -= 1
  , 'pynt': v => {ctx.fillStyle = '#000000'; ctx.fillRect(v.x, v.y, v.syz, v.syz)}
  },
  { 'name': 'eraser'
  , 'vals': {syz: 10}
  , 'upup': v => v.syz += 1
  , 'down': v => v.syz -= 1
  , 'pynt': v => ctx.clearRect(v.x, v.y, v.syz, v.syz)
  },
  { 'name': 'mirror growth'
  , 'vals': {liv: 31, hue: 30, lig: 60}
  , 'upup': v => v.liv += 1
  , 'down': v => v.liv -= 1
  , 'left': v => v.hue = (v.hue + 10) % 101
  , 'righ': v => v.lig = (v.lig + 10) % 101
  , 'pynt': v => { ctx.fillStyle = filler(v.hue, v.sat, v.lig, 255);
                   ctx.fillRect(v.x, v.y, v.syz, v.syz)
                   for(let i=v.y; i<v.y+v.syz; i++)
                     for(let j=v.x; j<v.x+v.syz; j++)
                       types[i + j*w] = 251 // NB. backwards!
                 }
  , 'pard': (terms, types, v) => {
              const l = types.length
              for(let i = 0; i < l; i++) {
                if(types[i] === 251) {
                  let rand = Math.floor(Math.random() * 4)
                  let n = [i - w, i + 1, i + w, i - 1].map(n=>n*4)[rand]
                  if(terms[n + 3] === 0) {
                    terms[n + 0] = (terms[4*i + 0] + 1) % 256 // red
                    terms[n + 1] = (terms[4*i + 1] + 1) % 256 // green
                    terms[n + 2] = (terms[4*i + 2] + 1) % 256 // blue
                    terms[n + 3] =  terms[4*i + 3]
                  }
                }
              }}
  },
  { 'name': 'miniflood'
  , 'vals': {liv: 31, hue: 30, lig: 60}
  , 'upup': v => v.liv += 1
  , 'down': v => v.liv -= 1
  , 'left': v => v.hue = (v.hue + 10) % 101
  , 'righ': v => v.lig = (v.lig + 10) % 101
  , 'pynt': v => {ctx.fillStyle = filler(v.hue, v.sat, v.lig, 255); fillRect(v.x, v.y, v.syz, v.syz, 250)}
  , 'pard': (terms, types, v) => {
              const l = types.length
              for(let i = 0; i < l; i++) {
                if(types[i] === 250) {
                  let rand = Math.floor(Math.random() * 4)
                  let n = [i - w, i + 1, i + w, i - 1].map(n=>n*4)[rand]
                  if(terms[n + 3] === 0) {
                    terms[n + 0] = (terms[4*i + 0] + 1) % 256 // red
                    terms[n + 1] = (terms[4*i + 1] + 1) % 256 // green
                    terms[n + 2] = (terms[4*i + 2] + 1) % 256 // blue
                    terms[n + 3] =  terms[4*i + 3]
                    types[n/4] = 250
                  }
                  if(1 > Math.random() * v.liv/10) {
                    types[n/4] = 255
                  }
                }
              }}
  },
  { 'name': 'floodwaves'
  , 'vals': {syz: 10, hue: 30, lig: 60}
  , 'upup': v => v.syz += 1
  , 'down': v => v.syz -= 1
  , 'left': v => v.hue = (v.hue + 10) % 101
  , 'righ': v => v.lig = (v.lig + 10) % 101
  , 'pynt': v => {ctx.fillStyle = filler(v.hue, v.sat, v.lig, 255); fillRect(v.x, v.y, v.syz, v.syz, 252)}
  , 'pard': (terms, types, v) => {
              const l = types.length
              for(let i = 0; i < l; i++) {
                if(types[i] === 252) {
                  let rand = Math.floor(Math.random() * 4)
                  let n = [i - w, i + 1, i + w, i - 1].map(n=>n*4)[rand]
                  if(terms[n + 3] === 0) {
                    terms[n + 0] = (terms[4*i + 0] + 1) % 256 // red
                    terms[n + 1] = (terms[4*i + 1] + 1) % 256 // green
                    terms[n + 2] = (terms[4*i + 2] + 1) % 256 // blue
                    terms[n + 3] =  terms[4*i + 3]
                    types[n/4] = 252
                  }
                }
              }}
  },
  { 'name': 'lightning like'
  , 'vals': {liv: 31, hue: 30, jmp: 1}
  , 'upup': v => v.liv += 1
  , 'down': v => v.liv -= 1
  , 'left': v => v.hue = (v.hue + 10) % 101
  , 'righ': v => v.jmp = (v.jmp + 1) % 8
  , 'pynt': v => {ctx.fillStyle = filler(v.hue, v.sat, v.lig, 255); ctx.fillRect(v.x, v.y, 1, 1); types[v.y*w+v.x] = 244}
  , 'pard': (terms, types, v) => {
              const l = types.length
              for(let i = 0; i < l; i++) {
                if(types[i] === 244) {
                  ;[-1,0,1].forEach(j => {
                    if(Math.random() < 1/vals.liv*10 && terms.length >= 4*(i+w+j+1)) {
                      let rand = Math.floor(Math.random() * 3)
                      terms.set(terms.slice(4*i,4*(i+1)), 4*(i+w+j))
                      terms[4*(i+w+j) + rand] += j*vals.jmp
                      types[i+w+j] = 244
                    }
                  })
                  types[i] = 255
                }
              }}
  },
  { 'name': 'confetti'
  , 'vals': {syz: 10, hue: 30, sat: 90}
  , 'upup': v => v.syz += 1
  , 'down': v => v.syz -= 1
  , 'left': v => v.hue = (v.hue + 10) % 101
  , 'righ': v => v.sat = (v.sat + 10) % 101
  , 'pynt': v => { ctx.fillStyle = filler(v.hue, v.sat, v.lig, 255)
                   let circle = new Path2D()
                   circle.arc(v.x + Math.random()*360 - 180, v.y + Math.random()*360 - 180, v.syz, 0, 2 * Math.PI)
                   ctx.fill(circle)
                 }
  },
  { 'name': 'randosize'
  , 'vals': {smw: 90, zwm: 20, jmp: 10, dir: 1}
  , 'upup': v => v.smw = (v.smw + 1) % 101
  , 'down': v => v.smw = (v.smw - 1) % 101
  , 'left': v => v.zwm = (v.zwm + 1) % 101
  , 'righ': v => v.jmp = (v.jmp + 10) % 101
  , 'pynt': v => v
  , 'pard': (terms, types, v) => {
              if(v.zwm > rand(100)) {
                v.dir = v.syz < 2 ? 1 : v.syz > 300 ? -1 : v.dir
                v.syz = Math.abs(v.syz + Math.floor((v.jmp/5) * (v.smw > rand(100) ? v.dir : (v.dir = Math.floor(rand(3))-1)))) % 300
              }
            }
  },
]


document.addEventListener('keydown', e => {
  // THINK: maybe switch to looping while keydown, for consistent velocity regardless of keyboard repeat?
  //        this might also allow polyphony...
  //        could tweak polyphony knobs with a different brush, to eg alter the repeat rates of arrows
  if(e.code === 'ArrowUp' || e.code === 'KeyW') {
    brush?.upup?.(vals)
  }
  if(e.code === 'ArrowDown' || e.code === 'KeyS') {
    brush?.down?.(vals)
  }
  if(e.code === 'ArrowLeft' || e.code === 'KeyA') {
    brush?.left?.(vals)
  }
  if(e.code === 'ArrowRight' || e.code === 'KeyD') {
    brush?.righ?.(vals)
  }
  if(e.code === 'Space') {
    vals.lift = (vals.lift + 1) % 2
  }
  if(e.code === 'KeyP') {
    vals.party = (vals.party + 1) % 2
  }
  if(e.code === 'KeyQ') {
    bnum = rem(bnum - 1, loadout.length)
    brush = loadout[bnum]
  }
  if(e.code === 'KeyE') {
    bnum = (bnum + 1) % loadout.length
    brush = loadout[bnum]
  }

  if(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code))
    e.preventDefault()

  show_mode()
})

can.addEventListener('mousemove', e => {
  if(vals.lift === 0) {
    vals.x = e.offsetX
    vals.y = e.offsetY // THINK: anything else we should grab?
    brush.pynt(vals)
  }
})

function partypaint() {
  if(vals.party) {
    const imageData = ctx.getImageData(0, 0, w, h)
    const terms = imageData.data
    loadout.forEach(b => b.pard ? b.pard(terms, types, vals) : 0)
    ctx.putImageData(imageData, 0, 0)
  }
}

function noop() {}
function par(f, g) {return (a,b,c,d) => {f(a,b,c,d); g(a,b,c,d)}} // faster than variadic version... /shrug
function rem(n, r) { return (n % r + r) % r }
function rand(n) {return Math.random() * n}
function clear(v) {ctx.clearRect(v.x, v.y, v.syz, v.syz)}
function fillRect(x, y, sw, sh, type) {
  ctx.fillRect(x, y, sw, sh)
  for(let i=y; i<y+sh; i++)
    for(let j=x; j<x+sw; j++)
      types[i*w + j] = type
}

function filler(h, s, l, a) { // 0 - 100, 0-255
  return `hsl(${h * 3.6}, ${s}%, ${l}%, ${a/255})`
}


function show_brushes() {
  let sel = el('options')
  sel.innerHTML = '<option>Add a brush</option>' + brushes.map(b => `<option>${b.name}</option>`).join('')
}

function show_mode() {
  el('mode').innerHTML  = `${vals.lift&&'invisible'||''} ${vals.party&&'PARTY!!!'||''} ${brush.name} :: `
  for(k in vals)
    if(!['party', 'lift', 'x', 'y'].includes(k))
      el('mode').innerHTML += `${vals[k]}${k} `
}

function set_loadout() {
  pardfun = noop
  el('loaded').innerHTML = ''

  if(!loadout.length)
    loadout = brushes.slice(0,5)

  for(let b = 0; b < loadout.length; b++) {
    let brush = loadout[b]
    if(brush.pard)
      pardfun = pardfun === noop ? brush.pard : par(pardfun, brush.pard)
    if(brush.vals)
      vals = {...brush.vals, ...vals}
    el('loaded').innerHTML += `<span class="loaded" fwump="${b}" style="color: hsl(${[...brush.name].map(c=>c.charCodeAt(0)-90).reduce((acc,n)=>acc+n*7,0)}, 80%, 50%)">${brush.name}</span>`
  }
  if(!brush)
    brush = loadout[0]
  show_mode()
}

function add_brush(e) {
  let index = +el('options').selectedIndex - 1
  loadout.push(brushes[index])
  set_loadout()
  el('options').selectedIndex = 0
  el('options').blur()
}

function rm_brush(e) {
  if(e.target.className !== 'loaded') return
  let i = +e.target.attributes.fwump?.value
  loadout.splice(i,1)
  set_loadout()
}


function chunker(arrayBuffer) {
  let arr = new Uint8Array(arrayBuffer)
  let cs = getChunks(arr)
  return cs
}

function add_my_chunk(cs) {
  let iend = cs.pop()
  let profile_chunk = {chunkType: 'paRd', data: slam_obj({types, loadout: trick(loadout)})}
  cs.push(profile_chunk)
  cs.push(iend)
  return cs
}

function slam_obj(o) {
  return JSON.stringify(o).split('').map(c=>c.charCodeAt())
}

function trick(a) {
  return a.map(o => Object.entries(o).map(p => typeof p[1] === 'function' ? [p[0], ''+p[1]] : p).reduce((acc, [k, v])=> {acc[k]=v; return acc}, {}))
}

function save() {
  can.toBlob(async function(blob) {
    let buff = await blob.arrayBuffer()
    let cs = chunker(buff)
    let css = add_my_chunk(cs) // this is huge, maybe pack 'types' into a png also???
    let uint = toPNG(css)
    let blob2 = new Blob([uint])
    let url  = URL.createObjectURL(blob2)
    el('hiddensaver').setAttribute('href', url);
    el('hiddensaver').click()
  });
}

function load(t) {
  let file = t.srcElement.files?.[0]
  if(!file) return
  ctx.clearRect(0, 0, w, h)
  let img = new Image()
  img.src = URL.createObjectURL(file)
  // but also pluck out the extra png metadata
  img.onload = _ => ctx.drawImage(img, 0, 0)
  el('import').blur()
}


function go(f) {
  requestAnimationFrame(t => {
    f()
    go(f)
    show_mode()
  })
}

function init() {
  set_loadout()
  show_brushes()
  show_mode()
  go(partypaint)
}

el('export').addEventListener('click', save)
el('import').addEventListener('change', load)
el('options').addEventListener('change', add_brush)
el('loaded').addEventListener('click', rm_brush)

init()


function timing() {
  let now = performance.now()
  partypaint()
  console.log(performance.now() - now)
}