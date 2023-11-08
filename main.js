//   .-------.   ____   .-------.,---------. ____     __         .-------.   ____   .-./`),---.   .--,---------.
//   \  _(`)_ \.'  __ `.|  _ _   \          \\   \   /  /        \  _(`)_ \.'  __ `.\ .-.'|    \  |  \          \
//   | (_ o._)/   '  \  | ( ' )  |`--.  ,---' \  _. /  '         | (_ o._)/   '  \  / `-' |  ,  \ |  |`--.  ,---'
//   |  (_,_) |___|  /  |(_ o _) /   |   \     _( )_ .'          |  (_,_) |___|  /  |`-'`"|  |\_ \|  |   |   \
//   |   '-.-'   _.-`   | (_,_).' __ :_ _: ___(_ o _)'           |   '-.-'   _.-`   |.---.|  _( )_\  |   :_ _:
//   |   |    .'   _    |  |\ \  |  |(_I_)|   |(_,_)'            |   |    .'   _    ||   || (_ o _)  |   (_I_)
//   |   |    |  _( )_  |  | \ `'   (_(=)_|   `-'  /             |   |    |  _( )_  ||   ||  (_,_)\  |  (_(=)_)
//   /   )    \ (_ o _) |  |  \    / (_I_) \      /              /   )    \ (_ o _) /|   ||  |    |  |   (_I_)
//   `---'     '.(_,_).'''-'   `'-'  '---'  `-..-'               `---'     '.(_,_).' '---''--'    '--'   '---'

const el = document.getElementById.bind(document)
const can = el('cancan')
const ctx = can.getContext('2d', {willReadFrequently: true})
const w = can.width
const h = can.height
let types = new Uint8Array(w*h)
let vals = {party: 1, lift: 0}
let bnum = 0
let keymap = {}
let loadout = []
let brush

// hey, start here!
// - save/load full brushes!
// - paint the brush!
// - maybe tweak floodwaves so it's like it used to be?
// - toda file connection...
// - noisemaker brush that just randomly changes pixels...

// party mode: random brush change every ten seconds? presses random buttons? maybe it's a brush? 'surprise me!' brush...
// multiplayer? how?
// drawing prompts?
// it's like a game engine you can plug into a game...

// AUDIO BRUSHES!!!
// highlight brush vals (by action? that could be cool...)
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

// maze brush
// dots brush: syz colour density clustering
// random colour brush
// save brush set + types
// load them as well
// alpha to types for older images

// THINK: the current setup is fairly universal (pard is called once per tick, and brushes can do whatever they want with that)
//        and much faster than the interleaved version, but it loses the compositional style of pixel-by-pixel brush stacking...


document.addEventListener('keydown', e => {
  keymap[e.code] = 1

  if(keymap['Space']) {
    vals.lift = (vals.lift + 1) % 2
  }
  if(keymap['KeyP']) {
    vals.party = (vals.party + 1) % 2
  }
  if(keymap['KeyQ']) {
    bnum = rem(bnum - 1, loadout.length)
    brush = loadout[bnum]
  }
  if(keymap['KeyE']) {
    bnum = (bnum + 1) % loadout.length
    brush = loadout[bnum]
  }

  if(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code))
    e.preventDefault()
})

document.addEventListener('keyup', e => {
  keymap[e.code] = 0
})

function keystuff() {
  if(keymap['ArrowUp'] || keymap['KeyW']) {
    brush?.upup?.(vals)
  }
  if(keymap['ArrowDown'] || keymap['KeyS']) {
    brush?.down?.(vals)
  }
  if(keymap['ArrowLeft'] || keymap['KeyA']) {
    brush?.left?.(vals)
  }
  if(keymap['ArrowRight'] || keymap['KeyD']) {
    brush?.rite?.(vals)
  }

  show_mode()
}

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
    loadout.forEach(b => b.post ? b.post(vals) : 0)
  }
}

