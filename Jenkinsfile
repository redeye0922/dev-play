pipeline {
    agent any

    environment {
        DEPLOY_DIR = "/home/testdev/devspace"
        SERVER_IP = "172.29.231.196"
        IMAGE_NAME = "my-vue-app"
        DOCKER_REGISTRY = "redeye0922"  // Docker Hub 또는 사설 레지스트리
        INITIAL_TAG = "v1.0.0"  // 초기 버전
    }

    triggers {
        githubPush()  // GitHub webhook을 통해 자동 트리거
    }

    stages {
        stage('Set Version Tag') {
            steps {
                script {
                    echo '버전 태그 설정 중...'

                    // Jenkins 빌드 번호를 기반으로 버전 태그 생성
                    def buildNumber = env.BUILD_NUMBER.toInteger()

                    // 버전 계산: 빌드 번호가 10 이상이면 minor를 증가
                    def major = 1
                    def minor = 0
                    def patch = buildNumber

                    // 패치 번호가 10 이상이면 minor 증가
                    if (patch > 9) {
                        patch = 0
                        minor++
                    }

                    // minor가 10 이상이면 major 증가
                    if (minor > 9) {
                        minor = 0
                        major++
                    }

                    // 새로운 태그 생성
                    def newTag = "v${major}.${minor}.${patch}"
                    echo "새로운 버전: ${newTag}"

                    // Docker 이미지 태그 설정
                    env.DOCKER_IMAGE_TAG = newTag
                }
            }
        }

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
                    ARG DOCKER_REGISTRY
                    ARG IMAGE_NAME
                    ARG DOCKER_IMAGE_TAG

                    FROM node:18-slim AS build-stage
                    RUN mkdir -p /app
                    WORKDIR /app
                    COPY ./vue-play/package*.json .
                    RUN npm install
                    COPY . .
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
                    sh "DOCKER_CONTENT_TRUST=0 docker build --build-arg DOCKER_REGISTRY=${DOCKER_REGISTRY} --build-arg IMAGE_NAME=${IMAGE_NAME} --build-arg DOCKER_IMAGE_TAG=${DOCKER_IMAGE_TAG} -t ${DOCKER_REGISTRY}/${IMAGE_NAME}:${DOCKER_IMAGE_TAG} ."
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    echo 'Docker 이미지 Docker Hub에 푸시 중...'
                    withCredentials([usernamePassword(credentialsId: 'docker-hub-creds', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                        sh '''
                            docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}
                            docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:${DOCKER_IMAGE_TAG}
                        '''
                    }
                }
            }
        }

        stage('Deploy to Server') {
            steps {
                script {
                    echo '서버에서 Docker 컨테이너 실행 중...'
                    sshagent(credentials: ['my-ssh-key-id']) {
                        sh '''
                            ssh testdev@${SERVER_IP} <<'EOF'
                                docker pull ${DOCKER_REGISTRY}/${IMAGE_NAME}:${DOCKER_IMAGE_TAG} &&
                                CONTAINER_ID=$(docker ps -q --filter name=${IMAGE_NAME})
                                if [ -n "$CONTAINER_ID" ]; then
                                    docker stop $CONTAINER_ID
                                    docker rm -f $CONTAINER_ID
                                fi &&
                                docker run -d --name ${IMAGE_NAME}-${BUILD_NUMBER} -p 3000:3000 ${DOCKER_REGISTRY}/${IMAGE_NAME}:${DOCKER_IMAGE_TAG} &&
                                docker exec ${IMAGE_NAME}-${BUILD_NUMBER} ls -l /app || { echo "/app 디렉토리가 없습니다."; exit 1; }
                            EOF
                        '''
                    }
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
