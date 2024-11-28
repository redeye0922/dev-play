pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = "redeye0922"
        DOCKER_PASSWORD = credentials('DOCKER_PASSWORD')
        IMAGE_NAME = "my-vue-app"
        SERVER_IP = "172.29.231.196"
        DOCKER_IMAGE_TAG = ""
    }

    triggers {
        githubPush()
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'GitHub에서 코드 체크아웃 중...'
                checkout scm
            }
        }

        stage('Remove swagger-play') {
            steps {
                echo '불필요한 swagger-play 폴더 삭제 중...'
                sh 'rm -rf swagger-play'
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('vue-play') {
                    script {
                        echo 'npm 의존성 설치 중...'
                        sh 'npm install'
                    }
                }
            }
        }

        stage('Build Vue App') {
            steps {
                dir('vue-play') {
                    script {
                        echo 'Vue 앱 빌드 중...'
                        sh 'npm run build'
                    }
                }
            }
        }

        stage('Generate Dockerfile') {
            steps {
                echo 'Dockerfile 생성 중...'
                script {
                    def dockerfileContent = """
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

        stage('Determine Docker Image Tag') {
            steps {
                script {
                    // Git에서 마지막 태그를 가져옵니다
                    def lastTag = ""
                    try {
                        lastTag = sh(script: "git describe --tags --abbrev=0", returnStdout: true).trim()
                    } catch (Exception e) {
                        echo "No tags found. Starting from v1.0.0."
                    }

                    // 첫 번째 빌드일 경우 v1.0.0, 이후에는 패치 버전 증가
                    if (lastTag == "") {
                        DOCKER_IMAGE_TAG = "v1.0.0"
                    } else {
                        def versionParts = lastTag.split("\\.")
                        def major = versionParts[0]
                        def minor = versionParts[1]
                        def patch = versionParts[2].toInteger() + 1  // 패치 버전 증가
                        DOCKER_IMAGE_TAG = "${major}.${minor}.${patch}"
                    }

                    // 태그가 비어 있으면 빌드를 중지합니다.
                    if (DOCKER_IMAGE_TAG == "") {
                        error "DOCKER_IMAGE_TAG가 설정되지 않았습니다!"
                    }

                    echo "Docker image tag: ${DOCKER_IMAGE_TAG}"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo 'Docker 이미지 빌드 중...'
                    sh "DOCKER_CONTENT_TRUST=0 docker build -t ${DOCKER_REGISTRY}/${IMAGE_NAME}:${DOCKER_IMAGE_TAG} ."
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    echo 'Docker 이미지 Docker Hub에 푸시 중...'
                    sh '''
                    echo "${DOCKER_PASSWORD}" | docker login -u ${DOCKER_REGISTRY} --password-stdin
                    docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:${DOCKER_IMAGE_TAG}
                    '''
                }
            }
        }

        stage('Deploy to Server') {
            steps {
                script {
                    echo "이미지 이름: ${DOCKER_REGISTRY}/${IMAGE_NAME}:${DOCKER_IMAGE_TAG}"
                    sh '''
                    ssh -T -i ~/.ssh/id_rsa testdev@${SERVER_IP} <<EOF
                        echo "이미지 풀기: ${DOCKER_REGISTRY}/${IMAGE_NAME}:${DOCKER_IMAGE_TAG}"
                        docker pull ${DOCKER_REGISTRY}/${IMAGE_NAME}:${DOCKER_IMAGE_TAG} || { echo "이미지 풀기 실패!"; exit 1; }
                        CONTAINER_ID=\$(docker ps -q --filter name=${IMAGE_NAME})
                        if [ -n "\$CONTAINER_ID" ]; then
                            echo "실행 중인 컨테이너가 있습니다. 기존 컨테이너를 중지하고 제거합니다..."
                            docker stop \$CONTAINER_ID
                            docker rm \$CONTAINER_ID
                        fi
                        docker run -d --name ${IMAGE_NAME}-${BUILD_NUMBER} -p 3000:3000 ${DOCKER_REGISTRY}/${IMAGE_NAME}:${DOCKER_IMAGE_TAG}
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
            echo "배포 실패!"
        }
    }
}
