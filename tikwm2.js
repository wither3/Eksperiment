const axios = require('axios');

async function tiktokDl(url) {
    return new Promise(async (resolve, reject) => {
        try {
            let data = [];
            let domain = 'https://www.tikwm.com/api/';

            let response = await axios.post(domain, {}, {
                headers: {
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Origin': 'https://www.tikwm.com',
                    'Referer': 'https://www.tikwm.com/',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                params: {
                    url: url,
                    count: 12,
                    cursor: 0,
                    web: 1,
                    hd: 1
                }
            });


            let res = response.data.data;
console.log(res);
            if (!res.size) {
                res.images.map(v => {
                    data.push({ type: 'photo', url: v });
                });
            } else {
                data.push(
                    { type: 'watermark', url: 'https://www.tikwm.com' + res.wmplay },
                    { type: 'nowatermark', url: 'https://www.tikwm.com' + res.play },
                    { type: 'nowatermark_hd', url: 'https://www.tikwm.com' + res.hdplay }
                );
            }

            resolve({
  id: res.id,
  author: res.author.unique_id,
  name: res.author.nickname,
  region: res.region,
  title: res.title,
  avatar: `https://www.tikwm.com${res.author.avatar}`,
  cover: `https://www.tikwm.com${res.cover}`,
  duration: res.duration,
  video: {
    noWatermark: `https://www.tikwm.com${res.play}`,
    watermark: `https://www.tikwm.com${res.wmplay}`,
    videoHd: `https://www.tikwm.com${res.hdplay}`
  },
  noWMSize: res.size,
  WMSize: res.wm_size,
  HDSize: res.hd_size,
  musicInfo: {
  id: res.music_info.id,
  author: res.music_info.author,
  title: res.music_info.title,
  play: res.music_info.play,
  link: `https://www.tikwm.com${res.music}`,
  original: res.music_info.original,
  duration: res.music_info.duration
  },
  videoInfo:{
  view: res.play_count,
  like: res.digg_count,
  comment: res.comment_count,
  share: res.share_count,
  download: res.download_count,
  collect: res.collect_count,
  createTime: res.create_time,
  isAd: res.is_ad
  }
  
            });
        } catch (e) {
            reject(e); // Typo diperbaiki di sini
        }
    });
}

module.exports = { tiktokDl };