function noop() {}
function par(f, g) {return (a,b,c,d) => {f(a,b,c,d); g(a,b,c,d)}} // faster than variadic version... /shrug
function rem(n, r) { return (n % r + r) % r }
function rand(n) {return Math.floor(Math.random() * n)}
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
  el('mode').innerHTML  = `${vals.lift&&'invisible'||''} ${vals.party&&'PARTY!!!'||''} <b>${brush.name}</b> :: `
  for(k in vals)
    if(!['party', 'lift', 'x', 'y'].includes(k))
      el('mode').innerHTML += `<span class="${Object.entries(trick(brush)).reduce((acc, [key,v]) => v?.includes?.(k) ? acc + ' ' + key : acc, '')}">${vals[k]}${k}</span> `
}

function set_loadout() {
  el('loaded').innerHTML = ''

  if(!loadout.length)
    loadout = brushes.slice(0,5)

  for(let b = 0; b < loadout.length; b++) {
    let brush = loadout[b]
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

function add_my_chunks(cs) {
  let iend = cs.pop()
  // THINK: consider packing types into a png to compact it...
  let types_chunk = {chunkType: 'prDy', data: types}
  let brush_chunk = {chunkType: 'paRd', data: slam_obj({vals, bnum, loadout: munge_loadout(loadout)})}
  cs.push(types_chunk)
  cs.push(brush_chunk)
  cs.push(iend)
  return cs
}

function munge_loadout(l) {
  let bnames = brushes.map(b => b.name)
  return l.map(b => bnames.includes(b.name) ? b.name : trick(b))
}

function unmunge_loadout(l) {
  let bnames = brushes.map(b => b.name)
  return l.map(b => brushes[bnames.indexOf(b)] || untrick(b))
}

function slam_obj(o) {
  return JSON.stringify(o).split('').map(c=>c.charCodeAt())
}

function trick(o) {
  return Object.entries(o).map(p => typeof p[1] === 'function' ? [p[0], ''+p[1]] : p).reduce((acc, [k, v])=> {acc[k]=v; return acc}, {})
}

function untrick(o) {
  return Object.entries(o).map(p => typeof p[1] === 'function' ? [p[0], ''+p[1]] : p).reduce((acc, [k, v])=> {acc[k]=v; return acc}, {})
}

function save() {
  can.toBlob(async function(blob) {
    let buff = await blob.arrayBuffer()
    let cs = chunker(buff)
    let css = add_my_chunks(cs)
    let uint = toPNG(css)
    let blob2 = new Blob([uint])
    let url  = URL.createObjectURL(blob2)
    el('hiddensaver').setAttribute('href', url);
    el('hiddensaver').click()
  });
}

async function load(t) {
  let file = t.srcElement.files?.[0]
  if(!file) return
  ctx.clearRect(0, 0, w, h)
  let img = new Image()
  img.src = URL.createObjectURL(file)

  // import types
  let arr = new Uint8Array(await file.arrayBuffer())
  let cs = getChunks(arr)
  let types_chunk = find_first_chunk(cs, 'prDy')
  if(types_chunk)
    types = types_chunk.data

  // import vals, bnum and loadout
  let brush_chunk = find_first_chunk(cs, 'paRd')
  let pickles = unslam(brush_chunk?.data)
  if (pickles) {
    vals = pickles.vals
    bnum = pickles.bnum
    loadout = unmunge_loadout(pickles.loadout)
    brush = loadout[bnum]
    // TODO: extend brushes if new names, so you can get it back if you accidentally delete it
  }

  show_brushes()
  set_loadout()
  show_mode()

  img.onload = _ => ctx.drawImage(img, 0, 0)
  el('import').blur()
}

function find_first_chunk(cs, str) {
  return cs.find(c => c.chunkType === str)
}

function unslam(ns) {
  try {
    return JSON.parse(Array.from(ns).map(n=>String.fromCharCode(n)).join(''))
  } catch(e) {
    return null // {error: 'JSON, of course'}
  }
}

function go(f) {
  requestAnimationFrame(t => {
    f()
    go(f)
  })
}

function init() {
  set_loadout()
  show_brushes()
  show_mode()
  go(par(partypaint, keystuff))
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