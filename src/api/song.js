import { commonParams } from './config'
import { getUid } from 'common/js/uid'
import axios from 'axios'
import { ERR_OK } from 'api/config'

const debug = process.env.NODE_ENV !== 'production'
// 获取歌词
export function getLyric(mid) {
  const url = debug ? '/api/lyric' : 'http://47.107.250.161/api/lyric'

  const data = Object.assign({}, commonParams, {
    songmid: mid,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0,
    categoryId: 10000000,
    pcachetime: +new Date(),
    format: 'json'
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
// 获取歌曲url
export function getSongsUrl(songs) {
  const url = debug ? '/api/getPurlUrl' : 'http://47.107.250.161/api/getPurlUrl'

  let mids = []
  let types = []

  songs.forEach((song) => {
    mids.push(song.mid)
    types.push(0)
  })

  const urlMid = genUrlMid(mids, types)

  const data = Object.assign({}, commonParams, {
    g_tk: 5381,
    format: 'json',
    platform: 'h5',
    needNewCode: 1,
    uin: 0
  })

  return new Promise((resolve, reject) => {
    let tryTime = 3

    function request() {
      return axios.post(url, {
        comm: data,
        url_mid: urlMid
      }).then((response) => {
        const res = response.data
        if (res.code === ERR_OK) {
          let urlMid = res.url_mid
          if (urlMid && urlMid.code === ERR_OK) {
            const info = urlMid.data.midurlinfo[0]
            if (info && info.purl) {
              resolve(res)
            } else {
              retry()
            }
          } else {
            retry()
          }
        } else {
          retry()
        }
      })
    }

    function retry() {
      if (--tryTime >= 0) {
        request()
      } else {
        reject(new Error('Can not get the songs url'))
      }
    }

    request()
  })
}

function genUrlMid(mids, types) {
  const guid = getUid()
  return {
    module: 'vkey.GetVkeyServer',
    method: "CgiGetVkey",
    param: {
      guid,
      songmid: mids,
      songtype: types,
      uin: '0',
      loginflag: 0,
      platform: '23'
    }
  }
}
