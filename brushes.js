
let brushes = [
  { 'name': 'pard paint'
  , 'vals': {syz: 10, hue: 30, sat: 90, lyt: 60}
  , 'upup': v => v.syz += 1
  , 'down': v => v.syz -= 1
  , 'left': v => v.hue = (v.hue + 1) % 101
  , 'rite': v => v.lyt = (v.lyt + 1) % 101
  , 'pynt': v => {ctx.fillStyle = filler(v.hue, v.sat, v.lyt, 255); fillRect(v.x, v.y, v.syz, v.syz, 255)}
  , 'pard': (terms, types, v) => {
              const l = types.length
              for(let i = 0; i < l; i++) {
                let n = i*4
                if(types[i] !== 127 && (terms[n] || terms[n + 1] || terms[n + 2])) {
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
  , 'pynt': v => {ctx.fillStyle = '#000000'; fillRect(v.x, v.y, v.syz, v.syz, 1)}
  },
  { 'name': 'eraser'
  , 'vals': {syz: 10}
  , 'upup': v => v.syz += 1
  , 'down': v => v.syz -= 1
  , 'pynt': v => ctx.clearRect(v.x, v.y, v.syz, v.syz)
  },
  { 'name': 'mirror growth'
  , 'vals': {liv: 31, hue: 30, lyt: 60}
  , 'upup': v => v.liv += 1
  , 'down': v => v.liv -= 1
  , 'left': v => v.hue = (v.hue + 1) % 101
  , 'rite': v => v.lyt = (v.lyt + 1) % 101
  , 'pynt': v => { ctx.fillStyle = filler(v.hue, v.sat, v.lyt, 255)
                   ctx.fillRect(v.x, v.y, v.syz, v.syz)
                   for(let i=v.y; i<v.y+v.syz; i++)
                     for(let j=v.x; j<v.x+v.syz; j++)
                       types[i + j*w] = 251 // NB. backwards!
                 }
  , 'pard': (terms, types, v) => {
              const l = types.length
              for(let i = 0; i < l; i++) {
                if(types[i] === 251) {
                  let n = [i - w, i + 1, i + w, i - 1].map(n=>n*4)[rand(4)]
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
  , 'vals': {liv: 31, hue: 30, lyt: 60}
  , 'upup': v => v.liv += 1
  , 'down': v => v.liv -= 1
  , 'left': v => v.hue = (v.hue + 1) % 101
  , 'rite': v => v.lyt = (v.lyt + 1) % 101
  , 'pynt': v => {ctx.fillStyle = filler(v.hue, v.sat, v.lyt, 255); fillRect(v.x, v.y, v.syz, v.syz, 250)}
  , 'pard': (terms, types, v) => {
              const l = types.length
              for(let i = 0; i < l; i++) {
                if(types[i] === 250) {
                  let n = [i - w, i + 1, i + w, i - 1].map(n=>n*4)[rand(4)]
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
  , 'vals': {syz: 10, hue: 30, lyt: 60}
  , 'upup': v => v.syz += 1
  , 'down': v => v.syz -= 1
  , 'left': v => v.hue = (v.hue + 1) % 101
  , 'rite': v => v.lyt = (v.lyt + 1) % 101
  , 'pynt': v => {ctx.fillStyle = filler(v.hue, v.sat, v.lyt, 255); fillRect(v.x, v.y, v.syz, v.syz, 252)}
  , 'pard': (terms, types, v) => {
              const l = types.length
              for(let i = 0; i < l; i++) {
                if(types[i] === 252) {
                  let n = [i - w, i + 1, i + w, i - 1].map(n=>n*4)[rand(4)]
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
  , 'upup': v => v.liv = (v.liv + 1) % 101
  , 'down': v => v.liv = (v.liv - 1 + 101) % 101 // TODO: rem(v.liv - 1, 101)
  , 'left': v => v.hue = (v.hue + 1) % 101
  , 'rite': v => v.jmp = (v.jmp + 1) % 100
  , 'pynt': v => {ctx.fillStyle = filler(v.hue, v.sat, v.lyt, 255); ctx.fillRect(v.x, v.y, 1, 1); types[v.y*w+v.x] = 244}
  , 'pard': (terms, types, v) => {
              const l = types.length - 1
              for(let i = 0; i < l; i++) {
                if(types[i] === 244) {
                  ;[-1,0,1].forEach(j => {
                    let next = i+w+j
                    if(Math.random() < vals.liv/100) { // && terms.length >= 4*(next+1)) {
                      terms.set(terms.slice(4*i,4*(i+1)), 4*next)
                      terms[4*next + rand(3)] += Math.floor(j*vals.jmp/10)
                      types[next] = 244
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
  , 'left': v => v.hue = (v.hue + 1) % 101
  , 'rite': v => v.sat = (v.sat + 1) % 101
  , 'pynt': v => { ctx.fillStyle = filler(v.hue, v.sat, v.lyt, 255)
                   let circle = new Path2D()
                   circle.arc(v.x + Math.random()*360 - 180, v.y + Math.random()*360 - 180, Math.abs(v.syz), 0, 2 * Math.PI)
                   ctx.fill(circle)
                 }
  },
  { 'name': 'randosize'
  , 'vals': {smw: 90, zwm: 20, jmp: 10, dir: 1}
  , 'upup': v => v.smw = (v.smw + 1) % 101
  , 'down': v => v.smw = (v.smw - 1) % 101
  , 'left': v => v.zwm = (v.zwm + 1) % 101
  , 'rite': v => v.jmp = (v.jmp + 1) % 101
  , 'pynt': v => v
  , 'pard': (terms, types, v) => {
              if(v.zwm > rand(100)) {
                v.dir = v.syz < 4 ? 1 : v.syz > 300 ? -1 : v.dir
                v.syz = Math.abs(v.syz + Math.floor((v.jmp/50) * (v.smw > rand(100) ? v.dir : (v.dir = rand(3)-1)))) % 300
              }
            }
  },
  { 'name': 'metabrush1'
  , 'vals': {syz: 10, hue: 30, sat: 90, lyt: 60}
  , 'upup': v => v.syz += 1
  , 'down': v => v.syz -= 1
  , 'left': v => v.hue = (v.hue + 1) % 101
  , 'rite': v => v.lyt = (v.lyt + 1) % 101
  , 'pynt': v => {
              ctx.fillStyle = filler(v.hue, v.sat, v.lyt, 180)
              let str = JSON.stringify(trick(brush))
              ctx.font = `${v.syz}px monospace`
              ctx.fillText(str, v.x, v.y)
            }
  },
  { 'name': 'metabrush2'
  , 'vals': {syz: 10, hue: 30, sat: 90, lyt: 60}
  , 'upup': v => v.syz += 1
  , 'down': v => v.syz -= 1
  , 'left': v => v.hue = (v.hue + 1) % 101
  , 'rite': v => v.lyt = (v.lyt + 1) % 101
  , 'pynt': v => v
  , 'post': v => {
              ctx.fillStyle = filler(v.hue, v.sat, v.lyt, 180)
              let str = JSON.stringify(trick(brush))
              ctx.font = `${v.syz}px monospace`
              ctx.fillText(str, v.x, v.y)
            }
  },
  { 'name': 'metabrush3'
  , 'vals': {syz: 10, hue: 30, sat: 90, lyt: 60}
  , 'upup': v => v.syz += 1
  , 'down': v => v.syz -= 1
  , 'left': v => v.hue = (v.hue + 1) % 101
  , 'rite': v => v.lyt = (v.lyt + 1) % 101
  , 'pynt': v => v
  , 'post': v => {
              let str = JSON.stringify(trick(brush)).replaceAll(' ','')//.substr(9)
              let stack = []
              let x = v.x, y = v.y
              ctx.lineWidth = 1 // v.syz
              ctx.strokeStyle = filler(v.hue, v.sat, v.lyt, 30)
              ctx.beginPath()
              str.split('').forEach(c => {
                if(['(', '[', '{'].includes(c)) {
                  stack.push([x, y])
                }
                else if([')', ']', '}'].includes(c)) {
                  [x, y] = stack.pop()
                  ctx.moveTo(x, y)
                }
                else {
                  let n = (c.charCodeAt(0) - 60) / 3
                  x = x + 10 * Math.cos(n)
                  y = y + 10 * Math.sin(n)
                  ctx.lineTo(x, y)
                }
              })
              ctx.stroke()
            }
  },
  { 'name': 'highlighter'
  , 'vals': {syz: 10, hue: 30, alf: 127}
  , 'upup': v => v.syz += 1
  , 'down': v => v.syz -= 1
  , 'left': v => v.hue = (v.hue + 1) % 101
  , 'rite': v => v.alf = (v.alf + 1) % 256
  , 'pynt': v => {ctx.fillStyle = filler(v.hue, v.sat, v.lyt, v.alf); fillRect(v.x, v.y, v.syz, v.syz, 255)}
  },
  { 'name': 'smudgatron'
  , 'vals': {syz: 10, hue: 30, alf: 127}
  , 'upup': v => v.syz += 1
  , 'down': v => v.syz -= 1
  , 'left': v => v.hue = (v.hue + 1) % 101
  , 'rite': v => v.alf = (v.alf + 1) % 256
  , 'pynt': v => {ctx.fillStyle = filler(v.hue, v.sat, v.lyt, v.alf); fillRect(v.x, v.y, v.syz, v.syz, 247)}
  , 'pard': (terms, types, v) => {
              const l = types.length - 1
              for(let i = 0; i < l; i++) {
                if(types[i] === 247) {
                  let next = i+1
                  terms.set(terms.slice(4*i,4*(i+1)), 4*next)
                  terms[4*next + rand(3)] += Math.floor(vals.jmp/10)
                  types[next] = 244 // an electrifying accident
                  types[i] = 255
                }
              }}
  },
  { 'name': 'rivery'
  , 'vals': {liv: 31, hue: 30, alf: 50}
  , 'upup': v => v.liv = (v.liv + 1) % 101
  , 'down': v => v.liv = (v.liv - 1 + 101) % 101
  , 'left': v => v.hue = (v.hue + 1) % 101
  , 'rite': v => v.alf = (v.alf + 1) % 256
  , 'pynt': v => {ctx.fillStyle = filler(v.hue, v.sat, v.lyt, v.alf); fillRect(v.x, v.y, v.syz, v.syz, 247)}
  , 'pard': (terms, types, v) => {
              const l = types.length - 1
              for(let i = 0; i < l; i++) {
                if(types[i] === 247) {
                  if(rand(100) < 10) { // change
                    terms[i*4] += 1
                  } else { // follow

                  }
                }
              }}
  },
]
