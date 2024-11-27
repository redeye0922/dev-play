pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'redeye0922/my-vue-app'
        REMOTE_HOST = '172.29.231.196'
        REMOTE_USER = 'testdev'
        REMOTE_PATH = '/home/testdev/devspace'
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
                echo 'swagger-play 디렉토리 삭제 중...'
                sh 'rm -rf swagger-play'
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('vue-play') {
                    echo 'npm 의존성 설치 중...'
                    sh 'npm install'
                }
            }
        }

        stage('Build Vue App') {
            steps {
                dir('vue-play') {
                    echo 'Vue 앱 빌드 중...'
                    sh 'npm run build'
                }
            }
        }

        stage('Generate Dockerfile') {
            steps {
                echo 'Dockerfile 생성 중...'
                script {
                    def dockerfileContent = """
                    # 1. Node.js 기반 이미지를 사용하여 Vue.js 빌드
                    FROM node:18 AS build-stage

                    # 2. 작업 디렉토리 설정
                    WORKDIR /app

                    # 3. Vue 프로젝트의 종속성 파일 복사
                    COPY package*.json ./

                    # 4. 종속성 설치
                    RUN npm install

                    # 5. 프로젝트 소스 복사
                    COPY . .

                    # 6. Vue.js 프로젝트 빌드
                    RUN npm run build

                    # 7. Nginx를 이용한 정적 파일 서빙
                    FROM nginx:alpine AS production-stage

                    # 8. 빌드된 파일을 Nginx의 HTML 폴더에 복사
                    COPY --from=build-stage /app/dist /usr/share/nginx/html

                    # 9. Nginx 설정을 기본 설정으로 사용
                    COPY ./nginx.conf /etc/nginx/nginx.conf

                    # 10. Nginx 컨테이너 시작
                    CMD ["nginx", "-g", "daemon off;"]

                    # 11. 80 포트 노출 (Nginx 기본 포트)
                    EXPOSE 80
                    """
                    // 생성된 Dockerfile을 현재 작업 디렉토리에 저장
                    writeFile(file: 'Dockerfile', text: dockerfileContent)
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Docker 이미지 빌드 중...'
                script {
                    // Docker 빌드를 실행할 디렉토리 명시
                    sh 'docker build -t $DOCKER_IMAGE .'
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                echo 'Docker 이미지 푸시 중...'
                script {
                    // Docker Hub에 푸시하려면 아래 주석을 해제
                    // sh "docker push $DOCKER_IMAGE"
                }
            }
        }

        stage('Deploy to Remote Server') {
            steps {
                echo '원격 서버에 배포 중...'
                script {
                    // 원격 서버로 Docker 이미지를 배포하고 실행
                    sh """
                        ssh ${REMOTE_USER}@${REMOTE_HOST} 'docker pull ${DOCKER_IMAGE}'
                        ssh ${REMOTE_USER}@${REMOTE_HOST} 'docker run -d -p 80:80 --name vue-app ${DOCKER_IMAGE}'
                    """
                }
            }
        }
    }

    post {
        always {
            // 작업 후 워크스페이스 정리
            cleanWs()
        }
    }
}
