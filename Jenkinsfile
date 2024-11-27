pipeline {
    agent any

    environment {
        DEPLOY_DIR = "/home/testdev/devspace"
        SERVER_IP = "172.29.231.196"
        IMAGE_NAME = "my-vue-app"
        DOCKER_REGISTRY = "redeye0922"  // Docker Hub 또는 사설 레지스트리
        DOCKER_IMAGE_TAG = "${GIT_COMMIT}"
        DOCKER_USERNAME = "redeye0922"
        DOCKER_PASSWORD = "**jh7425**"
    }

    triggers {
        githubPush()  // GitHub webhook을 통해 자동 트리거
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'GitHub에서 코드 체크아웃 중...'
                git 'https://github.com/redeye0922/dev-play.git'  // 공개 리포지토리, 인증 필요 없음
                checkout scm
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

        stage('Check Workspace') {
            steps {
                script {
                    echo "Current working directory: ${pwd()}"
                }
            }
        }

        stage('Verify vue-play directory') {
            steps {
                echo '디렉토리 확인 중...'
                sh 'ls -l vue-play'  // vue-play 디렉토리가 존재하는지 확인
            }
        }
        
        stage('Generate Dockerfile') {
            steps {
                echo 'Dockerfile 생성중...'
                script {
                    // Dockerfile을 동적으로 생성
                    def dockerfileContent = """
                    # 1. Node.js 기반 이미지를 사용하여 Vue.js 빌드
                    FROM node:18 AS build-stage
                    
                    # 2. 작업 디렉토리 설정
                    WORKDIR /app
                    
                    # 3. vue-play 디렉토리 내의 package.json을 복사
                    COPY ./vue-play/package*.json .  
                    
                    # 4. 종속성 설치
                    RUN npm install
                    
                    # 5. vue-play 폴더의 소스 코드 복사
                    COPY . .  

                    # 6. vue-play 디렉토리로 이동
                    cd vue-play
                    
                    # 7. Vue.js 프로젝트 빌드
                    RUN npm run build
                    
                    # 8. Serve 패키지를 사용하여 정적 파일 서빙
                    FROM node:18-slim AS production-stage
                    
                    # 9. serve 패키지 설치
                    RUN npm install -g serve
                    
                    # 10. 빌드된 파일을 production-stage로 복사
                    COPY --from=build-stage /app/dist /app
                    
                    # 11. serve로 정적 파일 서빙
                    CMD ["serve", "-s", ".", "-l", "3000"]
                    
                    # 12. 3000 포트 노출
                    EXPOSE 3000
                    """
                    // Jenkins 워크스페이스에 Dockerfile 생성
                    writeFile(file: 'Dockerfile', text: dockerfileContent)
                }
            }
        }

        stage('Check Build Docker Image Exec Workspace') {
            steps {
                script {
                    echo "Docker 이미지 빌드 경로: ${pwd()}"
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    echo 'Docker 이미지 빌드 중...'
                    // Docker 이미지를 빌드할 때 --cache-from 옵션을 사용하여 캐시된 이미지를 활용
                    //# Docker Hub에서 캐시된 이미지를 가져옵니다. (기존에 푸시된 이미지 사용)
                    //docker pull ${DOCKER_REGISTRY}/${IMAGE_NAME}:${DOCKER_IMAGE_TAG} || true
                    sh '''                   
                    # Docker 빌드 실행
                    docker build -t ${DOCKER_REGISTRY}/${IMAGE_NAME}:${DOCKER_IMAGE_TAG} .                    
                    '''
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    echo 'Docker 이미지 Docker Hub에 푸시 중...'
                    // Docker Hub 또는 사설 레지스트리에 푸시
                    sh '''
                    # Docker Hub 로그인
                    docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}
                    
                    # Docker 이미지를 푸시
                    docker push ${DOCKER_REGISTRY}/${IMAGE_NAME}:${DOCKER_IMAGE_TAG}
                    '''
                }
            }
        }

        stage('Deploy to Server') {
            steps {
                script {
                    echo '서버에서 Docker 컨테이너 실행 중...'
                    // 서버에서 Docker 컨테이너 실행
                    sh '''
                    ssh testdev@${SERVER_IP} "
                        # 최신 이미지를 서버에 풀어옴
                        docker pull ${DOCKER_REGISTRY}/${IMAGE_NAME}:${DOCKER_IMAGE_TAG} &&
                        
                        # 이전 컨테이너가 있다면 중지하고 삭제
                        docker stop \$(docker ps -q --filter name=${IMAGE_NAME}) &&
                        docker rm \$(docker ps -aq --filter name=${IMAGE_NAME}) &&
                        
                        # 새로운 컨테이너 실행
                        docker run -d --name ${IMAGE_NAME} -p 80:80 ${DOCKER_REGISTRY}/${IMAGE_NAME}:${DOCKER_IMAGE_TAG}
                    "
                    '''
                }
            }
        }

        stage('Verify Application') {
            steps {
                script {
                    echo '애플리케이션 상태 확인 중...'
                    // pm2 상태 확인 또는 Docker 컨테이너 상태 확인
                    sh 'ssh testdev@${SERVER_IP} "docker ps -a"'
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
            // 실패 시 알림 추가 (예: 이메일, Slack 등)
        }
    }
}

