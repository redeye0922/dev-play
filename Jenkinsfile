pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'docker.io'
        IMAGE_NAME = 'my-vue-app'
        BUILD_NUMBER = "${env.BUILD_NUMBER}"
        SERVER_IP = 'your.server.ip'  // 서버의 IP 주소
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out the repository...'
                checkout scm
            }
        }

        stage('Determine Docker Image Tag') {
            steps {
                script {
                    // 최신 태그를 가져오거나 기본 버전 v1.0.0 설정
                    def latestTag = sh(script: "git describe --tags --abbrev=0", returnStdout: true).trim()
                    if (!latestTag) {
                        latestTag = "v1.0.0"
                    }
                    echo "Build tag: ${latestTag}"
                    env.DOCKER_IMAGE_TAG = latestTag
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Building Docker image with tag ${DOCKER_IMAGE_TAG}..."
                script {
                    sh """
                    docker build -t ${DOCKER_REGISTRY}/${IMAGE_NAME}:${DOCKER_IMAGE_TAG} .
                    """
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                echo "Pushing Docker image to Docker Hub..."
                script {
                    sh """
                    docker login -u redeye0922 --password-stdin
                    docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:${DOCKER_IMAGE_TAG}
                    """
                }
            }
        }

        stage('Deploy to Server') {
            steps {
                script {
                    echo "Deploying Docker image to server..."
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
                        
                        echo "새로운 컨테이너 실행 중..."
                        docker run -d --name ${IMAGE_NAME}-${BUILD_NUMBER} -p 3000:3000 ${DOCKER_REGISTRY}/${IMAGE_NAME}:${DOCKER_IMAGE_TAG}
                        
                        echo "컨테이너 디렉토리 확인:"
                        docker exec ${IMAGE_NAME}-${BUILD_NUMBER} ls -l /app || { echo "/app 디렉토리가 없습니다."; exit 1; }
                    EOF
                    '''
                }
            }
        }

        stage('Verify Application') {
            steps {
                echo "Verifying the application..."
                // 추가적인 검증을 여기서 수행할 수 있습니다.
                // 예: curl 또는 selenium 등을 사용하여 웹 애플리케이션 검증
            }
        }
    }

    post {
        always {
            echo '파이프라인 실행 완료!'
        }
        success {
            echo '배포 성공!'
        }
        failure {
            echo '배포 실패!'
        }
    }
}
