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
  try {
    const host = await uname()
    const stStatus = await storageStatus()
    const cpStatus = await coupleSatus()
    const sqlStatus = await mysql()

    const message = {
      host: host,
      subtitle: stStatus.status === false ? cpStatus.status === false ? sqlStatus.status === false ? '3가지 에러사항' : '2가지 에러사항' : '1가지 에러사항' : cpStatus.status === true ? false : '1가지 에러사항',
      message: stStatus.status === false ? cpStatus.status === false ? sqlStatus.status === false ? stStatus.message.map(e => ({message: e, subtitle: stStatus.subtitle})).concat(cpStatus.message.map(e => ({message: e, subtitle: cpStatus.subtitle}))).concat(sqlStatus.message.map(e => ({message: e, subtitle: cpStatus.subtitle}))) : stStatus.message.map(e => ({message: e, subtitle: stStatus.subtitle})).concat(cpStatus.message.map(e => ({message: e, subtitle: cpStatus.subtitle}))) : stStatus.message.map(e => ({message: e, subtitle: stStatus.subtitle})) : cpStatus.status === true ? false : cpStatus.message.map(e => ({message: e, subtitle: cpStatus.subtitle}))
    }

    console.log(message)
    if (message.subtitle !== false) {
      send(message)
    }

  } catch (error) {
    
  }
}


const storageStatus = async () => {
  try {
    var cmd = `df -t ext4 -h`;
    const { stdout } = await bach_shell(cmd);
    const storage = stdout.split('\n').map(e => e.split(' ').filter(_e => _e !== ''))
    const index = storage.shift()
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
  try {
    var cmd = `ps -aux | grep couplemng`;
    const { stdout } = await bach_shell(cmd);
    const psStatus = stdout.split('\n').filter(e => e.includes('start'))
    console.log(psStatus)
    const res = { return: psStatus.length }
    if (res.return !== 3) {
      var _cmd = 'python3 /home/fjbox/cvtgate3/gate/couplemng.py start'
      await bach_shell(_cmd);
      return {
        status: false,
        message: [`couplemng가 ${psStatus.length}개 돌고 있습니다.`],
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

const mysql = async () => {
  try {
    var cmd = `service mysql status | grep Active `;
    const { stdout: result } = await bach_shell(cmd);
    const mysqlStatus = result.split(' ').filter(e => e !== '')[1]
    if (mysqlStatus !== 'active') {
      var _cmd = 'service mysql restart | service mysql status | grep Active'
      const { stdout: reresult } = await bach_shell(_cmd);
      const remysqlStatus = reresult.split(' ').filter(e => e !== '')[1]
      return remysqlStatus !== 'active' ? {
        status: false,
        message: [`재실행 했는데도 안되네요...`],
        subtitle: 'mysql'
      } : {
        status: false,
        message: [`재실행 하니까 정상적으로 동작이 됩니다! 얏호!`],
        subtitle: 'mysql'
      }
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const send = async (message) => {
  slack.webhook({
    text: `🚨 ${message.host}는 아파요! -> 🌈 ${message.subtitle}`,
    attachments: message.message.map(e => ({
      color:"#00FFFF",
      fields:[
        {
          title:`${e.subtitle} 문제!`,
          value: e.message,
          short:false
        }
      ]
    }))
	}, function(err, response){
	  console.log(response);
	});
}

// // 1시간 주기
// schedule.scheduleJob('0 */1 * * *', function () {
//   console.log('schedule')
//   status()
// });

// 테스트용 1분
schedule.scheduleJob('*/1 * * * *', function () {
  console.log('schedule')
  status()
});