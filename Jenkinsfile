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
                echo 'Dockerfile 생성중...'
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
                    
                    RUN
