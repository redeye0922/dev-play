pipeline {
    agent any
    
    environment {
        // 환경 변수 설정
        DOCKER_REGISTRY = 'redeye0922'  // Docker Hub 사용자 이름
        IMAGE_NAME = 'my-vue-app'       // 빌드할 이미지 이름
        DOCKER_IMAGE_TAG = 'v1.0.0'     // 기본 태그 (수동으로 지정하거나 자동 증가 처리 가능)
        SERVER_IP = '172.29.231.196'    // 배포 서버 IP
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Checking out the repository..."
                checkout scm  // Git에서 소스 코드 가져오기
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image..."
                    sh """
                    docker build -t ${DOCKER_REGISTRY}/${IMAGE_NAME}:${DOCKER_IMAGE_TAG} .
                    """
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    echo "Pushing Docker image to Docker Hub..."
                    withCredentials([usernamePassword(credentialsId: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                        sh """
                        echo \$DOCKER_PASSWORD | docker login -u \$DOCKER_USERNAME --password-stdin
                        docker push \$DOCKER_USERNAME/${IMAGE_NAME}:${DOCKER_IMAGE_TAG}
                        """
                    }
                }
            }
        }

        stage('Deploy to Server') {
            steps {
                script {
                    echo "Deploying Docker image to the server..."
                    // SSH나 다른 방식으로 서버에 배포 작업을 추가
                    sh """
                    ssh user@${SERVER_IP} 'docker pull ${DOCKER_REGISTRY}/${IMAGE_NAME}:${DOCKER_IMAGE_TAG} && docker run -d ${DOCKER_REGISTRY}/${IMAGE_NAME}:${DOCKER_IMAGE_TAG}'
                    """
                }
            }
        }

        stage('Verify Application') {
            steps {
                script {
                    echo "Verifying the application..."
                    // 배포가 완료된 후 애플리케이션의 상태를 확인하는 로직을 추가
                    sh """
                    curl -f http://${SERVER_IP}:80 || exit 1
                    """
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline execution complete!"
        }
        failure {
            echo "배포 실패!"
        }
    }
}
