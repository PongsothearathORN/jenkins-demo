stage('Test') {
    steps {
        echo 'Running tests...'
        bat 'docker run --rm --user root -v "%CD%":/app -w /app node:18-alpine sh -c "npm install && npm test"'
    }
    post {
        always {
            junit allowEmptyResults: true, testResults: 'junit.xml'
        }
    }
}