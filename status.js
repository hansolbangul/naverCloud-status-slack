const util = require('util');
const bach_shell = util.promisify(require("child_process").exec)
const Slack = require("slack-node");
const schedule = require('node-schedule');
require('dotenv').config();


const webhookUri =
    process.env.webhookUri
const slack = new Slack();
slack.setWebhook(webhookUri);

const status = async () => {
  // console.log('status')
  try {
    const host = await uname()
    const stStatus = await storageStatus()
    const cpStatus = await coupleSatus()

    console.log(host)
    console.log(stStatus)
    console.log(cpStatus)

    const message = {
      host: host,
      subtitle: stStatus.status === false ? (cpStatus.status === false ? '2가지 에러사항' : '1가지 에러사항') : cpStatus.status === true ? false : '1가지 에러사항',
      message: stStatus.status === false ? (cpStatus.status === false ? stStatus.map(e => ({message: e.message, subtitle: e.subtitle})).concat(cpStatus.map(e => ({message: e.message, subtitle: e.subtitle}))) : stStatus.map(e => ({message: e.message, subtitle: e.subtitle}))) : cpStatus.status === true ? false : cpStatus.map(e => ({message: e.message, subtitle: e.subtitle}))
    }
    console.log(message)
    if (message.subtitle !== false) {
      send(message)
    }

  } catch (error) {
    
  }
}

// df -t ext4 -h

const storageStatus = async () => {
  console.log('storageStatus')
  try {
    var cmd = `df -t ext4 -h`;
    const { stdout } = await bach_shell(cmd);
    const storage = stdout.split('\n').map(e => e.split(' ').filter(_e => _e !== ''))
    const index = storage.shift()
    // console.log(index)
    // console.log(storage)
    const res = {return: []}
    for (var i = 0; i < storage.length; i++){
      if (storage[i].length !== 0) {
        if (Number(storage[i][4].split('%')[0]) > 90) {
          res.return.push(`'${index[5]}'된 '${storage[i][5]}'가 '${storage[i][4]}'만큼 찼습니다. ${index[1]}: ${storage[i][1]}`)
        }
      }
    }
    if (res.return.length > 0) {
      return {
        status: false,
        message: res.return.map(e => e),
        subtitle: 'storage'
      }
    } else {
      return {
        status: true,
        message: '정상작동',
        subtitle: 'storage'
      }
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const coupleSatus = async () => {
  console.log('coupleSatus')
  try {
    var cmd = `ps -aux | grep couplemng | grep start`;
    const { stdout } = await bach_shell(cmd);
    const psStatus = stdout.split('\n')
    console.log(psStatus)
    const res = { return: psStatus.length }
    if (res.return !== 3) {
      return {
        status: false,
        message: `couplemng가 ${psStatus.length}개 만큼 돌고 있습니다.`,
        subtitle: 'couple'
      }
    } else {
      return {
        status: true,
        message: '정상작동',
        subtitle: 'couple'
      }
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const uname = async () => {
  console.log('uname')
  try {
    var cmd = `uname -a`;
    const { stdout } = await bach_shell(cmd);
    const name = stdout.split(' ').filter(e => e !== '')
    return name[1]
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const send = async (message) => {
  console.log('send')
  slack.webhook({
    text: `${message.host}는 아파요! 🌈${message.status}`,
    attachments: message.message.map(e => ({
      pretext: `${e.subtitle} 문제!`,
      color:"#00FFFF",
      fields:[
        {
          title:"[위험]",
          value: e.message,
          short:false
        }
      ]
    }))
	}, function(err, response){
	  console.log(response);
	});
}

// const send = async(message) => {
//   slack.webhook({
//     text: `${message.host}는 아파요! 🌈${message.status}`,
//     attachments: [
// 		  {
//         // fallback:"구글드라이브: <https://docs.google.com|업무보고>",
//         pretext:"구글드라이브: <https://docs.google.com|업무보고>",
// 	      color:"#00FFFF",
// 	      fields:[
// 	        {
// 	          title:"[알림]",
// 	          value:"해당링크로 접속하여 작성해 주세요.",
// 	          short:false
// 	        }
// 	      ]
//       },
//       {
//         // fallback:"구글드라이브: <https://docs.google.com|업무보고>",
//         pretext:"구글드라이브: <https://docs.google.com|업무보고>",
// 	      color:"#00FFFF",
// 	      fields:[
// 	        {
// 	          title:"[알림]",
// 	          value:"해당링크로 접속하여 작성해 주세요.",
// 	          short:false
// 	        }
// 	      ]
// 	    }
// 	  ]
// 	}, function(err, response){
// 	  console.log(response);
// 	});
// }

// send('테스트 합니당.')
schedule.scheduleJob('*/1 * * * *', function () {
// schedule.scheduleJob('* * * * * *', function () {\
  console.log('schedule')
  status()
});


// console.log('sdsd')
