// 这个是项目的构建入口文件
// "build": "node scripts/build.js",
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const rollup = require('rollup')
const terser = require('terser')

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist')
}

// 基于 config.js 配置文件，获取配置参数
let builds = require('./config').getAllBuilds()

// package.json 中有三条核心的构建命令
//   "build": "node scripts/build.js",
//   "build:ssr": "npm run build -- web-runtime-cjs,web-server-renderer",
//   "build:weex": "npm run build -- weex",
// 本质上它们都是调用 build.js 脚本然后传入参数
// 比如调用了 npm run build
// 相当于执行 node scripts/build.js
// 这时候 process.argv 的内容是
// Array(2) [
//   C:\Program Files\nodejs\node.exe,
//   E:\all_projects\vue-2.6.14\scripts\build.js
// ]
// process.argv[2] 的内容相当于 build.js 后面的额外参数
// filter builds via command line arg
if (process.argv[2]) {
  // 分割额外的参数，比如 -- web-runtime-cjs,web-server-renderer
  // 被处理为 filters: ['web-runtime-cjs', 'web-server-renderer']
  const filters = process.argv[2].split(',')
  // builds 包含了所有配置对象
  // 这里过滤留下配置对象中 name 或者 output.name 中包含额外参数名称的配置
  builds = builds.filter(b => {
    return filters.some(f => b.output.file.indexOf(f) > -1 || b._name.indexOf(f) > -1)
  })
} else {
  // filter out weex builds by default
  builds = builds.filter(b => {
    // 如果没有传入额外参数，默认过滤掉 output.file 中包含 week 关键字的配置
    return b.output.file.indexOf('weex') === -1
  })
}

build(builds)

function build(builds) {
  let built = 0
  const total = builds.length
  const next = () => {
    buildEntry(builds[built]).then(() => {
      built++
      if (built < total) {
        next()
      }
    }).catch(logError)
  }

  next()
}

function buildEntry(config) {
  const output = config.output
  const {file, banner} = output
  const isProd = /(min|prod)\.js$/.test(file)
  return rollup.rollup(config)
               .then(bundle => bundle.generate(output))
               .then(({output: [{code}]}) => {
                 if (isProd) {
                   const minified = (banner ? banner + '\n' : '') + terser.minify(code, {
                     toplevel: true,
                     output: {
                       ascii_only: true
                     },
                     compress: {
                       pure_funcs: ['makeMap']
                     }
                   }).code
                   return write(file, minified, true)
                 } else {
                   return write(file, code)
                 }
               })
}

function write(dest, code, zip) {
  return new Promise((resolve, reject) => {
    function report(extra) {
      console.log(blue(path.relative(process.cwd(), dest)) + ' ' + getSize(code) + (extra || ''))
      resolve()
    }

    fs.writeFile(dest, code, err => {
      if (err) return reject(err)
      if (zip) {
        zlib.gzip(code, (err, zipped) => {
          if (err) return reject(err)
          report(' (gzipped: ' + getSize(zipped) + ')')
        })
      } else {
        report()
      }
    })
  })
}

function getSize(code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function logError(e) {
  console.log(e)
}

function blue(str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}
