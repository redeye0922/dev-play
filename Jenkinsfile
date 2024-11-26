pipeline {
        agent any
        environment {
            DEPLOY_DIR = "/home/testdev/devspace"
            SERVER_IP = "172.29.231.196"
        }
        triggers {
          //GitHub webhook을 통한 자동 트리거
          githubPush()
        }        
        stages {
            stage('Checkout') {
                steps {
                    // GitHub 리포지토리에서 코드 가져오기
                    echo 'GitHub 저장소에서 코드가져오기'
                    git 'https://github.com/redeye0922/dev-play.git'
                }
            }
            stage('Remove swagger-play') {
                steps {
                    echo '필요없는 폴더정리'
                    sh 'rm -rf swagger-play'  // swagger-play 디렉토리 삭제
                }
            }
            stage('Install Dependencies') {
                steps {
                    dir('vue-play') {
                        script {
                          echo '의존성 설치 중...'
                          // Node.js 및 npm 의존성 설치
                          sh 'npm install'
                        }
                    }
                }
            }
            stage('Build') {
                steps {
                    dir('vue-play') {
                        script {
                            echo 'Vue 앱 빌드 중...'
                            // Vue 프로젝트 빌드
                            sh 'npm run build'
                        }
                    }
                }
            }
            stage('Deploy') {
                steps {
                    script {
                        echo '배포 중...'
                        // 서버로 배포 (scp 또는 rsync 사용)
                        sh '''
                        scp -r vue-play/dist/* testdev@${SERVER_IP}:${DEPLOY_DIR}
                        '''
                    }
                }
            }
            stage('Start Application') {
                steps {
                    script {
                        // 서버에서 애플리케이션 실행
                        sh '''
                        ssh testdev@${SERVER_IP} "cd ${DEPLOY_DIR} && npm install --production && pm2 start server.js"
                        '''
                    }
                }
            }
            stage('Verify Application') {
                steps {
                        script {
                                echo '애플리케이션 상태 확인중 ...'
                                sh 'ssh testdev@${SERVER_IP} "pm2 status"'
                        }
                }
            }
        }
        post {
            success {
                echo "배포가 성공적으로 완료되었습니다."
            }
            failure {
                echo "배포에 실패했습니다."
            }
        }
    }
