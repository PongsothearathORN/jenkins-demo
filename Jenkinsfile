pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'jenkins-demo'
        DOCKER_TAG = "1.0.${BUILD_NUMBER}"
        SONAR_HOST = 'http://host.docker.internal:9000'
    }

    stages {

        stage('Build') {
            steps {
                echo 'Building Docker image...'
                bat "docker build -t %DOCKER_IMAGE%:%DOCKER_TAG% ."
                bat "docker tag %DOCKER_IMAGE%:%DOCKER_TAG% %DOCKER_IMAGE%:staging"
            }
        }

       stage('Test') {
            steps {
                echo 'Running tests...'
                bat "docker build -t jenkins-demo-test --target test -f Dockerfile.test ."
                bat "docker run --rm jenkins-demo-test"
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'junit.xml'
                }
            }
        }

        stage('Code Quality') {
            steps {
                echo 'Running SonarQube analysis...'
                withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                    bat """docker run --rm ^
                        -e SONAR_HOST_URL=%SONAR_HOST% ^
                        -e SONAR_TOKEN=%SONAR_TOKEN% ^
                        -v "%CD%":/usr/src ^
                        sonarsource/sonar-scanner-cli ^
                        -Dsonar.projectKey=jenkins-demo ^
                        -Dsonar.sources=. ^
                        -Dsonar.exclusions=node_modules/**"""
                }
            }
        }

        stage('Security') {
            steps {
                echo 'Running Trivy security scan...'
                bat "docker run --rm aquasec/trivy:latest image --exit-code 0 --severity LOW,MEDIUM,HIGH,CRITICAL %DOCKER_IMAGE%:%DOCKER_TAG%"
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying to staging...'
                bat 'docker stop jenkins-demo-staging || exit 0'
                bat 'docker rm jenkins-demo-staging || exit 0'
                bat "docker run -d --name jenkins-demo-staging -p 3000:3000 %DOCKER_IMAGE%:staging"
            }
        }

        stage('Release') {
            steps {
                echo 'Tagging release...'
                bat "docker tag %DOCKER_IMAGE%:%DOCKER_TAG% %DOCKER_IMAGE%:latest"
                bat "docker tag %DOCKER_IMAGE%:%DOCKER_TAG% %DOCKER_IMAGE%:release-%DOCKER_TAG%"
                echo "Released version %DOCKER_TAG%"
            }
        }

        stage('Monitoring') {
            steps {
                echo 'Starting Prometheus and Grafana...'
                bat 'docker stop prometheus || exit 0'
                bat 'docker rm prometheus || exit 0'
                bat 'docker stop grafana || exit 0'
                bat 'docker rm grafana || exit 0'
                bat """docker run -d --name prometheus ^
                    -p 9090:9090 ^
                    -v "%CD%/prometheus.yml":/etc/prometheus/prometheus.yml ^
                    prom/prometheus:latest"""
                bat """docker run -d --name grafana ^
                    -p 3001:3000 ^
                    -e GF_SECURITY_ADMIN_PASSWORD=admin123 ^
                    grafana/grafana:latest"""
                echo 'Monitoring at http://localhost:9090 and http://localhost:3001'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}