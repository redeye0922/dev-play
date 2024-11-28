pipeline {
    agent any

    environment {
        DEPLOY_DIR = "/home/testdev/devspace"
        SERVER_IP = "172.29.231.196"
        IMAGE_NAME = "my-vue-app"
        DOCKER_REGISTRY = "redeye0922"  // Docker Hub 또는 사설 레지스트리
        DOCKER_IMAGE_TAG = "${GIT_COMMIT}"
        DOCKER_USERNAME = "redeye0922"        
        DOCKER_PASSWORD = credentials('DOCKER_PASSWORD')  // 비밀번호는 Jenkins의 'Secret Text'로 관리
    }

    triggers {
        githubPush()  // GitHub webhook을 통해 자동 트리거
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'GitHub에서 코드 체크아웃 중...'
                checkout scm  // scm에서 체크아웃
            }
        }

        stage('Remove swagger-play') {
            steps {
                echo '불필요한 swagger-play 폴더 삭제 중...'
                sh 'rm -rf swagger-play'  // 불필요한 디렉토리 삭제
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('vue-play') {
                    script {
                        echo 'npm 의존성 설치 중...'
                        sh 'npm install'  // 의존성 설치
                    }
                }
            }
        }

        stage('Build Vue App') {
            steps {
                dir('vue-play') {
                    script {
                        echo 'Vue 앱 빌드 중...'
                        sh 'npm run build'  // 빌드 명령어 실행
                    }
                }
            }
        }

        stage('Generate Dockerfile') {
            steps {
                echo 'Dockerfile 생성 중...'
                script {
                    def dockerfileContent = """
                    # 1. Node.js 기반 이미지를 사용하여 Vue.js 빌드
                    FROM node:18-slim AS build-stage

                    RUN mkdir -p /app

                    WORKDIR /app
                    
                    COPY ./vue-play/package*.json .  
                    
                    RUN npm install
                    
                    COPY . .  

                    RUN echo "Contents of /app directory:" && ls -l /app
                    
                    WORKDIR /app/vue-play
                    
                    RUN npm run build

                    FROM node:18-slim AS production-stage
                    
                    RUN npm install -g http-server
                    
                    COPY --from=build-stage /app/vue-play/dist /app
                    
                    CMD ["npx", "http-server", "/app", "-p", "3000", "-a", "0.0.0.0"]
                    
                    EXPOSE 3000
                    """
                    writeFile(file: 'Dockerfile', text: dockerfileContent)
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo 'Docker 이미지 빌드 중...'
                    sh 'DOCKER_CONTENT_TRUST=0 docker build -t ${DOCKER_REGISTRY}/${IMAGE_NAME}:${DOCKER_IMAGE_TAG} .'  // Docker 빌드
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    echo 'Docker 이미지 Docker Hub에 푸시 중...'
                    sh '''
                    docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}
                    docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:${DOCKER_IMAGE_TAG}
                    '''
                }
            }
        }

        stage('Deploy to Server') {
            steps {
                script {
                    echo '서버에서 Docker 컨테이너 실행 중...'
                    sh '''
                        ssh -i ~/.ssh/id_rsa testdev@${SERVER_IP} <<'EOF'
                            # 최신 이미지를 서버에 풀어옴
                            docker pull ${DOCKER_REGISTRY}/${IMAGE_NAME}:${DOCKER_IMAGE_TAG} &&
        
                            # 실행 중인 컨테이너가 있으면 중지하고 강제로 삭제
                            CONTAINER_ID=\$(docker ps -q --filter name=${IMAGE_NAME})
                            if [ -n "\$CONTAINER_ID" ]; then
                                echo "실행 중인 컨테이너가 있습니다. 중지하고 삭제합니다..."
                                docker stop \$CONTAINER_ID &&
                                docker rm -f \$CONTAINER_ID  # 강제로 삭제
                            else
                                echo "실행 중인 컨테이너가 없습니다."
                            fi &&
        
                            # 모든 정지된 컨테이너 삭제
                            STOPPED_CONTAINERS=\$(docker ps -aq --filter name=${IMAGE_NAME})
                            if [ -n "\$STOPPED_CONTAINERS" ]; then
                                echo "정지된 컨테이너를 삭제합니다..."
                                docker rm -f \$STOPPED_CONTAINERS
                            fi &&
        
                            # 새로운 컨테이너 실행 (3000 포트 매핑)
                            docker run -d --name ${IMAGE_NAME}-${BUILD_NUMBER} -p 3000:3000 ${DOCKER_REGISTRY}/${IMAGE_NAME}:${DOCKER_IMAGE_TAG} &&
        
                            # /app 디렉토리 확인
                            docker exec ${IMAGE_NAME}-${BUILD_NUMBER} ls -l /app || { echo "/app 디렉토리가 없습니다."; exit 1; }
                        EOF
                    '''
                }
            }
        }

        stage('Verify Application') {
            steps {
                script {
                    echo '애플리케이션 상태 확인 중...'
                    sh 'ssh testdev@${SERVER_IP} "curl -s http://localhost:3000 || exit 1"'
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
