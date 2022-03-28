# Packer templates for Ubuntu written in legacy JSON

### Overview

This repository naver cloud service (os/ ubuntu-18-04) Forward process error messages to Slack.

이 레포지토리는 네이버 클라우드 서버의 프로세스 에러 메세지를 슬랙으로 전송한다.

### How use

1. this repository clone
2. npm install
3. make .env file ( webhookUri=USER_SLACK_WEBHOOK_URL )
4. forever start 

### checking process list

* storage
* mysql service
* couplemng.py

storage -> Whether or not more than 90% of the storage space of the Ubuntu server is used

mysql -> mysql on ubuntu server works, if not, rerun

couplemng.py -> Whether couplemng.py on ubuntu server works
