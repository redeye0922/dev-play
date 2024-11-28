pipeline {
    agent any

    environment {
        DEPLOY_DIR = "/home/testdev/devspace"
        SERVER_IP = "172.29.231.196"
        IMAGE_NAME = "my-vue-app"
        DOCKER_REGISTRY = "redeye0922"
        INITIAL_TAG = "v1.0.0"
    }

    stages {
        stage('Set Version Tag') {
            steps {
                script {
                    def buildNumber = env.BUILD_NUMBER.toInteger()
                    def major = 1
                    def minor = 0
                    def patch = buildNumber

                    if (patch > 9) {
                        patch = 0
                        minor++
                    }

                    if (minor > 9) {
                        minor = 0
                        major++
                    }

                    def newTag = "v${major}.${minor}.${patch}"
                    echo "새로운 버전: ${newTag}"

                    env.DOCKER_IMAGE_TAG = newTag
                }
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Remove swagger-play') {
            steps {
                sh 'rm -rf swagger-play'
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('vue-play') {
                    sh 'npm install'
                }
            }
        }

        stage('Build Vue App') {
            steps {
                dir('vue-play') {
                    script {
                        echo 'Vue 앱 빌드 중...'
                        sh 'npm run build'  // 빌드가 제대로 되는지 확인
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
                    COPY ./vue-play /app
                    RUN echo "Contents of /app directory:" && ls -l /app
                    WORKDIR /app
                    RUN npm run build

                    FROM node:18-slim AS production-stage
                    RUN npm install -g http-server
                    COPY --from=build-stage /app/dist /app
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
                    def imageTag = "${DOCKER_REGISTRY}/${IMAGE_NAME}:${DOCKER_IMAGE_TAG}"
        
                    // SSH 명령 실행
                    try {
                        sh """
                            ssh -i /home/jenkins/.ssh/id_rsa testdev@${SERVER_IP} 'bash -s' << EOF
                                # 실행 중인 my-vue-app- 컨테이너 모두 중지하고 삭제
                                CONTAINER_IDS=\$(docker ps -q --filter "name=my-vue-app-")
                                if [ -n "\$CONTAINER_IDS" ]; then
                                    echo "Stopping and removing existing 'my-vue-app-' containers..."
                                    docker stop \$CONTAINER_IDS
                                    docker rm -f \$CONTAINER_IDS
                                fi
        
                                # 새 컨테이너 실행
                                echo "Running new container from image ${imageTag}..."
                                docker run -d --name ${IMAGE_NAME}-${BUILD_NUMBER} -p 3001:3000 ${imageTag}
        
                                # /app 디렉토리 확인
                                echo "Checking /app directory..."
                                docker exec ${IMAGE_NAME}-${BUILD_NUMBER} ls -l /app || { echo "/app 디렉토리가 없습니다."; exit 1; }
                            EOF
                        """
                    } catch (Exception e) {
                        // 배포 실패 시에도 실행 중인 컨테이너를 중지하고 삭제
                        echo "배포가 실패했습니다. 실행 중인 'my-vue-app-' 컨테이너를 중지하고 삭제합니다."
                        sh """
                            ssh -i /home/jenkins/.ssh/id_rsa testdev@${SERVER_IP} 'bash -s' << EOF
                                CONTAINER_IDS=\$(docker ps -q --filter "name=my-vue-app-")
                                if [ -n "\$CONTAINER_IDS" ]; then
                                    echo "Stopping and removing existing 'my-vue-app-' containers..."
                                    docker stop \$CONTAINER_IDS
                                    docker rm -f \$CONTAINER_IDS
                                fi
                            EOF
                        """
                        // 배포 실패 후 오류 발생
                        throw e
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
